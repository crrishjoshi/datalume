# Datalume Hardening Implementation Plan

> **For agentic workers:** This plan is being executed natively in the current workspace, task by task, with regression checks after each subsystem.

**Goal:** Make Datalume safe for authenticated multi-user use, durable across restarts, responsive during background analysis, self-contained for frontend assets, and bounded in upload memory.

**Architecture:** Add a small SQLite-backed account/session-cookie service and persist each user's DuckDB session to a dedicated file with JSON metadata. Keep the existing analytical APIs, but scope every session lookup to the authenticated owner. Separate LLM proposal work from DuckDB execution locking, vendor browser assets, and spool uploads to disk before parsing.

**Tech Stack:** FastAPI, Starlette middleware, SQLite, PBKDF2-HMAC, DuckDB, pandas, vanilla JavaScript, Chart.js, Leaflet, topojson-client, us-atlas.

**Spec:** `docs/PROJECT_AUDIT.md`

**Execution status:** Complete. The implementation record and verification evidence are maintained in `docs/PROJECT_AUDIT.md`.

## Global Constraints

- No raw passwords, provider keys, or session data in frontend storage.
- Existing SQL AST validation remains the security boundary.
- Same-origin local use remains supported without manual token copying.
- Uploads are rejected over 300 MB before parsing.
- Existing CSV, XLSX, XLS, and PBIX workflows remain available.

## Review Focus

- Unauthenticated or cross-user session access must return `401/404`, never another user's data.
- Restarting the backend must preserve an authenticated user's dashboard and chat history.
- Opening the data browser while insights are generating must remain responsive.
- The app must render charts and maps without network access to a CDN.
- An upload just below the limit must succeed without retaining the multipart bytes after parsing.

### Task 1: Authentication and durable sessions

- Add `backend/auth.py` with SQLite users, PBKDF2 password hashing, opaque HttpOnly login cookies, registration/login/logout/status routes, and request context for the current user.
- Add auth middleware for protected API paths and owner checks in session lookup.
- Add `owner_user_id`, `db_path`, and persistence metadata to `Session`; restore sessions at startup and remove expired session files.
- Store uploaded DuckDB databases under a configurable `DATALUME_DATA_DIR`.
- Add a small login/register gate to the frontend before session restoration.

### Task 2: CORS and origin policy

- Replace wildcard CORS with an environment-configured allow-list and credentials support.
- Default to same-origin operation; reject cross-origin access unless explicitly configured.

### Task 3: Background insight isolation

- Generate LLM proposals without holding the DuckDB session lock.
- Revalidate proposals against the current dashboard before executing SQL under the lock.
- Keep narrative generation on its independent lock.

### Task 4: Self-host frontend assets

- Add pinned npm dependencies and copy their browser assets into `frontend/vendor`.
- Replace CDN script/style references and remote map topology with local files.
- Verify the app loads with external network requests blocked.

### Task 5: Bounded upload handling

- Copy multipart input to a temporary file in bounded chunks while enforcing the existing limit.
- Parse CSV/Excel/PBIX from the temporary path and clean it up in all success/error paths.
- Preserve clear 400/413 upload errors.

### Task 6: Documentation and verification

- Maintain `docs/PROJECT_AUDIT.md` with the original finding, root cause, change, verification, and deployment configuration.
- Run syntax checks, API auth/ownership/restart tests, frontend Playwright smoke tests, offline asset checks, and an upload memory-path smoke test.
