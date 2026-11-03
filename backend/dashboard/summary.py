"""Auto-generated dashboard: per-table stats + chart-ready breakdowns +
heuristic suggested questions. No LLM call here — keeps upload fast."""

from __future__ import annotations

from typing import Any

import pandas as pd

MAX_CATEGORIES_PER_CHART = 10
MAX_SUGGESTED_QUESTIONS = 6
MAX_ENUMERATED_VALUES = 20  # only populate all_values when this is a genuinely COMPLETE list
OUTLIER_IQR_MULTIPLIER = 1.5  # classic Tukey fence: outside Q1-1.5*IQR / Q3+1.5*IQR


def summarize_table(name: str, df: pd.DataFrame) -> dict[str, Any]:
    numeric_cols = list(df.select_dtypes(include="number").columns)
    datetime_cols = list(df.select_dtypes(include="datetime").columns)
    # Columns that look like dates but got read in as strings (common for CSV).
    datetime_cols += [
        c
        for c in df.columns
        if c not in datetime_cols and c not in numeric_cols and _looks_like_date_column(df[c])
    ]
    categorical_cols = [
        c for c in df.columns if c not in numeric_cols and c not in datetime_cols
    ]

    numeric_stats = {}
    outlier_counts: dict[str, int] = {}
    for col in numeric_cols:
        described = df[col].describe()
        numeric_stats[col] = {
            "min": _safe_float(described.get("min")),
            "max": _safe_float(described.get("max")),
            "mean": _safe_float(described.get("mean")),
            "median": _safe_float(df[col].median()),
        }
        count = _count_iqr_outliers(df[col], described)
        if count > 0:
            outlier_counts[col] = count

    top_categories = {}
    all_values: dict[str, list[str]] = {}
    for col in categorical_cols:
        nunique = df[col].nunique(dropna=True)
        if nunique <= 200:  # skip free-text/high-cardinality columns
            counts = df[col].value_counts().head(MAX_CATEGORIES_PER_CHART)
            top_categories[col] = [
                {"value": str(k), "count": int(v)} for k, v in counts.items()
            ]
        if nunique <= MAX_ENUMERATED_VALUES:  # a genuinely complete value list, not just top-N
            all_values[col] = sorted(str(v) for v in df[col].dropna().unique().tolist())

    date_stats = {col: _date_range(df[col]) for col in datetime_cols}

    return {
        "table": name,
        "row_count": len(df),
        "column_count": len(df.columns),
        "missing_values": {c: int(df[c].isna().sum()) for c in df.columns if df[c].isna().any()},
        "duplicate_rows": int(df.duplicated().sum()),
        "numeric_columns": numeric_cols,
        "categorical_columns": categorical_cols,
        "date_columns": datetime_cols,
        "numeric_stats": numeric_stats,
        "outlier_counts": outlier_counts,
        "top_categories": top_categories,
        "all_values": all_values,
        "unique_counts": {c: int(df[c].nunique(dropna=True)) for c in df.columns},
        "date_stats": date_stats,
    }


def build_dashboard(frames: dict[str, pd.DataFrame]) -> dict[str, Any]:
    return {"tables": [summarize_table(name, df) for name, df in frames.items()]}


def suggest_questions(frames: dict[str, pd.DataFrame]) -> list[str]:
    questions: list[str] = []
    for name, df in frames.items():
        numeric_cols = list(df.select_dtypes(include="number").columns)
        categorical_cols = [
            c
            for c in df.columns
            if c not in numeric_cols and df[c].nunique(dropna=True) <= 50 and df[c].nunique(dropna=True) > 1
        ]
        date_cols = [c for c in df.columns if _looks_like_date_column(df[c]) or pd.api.types.is_datetime64_any_dtype(df[c])]

        if categorical_cols and numeric_cols:
            questions.append(f"Which {categorical_cols[0]} has the highest {numeric_cols[0]}?")
            if len(numeric_cols) > 1:
                questions.append(f"Which {categorical_cols[0]} has the lowest {numeric_cols[1]}?")
        if date_cols and numeric_cols:
            questions.append(f"Show {numeric_cols[0]} trend over time by {date_cols[0]}.")
        if len(categorical_cols) >= 2 and numeric_cols:
            questions.append(
                f"Break down total {numeric_cols[0]} by {categorical_cols[0]} and {categorical_cols[1]}."
            )
        if numeric_cols:
            questions.append(f"What's the average {numeric_cols[0]} in {name}?")

    # de-dup while preserving order, cap the list
    seen = set()
    unique_questions = []
    for q in questions:
        if q not in seen:
            seen.add(q)
            unique_questions.append(q)
    return unique_questions[:MAX_SUGGESTED_QUESTIONS]


def _looks_like_date_column(series: pd.Series) -> bool:
    if "date" not in str(series.name).lower() and "time" not in str(series.name).lower():
        return False
    try:
        sample = series.dropna().head(20)
        if sample.empty:
            return False
        pd.to_datetime(sample, errors="raise")
        return True
    except (ValueError, TypeError):
        return False


def _count_iqr_outliers(series: pd.Series, described: pd.Series) -> int:
    """Tukey-fence outlier count for one numeric column. Skipped (returns 0)
    when the column has no spread (IQR == 0) so a mostly-constant column
    doesn't get flagged for its handful of differing values."""
    q1, q3 = described.get("25%"), described.get("75%")
    if q1 is None or q3 is None or pd.isna(q1) or pd.isna(q3):
        return 0
    iqr = q3 - q1
    if iqr <= 0:
        return 0
    lower, upper = q1 - OUTLIER_IQR_MULTIPLIER * iqr, q3 + OUTLIER_IQR_MULTIPLIER * iqr
    return int(((series < lower) | (series > upper)).sum())


def _safe_float(value) -> float | None:
    if value is None or pd.isna(value):
        return None
    return float(value)


def _date_range(series: pd.Series) -> dict[str, str | None]:
    parsed = series if pd.api.types.is_datetime64_any_dtype(series) else pd.to_datetime(series, errors="coerce")
    parsed = parsed.dropna()
    if parsed.empty:
        return {"min": None, "max": None}
    return {"min": parsed.min().date().isoformat(), "max": parsed.max().date().isoformat()}
