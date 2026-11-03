"""Turn an uploaded CSV/Excel/PBIX file into DuckDB tables + a schema description."""

from __future__ import annotations

import io
import re
import zipfile
from pathlib import Path

import duckdb
import pandas as pd

from backend.models import ColumnInfo, Relationship, TableInfo
from backend.query.duckdb_session import connect_session_db

MAX_UPLOAD_BYTES = 300 * 1024 * 1024  # 300 MB
MAX_ROWS_PER_TABLE = 5_000_000
MAX_TABLES = 100
SAMPLE_VALUES_PER_COLUMN = 5


class UploadTooLarge(ValueError):
    pass


class UnsupportedFile(ValueError):
    pass


class PbixParseError(ValueError):
    pass


def _parse_file(
    filename: str,
    content: bytes | None = None,
    source_path: str | Path | None = None,
) -> tuple[dict[str, pd.DataFrame], list[Relationship]]:
    """Dispatch on file extension into sanitized DataFrames, plus any
    relationships the source format declared natively (currently only .pbix;
    empty for CSV/Excel, which fall back to name-based heuristics). Pure
    parsing — no DuckDB connection is created here, so this is reusable both
    for a brand-new upload and for adding a file to an existing session."""
    if content is None and source_path is None:
        raise UnsupportedFile("No upload data was provided.")
    content_size = len(content) if content is not None else Path(source_path).stat().st_size
    if content_size > MAX_UPLOAD_BYTES:
        raise UploadTooLarge(
            f"File is {content_size / 1_000_000:.1f} MB, which is over the "
            f"{MAX_UPLOAD_BYTES / 1_000_000:.0f} MB limit."
        )

    native_relationships: list[Relationship] = []
    lower = filename.lower()
    source = io.BytesIO(content) if content is not None else str(source_path)
    try:
        if lower.endswith(".csv"):
            frames = {_table_name_from_filename(filename): pd.read_csv(source)}
        elif lower.endswith((".xlsx", ".xls")):
            sheets = pd.read_excel(source, sheet_name=None)
            frames = {_sanitize_identifier(name): df for name, df in sheets.items()}
        elif lower.endswith(".pbix"):
            frames, native_relationships = _load_pbix(content, source_path=source_path)
        else:
            raise UnsupportedFile(
                f"Unsupported file type for '{filename}'. Upload a .csv, .xlsx, or .pbix file."
            )
    except (UnsupportedFile, PbixParseError):
        raise
    except (
        pd.errors.EmptyDataError,
        pd.errors.ParserError,
        UnicodeDecodeError,
        ValueError,
        OSError,
        zipfile.BadZipFile,
        ImportError,
    ) as exc:
        raise UnsupportedFile(
            f"Couldn't read '{filename}'. Check that it is a non-empty, valid "
            "CSV or Excel file and try again."
        ) from exc

    if not frames or any(df.shape[1] == 0 for df in frames.values()):
        raise UnsupportedFile(f"'{filename}' doesn't contain any usable columns.")

    if len(frames) > MAX_TABLES:
        raise UnsupportedFile(f"File has {len(frames)} tables, which is over the {MAX_TABLES} limit.")

    frames = {name: _coerce_date_columns(_sanitize_columns(df)) for name, df in frames.items()}

    # Column sanitization can (rarely) rename a column away from the plain
    # `_sanitize_identifier` guess used in _extract_pbix_relationships (e.g. a
    # same-named-after-cleaning collision gets a numeric suffix) — drop any
    # relationship that no longer resolves rather than pointing at a column
    # that doesn't exist.
    native_relationships = [
        r
        for r in native_relationships
        if r.from_table in frames
        and r.to_table in frames
        and r.from_column in frames[r.from_table].columns
        and r.to_column in frames[r.to_table].columns
    ]

    for name, df in frames.items():
        if len(df) > MAX_ROWS_PER_TABLE:
            raise UnsupportedFile(
                f"Table '{name}' has {len(df):,} rows, which is over the "
                f"{MAX_ROWS_PER_TABLE:,} row limit."
            )

    return frames, native_relationships


