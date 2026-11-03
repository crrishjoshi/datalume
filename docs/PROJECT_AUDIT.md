# Datalume Project Audit and Hardening Log

Updated: 2026-10-16

## Scope

This document records the five issues identified during the Datalume application audit and the changes made to address them. It is intentionally kept in the project so future changes can be checked against the same risks.

## Findings and target state

| # | Finding | Target state |
|---|---|---|
| 1 | Sessions were process-local, unauthenticated, and used in-memory DuckDB. | Authenticated users own durable session databases and metadata; users cannot access another user's session. |
| 2 | CORS allowed every origin. | Same-origin by default; explicit configured origins only when needed. |
| 3 | Background LLM insight generation held the session/DuckDB lock for the whole model call. | Model proposal work happens outside the database lock; only bounded SQL execution is serialised. |
| 4 | Chart/map libraries and map topology were loaded from public CDNs. | Pinned frontend assets are served locally and the UI works without CDN access. |
| 5 | Uploads were read entirely into memory before parsing. | Multipart input is spooled to a temporary file in chunks, size-limited before parsing, and removed afterwards. |

## Implementation record

Each item below records the implementation and regression check.

### 1. Authentication and durable sessions

Status: complete.

Root cause: the global `_SESSIONS` dictionary held live connections only; session IDs were the only access control and there was no owner identity.

Change: added SQLite-backed accounts and opaque HttpOnly cookies in `backend/auth.py`; protected API routes with owner checks; persisted DuckDB files and session metadata under `DATALUME_DATA_DIR`; restored valid sessions at startup and removed expired sessions; added the browser login/register gate and logout control.

Verification: unauthenticated `/models` returned 401; two registered users were tested and the second user received 404 for the first user's session; the backend was restarted and the first user's dashboard restored with its source filename and table; browser upload and reload restoration also passed.

### 2. CORS/origin policy

Status: complete.

Root cause: `allow_origins=["*"]` exposed every API route to browser JavaScript from any origin.

Change: removed wildcard CORS. Same-origin operation is the default; `DATALUME_ALLOWED_ORIGINS` enables an explicit allow-list with credentials when a separate frontend origin is required.

Verification: `/health` returned 200 and an `Origin: https://evil.example` request received no `Access-Control-Allow-Origin` header.

### 3. Insight lock contention

Status: complete.

Root cause: `/dashboard/{session_id}/insights` held `session.lock` while `provider.chat()` waited on Ollama.

Change: split insight generation into LLM proposal work and `build_insights_from_proposals()` database work. The route snapshots a dashboard revision, performs candidate detection and model work outside `session.lock`, then rechecks the revision before executing views. Table changes increment that revision and invalidate cached insights.

Verification: source-level concurrency review confirmed the model call is outside the DuckDB lock; the existing independent narrative lock remains intact; compile and API smoke checks passed.

### 4. Frontend asset availability

Status: complete.

Root cause: Chart.js, Leaflet, topojson-client, and US map topology were remote runtime dependencies.

Change: pinned Chart.js, Leaflet, topojson-client, and us-atlas assets are served from `frontend/vendor`; the Google Fonts dependency and remote map topology were removed.

Verification: Playwright loaded the app with no external requests, no console errors, no failed requests, and successfully uploaded the sample dataset; all local vendor assets returned 200.

### 5. Upload memory handling

Status: complete.

Root cause: `await file.read()` created a complete in-memory upload before pandas/DuckDB created additional representations.

Change: initial and add-table uploads are copied to a temporary file in 1 MiB chunks, rejected above 300 MB before parsing, parsed by path, and cleaned up in success/error paths. Failed DuckDB preparation also removes its database file.

Verification: sample upload and add-table succeeded; empty CSV returned a clear 400; a mocked over-limit stream raised `UploadTooLarge` and cleaned its temporary file.

## Deployment configuration

The final implementation will document these environment variables here:

- `DATALUME_DATA_DIR`: persistent directory for auth/session data.
- `DATALUME_ALLOWED_ORIGINS`: comma-separated browser origins; unset means same-origin only.
- `DATALUME_COOKIE_SECURE`: set to `1` behind HTTPS.

