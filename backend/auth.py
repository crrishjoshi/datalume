"""Small first-party account and cookie-auth service for the local app."""

from __future__ import annotations

import asyncio
import base64
import contextvars
import hashlib
import hmac
import os
import re
import secrets
import sqlite3
import threading
import time
import uuid
from collections.abc import Awaitable, Callable, Generator
from contextlib import contextmanager
from typing import Any

from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from backend.storage import AUTH_DB_PATH, ensure_storage_dirs

AUTH_COOKIE = "datalume_auth"
AUTH_TTL_SECONDS = 7 * 24 * 60 * 60
PBKDF2_ROUNDS = 240_000
USERNAME_RE = re.compile(r"^[a-zA-Z0-9_.-]{3,64}$")
EXPIRED_SESSION_PURGE_INTERVAL_SECONDS = 10 * 60
LOGIN_FAILURE_WINDOW_SECONDS = 15 * 60
MAX_LOGIN_FAILURES_PER_USERNAME = 10
MAX_LOGIN_FAILURES_PER_CLIENT = 50
# Verifying against this when the username is unknown makes a miss cost the
# same PBKDF2 work as a wrong password, so response time can't reveal which
# usernames exist.
_DUMMY_SALT = secrets.token_bytes(16)
_DUMMY_DIGEST = hashlib.pbkdf2_hmac("sha256", b"datalume-dummy", _DUMMY_SALT, PBKDF2_ROUNDS)

_current_user: contextvars.ContextVar[str | None] = contextvars.ContextVar(
    "datalume_current_user", default=None
)


class AuthError(ValueError):
    pass


def _password_digest(password: str, salt: bytes) -> bytes:
    return hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, PBKDF2_ROUNDS)


def _encode(value: bytes) -> str:
    return base64.urlsafe_b64encode(value).decode("ascii")


def _decode(value: str) -> bytes:
    return base64.urlsafe_b64decode(value.encode("ascii"))


