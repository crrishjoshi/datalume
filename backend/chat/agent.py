"""The tool-calling loop: model <-> run_sql tool <-> DuckDB, with a bounded
retry on invalid/failing SQL, then a final natural-language answer that
includes the SQL, a plain-English explanation, and an optional chart spec."""

from __future__ import annotations

import json
import logging
import re
import time
from collections.abc import Callable
from typing import Any

import duckdb

from backend.llm.provider import LLMProvider
from backend.models import Relationship, TableInfo
from backend.query.duckdb_session import run_query
from backend.query.sql_guard import SqlRejected, validate_and_cap

logger = logging.getLogger("chat_with_your_dashboard.agent")

_PLACEHOLDER_PATTERN = re.compile(r"\$\d+|(?<![\w'\"])\?(?![\w'\"])")

MAX_SQL_ATTEMPTS = 4  # 1 initial + 3 retries

_RUN_SQL_TOOL = {
    "type": "function",
    "function": {
        "name": "run_sql",
        "description": (
            "Run a single read-only SQL SELECT query against the uploaded data "
            "and return the result rows. Only SELECT/WITH/UNION queries over the "
            "listed tables are allowed."
        ),
        "parameters": {
            "type": "object",
            "properties": {
                "sql": {
                    "type": "string",
                    "description": "A single read-only SELECT statement (DuckDB SQL dialect).",
                }
            },
            "required": ["sql"],
        },
    },
}

_FINAL_ANSWER_TOOL = {
    "type": "function",
    "function": {
        "name": "final_answer",
        "description": "Give the final natural-language answer to the user's question, after you've queried the data.",
        "parameters": {
            "type": "object",
            "properties": {
                "answer": {"type": "string", "description": "A direct, plain-English answer to the question."},
                "explanation": {
                    "type": "string",
                    "description": "One or two sentences explaining, in business terms, what the query did and why.",
                },
                "chart": {
                    "type": "object",
                    "description": (
                        "Optional chart suggestion for the result. Omit if a chart wouldn't help. "
                        "Use 'scatter' when the question is about the relationship/correlation "
                        "between two numeric columns (x and y both numeric); 'line' for a trend "
                        "over a date/time column; 'pie' only for a small (<=6 row) breakdown; "
                        "'bar' otherwise."
                    ),
                    "properties": {
                        "type": {"type": "string", "enum": ["bar", "line", "pie", "scatter"]},
                        "x": {"type": "string"},
                        "y": {"type": "string"},
                        "title": {"type": "string"},
                    },
                },
                "follow_up_questions": {
                    "type": "array",
                    "description": (
                        "Optional: 1-3 natural follow-up questions a user might ask next, "
                        "given this question and result. Omit if nothing obvious follows."
                    ),
                    "items": {"type": "string"},
                    "maxItems": 3,
                },
            },
            "required": ["answer", "explanation"],
        },
    },
}


_SCHEMA_CHAR_BUDGET = 6000  # caps how much of the prompt full value-enumeration can consume


