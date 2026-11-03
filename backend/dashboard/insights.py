"""LLM-picked dashboard insight views. The model only chooses which
columns/chart-type combination matters (from an enum-constrained tool
schema); the backend authors every actual SQL string itself from a fixed
template using enum-validated pieces and pre-sanitized identifiers — never
raw model SQL, mirroring the never-trust-model-text principle sql_guard
enforces for chat, applied to a narrower, template-only surface here."""

from __future__ import annotations

import itertools
import logging
import math
import re
from typing import Any

import duckdb
import pandas as pd

from backend.dashboard import geo
from backend.data.loaders import GEO_WORDS
from backend.llm.provider import LLMProvider
from backend.query.duckdb_session import run_query
from backend.query.sql_guard import SqlRejected, validate_and_cap

logger = logging.getLogger("chat_with_your_dashboard.insights")

MAX_INSIGHT_VIEWS = 5
PROPOSAL_POOL_SIZE = 8  # ask for more than we'll show, so diversity selection has room to pick from
INSIGHT_ROW_LIMIT = 100

GRANULARITY_DAY_THRESHOLD_DAYS = 90
GRANULARITY_MONTH_THRESHOLD_DAYS = 730

CORRELATION_THRESHOLD = 0.5  # |r| below this isn't worth a card
CORRELATION_MAX_PAIRS_PER_TABLE = 2
SCATTER_POINT_LIMIT = 300
SCATTER_MIN_POINTS = 5  # fewer than this and a scatter plot doesn't mean much

_AGG_SQL = {"sum": "SUM", "avg": "AVG"}
_GRANULARITY_SQL = {"day": "day", "month": "month", "year": "year"}
_FILTER_OPERATORS = {">", ">=", "<", "<=", "="}

FORECAST_MIN_POINTS = 4  # fewer than this and a linear fit is just connecting two dots
FORECAST_PERIODS = 3

ANOMALY_MIN_POINTS = 5  # need enough points for a residual std-dev to mean anything
ANOMALY_Z_THRESHOLD = 2.0  # flag points whose deviation from the trend exceeds 2 std devs
ANOMALY_MAX_FLAGGED = 3  # cap how many points get flagged so a noisy series doesn't light up everywhere
_GRANULARITY_OFFSET = {
    "day": lambda n: pd.DateOffset(days=n),
    "month": lambda n: pd.DateOffset(months=n),
    "year": lambda n: pd.DateOffset(years=n),
}

ID_LIKE_MIN_UNIQUE = 30  # below this, even a high uniqueness ratio is fine (e.g. a small lookup table)
ID_LIKE_UNIQUE_RATIO = 0.9  # >=90% distinct values means "key", not a grouping dimension


def _is_identifier_like(col: str, table: dict[str, Any]) -> bool:
    """A column where almost every row has its own distinct value (e.g.
    Order_ID) makes a useless grouping dimension — every bar/line point ends
    up representing ~1 row (e.g. a nonsense 'ORD-00002 leads at 1' highlight).
    Excluded from candidate dimensions entirely, not just downgraded, since
    there's no chart type where per-row-unique grouping is meaningful."""
    row_count = table.get("row_count") or 0
    if row_count < ID_LIKE_MIN_UNIQUE:
        return False
    nunique = table.get("unique_counts", {}).get(col, 0)
    return nunique >= ID_LIKE_MIN_UNIQUE and nunique / row_count >= ID_LIKE_UNIQUE_RATIO


def detect_candidates(dashboard: dict[str, Any]) -> dict[str, dict[str, Any]]:
    """Per table: which columns are usable as a dimension, measure, date, or
    geo dimension — derived entirely from the dashboard dict already computed
    at upload time, no re-scanning of the raw frames."""
    candidates: dict[str, dict[str, Any]] = {}
    for table in dashboard.get("tables", []):
        name = table["table"]
        dimensions = [
            c for c in table.get("categorical_columns", []) if not _is_identifier_like(c, table)
        ]
        measures = list(table.get("numeric_columns", []))
        dates = list(table.get("date_columns", []))
        all_values = table.get("all_values", {})
        top_categories = table.get("top_categories", {})
        numeric_stats = table.get("numeric_stats", {})

        geo_dimensions = []
        filter_values: dict[str, list[str]] = {}
        for col in dimensions:
            values = all_values.get(col) or [c["value"] for c in top_categories.get(col, [])]
            if _looks_geo_by_name(col) or geo.geo_match_confidence(values) >= geo.MAP_CONFIDENCE_THRESHOLD:
                geo_dimensions.append(col)
            if values:
                filter_values[col] = [str(v) for v in values]

        # UI hints only (slider/input bounds) — never a hard validation boundary,
        # since a threshold isn't drawn from a fixed enum the way a category is.
        numeric_ranges: dict[str, dict[str, float]] = {}
        for col in measures:
            stats = numeric_stats.get(col, {})
            lo, hi = stats.get("min"), stats.get("max")
            if lo is not None and hi is not None:
                numeric_ranges[col] = {"min": lo, "max": hi}

        if not measures or not (dimensions or dates):
            continue  # nothing chartable in this table

        candidates[name] = {
            "dimensions": dimensions,
            "measures": measures,
            "dates": dates,
            "geo_dimensions": geo_dimensions,
            "filter_values": filter_values,
            "numeric_ranges": numeric_ranges,
        }
    return candidates


