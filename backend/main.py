"""FastAPI app: POST /upload, POST /chat, GET /dashboard/{session_id}.
Serves the static frontend too, so the whole thing runs as one process."""

from __future__ import annotations

import asyncio
import json
import logging
import os
import tempfile
import time
import uuid
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Annotated

import duckdb
from fastapi import FastAPI, HTTPException, Request, UploadFile
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

from backend.chat.agent import answer_question
from backend.auth import (
    AuthError,
    AuthMiddleware,
    auth_store,
    clear_auth_cookie,
    current_user_id,
    login_throttle,
    set_auth_cookie,
)
from backend.data.loaders import (
    MAX_UPLOAD_BYTES,
    MAX_TABLES,
    PbixParseError,
    UnsupportedFile,
    UploadTooLarge,
    _sanitize_identifier,
    build_schema,
    detect_relationships,
    load_upload,
    parse_additional_upload,
    register_frames,
)
from backend.dashboard.insights import (
    InvalidView,
    build_custom_insight,
    build_insights_from_proposals,
    detect_candidates,
    propose_views,
)
from backend.dashboard.narrative import generate_narrative
from backend.dashboard.summary import build_dashboard, suggest_questions
from backend.llm.ollama_provider import OllamaProvider
from backend.models import (
    Relationship,
    Session,
    drop_session,
    get_session,
    new_session_id,
    persist_session,
    restore_persisted_sessions,
    store_session,
    sweep_expired_sessions,
    touch_session,
)
from backend.query.duckdb_session import run_query
from backend.query.sql_guard import SqlRejected, validate_and_cap
from backend.security_headers import SecurityHeadersMiddleware
from backend.storage import session_db_path

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s %(message)s")
logger = logging.getLogger("chat_with_your_dashboard.main")

SWEEP_INTERVAL_SECONDS = 5 * 60
MAX_QUERY_LOG_ENTRIES = 200
# The agent only reads the last few turns (backend/chat/agent.py), but the
# whole list is persisted on every request, so keep a bounded tail.
MAX_CHAT_HISTORY_ENTRIES = 40
MAX_CHAT_MESSAGE_CHARS = 4_000
MAX_SQL_CHARS = 20_000
MAX_NAME_CHARS = 256

provider = OllamaProvider()
# Model choice is per account. /models/select used to assign provider.model on
# this shared instance, so one user's pick silently switched the model for every
# other user, including their in-flight chats. The shared instance now only
# holds the server default; a user's pick lives here (in memory, so it resets to
# the default on restart) and is applied through _provider_for_user().
_selected_models: dict[str, str] = {}


def _provider_for_user() -> OllamaProvider:
    """The provider for the signed-in user's chosen model. Resolve it in the
    request handler, not in a worker thread or a streaming generator, so it
    reads the auth context of the request that asked."""
    user_id = current_user_id()
    model = _selected_models.get(user_id) if user_id else None
    if not model or model == provider.model:
        return provider
    return OllamaProvider(provider.base_url, model)


UPLOAD_CHUNK_BYTES = 1024 * 1024


@asynccontextmanager
async def lifespan(app: FastAPI):
    restored = restore_persisted_sessions()
    if restored:
        logger.info("restored %d durable session(s)", len(restored))
    sweep_task = asyncio.create_task(_sweep_loop())
    yield
    sweep_task.cancel()


async def _sweep_loop() -> None:
    while True:
        await asyncio.sleep(SWEEP_INTERVAL_SECONDS)
        expired = sweep_expired_sessions()
        if expired:
            logger.info("swept %d expired session(s): %s", len(expired), expired)


app = FastAPI(title="Chat With Your Dashboard", lifespan=lifespan)
app.add_middleware(
    AuthMiddleware,
)
allowed_origins = [
    origin.strip()
    for origin in os.environ.get("DATALUME_ALLOWED_ORIGINS", "").split(",")
    if origin.strip()
]
if allowed_origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
# Added last so it is outermost: auth 401s and CORS responses get the headers too.
app.add_middleware(SecurityHeadersMiddleware)

FRONTEND_DIR = Path(__file__).resolve().parent.parent / "frontend"


