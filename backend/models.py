"""Session state (in memory, persisted to DATALUME_DATA_DIR) and the BYOK account stub."""

from __future__ import annotations

import asyncio
import json
import re
import time
import uuid
from dataclasses import asdict
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

import duckdb

from backend.query.duckdb_session import connect_session_db
from backend.storage import ensure_storage_dirs, session_db_path, session_metadata_path


@dataclass
class ColumnInfo:
    name: str
    dtype: str
    null_count: int
    sample_values: list[Any]
    description: str


@dataclass
class TableInfo:
    name: str
    row_count: int
    columns: list[ColumnInfo]


@dataclass
class Relationship:
    from_table: str
    from_column: str
    to_table: str
    to_column: str


@dataclass
class Session:
    id: str
    con: duckdb.DuckDBPyConnection
    tables: list[TableInfo]
    relationships: list[Relationship]
    dashboard: dict[str, Any]
    suggested_questions: list[str]
    source_filename: str
    owner_user_id: str
    db_path: str
    dashboard_revision: int = 0
    created_at: float = field(default_factory=time.time)
    last_accessed_at: float = field(default_factory=time.time)
    chat_history: list[dict[str, str]] = field(default_factory=list)
    chat_cleared_at: float | None = None
    insights: list[dict[str, Any]] | None = None
    narrative: str | None = None
    """LLM-written dataset overview. None = not generated yet (mirrors
    `insights`' None/[] split); an empty string means generation ran but
    produced nothing usable — both are cached as-is, no automatic retry."""
    query_log: list[dict[str, Any]] = field(default_factory=list)
    feedback: dict[str, str] = field(default_factory=dict)
    """Maps a query_log entry's id to 'up' or 'down'. Sparse — only rated
    entries have a key here, so the vast majority of a session's history
    is never touched."""
    lock: asyncio.Lock = field(default_factory=asyncio.Lock)
    """Serializes this session's LLM+DuckDB work (chat, insights) when it's run
    via asyncio.to_thread — the DuckDB connection isn't safe for concurrent use
    from two threads at once, so two requests for the same session must queue
    rather than race, even though the event loop itself stays free for everyone
    else while an Ollama round-trip is in flight."""
    narrative_lock: asyncio.Lock = field(default_factory=asyncio.Lock)
    """Serializes narrative generation without blocking DuckDB-backed work."""
    persisted_at: float = field(default=0.0, repr=False, compare=False)
    """When persist_session last wrote this session's metadata (not itself
    persisted). Lets a plain read skip rewriting the file just to bump
    last_accessed_at; see touch_session."""

    def touch(self) -> None:
        self.last_accessed_at = time.time()

    def table_names(self) -> set[str]:
        return {t.name for t in self.tables}


@dataclass
class Account:
    """Stub for the future BYOK feature. Not wired to auth or any route yet —
    exists so adding real accounts later is additive, not a rewrite."""

    id: str
    name: str
    provider_type: str  # "ollama" | "openai" | "anthropic" | ...
    encrypted_api_key: str | None = None


_SESSIONS: dict[str, Session] = {}

SESSION_TTL_SECONDS = 30 * 60
# A read only needs the persisted last_accessed_at to be roughly right (it
# decides expiry after a restart), so it is rewritten at most this often rather
# than on every request. Real changes still call persist_session immediately.
ACCESS_PERSIST_INTERVAL_SECONDS = 60


def new_session_id() -> str:
    return uuid.uuid4().hex[:12]


def store_session(session: Session) -> None:
    _SESSIONS[session.id] = session
    persist_session(session)


def persist_session(session: Session) -> None:
    """Persist session metadata atomically; the analytical rows live in DuckDB.

    A no-op once the session has been dropped (deleted or expired): work still
    in flight for it, such as a narrative that only holds narrative_lock or a
    chat turn finishing after its client left, must not write the user's chat
    history and data samples back to disk after they were removed."""
    if _SESSIONS.get(session.id) is not session:
        return
    ensure_storage_dirs()
    payload = {
        "id": session.id,
        "owner_user_id": session.owner_user_id,
        "db_path": session.db_path,
        "tables": [asdict(t) for t in session.tables],
        "relationships": [asdict(r) for r in session.relationships],
        "dashboard": session.dashboard,
        "suggested_questions": session.suggested_questions,
        "source_filename": session.source_filename,
        "dashboard_revision": session.dashboard_revision,
        "created_at": session.created_at,
        "last_accessed_at": session.last_accessed_at,
        "chat_history": session.chat_history,
        "chat_cleared_at": session.chat_cleared_at,
        "insights": session.insights,
        "narrative": session.narrative,
        "query_log": session.query_log,
        "feedback": session.feedback,
    }
    target = session_metadata_path(session.id)
    temporary = target.with_suffix(".json.tmp")
    with temporary.open("w", encoding="utf-8") as handle:
        json.dump(payload, handle, ensure_ascii=False, default=str)
    temporary.replace(target)
    session.persisted_at = time.time()