def _looks_geo_by_name(col: str) -> bool:
    tokens = [t for t in re.split(r"[^A-Za-z0-9]+", col.lower()) if t]
    return bool(GEO_WORDS & set(tokens))


def propose_views(provider: LLMProvider, candidates: dict[str, dict[str, Any]]) -> list[dict[str, Any]]:
    """One LLM call, no retry loop (this is a supplementary feature — on any
    failure we degrade to 'no extra views', not an error)."""
    table_names = list(candidates.keys())
    all_dimension_names = sorted({
        col for info in candidates.values() for col in (*info["dimensions"], *info["dates"])
    })
    all_measure_names = sorted({col for info in candidates.values() for col in info["measures"]})
    if not table_names or not all_dimension_names or not all_measure_names:
        return []

    tool = {
        "type": "function",
        "function": {
            "name": "propose_views",
            "description": (
                f"Propose up to {PROPOSAL_POOL_SIZE} useful, VARIED candidate views for this "
                "dataset — do not repeat the same chart_type for every view. The best 5 will be "
                "selected from your candidates afterward, so it's fine to propose more than 5."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "views": {
                        "type": "array",
                        "maxItems": PROPOSAL_POOL_SIZE,
                        "items": {
                            "type": "object",
                            "properties": {
                                "table": {"type": "string", "enum": table_names},
                                "dimension": {"type": "string", "enum": all_dimension_names},
                                "measure": {"type": "string", "enum": all_measure_names},
                                "agg": {"type": "string", "enum": ["sum", "avg", "count"]},
                                "chart_type": {"type": "string", "enum": ["bar", "line", "pie", "map"]},
                                "title": {"type": "string"},
                            },
                            "required": ["table", "dimension", "agg", "chart_type", "title"],
                        },
                    }
                },
                "required": ["views"],
            },
        },
    }

    candidate_lines = [
        f"- {table}: dimensions={info['dimensions']}, measures={info['measures']}, "
        f"dates={info['dates']}, geo_dimensions={info['geo_dimensions']}"
        for table, info in candidates.items()
    ]
    system_prompt = "\n".join([
        "You are a data analyst choosing which summary views to show on a dashboard.",
        "Available tables and candidate columns:",
        *candidate_lines,
        "",
        f"Propose up to {PROPOSAL_POOL_SIZE} candidate views by calling propose_views. Rules:",
        "- Prefer a 'line' view over a date dimension if one exists (shows a trend over time).",
        "- Prefer a 'map' view over a geo_dimensions column if one exists (shows geographic spread).",
        "- Do not propose the same chart_type for every view — vary bar/line/pie/map based on what "
        "each column combination actually shows best.",
        "- 'dimension' and 'measure' must both come from the SAME table's candidate columns listed above.",
        "- Use agg='count' (and omit measure) when you just want a count of rows per dimension value.",
    ])

    try:
        response = provider.chat([{"role": "system", "content": system_prompt}], tools=[tool])
    except Exception:
        logger.exception("propose_views LLM call failed")
        return []

    raw_views: list[Any] = []
    for call in response.get("tool_calls") or []:
        if call.get("name") == "propose_views":
            raw_views = call.get("arguments", {}).get("views") or []
            break

    return _validate_views(raw_views, candidates)[:PROPOSAL_POOL_SIZE]


