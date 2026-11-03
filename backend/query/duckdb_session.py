"""Execute a validated query against a session's DuckDB connection."""

from __future__ import annotations

from typing import Any

import duckdb

RESULT_ROWS_FOR_MODEL = 200

# Session connections only ever need the tables the app itself creates in
# them. Disabling external access means a query that slipped past the SQL
# guard still cannot read local files (read_csv, glob, '/path' scans),
# attach other databases, COPY out, or scan Python objects by name; locking
# the configuration stops a query from switching that back on.
SANDBOX_CONFIG = {"enable_external_access": False, "lock_configuration": True}


def connect_session_db(database: str = ":memory:") -> duckdb.DuckDBPyConnection:
    """Open a session's DuckDB database with filesystem access disabled."""
    return duckdb.connect(database=database, config=dict(SANDBOX_CONFIG))


def run_query(con: duckdb.DuckDBPyConnection, sql: str) -> dict[str, Any]:
    """Runs an already-validated SQL string. Returns rows + a note if the
    result was truncated before being handed back to the model."""
    cursor = con.execute(sql)
    columns = [d[0] for d in cursor.description]
    rows = cursor.fetchall()

    total_rows = len(rows)
    truncated = total_rows > RESULT_ROWS_FOR_MODEL
    display_rows = rows[:RESULT_ROWS_FOR_MODEL]

    return {
        "columns": columns,
        "rows": [list(r) for r in display_rows],
        "total_rows": total_rows,
        "truncated": truncated,
    }