# Length bounds on every free-text field: these strings are parsed (sqlglot),
# sent to the model, and persisted in session metadata on each request.
SessionId = Annotated[str, Field(max_length=64)]
Name = Annotated[str, Field(max_length=MAX_NAME_CHARS)]


class ChatRequest(BaseModel):
    session_id: SessionId
    message: str = Field(max_length=MAX_CHAT_MESSAGE_CHARS)


class RunSqlRequest(BaseModel):
    session_id: SessionId
    sql: str = Field(max_length=MAX_SQL_CHARS)


class FeedbackRequest(BaseModel):
    entry_id: str = Field(max_length=64)
    rating: str = Field(max_length=8)  # "up" | "down" | "none" (none clears a prior rating)


class RenameTableRequest(BaseModel):
    new_name: Name


class CustomInsightRequest(BaseModel):
    table: Name
    dimension: Name
    measure: Name | None = None
    agg: str = Field(max_length=32)
    chart_type: str = Field(max_length=32)
    title: Name | None = None
    filter_column: Name | None = None
    filter_value: str | None = Field(default=None, max_length=1_000)
    filter_measure: Name | None = None
    filter_operator: str | None = Field(default=None, max_length=32)
    filter_threshold: float | None = None


class ModelSelectRequest(BaseModel):
    model: Name


class RelationshipRequest(BaseModel):
    from_table: Name
    from_column: Name
    to_table: Name
    to_column: Name


@app.exception_handler(RequestValidationError)
async def validation_error_handler(request: Request, exc: RequestValidationError):
    """The frontend shows `detail` as a message string; FastAPI's default puts
    a list there (and echoes the rejected input back, which for an oversized
    field means the whole payload). Return a readable string instead."""
    errors = [
        {"loc": list(e.get("loc", ())), "msg": str(e.get("msg", "")), "type": str(e.get("type", ""))}
        for e in exc.errors()
    ]
    first = errors[0] if errors else {}
    field_name = ".".join(str(part) for part in first.get("loc", []) if part != "body")
    message = first.get("msg") or "Invalid request."
    detail = f"{field_name}: {message}" if field_name else message
    return JSONResponse(status_code=422, content={"detail": detail, "errors": errors})


class AuthRequest(BaseModel):
    # Bounds keep a hostile body from feeding megabytes into PBKDF2.
    username: str = Field(max_length=128)
    password: str = Field(max_length=1024)


@app.get("/auth/status")
async def auth_status():
    has_users = await asyncio.to_thread(auth_store.has_users)
    return {"authenticated": current_user_id() is not None, "has_users": has_users}


@app.post("/auth/register")
async def register(request: AuthRequest):
    try:
        await asyncio.to_thread(auth_store.register, request.username, request.password)
        token, user_id = await asyncio.to_thread(auth_store.login, request.username, request.password)
    except AuthError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    response = JSONResponse({"ok": True, "user_id": user_id})
    set_auth_cookie(response, token)
    return response


@app.post("/auth/login")
async def login(request: AuthRequest, http_request: Request):
    client = http_request.client.host if http_request.client else None
    retry_after = login_throttle.retry_after(request.username, client)
    if retry_after:
        raise HTTPException(
            status_code=429,
            detail="Too many failed sign-in attempts. Try again later.",
            headers={"Retry-After": str(retry_after)},
        )
    try:
        token, user_id = await asyncio.to_thread(auth_store.login, request.username, request.password)
    except AuthError as exc:
        login_throttle.record_failure(request.username, client)
        raise HTTPException(status_code=401, detail=str(exc)) from exc
    login_throttle.record_success(request.username)
    response = JSONResponse({"ok": True, "user_id": user_id})
    set_auth_cookie(response, token)
    return response


@app.post("/auth/logout")
async def logout(request: Request):
    await asyncio.to_thread(auth_store.logout, request.cookies.get("datalume_auth"))
    response = JSONResponse({"ok": True})
    clear_auth_cookie(response)
    return response


def _session_or_404(session_id: str) -> Session:
    session = get_session(session_id, touch=False)
    if session is None or session.owner_user_id != current_user_id():
        raise HTTPException(status_code=404, detail="Session not found or expired. Please upload again.")
    touch_session(session)
    return session