def _validate_views(
    raw_views: list[Any], candidates: dict[str, dict[str, Any]]
) -> list[dict[str, Any]]:
    """A JSON Schema enum can't express 'dimension/measure must belong to the
    same table', so that (and everything else) is checked here, server-side."""
    validated = []
    for raw in raw_views:
        if not isinstance(raw, dict):
            continue
        table = raw.get("table")
        dimension = raw.get("dimension")
        agg = raw.get("agg")
        chart_type = raw.get("chart_type")
        title = raw.get("title")
        measure = raw.get("measure")
        filter_column = raw.get("filter_column")
        filter_value = raw.get("filter_value")
        filter_measure = raw.get("filter_measure")
        filter_operator = raw.get("filter_operator")
        filter_threshold = raw.get("filter_threshold")

        if table not in candidates:
            continue
        info = candidates[table]
        if dimension not in info["dimensions"] and dimension not in info["dates"]:
            continue
        if agg not in ("sum", "avg", "count"):
            continue
        if chart_type not in ("bar", "line", "pie", "map"):
            continue
        if not isinstance(title, str) or not title.strip():
            continue

        if agg == "count":
            measure = None
        elif measure not in info["measures"]:
            continue

        if chart_type == "map" and dimension not in info["geo_dimensions"]:
            chart_type = "bar"  # not a real geo column — don't attempt a map

        # Filter is optional. Never trust the raw value against SQL — only accept it
        # if it exactly matches one of that column's known values (same list the
        # frontend's dropdown was populated from), same enum-validation principle as
        # every other field here.
        if filter_column:
            allowed_values = info.get("filter_values", {}).get(filter_column)
            if not allowed_values or str(filter_value) not in allowed_values:
                continue
            filter_value = str(filter_value)
        else:
            filter_column = None
            filter_value = None

        # Numeric threshold isn't drawn from a fixed enum like the categorical
        # filter above, so it's validated by shape instead: a real measure
        # column, a whitelisted operator, and a finite float.
        if filter_measure:
            if filter_measure not in info["measures"]:
                continue
            if filter_operator not in _FILTER_OPERATORS:
                continue
            if filter_threshold is None:
                continue
            try:
                filter_threshold = float(filter_threshold)
            except (TypeError, ValueError):
                continue
            if not math.isfinite(filter_threshold):
                continue
        else:
            filter_measure = None
            filter_operator = None
            filter_threshold = None

        validated.append({
            "table": table,
            "dimension": dimension,
            "measure": measure,
            "agg": agg,
            "chart_type": chart_type,
            "title": title.strip(),
            "filter_column": filter_column,
            "filter_value": filter_value,
            "filter_measure": filter_measure,
            "filter_operator": filter_operator,
            "filter_threshold": filter_threshold,
        })
    return validated


def _pick_granularity(con: duckdb.DuckDBPyConnection, table: str, column: str) -> str:
    """MIN/MAX span of the date column decides day/month/year bucketing, so a
    5-year range doesn't render as 60 illegible monthly bars and a 2-week
    range doesn't collapse to a single bucket. Supplementary heuristic — any
    failure just falls back to 'month'."""
    sql = f'SELECT MIN("{column}") AS lo, MAX("{column}") AS hi FROM "{table}" WHERE "{column}" IS NOT NULL'
    try:
        result = run_query(con, validate_and_cap(sql, {table}))
        lo, hi = result["rows"][0]
        if lo is None or hi is None:
            return "month"
        span_days = (hi - lo).days
    except Exception:
        return "month"
    if span_days < GRANULARITY_DAY_THRESHOLD_DAYS:
        return "day"
    if span_days < GRANULARITY_MONTH_THRESHOLD_DAYS:
        return "month"
    return "year"


def _sql_string_literal(value: str) -> str:
    """Single-quoted SQL literal, with embedded quotes doubled per the
    standard SQL escaping rule. Only ever called on a value that's already
    been checked to exactly match a known real column value (see
    _validate_views) — this escaping is defense in depth, not the primary
    safety net."""
    return "'" + value.replace("'", "''") + "'"


def _sql_numeric_literal(value: float) -> str:
    """Safe to embed unquoted — no string-escaping concept applies to a
    validated finite float, unlike _sql_string_literal's case. The
    isfinite check is defense in depth; _validate_views already enforced it."""
    if not math.isfinite(value):
        raise ValueError(f"non-finite filter threshold: {value!r}")
    return repr(float(value))