def register_frames(con: duckdb.DuckDBPyConnection, frames: dict[str, pd.DataFrame]) -> None:
    """Create a real DuckDB table for each DataFrame on the given connection."""
    for name, df in frames.items():
        con.register(f"_{name}_df", df)
        con.execute(f'CREATE TABLE "{name}" AS SELECT * FROM "_{name}_df"')
        con.unregister(f"_{name}_df")


def load_upload(
    filename: str, content: bytes | None = None, database: str = ":memory:", source_path: str | Path | None = None
) -> tuple[duckdb.DuckDBPyConnection, dict[str, pd.DataFrame], list[Relationship]]:
    """Parse a freshly uploaded file into a brand-new in-memory DuckDB
    connection with every table registered, plus the raw DataFrames (for
    schema building) and any natively-declared relationships."""
    frames, native_relationships = _parse_file(filename, content, source_path=source_path)

    con = connect_session_db(database)
    register_frames(con, frames)

    return con, frames, native_relationships


def parse_additional_upload(
    filename: str,
    content: bytes | None,
    existing_table_names: set[str],
    source_path: str | Path | None = None,
) -> tuple[dict[str, pd.DataFrame], list[Relationship]]:
    """Parse a file being added to an *existing* session. Table names that
    collide with a table already in the session are suffixed (_2, _3, ...)
    so the new file never silently overwrites existing data; any native
    relationship pointing at a renamed table is remapped to match."""
    frames, native_relationships = _parse_file(filename, content, source_path=source_path)

    rename_map: dict[str, str] = {}
    taken = set(existing_table_names)
    for name in list(frames.keys()):
        new_name = name
        suffix = 2
        while new_name in taken:
            new_name = f"{name}_{suffix}"
            suffix += 1
        taken.add(new_name)
        if new_name != name:
            rename_map[name] = new_name

    if rename_map:
        frames = {rename_map.get(name, name): df for name, df in frames.items()}
        native_relationships = [
            Relationship(
                from_table=rename_map.get(r.from_table, r.from_table),
                from_column=r.from_column,
                to_table=rename_map.get(r.to_table, r.to_table),
                to_column=r.to_column,
            )
            for r in native_relationships
        ]

    return frames, native_relationships


def _load_pbix(
    content: bytes | None, source_path: str | Path | None = None
) -> tuple[dict[str, pd.DataFrame], list[Relationship]]:
    from pbixray import PBIXRay

    import tempfile

    temporary = tempfile.NamedTemporaryFile(suffix=".pbix", delete=True) if content is not None else None
    try:
        tmp_path = source_path
        if temporary is not None:
            temporary.write(content)
            temporary.flush()
            tmp_path = temporary.name
        if tmp_path is None:
            raise PbixParseError("No .pbix source was provided.")
        try:
            model = PBIXRay(str(tmp_path))
            table_names = list(model.tables)
            if not table_names:
                raise PbixParseError(
                    "This .pbix has no embedded data model (it looks like a "
                    "DirectQuery-only file). Export the underlying data to CSV/Excel "
                    "and upload that instead."
                )
            frames = {}
            for name in table_names:
                df = model.get_table(name)
                if df is not None and len(df) > 0:
                    frames[_sanitize_identifier(name)] = df
            if not frames:
                raise PbixParseError(
                    "This .pbix's data model appears to be empty. Export the "
                    "underlying data to CSV/Excel and upload that instead."
                )
            relationships = _extract_pbix_relationships(model, frames)
            return frames, relationships
        except PbixParseError:
            raise
        except Exception as exc:  # pbixray can raise a variety of internal errors on odd files
            raise PbixParseError(
                "Couldn't parse this .pbix file's data model "
                f"({exc.__class__.__name__}). Export the underlying data to "
                "CSV/Excel and upload that instead."
            ) from exc
    finally:
        if temporary is not None:
            temporary.close()