async def _spool_upload(file: UploadFile) -> tuple[Path, int]:
    """Copy multipart input to a bounded temporary file without materialising it in RAM."""
    suffix = Path(file.filename or "upload").suffix[:16]
    descriptor, raw_path = tempfile.mkstemp(prefix="datalume-upload-", suffix=suffix)
    path = Path(raw_path)
    total = 0
    try:
        with os.fdopen(descriptor, "wb") as target:
            while True:
                chunk = await file.read(UPLOAD_CHUNK_BYTES)
                if not chunk:
                    break
                total += len(chunk)
                if total > MAX_UPLOAD_BYTES:
                    raise UploadTooLarge(
                        f"File is over the {MAX_UPLOAD_BYTES / 1_000_000:.0f} MB limit."
                    )
                target.write(chunk)
        return path, total
    except Exception:
        path.unlink(missing_ok=True)
        raise


def _prepare_upload(filename: str, source_path: str, database_path: str):
    """Parse and profile an upload off the event loop.

    Pandas, DuckDB registration, and the dashboard profiling work are all
    synchronous. Keeping them together in one worker also means a partially
    prepared in-memory connection is closed if schema construction fails.
    """
    con = None
    try:
        con, frames, native_relationships = load_upload(
            filename, database=database_path, source_path=source_path
        )
        tables = build_schema(frames)
        relationships = detect_relationships(frames, native_relationships)
        dashboard = build_dashboard(frames)
        questions = suggest_questions(frames)
        return con, frames, tables, relationships, dashboard, questions
    except Exception:
        if con is not None:
            con.close()
        Path(database_path).unlink(missing_ok=True)
        raise


@app.post("/upload")
async def upload(file: UploadFile):
    start = time.monotonic()
    filename = file.filename or "upload"
    try:
        source_path, _ = await _spool_upload(file)
    except UploadTooLarge as exc:
        raise HTTPException(status_code=413, detail=str(exc)) from exc
    session_id = new_session_id()
    database_path = str(session_db_path(session_id))

    try:
        con, frames, tables, relationships, dashboard, questions = await asyncio.to_thread(
            _prepare_upload, filename, str(source_path), database_path
        )
    except UploadTooLarge as exc:
        raise HTTPException(status_code=413, detail=str(exc)) from exc
    except (UnsupportedFile, PbixParseError) as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    finally:
        source_path.unlink(missing_ok=True)

    load_time = time.monotonic() - start

    session = Session(
        id=session_id,
        con=con,
        tables=tables,
        relationships=relationships,
        dashboard=dashboard,
        suggested_questions=questions,
        source_filename=filename,
        owner_user_id=current_user_id() or "",
        db_path=database_path,
    )
    store_session(session)

    total_time = time.monotonic() - start
    logger.info(
        "upload done file=%r tables=%d rows=%d load=%.2fs total=%.2fs",
        filename, len(tables), sum(t.row_count for t in tables), load_time, total_time,
    )

    return {
        "session_id": session.id,
        "schema": _serialize_schema(tables),
        "relationships": _serialize_relationships(relationships),
        "dashboard": dashboard,
        "suggested_questions": questions,
    }


def _serialize_schema(tables: list) -> list[dict]:
    return [
        {
            "name": t.name,
            "row_count": t.row_count,
            "columns": [
                {
                    "name": c.name,
                    "dtype": c.dtype,
                    "null_count": c.null_count,
                    "sample_values": c.sample_values,
                    "description": c.description,
                }
                for c in t.columns
            ],
        }
        for t in tables
    ]


def _serialize_relationships(relationships: list) -> list[dict]:
    return [
        {"from_table": r.from_table, "from_column": r.from_column, "to_table": r.to_table, "to_column": r.to_column}
        for r in relationships
    ]