def _token_hash(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


class AuthStore:
    def __init__(self) -> None:
        ensure_storage_dirs()
        self._purge_lock = threading.Lock()
        self._next_purge_at = 0.0
        with self._connect() as con:
            con.executescript(
                """
                CREATE TABLE IF NOT EXISTS users (
                    id TEXT PRIMARY KEY,
                    username TEXT NOT NULL UNIQUE COLLATE NOCASE,
                    salt TEXT NOT NULL,
                    password_hash TEXT NOT NULL,
                    created_at REAL NOT NULL
                );
                CREATE TABLE IF NOT EXISTS auth_sessions (
                    token_hash TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    expires_at REAL NOT NULL
                );
                CREATE INDEX IF NOT EXISTS auth_sessions_expiry ON auth_sessions(expires_at);
                """
            )

    @staticmethod
    @contextmanager
    def _connect() -> Generator[sqlite3.Connection, None, None]:
        """Commit on success, roll back on error, and always close. sqlite3's
        own connection context manager only commits; it never closes."""
        con = sqlite3.connect(AUTH_DB_PATH, timeout=30)
        con.row_factory = sqlite3.Row
        try:
            with con:
                yield con
        finally:
            con.close()

    def register(self, username: str, password: str) -> str:
        username = username.strip()
        if not USERNAME_RE.fullmatch(username):
            raise AuthError("Username must be 3–64 letters, numbers, dots, hyphens, or underscores.")
        if len(password) < 8:
            raise AuthError("Password must be at least 8 characters.")
        user_id = uuid.uuid4().hex
        salt = secrets.token_bytes(16)
        digest = _password_digest(password, salt)
        try:
            with self._connect() as con:
                con.execute(
                    "INSERT INTO users (id, username, salt, password_hash, created_at) VALUES (?, ?, ?, ?, ?)",
                    (user_id, username, _encode(salt), _encode(digest), time.time()),
                )
        except sqlite3.IntegrityError as exc:
            raise AuthError("That username is already in use.") from exc
        return user_id

    def login(self, username: str, password: str) -> tuple[str, str]:
        with self._connect() as con:
            row = con.execute(
                "SELECT id, salt, password_hash FROM users WHERE username = ? COLLATE NOCASE",
                (username.strip(),),
            ).fetchone()
        if row is None:
            hmac.compare_digest(_password_digest(password, _DUMMY_SALT), _DUMMY_DIGEST)
            raise AuthError("Invalid username or password.")
        try:
            expected = _decode(row["password_hash"])
            actual = _password_digest(password, _decode(row["salt"]))
        except (ValueError, UnicodeDecodeError) as exc:
            raise AuthError("Invalid username or password.") from exc
        if not hmac.compare_digest(actual, expected):
            raise AuthError("Invalid username or password.")
        token = secrets.token_urlsafe(32)
        with self._connect() as con:
            con.execute(
                "INSERT INTO auth_sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)",
                (_token_hash(token), row["id"], time.time() + AUTH_TTL_SECONDS),
            )
        return token, row["id"]

    def user_for_token(self, token: str | None) -> str | None:
        if not token:
            return None
        now = time.time()
        self._purge_expired_sessions(now)
        with self._connect() as con:
            row = con.execute(
                "SELECT user_id FROM auth_sessions WHERE token_hash = ? AND expires_at > ?",
                (_token_hash(token), now),
            ).fetchone()
        return str(row["user_id"]) if row else None

    def _purge_expired_sessions(self, now: float) -> None:
        """Expired rows are already ignored by the lookup query, so deleting
        them is housekeeping only; doing it at most every few minutes keeps
        ordinary authenticated reads from taking SQLite's write lock."""
        with self._purge_lock:
            if now < self._next_purge_at:
                return
            self._next_purge_at = now + EXPIRED_SESSION_PURGE_INTERVAL_SECONDS
        with self._connect() as con:
            con.execute("DELETE FROM auth_sessions WHERE expires_at <= ?", (now,))

    def logout(self, token: str | None) -> None:
        if not token:
            return
        with self._connect() as con:
            con.execute("DELETE FROM auth_sessions WHERE token_hash = ?", (_token_hash(token),))

    def has_users(self) -> bool:
        with self._connect() as con:
            return con.execute("SELECT 1 FROM users LIMIT 1").fetchone() is not None


auth_store = AuthStore()


class LoginThrottle:
    """Sliding-window count of failed logins, per username and per client
    address. The username limit stops guessing one account from many
    addresses; the looser client limit stops one address spraying many
    accounts without locking out everyone behind a shared NAT. In-memory
    and per-process: it resets on restart, which is acceptable for a
    single-process local app."""

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._failures: dict[str, list[float]] = {}

    @staticmethod
    def _keys(username: str, client: str | None) -> list[tuple[str, int]]:
        keys = [(f"user:{username.strip().casefold()}", MAX_LOGIN_FAILURES_PER_USERNAME)]
        if client:
            keys.append((f"client:{client}", MAX_LOGIN_FAILURES_PER_CLIENT))
        return keys

    def _recent(self, key: str, now: float) -> list[float]:
        cutoff = now - LOGIN_FAILURE_WINDOW_SECONDS
        recent = [t for t in self._failures.get(key, ()) if t > cutoff]
        if recent:
            self._failures[key] = recent
        else:
            self._failures.pop(key, None)
        return recent

    def retry_after(self, username: str, client: str | None) -> int:
        """Seconds until another attempt is allowed; 0 if allowed now."""
        now = time.time()
        wait = 0.0
        with self._lock:
            for key, limit in self._keys(username, client):
                recent = self._recent(key, now)
                if len(recent) >= limit:
                    wait = max(wait, recent[-limit] + LOGIN_FAILURE_WINDOW_SECONDS - now)
        return max(1, int(wait) + 1) if wait > 0 else 0

    def record_failure(self, username: str, client: str | None) -> None:
        now = time.time()
        with self._lock:
            for key, _ in self._keys(username, client):
                recent = self._recent(key, now)
                recent.append(now)
                self._failures[key] = recent

    def record_success(self, username: str) -> None:
        with self._lock:
            self._failures.pop(f"user:{username.strip().casefold()}", None)


login_throttle = LoginThrottle()


def current_user_id() -> str | None:
    return _current_user.get()


def _secure_cookie() -> bool:
    return os.environ.get("DATALUME_COOKIE_SECURE", "0") == "1"


def set_auth_cookie(response: Any, token: str) -> None:
    response.set_cookie(
        AUTH_COOKIE,
        token,
        max_age=AUTH_TTL_SECONDS,
        httponly=True,
        samesite="lax",
        secure=_secure_cookie(),
    )


def clear_auth_cookie(response: Any) -> None:
    response.delete_cookie(AUTH_COOKIE, httponly=True, samesite="lax", secure=_secure_cookie())


def _public_path(path: str) -> bool:
    return (
        path == "/"
        or path in {"/index.html", "/styles.css", "/app.js", "/theme-init.js", "/sample_superstore.csv", "/health"}
        or path.startswith("/auth/")
        or path.startswith("/vendor/")
        or path.startswith("/favicon")
        or path.startswith("/docs")
        or path.startswith("/redoc")
        or path == "/openapi.json"
    )


class AuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: Callable[[Request], Awaitable[Any]]) -> Any:
        token_value = request.cookies.get(AUTH_COOKIE)
        # SQLite is blocking; keep it off the event loop that serves everyone.
        user_id = await asyncio.to_thread(auth_store.user_for_token, token_value) if token_value else None
        if not _public_path(request.url.path) and request.method != "OPTIONS" and user_id is None:
            return JSONResponse({"detail": "Authentication required."}, status_code=401)
        if user_id is None:
            return await call_next(request)
        token = _current_user.set(user_id)
        try:
            return await call_next(request)
        finally:
            _current_user.reset(token)
