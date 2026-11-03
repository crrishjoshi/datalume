"""One-time, LLM-written plain-English overview of the whole dataset.

Distinct from insights.py's per-chart `highlight` sentences (deterministic
templates scoped to one dimension/measure pair): this synthesizes across every
table's stats into a single skimmable paragraph — what the data covers, its
scale, and the one most notable pattern or caveat. Supplementary, like
insights — any failure (unreachable model, malformed response) degrades to
None so the dashboard renders exactly as before, never a 500.
"""

from __future__ import annotations

import logging
from typing import Any

from backend.llm.provider import LLMProvider

logger = logging.getLogger(__name__)

MAX_NARRATIVE_CHARS = 480  # ~2-3 sentences — a skimmable headline, not a wall of text

_SYSTEM_PROMPT = (
    "You write a single short, plain-English overview of an uploaded dataset for a "
    "business dashboard. Given the stats below, write 2-3 sentences (no more than "
    f"{MAX_NARRATIVE_CHARS} characters) that a non-technical reader can skim in five "
    "seconds: what the data covers, its scale, and the single most notable pattern or "
    "caveat (e.g. a dominant category, a data-quality issue, a wide date range). "
    "Plain prose only — no markdown, no bullet points, no headers, no restating these "
    "instructions, no preamble like 'Here is a summary'. Never invent numbers that "
    "aren't present in the stats below."
)


def _describe_table_for_prompt(table: dict[str, Any]) -> str:
    lines = [f'Table "{table["table"]}": {table["row_count"]} rows, {table["column_count"]} columns.']
    if table["numeric_columns"]:
        lines.append(f"Numeric columns: {', '.join(table['numeric_columns'])}.")
    if table["categorical_columns"]:
        lines.append(f"Categorical columns: {', '.join(table['categorical_columns'])}.")
    for col, stats in table["date_stats"].items():
        if stats["min"] and stats["max"]:
            lines.append(f'"{col}" spans {stats["min"]} to {stats["max"]}.')
    for col, cats in table["top_categories"].items():
        if cats:
            lines.append(f'Most common "{col}": {cats[0]["value"]} ({cats[0]["count"]} rows).')
    if table["outlier_counts"]:
        worst_col, worst_n = max(table["outlier_counts"].items(), key=lambda kv: kv[1])
        lines.append(f'"{worst_col}" has {worst_n} statistical outliers.')
    if table["duplicate_rows"]:
        lines.append(f"{table['duplicate_rows']} duplicate rows detected.")
    return " ".join(lines)


def generate_narrative(provider: LLMProvider, dashboard: dict[str, Any]) -> str | None:
    tables = dashboard.get("tables") or []
    if not tables:
        return None

    prompt_body = "\n".join(_describe_table_for_prompt(t) for t in tables)
    messages = [
        {"role": "system", "content": _SYSTEM_PROMPT},
        {"role": "user", "content": prompt_body},
    ]
    try:
        response = provider.chat(messages, tools=None)
        text = (response.get("content") or "").strip()
    except Exception:
        logger.exception("narrative generation failed")
        return None

    if not text:
        return None
    if len(text) > MAX_NARRATIVE_CHARS:
        text = text[:MAX_NARRATIVE_CHARS].rsplit(" ", 1)[0].rstrip(".,;: ") + "…"
    return text