def _system_prompt(
    tables: list[TableInfo],
    relationships: list[Relationship],
    dashboard: dict[str, Any] | None = None,
) -> str:
    all_values_by_table: dict[str, dict[str, list[str]]] = {
        t["table"]: t.get("all_values", {}) for t in (dashboard or {}).get("tables", [])
    }

    lines = [
        "You are a data analyst assistant. You answer questions about the user's "
        "uploaded data by calling the run_sql tool to query it, then calling the "
        "final_answer tool with your answer.",
        "",
        "Available tables and columns:",
    ]
    schema_chars = 0
    for table in tables:
        lines.append(f"- {table.name} ({table.row_count} rows):")
        enumerated_for_table = all_values_by_table.get(table.name, {})
        for col in table.columns:
            enumerated = enumerated_for_table.get(col.name)
            if enumerated is not None and schema_chars < _SCHEMA_CHAR_BUDGET:
                values_str = ", ".join(enumerated)
                line = (
                    f"    {col.name} ({col.dtype}) — {col.description} "
                    f"ALL {len(enumerated)} distinct values: [{values_str}]"
                )
            else:
                samples = ", ".join(str(s) for s in col.sample_values[:3])
                line = f"    {col.name} ({col.dtype}) — {col.description} examples: [{samples}]"
            lines.append(line)
            schema_chars += len(line)

    if relationships:
        lines.append("")
        lines.append("Known relationships:")
        for rel in relationships:
            lines.append(f"- {rel.from_table}.{rel.from_column} -> {rel.to_table}.{rel.to_column}")

    lines += [
        "",
        "Follow this investigation protocol on every question:",
        "1. Identify the exact table(s) and column(s) the question refers to from the schema "
        "above — never assume a column exists or guess its name/spelling.",
        "2. If you need to filter or group by a specific categorical value and its full value "
        "list isn't already shown above (marked \"ALL N distinct values\"), run "
        "`SELECT DISTINCT <column> FROM <table>` first to see the exact spelling/casing before "
        "filtering — never guess a value string.",
        "3. Write the minimal SQL needed to answer the question — no unrelated columns or joins.",
        "4. Sanity-check the result before answering: an empty result, an unexpectedly zero/NULL "
        "aggregate, or a suspiciously large/small count usually means a wrong table, column, "
        "filter value, or join — reconsider and retry with a corrected query rather than "
        "reporting a result you're not confident in.",
        "5. Always call run_sql at least once before answering, unless the question isn't "
        "answerable from this data. Only call final_answer once the result plausibly answers "
        "the question — never answer in plain text directly.",
        "6. In final_answer, optionally suggest 1-3 short follow_up_questions that naturally "
        "build on this result (e.g. drill into a category the result surfaced, compare against "
        "another dimension, or look at the trend over time) — skip it if nothing obvious follows.",
        "7. This is historical data, not live data. For relative time phrases ('last quarter', "
        "'this year', 'recently'), first find the most recent date in the relevant date column "
        "(e.g. MAX(date_column)) and interpret the phrase relative to that date — not today's "
        "real-world date.",
        "",
        "The run_sql tool executes your SQL text literally — there is no parameter binding. "
        "Never use placeholders like ? or $1. If you need a computed value (like a max date), "
        "reference it with a CTE or scalar subquery in the same statement.",
    ]
    return "\n".join(lines)