def build_view_sql(view: dict[str, Any], dimension_is_date: bool, granularity: str = "month") -> str:
    table = view["table"]
    dimension = view["dimension"]
    agg = view["agg"]

    if dimension_is_date:
        dim_expr = f"DATE_TRUNC('{_GRANULARITY_SQL[granularity]}', \"{dimension}\")"
    else:
        dim_expr = f'"{dimension}"'
    agg_expr = "COUNT(*)" if agg == "count" else f'{_AGG_SQL[agg]}("{view["measure"]}")'
    order_by = "1" if dimension_is_date else "2 DESC"

    where_clauses = [f'"{dimension}" IS NOT NULL']
    filter_column = view.get("filter_column")
    if filter_column:
        where_clauses.append(f'"{filter_column}" = {_sql_string_literal(view["filter_value"])}')
    filter_measure = view.get("filter_measure")
    if filter_measure:
        # Operator is interpolated directly — it's whitelist-validated against
        # _FILTER_OPERATORS in _validate_views, never raw model/user text.
        where_clauses.append(
            f'"{filter_measure}" {view["filter_operator"]} {_sql_numeric_literal(view["filter_threshold"])}'
        )

    return (
        f'SELECT {dim_expr} AS dimension, {agg_expr} AS value FROM "{table}" '
        f'WHERE {" AND ".join(where_clauses)} GROUP BY {dim_expr} '
        f"ORDER BY {order_by} LIMIT {INSIGHT_ROW_LIMIT}"
    )


def execute_view(
    con: duckdb.DuckDBPyConnection, view: dict[str, Any], dimension_is_date: bool
) -> tuple[dict[str, Any], str] | None:
    granularity = _pick_granularity(con, view["table"], view["dimension"]) if dimension_is_date else "month"
    sql = build_view_sql(view, dimension_is_date, granularity)
    try:
        safe_sql = validate_and_cap(sql, {view["table"]})
        return run_query(con, safe_sql), granularity
    except (SqlRejected, duckdb.Error) as exc:
        logger.warning(
            "insight view query failed table=%r dimension=%r error=%s", view["table"], view["dimension"], exc
        )
        return None


def apply_safety_downgrades(view: dict[str, Any], result: dict[str, Any]) -> dict[str, Any]:
    chart_type = view["chart_type"]
    columns = result["columns"]
    rows = [list(r) for r in result["rows"]]
    dim_idx = columns.index("dimension") if "dimension" in columns else 0

    if chart_type == "map":
        values = [row[dim_idx] for row in rows]
        if geo.geo_match_confidence(values) < geo.MAP_CONFIDENCE_THRESHOLD:
            chart_type = "bar"
        else:
            normalized_rows = []
            for row in rows:
                canonical = geo.normalize_state_name(row[dim_idx])
                if canonical is None:
                    continue
                row = list(row)
                row[dim_idx] = canonical
                normalized_rows.append(row)
            rows = normalized_rows

    if chart_type == "pie" and len(rows) > 6:
        chart_type = "bar"

    return {
        "title": view["title"],
        "chart_type": chart_type,
        "table": view["table"],
        "dimension": view["dimension"],
        "columns": columns,
        "rows": rows,
    }


def _score_confidence(insight: dict[str, Any], view: dict[str, Any]) -> float:
    """Deterministic 0-1 heuristic from chart_type + result shape — not a
    model output. Used both to rank candidates (diversity selection) and as
    a quality signal shown to the user."""
    n = len(insight["rows"])
    chart_type = insight["chart_type"]
    if chart_type == "line":
        score = 0.85 - (0.35 if n < 3 else 0.15 if n > 60 else 0)
    elif chart_type == "map":
        score = 0.9 - (0.2 if n < 3 else 0)
    elif chart_type == "pie":
        score = 0.75 - (0.4 if n <= 1 else 0)
    else:  # bar
        score = 0.8 - (0.35 if n == 1 else min(0.45, 0.02 * max(0, n - 15)))
    if view.get("agg") == "count":
        score -= 0.05
    return round(max(0.0, min(1.0, score)), 2)


def _confidence_reason(insight: dict[str, Any]) -> str:
    """One-line, human-readable explanation of the _score_confidence result,
    mirroring the same n/chart_type branches so the tooltip never contradicts
    the badge it's attached to."""
    n = len(insight["rows"])
    chart_type = insight["chart_type"]
    if chart_type == "line":
        if n < 3:
            return f"Only {n} points on the trend line — too few to judge a pattern."
        if n > 60:
            return f"{n} points on the trend line — dense enough that small bumps may just be noise."
        return f"{n} points on the trend line — enough to see a clear pattern."
    if chart_type == "map":
        if n < 3:
            return f"Only {n} region{'s' if n != 1 else ''} matched — too few to color a meaningful map."
        return f"{n} regions matched confidently on the map."
    if chart_type == "pie":
        if n <= 1:
            return "Only one slice — nothing to compare it against."
        return f"{n} categories — clear enough to compare at a glance."
    if n == 1:
        return "Only one category — nothing to compare it against."
    if n > 15:
        return f"{n} categories — some of the smaller ones may be hard to read."
    return f"{n} categories — a clear comparison."