def _add_table_to_session(session: Session, filename: str, source_path: str) -> dict:
    """Blocking work for POST /upload/{session_id}/add-table — runs inside
    asyncio.to_thread under the session lock. Reconstitutes the session's
    existing tables from DuckDB (Session doesn't keep raw DataFrames around
    after the initial upload), registers the new file's tables on the same
    connection, and rebuilds schema/relationships/dashboard from the combined
    set, since none of those are designed to be updated incrementally."""
    existing_names = session.table_names()
    new_frames, native_relationships = parse_additional_upload(
        filename, None, existing_names, source_path=source_path
    )

    total_tables = len(existing_names) + len(new_frames)
    if total_tables > MAX_TABLES:
        raise UnsupportedFile(
            f"Adding this file would bring the session to {total_tables} tables, "
            f"which is over the {MAX_TABLES} limit."
        )

    existing_frames = {name: session.con.execute(f'SELECT * FROM "{name}"').df() for name in existing_names}
    register_frames(session.con, new_frames)
    combined_frames = {**existing_frames, **new_frames}

    # detect_relationships() returns pbix relationships *instead of* running
    # heuristic detection when given any — never merges the two. To avoid
    # losing whatever the session already knew (heuristic or pbix-native)
    # while still picking up new heuristic links between old and new tables,
    # merge every source (existing relationships, this file's own native
    # ones, and a fresh heuristic pass over the combined set) and dedupe.
    heuristic = detect_relationships(combined_frames)
    seen = {(r.from_table, r.from_column, r.to_table, r.to_column) for r in session.relationships}
    merged_relationships = list(session.relationships)
    for r in native_relationships + heuristic:
        key = (r.from_table, r.from_column, r.to_table, r.to_column)
        if key not in seen:
            seen.add(key)
            merged_relationships.append(r)

    session.tables = build_schema(combined_frames)
    session.relationships = merged_relationships
    session.dashboard = build_dashboard(combined_frames)
    session.suggested_questions = suggest_questions(combined_frames)
    session.insights = None  # stale against the new dashboard — regenerated lazily on next GET
    session.narrative = None
    session.source_filename = f"{session.source_filename} + {filename}"
    session.dashboard_revision += 1
    persist_session(session)

    return {
        "schema": _serialize_schema(session.tables),
        "relationships": _serialize_relationships(session.relationships),
        "dashboard": session.dashboard,
        "suggested_questions": session.suggested_questions,
        "added_tables": sorted(new_frames.keys()),
    }


@app.post("/upload/{session_id}/add-table")
async def add_table(session_id: str, file: UploadFile):
    session = _session_or_404(session_id)
    start = time.monotonic()
    filename = file.filename or "upload"
    try:
        source_path, _ = await _spool_upload(file)
    except UploadTooLarge as exc:
        raise HTTPException(status_code=413, detail=str(exc)) from exc

    try:
        async with session.lock:
            try:
                result = await asyncio.to_thread(_add_table_to_session, session, filename, str(source_path))
            except UploadTooLarge as exc:
                raise HTTPException(status_code=413, detail=str(exc)) from exc
            except (UnsupportedFile, PbixParseError) as exc:
                raise HTTPException(status_code=400, detail=str(exc)) from exc
    finally:
        source_path.unlink(missing_ok=True)

    session.touch()
    logger.info(
        "add-table done session=%s file=%r added=%s total_tables=%d elapsed=%.2fs",
        session_id, filename, result["added_tables"], len(session.tables), time.monotonic() - start,
    )
    return result


def _remove_table_from_session(session: Session, table_name: str) -> dict:
    """Blocking work for DELETE /session/{session_id}/table/{table_name} — the
    inverse of _add_table_to_session. Drops the table from DuckDB, then rebuilds
    schema/relationships/dashboard/questions from the remaining frames, since
    none of those are updated incrementally."""
    existing_names = session.table_names()
    if table_name not in existing_names:
        raise UnsupportedFile(f'Table "{table_name}" is not in this session.')
    if len(existing_names) <= 1:
        raise UnsupportedFile("Can't remove the last table in a session — upload a different file instead.")

    remaining_names = existing_names - {table_name}
    remaining_frames = {name: session.con.execute(f'SELECT * FROM "{name}"').df() for name in remaining_names}
    session.con.execute(f'DROP TABLE "{table_name}"')

    session.tables = build_schema(remaining_frames)
    session.relationships = [
        r for r in session.relationships if r.from_table != table_name and r.to_table != table_name
    ]
    session.dashboard = build_dashboard(remaining_frames)
    session.suggested_questions = suggest_questions(remaining_frames)
    session.insights = None
    session.narrative = None
    session.dashboard_revision += 1
    persist_session(session)

    return {
        "schema": _serialize_schema(session.tables),
        "relationships": _serialize_relationships(session.relationships),
        "dashboard": session.dashboard,
        "suggested_questions": session.suggested_questions,
        "removed_table": table_name,
    }