def touch_session(session: Session) -> None:
    """Mark the session as used now. The metadata file holds the dashboard,
    chat history and query log, so rewriting it on every read (dashboard
    polls, history views) was the bulk of a read's cost; persist the new
    access time only when the stored one is getting stale."""
    session.touch()
    if session.last_accessed_at - session.persisted_at >= ACCESS_PERSIST_INTERVAL_SECONDS:
        persist_session(session)


def get_session(session_id: str, *, touch: bool = True) -> Session | None:
    session = _SESSIONS.get(session_id)
    if session is not None and time.time() - session.last_accessed_at > SESSION_TTL_SECONDS:
        drop_session(session_id)
        return None
    if session is not None and touch:
        touch_session(session)
    return session


def drop_session(session_id: str) -> None:
    session = _SESSIONS.pop(session_id, None)
    if session is not None:
        session.con.close()
    paths = (session_metadata_path(session_id), session_db_path(session_id)) if session is not None else ()
    for path in paths:
        try:
            path.unlink()
        except FileNotFoundError:
            pass


def sweep_expired_sessions() -> list[str]:
    """Evict sessions idle longer than SESSION_TTL_SECONDS. Returns dropped IDs."""
    now = time.time()
    expired = [
        sid
        for sid, s in _SESSIONS.items()
        if now - s.last_accessed_at > SESSION_TTL_SECONDS
    ]
    for sid in expired:
        drop_session(sid)
    return expired


def restore_persisted_sessions() -> list[str]:
    """Load valid session metadata and its durable DuckDB file at startup."""
    ensure_storage_dirs()
    restored: list[str] = []
    for metadata_path in sorted(Path(session_metadata_path("placeholder")).parent.glob("*.json")):
        try:
            with metadata_path.open("r", encoding="utf-8") as handle:
                payload = json.load(handle)
            session_id = str(payload["id"])
            if not re.fullmatch(r"[a-f0-9]{12}", session_id):
                raise ValueError("invalid persisted session id")
            # Never trust a path copied from metadata; session databases always
            # live under the configured sessions directory.
            db_path = session_db_path(session_id)
            last_accessed_at = float(payload.get("last_accessed_at", time.time()))
            if time.time() - last_accessed_at > SESSION_TTL_SECONDS:
                metadata_path.unlink(missing_ok=True)
                db_path.unlink(missing_ok=True)
                continue
            if not db_path.exists():
                raise FileNotFoundError(db_path)
            tables = [
                TableInfo(
                    name=t["name"],
                    row_count=int(t["row_count"]),
                    columns=[ColumnInfo(**c) for c in t["columns"]],
                )
                for t in payload["tables"]
            ]
            session = Session(
                id=session_id,
                con=connect_session_db(str(db_path)),
                tables=tables,
                relationships=[Relationship(**r) for r in payload["relationships"]],
                dashboard=payload["dashboard"],
                suggested_questions=payload["suggested_questions"],
                source_filename=payload["source_filename"],
                owner_user_id=payload["owner_user_id"],
                db_path=str(db_path),
                dashboard_revision=int(payload.get("dashboard_revision", 0)),
                created_at=float(payload.get("created_at", time.time())),
                last_accessed_at=last_accessed_at,
                chat_history=payload.get("chat_history", []),
                chat_cleared_at=payload.get("chat_cleared_at"),
                insights=payload.get("insights"),
                narrative=payload.get("narrative"),
                query_log=payload.get("query_log", []),
                feedback=payload.get("feedback", {}),
            )
            _SESSIONS[session.id] = session
            restored.append(session.id)
        except Exception:
            # A corrupt metadata file must not prevent the service starting.
            try:
                metadata_path.unlink()
            except FileNotFoundError:
                pass
    return restored