def _format_number(v: Any) -> str:
    if v is None:
        return "—"
    v = float(v)
    av = abs(v)
    if av >= 1_000_000:
        return f"{v / 1_000_000:.1f}M".replace(".0M", "M")
    if av >= 1_000:
        return f"{v / 1_000:.1f}K".replace(".0K", "K")
    if v.is_integer():
        return f"{int(v):,}"
    return f"{v:,.1f}"


def _format_dim_label(v: Any, granularity: str) -> str:
    if hasattr(v, "strftime"):
        if granularity == "year":
            return v.strftime("%Y")
        if granularity == "day":
            return v.strftime("%b %d, %Y")
        return v.strftime("%b %Y")
    return str(v)


def _build_highlight(
    view: dict[str, Any], insight: dict[str, Any], dimension_is_date: bool, granularity: str
) -> str | None:
    """Deterministic, template-only highlight sentence computed straight from
    the already-executed rows — no extra LLM call, so it can't hallucinate
    and costs nothing beyond the query already run. Relies on build_view_sql's
    existing ORDER BY: value DESC for categorical dimensions, chronological
    ASC for date dimensions."""
    rows = insight["rows"]
    if not rows:
        return None
    if view.get("agg") == "count":
        measure_label = "Row count"
    else:
        measure_label = str(view.get("measure") or "Value").replace("_", " ").strip().capitalize()

    if dimension_is_date and insight["chart_type"] == "line":
        first_dim, first_val = rows[0][0], rows[0][1]
        last_dim, last_val = rows[-1][0], rows[-1][1]
        if first_val in (None, 0) or last_val is None or len(rows) < 2:
            return None
        pct_change = (last_val - first_val) / first_val * 100
        direction = "up" if last_val >= first_val else "down"
        peak_row = max(rows, key=lambda r: r[1] if r[1] is not None else float("-inf"))
        first_label = _format_dim_label(first_dim, granularity)
        last_label = _format_dim_label(last_dim, granularity)
        sentence = f"{measure_label} trended {direction} {abs(pct_change):.0f}% from {first_label} to {last_label}"
        if peak_row[0] not in (first_dim, last_dim):
            sentence += f", peaking at {_format_number(peak_row[1])} in {_format_dim_label(peak_row[0], granularity)}"
        return sentence + "."

    top_dim, top_val = rows[0][0], rows[0][1]
    if top_val is None:
        return None
    sentence = f"{top_dim} leads at {_format_number(top_val)}"
    if len(rows) > 1:
        second_dim, second_val = rows[1][0], rows[1][1]
        if second_val not in (None, 0):
            pct = (top_val - second_val) / second_val * 100
            if pct > 1:
                sentence += f", {pct:.0f}% ahead of {second_dim}"
    return sentence + "."


_PERIOD_DELTA_LABEL = {"day": "vs previous day", "month": "vs previous month", "year": "vs previous year"}


def _build_period_delta(
    insight: dict[str, Any], dimension_is_date: bool, granularity: str
) -> dict[str, Any] | None:
    """Latest-bucket-vs-the-one-before-it delta (MoM/WoW/YoY style) — distinct
    from _build_highlight's whole-range first-to-last trend and from
    _detect_anomalies' OLS-residual flagging: this is the one number a
    business user checks every period regardless of whether anything is
    trending or unusual. Deterministic, template-only, no LLM call."""
    if not dimension_is_date:
        return None
    rows = insight["rows"]
    if len(rows) < 2:
        return None
    prev_dim, prev_val = rows[-2][0], rows[-2][1]
    curr_dim, curr_val = rows[-1][0], rows[-1][1]
    if prev_val in (None, 0) or curr_val is None:
        return None
    pct = (curr_val - prev_val) / prev_val * 100
    return {
        "label": _PERIOD_DELTA_LABEL.get(granularity, "vs previous period"),
        "pct": round(pct, 1),
        "direction": "up" if pct >= 0 else "down",
        "current_label": _format_dim_label(curr_dim, granularity),
        "previous_label": _format_dim_label(prev_dim, granularity),
    }