@app.delete("/session/{session_id}/table/{table_name}")
async def remove_table(session_id: str, table_name: str):
    session = _session_or_404(session_id)
    start = time.monotonic()

    async with session.lock:
        try:
            result = await asyncio.to_thread(_remove_table_from_session, session, table_name)
        except UnsupportedFile as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc

    session.touch()
    logger.info(
        "remove-table done session=%s table=%r remaining_tables=%d elapsed=%.2fs",
        session_id, table_name, len(session.tables), time.monotonic() - start,
    )
    return result


def _rename_table_in_session(session: Session, old_name: str, new_name_raw: str) -> dict:
    """Blocking work for PATCH /session/{session_id}/table/{table_name} — renames
    a table in place. Rebuilds schema/relationships/dashboard/questions from the
    (unchanged) frames, since none of those are updated incrementally, and every
    other table's DuckDB rows are left untouched."""
    existing_names = session.table_names()
    if old_name not in existing_names:
        raise UnsupportedFile(f'Table "{old_name}" is not in this session.')

    new_name = _sanitize_identifier(new_name_raw)
    if not new_name:
        raise UnsupportedFile("That table name isn't valid — use letters, numbers, or underscores.")
    if new_name == old_name:
        raise UnsupportedFile("That's already this table's name.")
    if new_name in existing_names:
        raise UnsupportedFile(f'A table named "{new_name}" already exists in this session.')

    frames = {name: session.con.execute(f'SELECT * FROM "{name}"').df() for name in existing_names}
    frames[new_name] = frames.pop(old_name)

    session.con.execute(f'ALTER TABLE "{old_name}" RENAME TO "{new_name}"')

    session.tables = build_schema(frames)
    session.relationships = [
        Relationship(
            from_table=new_name if r.from_table == old_name else r.from_table,
            from_column=r.from_column,
            to_table=new_name if r.to_table == old_name else r.to_table,
            to_column=r.to_column,
        )
        for r in session.relationships
    ]
    session.dashboard = build_dashboard(frames)
    session.suggested_questions = suggest_questions(frames)
    session.insights = None
    session.narrative = None
    session.dashboard_revision += 1
    persist_session(session)

    return {
        "schema": _serialize_schema(session.tables),
        "relationships": _serialize_relationships(session.relationships),
        "dashboard": session.dashboard,
        "suggested_questions": session.suggested_questions,
        "old_name": old_name,
        "new_name": new_name,
    }


@app.patch("/session/{session_id}/table/{table_name}")
async def rename_table(session_id: str, table_name: str, req: RenameTableRequest):
    session = _session_or_404(session_id)
    start = time.monotonic()

    async with session.lock:
        try:
            result = await asyncio.to_thread(_rename_table_in_session, session, table_name, req.new_name)
        except UnsupportedFile as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc

    session.touch()
    logger.info(
        "rename-table done session=%s %r->%r elapsed=%.2fs",
        session_id, table_name, result["new_name"], time.monotonic() - start,
    )
    return result


def _table_column_names(session: Session, table_name: str) -> set[str] | None:
    for t in session.tables:
        if t.name == table_name:
            return {c.name for c in t.columns}
    return None


