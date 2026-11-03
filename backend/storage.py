"""Filesystem locations shared by authentication and durable data sessions."""

from __future__ import annotations

import os
from pathlib import Path


DATA_DIR = Path(os.environ.get("DATALUME_DATA_DIR", ".datalume")).expanduser().resolve()
SESSIONS_DIR = DATA_DIR / "sessions"
AUTH_DB_PATH = DATA_DIR / "auth.sqlite3"


def ensure_storage_dirs() -> None:
    SESSIONS_DIR.mkdir(parents=True, exist_ok=True)


def session_db_path(session_id: str) -> Path:
    return SESSIONS_DIR / f"{session_id}.duckdb"


def session_metadata_path(session_id: str) -> Path:
    return SESSIONS_DIR / f"{session_id}.json"