def _extract_pbix_relationships(model, frames: dict[str, pd.DataFrame]) -> list[Relationship]:
    """Power BI's own VertiPaq relationships (the real PK/FK links the report
    author defined in the data model) are far more reliable than the
    name-based heuristic used for CSV/Excel, which has nothing but column
    names to go on. Only active relationships are used — an inactive one
    needs an explicit USERELATIONSHIP in DAX to take effect, so surfacing it
    as a plain join would misrepresent how the model actually filters."""
    try:
        rel_df = model.relationships
    except Exception:
        return []
    if rel_df is None or len(rel_df) == 0:
        return []

    relationships = []
    for row in rel_df.to_dict("records"):
        if not row.get("IsActive", True):
            continue
        from_table, from_column = row.get("FromTableName"), row.get("FromColumnName")
        to_table, to_column = row.get("ToTableName"), row.get("ToColumnName")
        if not all(isinstance(v, str) and v for v in (from_table, from_column, to_table, to_column)):
            continue
        from_table_clean = _sanitize_identifier(from_table)
        to_table_clean = _sanitize_identifier(to_table)
        if from_table_clean not in frames or to_table_clean not in frames:
            continue
        relationships.append(
            Relationship(
                from_table=from_table_clean,
                from_column=_sanitize_identifier(from_column),
                to_table=to_table_clean,
                to_column=_sanitize_identifier(to_column),
            )
        )
    return relationships


def build_schema(frames: dict[str, pd.DataFrame]) -> list[TableInfo]:
    tables = []
    for name, df in frames.items():
        columns = []
        for col in df.columns:
            series = df[col]
            samples = series.dropna().unique()[:SAMPLE_VALUES_PER_COLUMN].tolist()
            columns.append(
                ColumnInfo(
                    name=str(col),
                    dtype=str(series.dtype),
                    null_count=int(series.isna().sum()),
                    sample_values=[_jsonable(v) for v in samples],
                    description=_describe_column(str(col), series),
                )
            )
        tables.append(TableInfo(name=name, row_count=len(df), columns=columns))
    return tables


_ID_SUFFIX = {"id"}
_MONEY_WORDS = {"amount", "sales", "profit", "price", "revenue", "cost", "discount", "fee", "salary", "income", "total"}
_COUNT_WORDS = {"qty", "quantity", "count", "units", "stock"}
GEO_WORDS = {"region", "country", "city", "state", "province", "territory", "location"}
_CATEGORY_WORDS = {"status", "category", "type", "segment", "class", "group", "tier", "level"}


def _tokenize_column_name(name: str) -> list[str]:
    """Split a (possibly snake_case or camelCase) column name into lowercase
    word tokens, e.g. 'Order_Date' / 'OrderDate' -> ['order', 'date']."""
    tokens: list[str] = []
    for part in re.split(r"[^A-Za-z0-9]+", name):
        if not part:
            continue
        tokens.extend(re.findall(r"[A-Z]?[a-z0-9]+|[A-Z]+(?![a-z])", part))
    return [t.lower() for t in tokens]