@app.post("/session/{session_id}/relationship")
async def add_relationship(session_id: str, req: RelationshipRequest):
    """Manually declare a join hint between two tables — fills in for cases
    detect_relationships() misses (e.g. differently-named key columns), since
    this list is fed straight into the chat system prompt as join guidance."""
    session = _session_or_404(session_id)

    async with session.lock:
        if req.from_table == req.to_table:
            raise HTTPException(status_code=400, detail="A relationship must link two different tables.")

        from_cols = _table_column_names(session, req.from_table)
        if from_cols is None:
            raise HTTPException(status_code=400, detail=f'Table "{req.from_table}" is not in this session.')
        if req.from_column not in from_cols:
            raise HTTPException(status_code=400, detail=f'Column "{req.from_column}" is not in "{req.from_table}".')

        to_cols = _table_column_names(session, req.to_table)
        if to_cols is None:
            raise HTTPException(status_code=400, detail=f'Table "{req.to_table}" is not in this session.')
        if req.to_column not in to_cols:
            raise HTTPException(status_code=400, detail=f'Column "{req.to_column}" is not in "{req.to_table}".')

        new_rel = Relationship(
            from_table=req.from_table, from_column=req.from_column, to_table=req.to_table, to_column=req.to_column
        )
        if any(
            r.from_table == new_rel.from_table
            and r.from_column == new_rel.from_column
            and r.to_table == new_rel.to_table
            and r.to_column == new_rel.to_column
            for r in session.relationships
        ):
            raise HTTPException(status_code=400, detail="That relationship already exists.")

        session.relationships.append(new_rel)
        persist_session(session)

    session.touch()
    logger.info(
        "add-relationship session=%s %s.%s -> %s.%s",
        session_id, req.from_table, req.from_column, req.to_table, req.to_column,
    )
    return {"relationships": _serialize_relationships(session.relationships)}


@app.delete("/session/{session_id}/relationship/{index}")
async def remove_relationship(session_id: str, index: int):
    session = _session_or_404(session_id)

    async with session.lock:
        if index < 0 or index >= len(session.relationships):
            raise HTTPException(status_code=404, detail="That relationship no longer exists.")
        removed = session.relationships.pop(index)
        persist_session(session)

    session.touch()
    logger.info(
        "remove-relationship session=%s %s.%s -> %s.%s",
        session_id, removed.from_table, removed.from_column, removed.to_table, removed.to_column,
    )
    return {"relationships": _serialize_relationships(session.relationships)}


def _finalize_chat_turn(session: Session, message: str, result: dict) -> dict:
    """Shared by /chat and /chat/stream: append to the visible transcript and
    the query-history log, and stamp an entry id — same bookkeeping either way,
    just reached via a plain call vs. after a streamed sequence of status events."""
    session.chat_history.append({"role": "user", "content": message})
    session.chat_history.append({"role": "assistant", "content": result["answer"]})

    entry_id = uuid.uuid4().hex[:8]
    result["id"] = entry_id
    session.query_log.append({
        "id": entry_id,
        "question": message,
        "answer": result["answer"],
        "sql": result["sql"],
        "explanation": result["explanation"],
        "chart": result["chart"],
        "follow_up_questions": result["follow_up_questions"],
        "result": result["result"],
        "success": result["success"],
        "elapsed": result["elapsed"],
        "row_count": result["result"]["total_rows"] if result["result"] else None,
        "timestamp": time.time(),
    })
    session.query_log = session.query_log[-MAX_QUERY_LOG_ENTRIES:]
    session.chat_history = session.chat_history[-MAX_CHAT_HISTORY_ENTRIES:]
    persist_session(session)
    return result


@app.post("/chat")
async def chat(req: ChatRequest):
    session = _session_or_404(req.session_id)

    # answer_question makes a blocking (requests-library) call to Ollama, which
    # can take many seconds for a local 7B model's tool-calling loop. Running it
    # inline would freeze uvicorn's single event loop for that whole window —
    # even simple GETs (dashboard, health) would stall. to_thread frees the loop;
    # the session lock keeps two requests from racing on the same DuckDB connection.
    async with session.lock:
        result = await asyncio.to_thread(
            answer_question,
            provider=_provider_for_user(),
            con=session.con,
            tables=session.tables,
            relationships=session.relationships,
            question=req.message,
            chat_history=session.chat_history,
            dashboard=session.dashboard,
        )
        return _finalize_chat_turn(session, req.message, result)


_STREAM_DONE = object()
_background_chat_tasks: set[asyncio.Task] = set()


def _chat_task_done(task: asyncio.Task, message: str) -> None:
    _background_chat_tasks.discard(task)
    if not task.cancelled() and (exc := task.exception()) is not None:
        logger.error("chat stream failed q=%r", message, exc_info=exc)