def _ols_fit(xs: list[int], ys: list[float]) -> tuple[float, float] | None:
    """Simple least-squares slope/intercept for y over x. None if x has no
    spread (every point at the same index — can't fit a line through it).
    Shared by _build_forecast (projects the fit forward) and
    _detect_anomalies (flags historical points that sit far off it)."""
    n = len(xs)
    mean_x = sum(xs) / n
    mean_y = sum(ys) / n
    denom = sum((x - mean_x) ** 2 for x in xs)
    if denom == 0:
        return None
    slope = sum((x - mean_x) * (y - mean_y) for x, y in zip(xs, ys)) / denom
    intercept = mean_y - slope * mean_x
    return slope, intercept


def _build_forecast(
    insight: dict[str, Any], dimension_is_date: bool, granularity: str
) -> dict[str, Any] | None:
    """Naive linear-trend projection for date-dimensioned views. An ordinary
    least-squares fit over the bucket index (0, 1, 2, ...) rather than the
    raw calendar gap, extended FORECAST_PERIODS buckets past the last real
    point. This is a 'where is this headed' heuristic, not a real
    forecasting model — no seasonality, no confidence interval — so every
    caller must label it as a projection, never present it as a prediction.

    Computed for any date dimension regardless of the view's own chart_type
    (not just chart_type=="line"): the frontend lets a user switch a
    bar/pie view of date data to a line chart via its existing chart-type
    toggle, and that manually-switched line view should show the same
    forecast a model-proposed line chart would — the gate on whether to
    *display* it lives client-side, keyed off whatever chart type is
    currently on screen, not off this view's original proposed type."""
    if not dimension_is_date:
        return None
    rows = insight["rows"]
    if len(rows) < FORECAST_MIN_POINTS:
        return None
    ys = [row[1] for row in rows]
    if any(y is None for y in ys):
        return None

    n = len(rows)
    xs = list(range(n))
    fit = _ols_fit(xs, ys)
    if fit is None:
        return None
    slope, intercept = fit

    try:
        base = pd.Timestamp(rows[-1][0])
    except (TypeError, ValueError):
        return None
    offset_fn = _GRANULARITY_OFFSET.get(granularity, _GRANULARITY_OFFSET["month"])

    labels = [_format_dim_label((base + offset_fn(i)).to_pydatetime(), granularity) for i in range(1, FORECAST_PERIODS + 1)]
    values = [round(slope * (n - 1 + i) + intercept, 2) for i in range(1, FORECAST_PERIODS + 1)]

    return {
        "labels": labels,
        "values": values,
        "method": "Naive linear trend projection — not a statistical forecast (no seasonality or confidence range).",
    }


def _detect_anomalies(
    insight: dict[str, Any], dimension_is_date: bool, granularity: str
) -> list[dict[str, Any]] | None:
    """Flags historical points that sit far off the same OLS trend line
    _build_forecast projects forward — a per-point 'this one doesn't fit
    the trend' signal, distinct from _score_confidence (judges the whole
    view's reliability) and _build_highlight (only compares the first and
    last point, so a mid-series spike is invisible to it).

    None means not applicable (not a date series, too few points, or a
    degenerate fit); an empty list means checked and nothing stood out —
    callers should treat these differently only if useful, both render as
    'no badge' either way."""
    if not dimension_is_date:
        return None
    rows = insight["rows"]
    if len(rows) < ANOMALY_MIN_POINTS:
        return None
    ys = [row[1] for row in rows]
    if any(y is None for y in ys):
        return None

    n = len(rows)
    xs = list(range(n))
    fit = _ols_fit(xs, ys)
    if fit is None:
        return None
    slope, intercept = fit

    residuals = [y - (slope * x + intercept) for x, y in zip(xs, ys)]
    mean_resid = sum(residuals) / n
    variance = sum((r - mean_resid) ** 2 for r in residuals) / n
    std = variance**0.5
    if std == 0:
        return []

    flagged = []
    for i, (row, resid) in enumerate(zip(rows, residuals)):
        z = abs(resid) / std
        if z < ANOMALY_Z_THRESHOLD:
            continue
        expected = slope * i + intercept
        actual = row[1]
        pct_diff = round((actual - expected) / expected * 100, 1) if expected else None
        flagged.append(
            {
                "label": _format_dim_label(row[0], granularity),
                "value": actual,
                "expected": round(expected, 2),
                "pct_diff": pct_diff,
                "direction": "above" if resid > 0 else "below",
                "index": i,
                "z": round(z, 2),
            }
        )

    flagged.sort(key=lambda a: a["z"], reverse=True)
    flagged = flagged[:ANOMALY_MAX_FLAGGED]
    flagged.sort(key=lambda a: a["index"])
    return flagged