def answer_question(
    provider: LLMProvider,
    con: duckdb.DuckDBPyConnection,
    tables: list[TableInfo],
    relationships: list[Relationship],
    question: str,
    chat_history: list[dict[str, str]],
    dashboard: dict[str, Any] | None = None,
    on_status: Callable[[str], None] | None = None,
) -> dict[str, Any]:
    """on_status, if given, is called with short human-readable progress
    strings ("Querying your data...", "Got 42 rows...") as the loop runs —
    lets the caller stream live status to the UI instead of a bare spinner
    while a local model works through the tool-calling turns."""
    start = time.monotonic()
    allowed_tables = {t.name for t in tables}
    tools = [_RUN_SQL_TOOL, _FINAL_ANSWER_TOOL]

    def emit(message: str) -> None:
        if on_status:
            on_status(message)

    messages: list[dict[str, Any]] = [
        {"role": "system", "content": _system_prompt(tables, relationships, dashboard)}
    ]
    for turn in chat_history[-6:]:  # small rolling window, not the whole history
        messages.append(turn)
    messages.append({"role": "user", "content": question})

    last_sql: str | None = None
    last_error: str | None = None
    last_result: dict[str, Any] | None = None
    sql_attempts = 0
    llm_time = 0.0
    sql_time = 0.0

    for _ in range(MAX_SQL_ATTEMPTS + 2):  # + a couple turns for the final_answer call
        emit("Thinking about your question..." if sql_attempts == 0 else "Reviewing the result...")
        llm_start = time.monotonic()
        response = provider.chat(messages, tools=tools)
        llm_time += time.monotonic() - llm_start

        tool_calls = response.get("tool_calls")
        if not tool_calls:
            # Model answered in plain text instead of calling final_answer. It
            # is only a safe fallback after a verified SQL result exists.
            content = response.get("content") or "I couldn't produce an answer."
            if last_result is None:
                logger.warning("chat returned unverified plain text without a SQL result q=%r", question)
                return {
                    "answer": "I couldn't verify that answer against the uploaded data — could you rephrase the question?",
                    "sql": last_sql,
                    "explanation": "The model did not run a data query, so I did not treat its response as verified.",
                    "chart": None,
                    "follow_up_questions": [],
                    "result": None,
                    "success": False,
                    "elapsed": time.monotonic() - start,
                }
            logger.info(
                "chat done (plain text fallback) q=%r sql=%r total=%.2fs llm=%.2fs sql=%.2fs",
                question, last_sql, time.monotonic() - start, llm_time, sql_time,
            )
            return {
                "answer": content,
                "sql": last_sql,
                "explanation": None,
                "chart": None,
                "follow_up_questions": [],
                "result": last_result,
                "success": True,
                "elapsed": time.monotonic() - start,
            }

        messages.append({"role": "assistant", "content": response.get("content") or "", "tool_calls": [
            {"function": {"name": tc["name"], "arguments": tc["arguments"]}} for tc in tool_calls
        ]})

        for call in tool_calls:
            if call["name"] == "final_answer":
                args = call["arguments"]
                logger.info(
                    "chat done q=%r sql=%r total=%.2fs llm=%.2fs sql=%.2fs",
                    question, last_sql, time.monotonic() - start, llm_time, sql_time,
                )
                raw_follow_ups = args.get("follow_up_questions") or []
                follow_up_questions = [
                    q.strip() for q in raw_follow_ups if isinstance(q, str) and q.strip()
                ][:3]
                return {
                    "answer": args.get("answer", ""),
                    "sql": last_sql,
                    "explanation": args.get("explanation"),
                    "chart": args.get("chart"),
                    "follow_up_questions": follow_up_questions,
                    "result": last_result,
                    "success": True,
                    "elapsed": time.monotonic() - start,
                }

            if call["name"] == "run_sql":
                sql_attempts += 1
                candidate_sql = call["arguments"].get("sql", "")
                last_sql = candidate_sql
                emit("Querying your data..." if sql_attempts == 1 else "That query needed a fix — retrying...")
                try:
                    if sql_attempts > MAX_SQL_ATTEMPTS:
                        raise SqlRejected("Too many failed attempts — giving up on this query.")
                    if _PLACEHOLDER_PATTERN.search(candidate_sql):
                        raise SqlRejected(
                            "This SQL uses a bind-parameter placeholder (? or $1). The "
                            "run_sql tool has no parameter binding — rewrite it as a single "
                            "self-contained statement using a CTE or scalar subquery instead "
                            "of a placeholder."
                        )
                    safe_sql = validate_and_cap(candidate_sql, allowed_tables)
                    sql_start = time.monotonic()
                    result = run_query(con, safe_sql)
                    sql_time += time.monotonic() - sql_start
                    last_error = None
                    last_result = {
                        "columns": result["columns"],
                        "rows": result["rows"],
                        "total_rows": result["total_rows"],
                        "truncated": result["truncated"],
                    }
                    tool_content = json.dumps(
                        {
                            "columns": result["columns"],
                            "rows": result["rows"],
                            "total_rows": result["total_rows"],
                            "truncated_note": (
                                f"Showing first {len(result['rows'])} of {result['total_rows']} rows."
                                if result["truncated"]
                                else None
                            ),
                        },
                        default=str,
                    )
                    n = result["total_rows"]
                    emit(f"Got {n} row{'s' if n != 1 else ''} back — writing your answer...")
                except (SqlRejected, duckdb.Error) as exc:
                    last_error = str(exc)
                    logger.warning("sql rejected/failed q=%r sql=%r error=%s", question, candidate_sql, exc)
                    tool_content = json.dumps({"error": last_error})
                    emit("That didn't quite work — trying a different approach...")

                messages.append({"role": "tool", "content": tool_content})

    # Exhausted attempts without a final_answer call.
    logger.warning("chat gave up q=%r last_sql=%r last_error=%s", question, last_sql, last_error)
    return {
        "answer": "I couldn't reliably answer that from the data — could you rephrase the question?",
        "sql": last_sql,
        "explanation": last_error,
        "chart": None,
        "follow_up_questions": [],
        "result": last_result,
        "success": False,
        "elapsed": time.monotonic() - start,
    }