## Verification log

- `./.venv/bin/python -m compileall -q backend` — passed.
- `node --check frontend/app.js` — passed.
- Auth, ownership, restart/restore, local asset, add-table, empty-upload, and CORS smoke checks — passed on 2026-10-16.
- Playwright mobile smoke at 390px — passed: sign-in gate, upload, reload restore, `scrollWidth == innerWidth`, no console/page/request errors.
- Browser dependencies are pinned in `frontend/package.json`; committed runtime copies live under `frontend/vendor`.

## Improvement iterations (2026-10-17)

A second pass of twelve iterations. Each fixes one issue not covered above. Automated tests live in `tests/` and run with no extra dependencies:

```bash
./.venv/bin/python -m unittest discover -s tests -t .
```

`tests/__init__.py` points `DATALUME_DATA_DIR` at a temporary directory before the backend is imported, and `tests/asgi_client.py` is a minimal in-process ASGI client (FastAPI's `TestClient` needs `httpx`, which is not a project dependency).

### Iteration 1. Blocking I/O on the event loop in health/model routes

Status: complete.

Issue: `GET /health`, `GET /models`, `POST /models/select` and `GET /auth/status` performed synchronous I/O directly inside `async def` handlers. The frontend polls `/health`, so whenever Ollama was slow or down every request for every user stalled for up to the provider's 5 s timeout.

Root cause: `OllamaProvider.model_status()`/`list_models()` use the blocking `requests` library and `AuthStore.has_users()` uses blocking `sqlite3`; unlike `/chat` and `/upload`, these routes never offloaded that work with `asyncio.to_thread`.

Change: wrapped the four calls in `asyncio.to_thread` (`backend/main.py`).

Files: `backend/main.py`, `tests/__init__.py`, `tests/asgi_client.py`, `tests/test_event_loop.py`.

Verification: `tests/test_event_loop.py` patches the provider with a 0.4 s blocking call and counts how often a concurrent coroutine runs during the request. It passes with the fix (>10 ticks). As a negative control, forcing `asyncio.to_thread` to run inline makes all three tests fail (2 ticks). `compileall` passed.

Remaining risk: `/models/select` still changes the model process-wide for every user. It is addressed in a later iteration if it qualifies.

### Iteration 2. Auth store leaked SQLite connections and wrote on every request

Status: complete.

Issue: every authenticated request (the middleware runs on all of them) opened a SQLite connection that was never closed, ran a `DELETE` of expired sessions (taking SQLite's write lock), and did all of this synchronously on the event loop. Under `-X dev`, a single register, a login and three token lookups produced 14 `ResourceWarning: unclosed database` warnings.

Root cause: `AuthStore._connect()` returned a raw `sqlite3.Connection` that was used as `with self._connect() as con:`. sqlite3's own context manager commits or rolls back but never closes. `user_for_token` also purged expired rows on each call, and `AuthMiddleware.dispatch` called it without `asyncio.to_thread`.

Change: `_connect` is now a `contextmanager` that commits or rolls back and always closes. The expired-session purge runs at most every 10 minutes, guarded by a `threading.Lock`. The lookup query still filters on `expires_at > now`, so expired tokens are rejected immediately whether or not the purge has run. The middleware performs the lookup in `asyncio.to_thread`, and only when a cookie is present.

Files: `backend/auth.py`, `tests/test_auth_store.py`.

Verification: `tests/test_auth_store.py` covers a login round trip, logout invalidation, wrong-password rejection, no `ResourceWarning` across login, lookups and `has_users`, and an expired token being rejected while the purge is not yet due and then deleted once it is. All 7 tests passed under `python -X dev`. Negative control: restoring the old `_connect` makes the leak test fail.

Remaining risk: the purge interval is per process. Multiple workers each purge on their own schedule, which is harmless.

### Iteration 3. Unlimited password guessing and username enumeration on login

Status: complete.

Issue: `POST /auth/login` accepted unlimited attempts, so an exposed instance could be brute-forced. A login for an unknown username returned right after the lookup, while a known username paid about 27 ms for PBKDF2, so response time showed which usernames exist. `AuthRequest` fields had no length limit, so a multi-megabyte password went straight into PBKDF2.

Root cause: no throttling existed. `AuthStore.login` raised before hashing when the row was missing. The Pydantic model was unbounded.

Change:
- `LoginThrottle` in `backend/auth.py` keeps a sliding 15-minute count of failures. It allows 10 per username (case-insensitive) and 50 per client address. Over the limit, login returns `429` with `Retry-After` before any password check. A successful login clears that username's count.
- Unknown usernames are now verified against a dummy PBKDF2 digest.
- `AuthRequest` caps `username` at 128 characters and `password` at 1024. Oversized input returns `422` before hashing.
- The frontend already displays the `detail` string, so the 429 message shows on the sign-in form with no UI change.

Files: `backend/auth.py`, `backend/main.py`, `tests/test_login_throttle.py`.

Verification:
- `tests/test_login_throttle.py` has 7 tests: lockout after 10 failures even with the right password, case-insensitive keying, reset on success, unlock after the window, the client-wide limit across usernames, 422 for an oversized password, and PBKDF2 running for unknown users.
- The full suite of 14 tests passed under `-X dev`.
- Measured median login time: 27.3 ms for a known user with a wrong password and 27.0 ms for an unknown user. Before the fix, the unknown-user path skipped hashing.

Remaining risk:
- Counters are in memory and per process, so they reset on restart.
- Behind a reverse proxy every client shares the proxy's address, so only the per-username limit remains meaningful. Trusting `X-Forwarded-For` was deliberately not added because it is spoofable without proxy configuration.
- Per-username lockout lets an attacker temporarily lock a known account. This is the usual trade-off, and it is bounded by the 15-minute window.
- Registration is not throttled.

### Iteration 4. Unbounded request fields and chat history; unreadable validation errors

Status: complete.

Issue: Every text field in the JSON request models (chat message, SQL, table/column names, filter values, model name) was unbounded, so one request could push megabytes into the LLM prompt, the sqlglot parser, or the persisted session JSON. `Session.chat_history` grew by two entries per question forever and was rewritten to disk on every access, even though the agent only reads the last 6 entries (`query_log` was already capped). Pydantic's default 422 body is a list, and the frontend's `data.detail || "..."` pattern rendered it as `[object Object]`; it also echoed the rejected input back.

Root cause: the request models had no `max_length` constraints; `_finalize_chat_turn` trimmed `query_log` but not `chat_history`; FastAPI's default `RequestValidationError` handler was in use.

Change:
- Limits in `backend/main.py`: chat message 4,000 characters, SQL 20,000, names 256 (`Name` alias), session id 64, filter value 1,000, enum-like fields 32. The chat textarea has `maxlength="4000"` so the UI matches.
- `chat_history` is trimmed to the latest 40 entries after each turn. `query_log` (the user-visible history) is unchanged.
- A `RequestValidationError` handler returns `422` with a readable string `detail` (`"message: String should have at most 4000 characters"`) plus a structured `errors` list, and never echoes the input.

Files: `backend/main.py`, `frontend/index.html`, `tests/asgi_client.py` (multipart upload and signed-in client helpers), `tests/test_input_limits.py`.

Verification:
- `tests/test_input_limits.py` has 6 tests: oversized chat message rejected with a string `detail` and without echoing input (the LLM call is patched to fail if reached), oversized SQL rejected, normal SQL still runs against a real uploaded CSV, oversized rename rejected, a missing field gives a string `detail`, and 40 stubbed chat turns leave `chat_history` at exactly 40 while `query_log` keeps them all.
- Full suite: 20 tests passed under `-X dev`. `node --check frontend/app.js` passed.

Remaining risk: limits are generous guesses; a legitimately longer SQL statement would need the constant raised. Sessions persisted before this change keep their long history until the next chat turn trims it.

### Iteration 5. No browser security headers (CSP, framing, MIME sniffing)

Status: complete.

Issue: No response carried `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options` or `Referrer-Policy`. The app renders LLM output and user-supplied column/table names into the DOM, so any escaping slip would have been a script-injection hole with nothing to contain it, and the page could be framed for clickjacking. `index.html` also contained an inline `<script>` (theme bootstrap), which prevented a strict policy.

Root cause: no header middleware existed; the inline bootstrap was written before any CSP was considered.

Change:
- New `backend/security_headers.py`: a pure ASGI middleware (so the streamed `/chat/stream` body is untouched) that adds `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`, `Cross-Origin-Opener-Policy: same-origin`, and a CSP of `default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data: blob:; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'` (no `unsafe-inline`/`unsafe-eval`). It is registered outermost, so `401` responses also get it. `/docs` and `/redoc` keep the other headers but skip the CSP because FastAPI's Swagger page loads from a CDN.
- The theme bootstrap moved to `frontend/theme-init.js` (still loaded synchronously in `<head>`, so no theme flash) and now tolerates blocked `localStorage`. It was added to the auth middleware's public paths.

Files: `backend/security_headers.py` (new), `backend/main.py`, `backend/auth.py`, `frontend/index.html`, `frontend/theme-init.js` (new), `tests/test_security_headers.py` (new).

Verification:
- `tests/test_security_headers.py` has 5 tests: strict CSP on `/`, headers on an unauthenticated `401`, `/theme-init.js` reachable without login, `/docs` exempt from CSP only, and a static check that `index.html` has no inline scripts, inline event handlers or `style` attributes.
- Full suite: 25 tests passed under `-X dev`.
- Browser check against a live server (scratch data directory): signed in, loaded the sample dataset, charts rendered, theme toggle worked, a Leaflet map with US-state GeoJSON and a marker rendered, and a `securitypolicyviolation` listener recorded zero violations. Negative control: an injected inline `<script>` and an `<img onerror>` were both blocked and reported.

Remaining risk: a future feature that needs a third-party origin (map tiles, CDN fonts) must add it to the CSP explicitly. `X-Frame-Options`/`frame-ancestors` forbid embedding the app in an iframe, which is intended. HSTS is not set because TLS termination is deployment-specific.

### Iteration 6. One user's model choice changed the model for every user

Status: complete.

Issue: `POST /models/select` did `provider.model = req.model` on the single module-level `OllamaProvider`. Any signed-in account therefore switched the model for every other account, including chats already running in worker threads, which read `self.model` when they build each Ollama request. `/models` and `/health` then reported that user's pick as everyone's current model.

Root cause: the provider was written for a single local user, before accounts existed. Mutable per-user preference was stored on a shared singleton.

Change:
- The shared `provider` now holds only the server default and is never mutated.
- A user's pick is stored in `_selected_models` (user id → model name), and `_provider_for_user()` returns the shared provider or a lightweight `OllamaProvider(base_url, model)` for that user.
- `/chat`, `/chat/stream`, `/dashboard/{id}/insights`, `/dashboard/{id}/narrative`, `/health` and `/models` all resolve the provider through this helper. `/chat/stream`, insights and narrative resolve it in the request handler, not inside the stream generator or worker thread, so they read the right request's auth context.
- `/models/select` still validates against the pulled-model list and now records the choice for the caller only. It also has an explicit 401 guard, as defence in depth behind the auth middleware.
- The frontend needed no change: it already re-reads `/health` and `/models` with the user's cookie.

Files: `backend/main.py`, `tests/test_model_selection.py` (new).

Verification:
- `tests/test_model_selection.py` has 5 tests:
  - User A's selection does not change user B's `/models` `current`, and the shared default stays untouched.
  - `/health` reports each caller's model, with the default for anonymous callers.
  - `/chat` and `/chat/stream` pass the caller's model to the agent: A, B, A gives `llama3:8b`, the default, then `llama3:8b`.
  - An unpulled model is rejected with 400 and leaves the selection unchanged.
  - Selecting a model while signed out gets 401 and stores nothing.
- Full suite: 30 tests passed under `-X dev`.
- Live server, smoke test with `curl` and two accounts against the real Ollama:
  - `/models`, `/models/select` and `/health` respond correctly.
  - Only one model is pulled on this machine, so the cross-user swap itself is shown by the unit tests, not by the live run.

Remaining risk:
- Model choices live in memory, so they reset to the server default on restart, and they are not shared across multiple worker processes.
- Persisting them in the auth database would fix both but needs a schema change. That is left for when multi-process deployment is real.

### Iteration 7. Every read rewrote the whole session metadata file on the event loop

Status: complete.

Issue:
- `_session_or_404`, which runs on every session route including plain GETs like the dashboard, history and insight fields, called `persist_session` after `touch()`.
- That re-serialised the full session to JSON (dashboard, up to 40 chat entries, up to 200 query-log entries) and rewrote the file synchronously on the event loop, only to update `last_accessed_at`.
- `get_session(touch=True)` did the same.
- The frontend polls these routes, so disk writes and event-loop stalls grew with session size, not with actual changes.

Root cause: the access timestamp and the real session data are stored in one file, and the timestamp was persisted eagerly.

Change:
- New `models.touch_session(session)` always updates the in-memory `last_accessed_at`, which is what the TTL sweeper uses. It rewrites the file only when the stored access time is at least `ACCESS_PERSIST_INTERVAL_SECONDS` (60 s) old.
- `persist_session` records `session.persisted_at`, an in-memory field that is not written to the file.
- `_session_or_404` and `get_session(touch=True)` use `touch_session`.
- Every route that changes session state already calls `persist_session` explicitly. I checked all 10 mutation sites in `main.py`, so changes are still saved at once.

Files: `backend/models.py`, `backend/main.py`, `tests/test_session_persistence.py` (new).

Verification:
- `tests/test_session_persistence.py` has 5 tests:
  - Nine reads across three routes leave the metadata file's inode unchanged.
  - A stale stored access time is written by the next read, once only.
  - In-memory access time still advances without a write.
  - A chat turn is still persisted immediately.
  - `persisted_at` is not written to disk.
- Negative control: with the old `touch(); persist_session()` put back, the read test and the stale-access test both fail.
- Full suite: 35 tests passed under `-X dev`.

Remaining risk:
- After a crash, a session's stored access time can lag by up to 60 s, so on restart it may expire up to 60 s early against its 30-minute TTL.
- Mutating routes still write the full JSON synchronously. Moving persistence to a worker thread, or splitting the hot fields out, would be the next step if sessions grow large.

### Iteration 8. Session DuckDB connections had full filesystem access behind the SQL guard

Status: Fixed and verified.

Issue:
- Every session's DuckDB connection was opened with default settings, so `read_csv`, `read_text`, `glob`, `'/path'` scans, `ATTACH` and `COPY ... TO` could all reach the host filesystem.
- The only thing between model-generated SQL and those functions was the sqlglot guard.
- The guard did reject table functions, but only by accident. They parse as a `Table` with an empty name, so they failed the unknown-table check with the confusing message "Query references unknown table(s): " followed by nothing.

Root cause: there was no defense in depth at the database layer. A future guard regression, a sqlglot parsing difference, or a new code path that runs SQL without the guard would expose local files, such as the auth database or other users' session files, to whoever can prompt the model.

Change:
- New `backend/query/duckdb_session.connect_session_db()` opens session databases with `enable_external_access=false` and `lock_configuration=true`.
- `load_upload`, which handles new sessions, and `restore_persisted_sessions`, which handles restarts, both use it.
- DuckDB refuses to re-enable either setting at runtime.
- The app's own operations still work: `register` of DataFrames, `CREATE TABLE AS`, `ALTER`/`DROP`, and `.df()` exports.
- `sql_guard.validate_and_cap` now rejects FROM-clause functions explicitly, with "Table functions are not allowed; query the session's tables directly."

Files: `backend/query/duckdb_session.py`, `backend/data/loaders.py`, `backend/models.py`, `backend/query/sql_guard.py`, `tests/test_duckdb_sandbox.py` (new).

Verification:
- `tests/test_duckdb_sandbox.py` has 8 tests:
  - Unguarded SQL on a sandboxed connection cannot `read_csv`, `read_text`, `glob`, `ATTACH` or `COPY TO` a real temp file, and no output file appears.
  - The settings cannot be switched back off.
  - App table operations still work.
  - Uploaded, appended (`/upload/{id}/add-table`) and restart-restored sessions are all sandboxed and still queryable through `/run-sql`.
  - The guard gives the new message for `read_csv`, `glob` and `range`, and still accepts `sales` and `main.sales`.
- Negative control: with plain `duckdb.connect` put back, 10 subtests fail. With the fix restored, all pass.
- Full suite: 43 tests passed. `node --check frontend/app.js` passed.
- Live, on a restarted uvicorn:
  - Uploading `sample_superstore.csv` and then `SELECT count(*)` through `/run-sql` returned 2000.
  - `SELECT * FROM read_csv('/etc/hosts')` returned 400 with the new message.
  - The dashboard returned 200.

Remaining risk:
- Scalar introspection such as `current_setting(...)` and `version()` is still allowed. It exposes only configuration values, not files.
- `range()` and `generate_series()` in FROM are rejected, as before, though they would be harmless.
- Sessions created by older builds are sandboxed on their next restore, but connections already open in a running process keep their old settings until restart.

### Iteration 9. The README's run instructions failed, and it described a different app

Status: Fixed and verified.

Issue:
- The documented start-up steps ran `cd backend` and then `uvicorn backend.main:app`. From inside `backend/` that fails immediately with `ModuleNotFoundError: No module named 'backend'` (reproduced). They also created the venv inside `backend/`, while the project uses a root `.venv`.
- The README said sessions are in-memory and listed "wire up real accounts/auth" as future work. In fact sessions are persisted to disk and restored, and cookie auth with throttling has existed for several iterations.
- None of the three `DATALUME_*` settings were documented. `DATALUME_DATA_DIR` decides where every account and upload is stored, and it defaults to a path relative to the working directory, so a user starting the app from a different folder silently gets an empty data store.
- The README never mentioned that the first screen requires creating an account, the per-user model selection, the DuckDB sandbox, or the security headers. The `models.py` module docstring still said "In-memory session state".

Root cause: the docs were written for v1 and never updated as auth, persistence and hardening landed, and nothing checked them against the code.

Change:
- Run steps now start from the project root (`pip install -r backend/requirements.txt`, `uvicorn backend.main:app`), with a note explaining why.
- Added a Configuration table for `DATALUME_DATA_DIR`, `DATALUME_COOKIE_SECURE` and `DATALUME_ALLOWED_ORIGINS`, plus the Ollama URL and default model, and a Tests section.
- Replaced the stale "in-memory sessions" bullet with accurate bullets on auth and ownership, durable TTL-swept sessions, the DuckDB sandbox and the security headers. Updated the BYOK bullet for per-user model selection, the next-steps list, and the architecture diagram label.
- Corrected the `backend/models.py` module docstring.
- Every new claim was checked against the code: the 404 for other users' sessions in `_session_or_404`, the header values in `security_headers.py`, the `/models/select` picker in `app.js`, and file deletion in `drop_session`.

Files: `README.md`, `backend/models.py` (docstring only), `tests/test_readme.py` (new).

Verification:
- `tests/test_readme.py` has 3 tests:
  - Every `DATALUME_*` variable read anywhere under `backend/` is documented in the README.
  - No bash step does `cd backend`, the uvicorn target is `backend.main:app`, and every `pip install -r` path exists.
  - Every referenced `sample_data/` file exists.
- Negative control: reverting to `cd backend` and `requirements.txt` and dropping the `DATALUME_COOKIE_SECURE` row makes 2 tests fail. With the fix restored, they pass.
- Full suite: 46 tests passed. The live server for this audit is started exactly as documented, from the root.

Remaining risk: the drift test covers env vars, the run steps and sample paths, not prose claims. Feature descriptions can still go stale.

### Iteration 10. A streamed chat answer was lost when the client disconnected

Status: Fixed and verified.

Issue:
- `/chat/stream` recorded the turn (chat history, query log, `persist_session`) only after the generator resumed past its last status event. If the browser tab closed, the user navigated away, or a proxy dropped the connection while the model was answering, Starlette stopped consuming the generator. The model's work still finished, but the question and answer silently disappeared from the transcript and the History panel (reproduced: history stayed `[]`).
- The background task was created with `ensure_future` and no reference was kept. Its exception was never retrieved once the client was gone, so a failed turn left no log line at all (reproduced with `assertLogs`).
- The generator polled the queue every 0.2 s with `wait_for` while the task ran. It also read `chat_history` under one lock acquisition and wrote the turn under a second one, so another request for the same session could slip in between.

Root cause: the turn's bookkeeping was tied to the HTTP stream's lifetime instead of the model task's.

Change (`backend/main.py`):
- The background `run()` task now calls `_finalize_chat_turn` itself, inside the same `session.lock` hold as the model call, so a completed turn is recorded and persisted whether or not anyone is still listening.
- The task is kept in `_background_chat_tasks`, so it is not garbage-collected mid-run. A done-callback (`_chat_task_done`) drops it from the set and logs any exception with the question, once, whether or not a client is connected. That log line replaces the old in-generator `logger.exception`.
- The generator blocks on `queue.get()` until a `_STREAM_DONE` sentinel. That removes the 0.2 s polling loop and the separate drain step.
- Found while testing: if the worker thread finishes before `to_thread`'s future is chained, the `await` never suspends, so a sentinel pushed directly could overtake status events still waiting in the loop's ready queue. A connected client then got `done` without the preceding status (about 1 in 3 runs under `python -X dev`). The sentinel is now queued with `loop.call_soon`, behind those callbacks.
- The connected-client protocol is unchanged: `status`* then `done` with the same payload as `/chat`, or `error`. The frontend needs no change.

Files: `backend/main.py`, `tests/test_chat_stream.py` (new).

Verification:
- `tests/test_chat_stream.py` has 4 tests. It drives the real ASGI app with a fake `answer_question` that emits a status and then blocks until released.
  - A client that hangs up after the first status: the turn appears in `chat_history` and `query_log` and in the persisted metadata file, and no background task is left behind.
  - The same with a failing model: an ERROR log naming the question is emitted, and nothing is recorded.
  - A connected client gets exactly `status`, `done`, and the `done` id matches the query-log entry. This is repeated 5 times to catch the ordering race.
  - A connected client gets an `error` event carrying the model's message.
- Red first: on the unfixed code the two disconnect tests failed. Negative control for the ordering fix: swapping `loop.call_soon` back to `put_nowait` fails 4 of 5 attempts in each of 3 runs. With the fix restored, the tests pass.
- Full suite: 50 tests passed. `node --check frontend/app.js` passed. Not exercised against a live Ollama model; the fake stands in for it.

Remaining risk: a turn that finishes after its session expired was finalized against the in-memory object and rewrote an orphan metadata file. Resolved in Iteration 11, where `persist_session` ignores dropped sessions.

### Iteration 11. A deleted or expired session's data was written back to disk

Status: Fixed and verified.

Issue:
- `GET /dashboard/{id}/narrative` generates the overview while holding only `narrative_lock`. `DELETE /session/{id}` takes `session.lock`, so it does not wait for a narrative in flight. If the user deleted the session while the model was writing the overview, `drop_session` removed the metadata and DuckDB files. Then the narrative finished and `persist_session` recreated the metadata JSON. That file holds the dashboard (with column sample values), the chat history and the query log, and it stayed on disk after the user had deleted it (reproduced).
- The same happened to any write that landed after `sweep_expired_sessions` dropped an idle session. This is the orphan-file risk recorded under Iteration 10 (reproduced at model level).
- `restore_persisted_sessions` deleted such a file at the next start, because its DuckDB file is gone. Until then, user data that was supposed to be deleted remained in `DATALUME_DATA_DIR`.

Root cause: `persist_session` wrote whatever `Session` object it was handed, without checking that the session was still registered. Only some writers serialize with deletion through `session.lock`.

Change (`backend/models.py`): `persist_session` returns without writing unless `_SESSIONS[session.id]` is still that same object. Every writer goes through this function: the narrative route, insights, chat turns, table edits, relationships, feedback and `touch_session`. All of them now respect deletion and expiry. The session check and the write both run on the event-loop thread, as `drop_session` does, so they cannot interleave. No route changes were needed, and the response of an in-flight request is unchanged.

Files: `backend/models.py`, `tests/test_session_deletion.py` (new).

Verification:
- `tests/test_session_deletion.py` has 3 tests.
  - It drives the real app on one event loop: a narrative request with a fake `generate_narrative` that blocks, then `DELETE /session/{id}` while it is blocked, then release. Both requests return 200, and neither the metadata nor the DuckDB file exists afterwards.
  - An expired, swept session that is then persisted leaves no metadata file and no `.json.tmp` file.
  - A live session still persists normally.
- Red first: on the unfixed code, the first two tests failed with the metadata file present.
- Full suite: 53 tests passed. Compile check passed.

Remaining risk: a request already past `_session_or_404` when the session is dropped still runs against the closed DuckDB connection. It gets a DuckDB error, which was the existing behaviour. Nothing is persisted.

### Iteration 12. Chat progress and answers were silent for screen-reader users

Status: Fixed and verified.

Issue:
- The chat textarea and four search inputs (`chat-search-input`, `history-search`, `command-palette-input`, `data-browser-search`) had only a placeholder for a name. A placeholder is not a reliable accessible name: some screen readers skip it, and it disappears once the user types.
- While a question runs, the typing bubble's status text ("Querying your data...") changes silently, and the finished answer is appended to `#chat-log`, which is not a live region. A screen-reader user pressed Ask and heard nothing until they went looking through the log. A stopped request was also silent. Errors were already announced, because `#toast-container` is `aria-live="polite"`.

Root cause: the chat UI updated the DOM visually but had no live region for asynchronous updates. The inputs relied on `placeholder` instead of a label.

Change:
- `frontend/index.html`: an `aria-label` on each of the five controls. A visually hidden `#chat-announcer` (`role="status"`, `aria-live="polite"`, `aria-atomic="true"`) next to the chat log.
- `frontend/styles.css`: a standard `.sr-only` class.
- `frontend/app.js`:
  - `announceChat(text)` writes to the live region. It clears first, so repeated text is spoken again, and it replaces any update still pending, so a slow reader never lands on a stale status.
  - `askQuestion` announces each streamed `status` event, the answer on `done`, and "Stopped." on abort.
  - `answerAnnouncement` strips markdown emphasis and code marks, collapses whitespace and caps the spoken answer at 600 characters. It keeps underscores, so column names read correctly.
  - Errors are not announced twice; the toast still announces them.
  - `#chat-log` itself was not made live on purpose, because it would then also read the user's own message, SQL, tables and chart markup.

Files: `frontend/index.html`, `frontend/styles.css`, `frontend/app.js`, `tests/test_frontend_a11y.py` (new).

Verification:
- `tests/test_frontend_a11y.py` (3 tests, standard library `html.parser` only):
  - Every visible `input`, `textarea` and `select` in `index.html` has a wrapping `<label>`, a `<label for>`, `aria-label` or `aria-labelledby`.
  - `#chat-announcer` exists with `role="status"`, `aria-live="polite"` and the `sr-only` class, and `.sr-only` is defined in the CSS.
  - The `/chat/stream` handler calls `announceChat` for `status` and `done`, including the answer.
- Red first: all 3 failed on the unfixed frontend. The first listed exactly the five unnamed controls.
- `node --check frontend/app.js` passed.
- In the browser against the running app on port 8765:
  - The five controls expose their labels.
  - The announcer is 1px and clipped.
  - ``announceChat(answerAnnouncement("**Total** `sales` for north_region is 1,200"))`` produced "Answer: Total sales for north_region is 1,200".
  - No console errors (so no CSP violation).
- Full suite: 56 tests passed. Compile check passed.

Remaining risk: not tested with a real screen reader (VoiceOver/NVDA), and not exercised end to end with a live Ollama answer. Other async panels (insights, narrative, data browser) still update without announcements.