def _select_diverse(insights: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Collapse same (dimension, chart_type) views to their single highest-
    confidence version — 'Sales/Profit/Quantity/Discount by Region' as four
    near-identical bar charts becomes one. Then greedily fill up to
    MAX_INSIGHT_VIEWS, favoring chart-type/dimension variety when scores are
    close, so the dashboard doesn't end up all bar charts."""
    best_per_key: dict[tuple[str, str], dict[str, Any]] = {}
    for ins in insights:
        key = (ins["dimension"], ins["chart_type"])
        if key not in best_per_key or ins["confidence"] > best_per_key[key]["confidence"]:
            best_per_key[key] = ins

    pool = list(best_per_key.values())
    selected: list[dict[str, Any]] = []
    used_types: set[str] = set()
    used_dims: set[str] = set()
    while pool and len(selected) < MAX_INSIGHT_VIEWS:
        def rank(ins: dict[str, Any]) -> float:
            bonus = 0.15 if ins["chart_type"] not in used_types else 0
            bonus += 0.1 if ins["dimension"] not in used_dims else 0
            return ins["confidence"] + bonus

        best = max(pool, key=rank)
        pool.remove(best)
        selected.append(best)
        used_types.add(best["chart_type"])
        used_dims.add(best["dimension"])
    return selected


def _detect_correlations(
    con: duckdb.DuckDBPyConnection,
    candidates: dict[str, dict[str, Any]],
) -> list[dict[str, Any]]:
    """Deterministic Pearson-correlation scan across numeric column pairs.
    Not LLM-proposed like the bar/line/pie/map views above — 'do these two
    numbers move together' is a computable fact, not a subjective choice of
    what to show, so it's cheaper and more reliable to just compute it."""
    insights: list[dict[str, Any]] = []
    for table, info in candidates.items():
        measures = info["measures"]
        if len(measures) < 2:
            continue
        pairs = list(itertools.combinations(measures, 2))
        corr_exprs = ", ".join(f'CORR("{a}", "{b}") AS c{i}' for i, (a, b) in enumerate(pairs))
        sql = f'SELECT {corr_exprs} FROM "{table}"'
        try:
            result = run_query(con, validate_and_cap(sql, {table}))
            row = result["rows"][0]
        except (SqlRejected, duckdb.Error, IndexError) as exc:
            logger.warning("correlation scan failed table=%r error=%s", table, exc)
            continue

        scored = [
            (pairs[i], row[i])
            for i in range(len(pairs))
            if row[i] is not None and abs(row[i]) >= CORRELATION_THRESHOLD
        ]
        scored.sort(key=lambda item: abs(item[1]), reverse=True)
        for (col_a, col_b), r in scored[:CORRELATION_MAX_PAIRS_PER_TABLE]:
            insight = _build_correlation_insight(con, table, col_a, col_b, r)
            if insight:
                insights.append(insight)
    return insights


def _build_correlation_insight(
    con: duckdb.DuckDBPyConnection, table: str, col_a: str, col_b: str, r: float
) -> dict[str, Any] | None:
    sql = (
        f'SELECT "{col_a}", "{col_b}" FROM "{table}" '
        f'WHERE "{col_a}" IS NOT NULL AND "{col_b}" IS NOT NULL '
        f"LIMIT {SCATTER_POINT_LIMIT}"
    )
    try:
        result = run_query(con, validate_and_cap(sql, {table}))
    except (SqlRejected, duckdb.Error) as exc:
        logger.warning("scatter query failed table=%r cols=%r,%r error=%s", table, col_a, col_b, exc)
        return None
    if len(result["rows"]) < SCATTER_MIN_POINTS:
        return None

    strength = "strong" if abs(r) >= 0.75 else "moderate"
    direction = "positive" if r > 0 else "negative"
    confidence = round(min(0.95, 0.5 + abs(r) * 0.5), 2)

    return {
        "title": f"{col_a} vs {col_b} — {strength} {direction} correlation",
        "chart_type": "scatter",
        "table": table,
        "dimension": f"{col_a}|{col_b}",  # synthetic key so diversity dedup still works
        "columns": result["columns"],
        "rows": [list(row) for row in result["rows"]],
        "confidence": confidence,
        "confidence_reason": (
            f"Pearson r={r:.2f} across {len(result['rows']):,} points — a {strength} {direction} relationship."
        ),
        "highlight": (
            f"{col_a} and {col_b} show a {strength} {direction} correlation (r={r:.2f}) "
            f"across {len(result['rows']):,} rows."
        ),
    }


class InvalidView(Exception):
    """Raised when a user-submitted custom view fails validation or produces
    no computable result — always carries a message safe to show the user."""


def build_custom_insight(
    con: duckdb.DuckDBPyConnection, dashboard: dict[str, Any], raw_view: dict[str, Any]
) -> dict[str, Any]:
    """Same validate -> execute -> downgrade -> score -> highlight pipeline
    generate_insights runs for each LLM-proposed view, applied to a single
    user-submitted one from the custom insight builder form."""
    candidates = detect_candidates(dashboard)

    raw = dict(raw_view)
    if not (raw.get("title") or "").strip():
        if raw.get("agg") == "count":
            measure_label = "Count"
        else:
            measure_label = str(raw.get("measure") or "Value").replace("_", " ").strip().capitalize()
        raw["title"] = f"{measure_label} by {raw.get('dimension') or '?'}"

    validated = _validate_views([raw], candidates)
    if not validated:
        raise InvalidView(
            "That combination isn't valid for this dataset — check that the dimension and measure "
            "both belong to the chosen table."
        )
    view = validated[0]

    dimension_is_date = view["dimension"] in candidates[view["table"]]["dates"]
    executed = execute_view(con, view, dimension_is_date)
    if executed is None:
        raise InvalidView("That view couldn't be computed — try a different combination.")
    result, granularity = executed
    if not result["rows"]:
        raise InvalidView("That view returned no data — try a different combination.")

    insight = apply_safety_downgrades(view, result)
    insight["confidence"] = _score_confidence(insight, view)
    insight["confidence_reason"] = _confidence_reason(insight)
    insight["highlight"] = _build_highlight(view, insight, dimension_is_date, granularity)
    insight["forecast"] = _build_forecast(insight, dimension_is_date, granularity)
    insight["anomalies"] = _detect_anomalies(insight, dimension_is_date, granularity)
    insight["period_delta"] = _build_period_delta(insight, dimension_is_date, granularity)
    insight["granularity"] = granularity if dimension_is_date else None
    insight["custom"] = True
    filters = []
    if view.get("filter_column"):
        filters.append({"column": view["filter_column"], "op": "=", "value": view["filter_value"]})
    if view.get("filter_measure"):
        filters.append({
            "column": view["filter_measure"],
            "op": view["filter_operator"],
            "value": view["filter_threshold"],
        })
    insight["filters"] = filters
    return insight


def build_insights_from_proposals(
    con: duckdb.DuckDBPyConnection,
    candidates: dict[str, Any],
    proposed: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    """Execute already-validated views against DuckDB.

    Proposal generation is intentionally separate from this phase so the
    caller can keep the session/DuckDB lock free while the LLM is thinking.
    """
    try:
        executed = []
        for view in proposed:
            dimension_is_date = view["dimension"] in candidates[view["table"]]["dates"]
            executed_view = execute_view(con, view, dimension_is_date)
            if executed_view is None:
                continue
            result, granularity = executed_view
            if not result["rows"]:
                continue  # empty result adds nothing — don't even score it
            insight = apply_safety_downgrades(view, result)
            insight["confidence"] = _score_confidence(insight, view)
            insight["confidence_reason"] = _confidence_reason(insight)
            insight["highlight"] = _build_highlight(view, insight, dimension_is_date, granularity)
            insight["forecast"] = _build_forecast(insight, dimension_is_date, granularity)
            insight["anomalies"] = _detect_anomalies(insight, dimension_is_date, granularity)
            insight["period_delta"] = _build_period_delta(insight, dimension_is_date, granularity)
            insight["granularity"] = granularity if dimension_is_date else None
            executed.append(insight)
        executed.extend(_detect_correlations(con, candidates))
        return _select_diverse(executed)
    except Exception:
        logger.exception("insight generation failed")
        return []


def generate_insights(
    provider: LLMProvider, con: duckdb.DuckDBPyConnection, dashboard: dict[str, Any]
) -> list[dict[str, Any]]:
    """Compatibility wrapper for callers that want the old synchronous API."""
    try:
        candidates = detect_candidates(dashboard)
        if not candidates:
            return []
        return build_insights_from_proposals(con, candidates, propose_views(provider, candidates))
    except Exception:
        logger.exception("insight proposal generation failed")
        return []