def _describe_column(name: str, series: pd.Series) -> str:
    """Heuristic, no-LLM column description from name tokens + dtype +
    cardinality. Falls back to a neutral dtype-only description (e.g. 'Numeric
    field.') when the name doesn't match a known business term, rather than
    inventing semantics it can't infer (e.g. for 'GM2' or 'Metric_A')."""
    tokens = _tokenize_column_name(name)
    is_numeric = pd.api.types.is_numeric_dtype(series)
    is_datetime = pd.api.types.is_datetime64_any_dtype(series)
    is_bool = pd.api.types.is_bool_dtype(series)
    non_null = series.dropna()

    if tokens and tokens[-1] in _ID_SUFFIX:
        subject = " ".join(tokens[:-1])
        if not subject:
            return "Identifier field."
        article = "an" if subject[0] in "aeiou" else "a"
        return f"Identifier field, likely referencing {article} {subject} record."

    if is_datetime or "date" in tokens or "time" in tokens:
        subject = " ".join(t for t in tokens if t not in ("date", "time"))
        return f"Date field representing {subject} timestamps." if subject else "Date field."

    if _MONEY_WORDS & set(tokens):
        return "Numeric monetary field."
    if _COUNT_WORDS & set(tokens):
        return "Numeric count field."
    if GEO_WORDS & set(tokens):
        return "Categorical geographic field."
    if _CATEGORY_WORDS & set(tokens):
        return "Categorical field."
    if "name" in tokens:
        return "Text field representing a name."

    if is_bool:
        return "Boolean field."
    if is_numeric:
        return "Numeric field."
    if is_datetime:
        return "Date field."

    nunique = non_null.nunique()
    if len(non_null) > 0 and (nunique <= 20 or nunique / len(non_null) <= 0.05):
        return "Categorical field."
    return "Text field."


def detect_relationships(frames: dict[str, pd.DataFrame], pbix_relationships: list[Relationship] | None = None) -> list[Relationship]:
    """Heuristic FK detection across tables by shared column names ending in
    'id' (case-insensitive). Only meaningful for multi-table uploads."""
    if pbix_relationships:
        return pbix_relationships
    if len(frames) < 2:
        return []

    id_columns: dict[str, list[str]] = {}  # column name (lower) -> [table names]
    for table_name, df in frames.items():
        for col in df.columns:
            if re.search(r"(id)$", str(col), re.IGNORECASE):
                id_columns.setdefault(str(col).lower(), []).append(table_name)

    relationships = []
    for col_lower, table_names in id_columns.items():
        if len(table_names) < 2:
            continue
        original_names = {
            t: next(c for c in frames[t].columns if str(c).lower() == col_lower) for t in table_names
        }
        anchor = table_names[0]
        for other in table_names[1:]:
            relationships.append(
                Relationship(
                    from_table=other,
                    from_column=original_names[other],
                    to_table=anchor,
                    to_column=original_names[anchor],
                )
            )
    return relationships


def _sanitize_columns(df: pd.DataFrame) -> pd.DataFrame:
    """Rename columns to plain identifiers (letters/digits/underscore) so the
    model never has to guess quoting rules for names like "Order Date"."""
    seen: dict[str, int] = {}
    new_names = []
    for col in df.columns:
        clean = _sanitize_identifier(str(col))
        if clean in seen:
            seen[clean] += 1
            clean = f"{clean}_{seen[clean]}"
        else:
            seen[clean] = 0
        new_names.append(clean)
    return df.set_axis(new_names, axis=1)


def _coerce_date_columns(df: pd.DataFrame) -> pd.DataFrame:
    """Parse columns that look like dates (by name) into real datetime64
    values, so DuckDB stores them as DATE/TIMESTAMP and date functions
    (MAX, DATE_TRUNC, etc.) work without the model having to guess a CAST."""
    df = df.copy()
    for col in df.columns:
        if df[col].dtype == object and re.search(r"date|time", str(col), re.IGNORECASE):
            parsed = pd.to_datetime(df[col], errors="coerce")
            non_null = df[col].notna().sum()
            if non_null > 0 and parsed.notna().sum() / non_null >= 0.95:
                df[col] = parsed
    return df


def _table_name_from_filename(filename: str) -> str:
    base = filename.rsplit(".", 1)[0]
    return _sanitize_identifier(base) or "data"


def _sanitize_identifier(name: str) -> str:
    cleaned = re.sub(r"\W+", "_", str(name)).strip("_")
    return cleaned or "table"


def _jsonable(value):
    if pd.isna(value):
        return None
    if hasattr(value, "isoformat"):
        return value.isoformat()
    if hasattr(value, "item"):  # numpy scalar
        return value.item()
    return value
