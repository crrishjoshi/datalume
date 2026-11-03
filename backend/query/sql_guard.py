"""The actual security boundary: every model-generated SQL string passes
through here before it ever touches DuckDB. Allow-list based, not a denylist
of keywords, so there's no bypass-by-synonym surface."""

from __future__ import annotations

import sqlglot
from sqlglot import exp

DEFAULT_ROW_LIMIT = 500

_ALLOWED_STATEMENT_TYPES = (exp.Select, exp.SetOperation)  # SELECT, and UNION/INTERSECT/EXCEPT of SELECTs


class SqlRejected(ValueError):
    pass


def validate_and_cap(sql: str, allowed_tables: set[str]) -> str:
    """Raises SqlRejected if the query isn't a single read-only SELECT (optionally
    with CTEs) restricted to known tables. Returns the query with a LIMIT applied
    if it didn't already have one at or under DEFAULT_ROW_LIMIT."""
    sql = sql.strip().rstrip(";")

    if ";" in sql:
        raise SqlRejected("Only a single SQL statement is allowed.")

    try:
        statements = sqlglot.parse(sql, read="duckdb")
    except Exception as exc:
        raise SqlRejected(f"Couldn't parse SQL: {exc}") from exc

    if len(statements) != 1 or statements[0] is None:
        raise SqlRejected("Only a single SQL statement is allowed.")

    tree = statements[0]

    if not isinstance(tree, _ALLOWED_STATEMENT_TYPES):
        raise SqlRejected(
            f"Only SELECT queries are allowed, got {type(tree).__name__}."
        )

    # Defense in depth: explicitly reject any write/DDL/admin node anywhere
    # in the tree (covers subqueries, CTEs).
    forbidden_types = (
        exp.Insert,
        exp.Update,
        exp.Delete,
        exp.Drop,
        exp.Create,
        exp.Alter,
        exp.TruncateTable,
        exp.Attach,
        exp.Copy,
        exp.Command,  # catches PRAGMA/INSTALL/LOAD/CALL/EXPORT/VACUUM etc.
    )
    for node in tree.walk():
        node_obj = node[0] if isinstance(node, tuple) else node
        if isinstance(node_obj, forbidden_types):
            raise SqlRejected(f"'{node_obj.key}' is not allowed in queries.")

    # A FROM-clause function call (read_csv, glob, range, ...) parses as a
    # Table with no plain name. Name the reason rather than reporting an
    # "unknown table" with an empty name.
    for table in tree.find_all(exp.Table):
        if not isinstance(table.this, exp.Identifier):
            raise SqlRejected("Table functions are not allowed; query the session's tables directly.")

    cte_names = {c.alias.lower() for c in tree.find_all(exp.CTE) if c.alias}
    referenced_tables = {t.name.lower() for t in tree.find_all(exp.Table)}
    unknown = referenced_tables - {t.lower() for t in allowed_tables} - cte_names
    if unknown:
        raise SqlRejected(f"Query references unknown table(s): {', '.join(sorted(unknown))}")

    if tree.args.get("limit") is None:
        tree = tree.limit(DEFAULT_ROW_LIMIT)
    else:
        limit_expr = tree.args["limit"].expression
        try:
            if int(limit_expr.this) > DEFAULT_ROW_LIMIT:
                tree.set("limit", exp.Limit(expression=exp.Literal.number(DEFAULT_ROW_LIMIT)))
        except (TypeError, ValueError):
            tree.set("limit", exp.Limit(expression=exp.Literal.number(DEFAULT_ROW_LIMIT)))

    return tree.sql(dialect="duckdb")