@app.post("/chat/stream")
async def chat_stream(req: ChatRequest):
    """Same as /chat, but streams live progress ('Querying your data...', 'Got
    42 rows...') as Server-Sent Events while the local model's tool-calling
    loop runs, so the UI shows real status instead of a bare spinner during a
    wait that can run many seconds. Ends with one 'done' event carrying the
    exact same payload /chat returns in one shot."""
    session = _session_or_404(req.session_id)
    llm = _provider_for_user()

    async def event_generator():
        queue: asyncio.Queue = asyncio.Queue()
        loop = asyncio.get_running_loop()

        def on_status(message: str) -> None:
            # answer_question runs in a worker thread (to_thread below), so this
            # callback fires off the event loop thread — call_soon_threadsafe is
            # the only safe way to hand data back to the asyncio queue from there.
            loop.call_soon_threadsafe(queue.put_nowait, {"type": "status", "message": message})

        async def run() -> dict:
            try:
                async with session.lock:
                    result = await asyncio.to_thread(
                        answer_question,
                        provider=llm,
                        con=session.con,
                        tables=session.tables,
                        relationships=session.relationships,
                        question=req.message,
                        chat_history=session.chat_history,
                        dashboard=session.dashboard,
                        on_status=on_status,
                    )
                    # Record the turn here rather than after streaming it: if the
                    # client disconnects mid-answer Starlette stops consuming this
                    # generator, and nothing after its pending await would run.
                    return _finalize_chat_turn(session, req.message, result)
            finally:
                # Not put_nowait: if the worker finishes before to_thread's
                # future is chained, the await above never yields, and its
                # status callbacks are still waiting in the loop's ready queue.
                # Scheduling this callback behind them keeps statuses first.
                loop.call_soon(queue.put_nowait, _STREAM_DONE)

        task = asyncio.ensure_future(run())
        # The task must outlive a disconnected client: keep a strong reference
        # (the loop only holds a weak one) and log a failure nobody awaited.
        _background_chat_tasks.add(task)
        task.add_done_callback(lambda t: _chat_task_done(t, req.message))

        while (item := await queue.get()) is not _STREAM_DONE:
            yield f"data: {json.dumps(item)}\n\n"

        try:
            result = await task
        except Exception as exc:
            yield f"data: {json.dumps({'type': 'error', 'message': str(exc)})}\n\n"
            return
        yield f"data: {json.dumps({'type': 'done', **result}, default=str)}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")


@app.post("/run-sql")
async def run_sql(req: RunSqlRequest):
    """Power-user escape hatch: run a hand-edited SELECT directly against the
    session's tables. Same sql_guard boundary as the chat agent's run_sql tool —
    this is a human editing the model's SQL, not a new trust surface."""
    session = _session_or_404(req.session_id)
    allowed_tables = {t.name for t in session.tables}
    try:
        async with session.lock:
            safe_sql = validate_and_cap(req.sql, allowed_tables)
            result = await asyncio.to_thread(run_query, session.con, safe_sql)
    except (SqlRejected, duckdb.Error) as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    session.touch()
    return {"sql": safe_sql, "result": result}


@app.get("/dashboard/{session_id}")
async def dashboard(session_id: str):
    session = _session_or_404(session_id)
    return {
        "dashboard": session.dashboard,
        "suggested_questions": session.suggested_questions,
        "source_filename": session.source_filename,
        "relationships": [
            {"from_table": r.from_table, "from_column": r.from_column, "to_table": r.to_table, "to_column": r.to_column}
            for r in session.relationships
        ],
    }


@app.get("/dashboard/{session_id}/insights")
async def insights(session_id: str, refresh: bool = False):
    session = _session_or_404(session_id)
    llm = _provider_for_user()
    if session.insights is None or refresh:
        for _ in range(3):
            revision = session.dashboard_revision
            dashboard_snapshot = session.dashboard
            candidates = await asyncio.to_thread(detect_candidates, dashboard_snapshot)
            proposed = (
                await asyncio.to_thread(propose_views, llm, candidates)
                if candidates
                else []
            )
            async with session.lock:
                if revision != session.dashboard_revision:
                    continue
                session.insights = await asyncio.to_thread(
                    build_insights_from_proposals, session.con, candidates, proposed
                )
                persist_session(session)
                break
    return {"insights": session.insights}


@app.get("/dashboard/{session_id}/narrative")
async def narrative(session_id: str, refresh: bool = False):
    """LLM-written 1-2 sentence overview of the whole dataset, synthesized
    across every table's stats. Memoized like /insights; a failed/empty
    generation is cached as "" so it isn't silently retried on every poll."""
    session = _session_or_404(session_id)
    llm = _provider_for_user()
    if session.narrative is None or refresh:
        async with session.narrative_lock:
            result = await asyncio.to_thread(generate_narrative, llm, session.dashboard)
            session.narrative = result or ""
            persist_session(session)
    return {"narrative": session.narrative}


@app.get("/dashboard/{session_id}/insight-fields")
async def insight_fields(session_id: str):
    """Candidate table/dimension/measure/date columns for the custom insight
    builder form — the same detection generate_insights uses internally,
    exposed so the frontend can populate its selects without duplicating
    the categorical/numeric/date/geo heuristics client-side."""
    session = _session_or_404(session_id)
    return {"candidates": detect_candidates(session.dashboard)}


@app.post("/dashboard/{session_id}/custom-insight")
async def custom_insight(session_id: str, req: CustomInsightRequest):
    """User-built view, bypassing the LLM entirely — same validate/execute/
    score/highlight pipeline as an LLM-proposed one (build_custom_insight
    reuses it), so this is a fast DB-only operation like /run-sql, not a
    slow provider.chat() call like /chat and /insights."""
    session = _session_or_404(session_id)
    try:
        async with session.lock:
            insight = await asyncio.to_thread(
                build_custom_insight, session.con, session.dashboard, req.model_dump()
            )
    except InvalidView as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    session.touch()
    return {"insight": insight}


@app.get("/dashboard/{session_id}/history")
async def history(session_id: str):
    session = _session_or_404(session_id)
    entries = [dict(e, feedback=session.feedback.get(e["id"])) for e in session.query_log]
    return {"history": entries, "chat_cleared_at": session.chat_cleared_at}


@app.post("/dashboard/{session_id}/feedback")
async def feedback(session_id: str, req: FeedbackRequest):
    session = _session_or_404(session_id)
    if req.rating not in ("up", "down", "none"):
        raise HTTPException(status_code=400, detail="rating must be 'up', 'down', or 'none'")
    async with session.lock:
        if not any(e["id"] == req.entry_id for e in session.query_log):
            raise HTTPException(status_code=404, detail="Unknown entry_id for this session.")
        if req.rating == "none":
            session.feedback.pop(req.entry_id, None)
        else:
            session.feedback[req.entry_id] = req.rating
        persist_session(session)
    return {"ok": True}


@app.post("/dashboard/{session_id}/clear-chat")
async def clear_chat(session_id: str):
    """Reset the model's conversation context and the visible transcript for a
    'New chat'. query_log is left untouched — the History panel stays a full
    archive of every question asked this session, independent of chat resets."""
    session = _session_or_404(session_id)
    async with session.lock:
        session.chat_history = []
        session.chat_cleared_at = time.time()
        persist_session(session)
    return {"ok": True}


@app.delete("/session/{session_id}")
async def delete_session(session_id: str):
    session = _session_or_404(session_id)
    async with session.lock:
        drop_session(session_id)
    return {"ok": True}


# The provider uses the blocking `requests` library with multi-second
# timeouts; calling it inline from these async handlers would stall every other
# request on the event loop whenever Ollama is slow or unreachable.
@app.get("/health")
async def health():
    # Public route: signed-out callers get the server default model's status.
    status = await asyncio.to_thread(_provider_for_user().model_status)
    return {"ok": True, "llm_reachable": status["reachable"], "llm": status}


@app.get("/models")
async def list_models():
    available = await asyncio.to_thread(provider.list_models)
    return {"current": _provider_for_user().model, "available": available}


@app.post("/models/select")
async def select_model(req: ModelSelectRequest):
    available = await asyncio.to_thread(provider.list_models)
    if req.model not in available:
        raise HTTPException(status_code=400, detail=f'"{req.model}" is not pulled locally in Ollama.')
    user_id = current_user_id()
    if user_id is None:  # the auth middleware already requires sign-in here
        raise HTTPException(status_code=401, detail="Authentication required.")
    _selected_models[user_id] = req.model
    return await asyncio.to_thread(_provider_for_user().model_status)


app.mount("/", StaticFiles(directory=str(FRONTEND_DIR), html=True), name="frontend")
