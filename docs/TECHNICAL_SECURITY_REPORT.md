# Datalume Technical and Security Report

Updated: 2026-11-03

## 1. Purpose

Datalume is a local-first data-analysis application. A user uploads a CSV,
Excel, or Power BI file, receives an automatically profiled dashboard, and can
ask questions about the uploaded data in plain English. The application
generates read-only SQL, validates it, runs it against DuckDB, and presents the
result as an answer or visualisation.

This report describes the technology used in the application, its main data
flows, security controls, non-functional safeguards, and known limitations.

## 2. Technology used

### Frontend

- HTML, CSS, and vanilla JavaScript; no frontend build step is required.
- Chart.js for charts.
- Leaflet for map visualisations.
- topojson-client and US Atlas data for geographic rendering.
- All runtime browser assets are pinned and served locally from `frontend/vendor`.

### Backend and data processing

- FastAPI and Uvicorn provide the HTTP API and static-file server.
- pandas parses CSV and Excel files and prepares profiling data.
- pbixray extracts tables and relationships from Power BI files.
- DuckDB stores each uploaded session in a separate analytical database file.
- sqlglot parses and validates generated SQL as an abstract syntax tree.
- SQLite stores account credentials and authentication sessions.
- Ollama provides the locally hosted language-model integration behind the
  `LLMProvider` interface.

### Main application areas

- `backend/main.py`: API routes, authentication boundary, uploads, sessions,
  chat, dashboards, and model selection.
- `backend/data/loaders.py`: file parsing, table limits, column sanitisation,
  and relationship extraction.
- `backend/query/sql_guard.py`: read-only SQL validation and row limits.
- `backend/query/duckdb_session.py`: sandboxed DuckDB connections and query
  execution.
- `backend/chat/agent.py`: controlled question-answering loop and response
  validation.
- `backend/dashboard/`: dashboard summaries, insights, narrative, and maps.
- `backend/auth.py`: account registration, login, logout, cookies, and login
  throttling.
- `backend/models.py` and `backend/storage.py`: durable session metadata and
  storage paths.

## 3. Data flow

1. The user signs in or creates an account.
2. The upload is copied to a temporary file in bounded chunks and rejected if
   it exceeds the configured 300 MB limit.
3. The parser loads the file, sanitises identifiers, checks row/table limits,
   and extracts tables and relationships.
4. Tables are written to a user-owned DuckDB database file. Metadata is stored
   atomically as JSON beside the database.
5. Dashboard summaries and suggested questions are generated from the data.
6. A question is sent to the local model. The model can use the read-only SQL
   tool, but cannot execute arbitrary Python or shell commands.
7. SQL is parsed, restricted to the session's known tables, executed in the
   sandboxed DuckDB connection, capped, and returned to the model for a final
   response.

## 4. Security controls

### Authentication and session ownership

- Accounts are stored in SQLite with PBKDF2-HMAC-SHA256 password hashes and
  per-user salts.
- Passwords are never stored in plaintext and are never sent to the frontend
  after registration.
- Login sessions use random opaque tokens. Only the token hash is stored in
  SQLite.
- The browser receives an HttpOnly, SameSite=Lax cookie. `Secure` can be
  enabled with `DATALUME_COOKIE_SECURE=1` when HTTPS is used.
- Protected API routes require authentication.
- Every data session stores an owner user ID. A user cannot read, modify, or
  delete another user's session.
- Authentication sessions expire and failed sign-ins are throttled per account
  and client.

### SQL and database isolation

- SQL is parsed with sqlglot rather than checked with a simple keyword filter.
- Only a single read-only `SELECT`, `WITH`, or permitted set operation is
  accepted.
- Queries may reference only tables belonging to the current session.
- Multiple statements and write/administrative operations such as
  `INSERT`, `UPDATE`, `DELETE`, `DROP`, `CREATE`, `ALTER`, `ATTACH`, `COPY`,
  `PRAGMA`, and `CALL` are rejected.
- Results are capped before returning to the browser and are reduced further
  before being sent back to the language model.
- DuckDB connections disable external access and lock the relevant
  configuration, providing defence in depth if an invalid query reaches the
  database layer.

### File and input protection

- Uploads are streamed to temporary files in 1 MiB chunks instead of being
  fully materialised in application memory.
- Temporary upload files are removed on both success and failure.
- Empty, malformed, unsupported, oversized, and over-row-limit files return
  controlled errors rather than unhandled server exceptions.
- Table and column identifiers are sanitised before use in DuckDB and SQL.
- Maximum table counts and row counts limit resource consumption.
- PBIX parser failures are caught and surfaced as actionable upload errors.

### Browser and HTTP protection

- Content Security Policy allows scripts, styles, connections, and assets only
  from the application origin.
- `X-Content-Type-Options: nosniff` reduces content-type attacks.
- `X-Frame-Options: DENY` and `frame-ancestors 'none'` prevent framing.
- A restrictive referrer policy is applied.
- Cross-Origin-Opener-Policy is set to `same-origin`.
- CORS is same-origin by default. Separate origins must be explicitly listed in
  `DATALUME_ALLOWED_ORIGINS`.
- Runtime chart, map, and topology assets are self-hosted, so the dashboard
  does not depend on a third-party CDN at runtime.

### Model boundary

- The model receives a controlled schema/data summary and one SQL tool rather
  than arbitrary code execution.
- SQL validation and database sandboxing remain authoritative even if the
  model produces unsafe or incorrect text.
- Unverified model text is not accepted as a successful data answer when no
  validated query result exists.
- The provider is abstracted so future hosted providers can be added without
  exposing provider credentials in the frontend.

### Storage and lifecycle

- Account and session files live beneath the configurable `DATALUME_DATA_DIR`.
- Session databases and metadata are restored after a backend restart.
- Idle sessions are removed after the configured TTL, including their DuckDB
  data file.
- Metadata writes use a temporary file and atomic replacement to reduce the
  chance of a partially written session record.
- Local storage is not encrypted by the application; operating-system disk
  encryption and restricted permissions are recommended for sensitive data.

## 5. Performance and reliability safeguards

- CPU-heavy parsing and profiling run in worker threads so the FastAPI event
  loop remains responsive.
- Chat and DuckDB operations are serialised per session to protect the
  connection from concurrent access.
- Slow insight-model proposal generation happens outside the DuckDB lock; only
  the bounded execution phase uses the session lock.
- Dashboard revisions prevent stale insight proposals from being applied after
  a table change.
- Narrative generation has an independent lock so it does not unnecessarily
  block ordinary data operations.
- SSE chat responses expose progress while the model is working.
- The project has automated tests covering authentication, throttling, SQL and
  DuckDB isolation, uploads, session persistence, event-loop behaviour,
  security headers, model selection, accessibility, and chat streaming.

## 6. Known limitations and deployment responsibilities

- The default language model is local Ollama, so chat and model-generated
  insights depend on Ollama availability and an installed compatible model.
- The current sign-in throttle is process-local. A multi-worker deployment
  should move throttling to shared storage.
- Session files contain uploaded data and are not application-encrypted. Use
  encrypted disks, restricted service accounts, backups, and appropriate data
  retention policies for sensitive business data.
- HTTPS, `DATALUME_COOKIE_SECURE=1`, a persistent `DATALUME_DATA_DIR`, and a
  narrow CORS allow-list should be used outside local development.
- PBIX support depends on the upstream parser and may not support every Power
  BI encoding or report variant.
- The application is designed for controlled local or small-team use; a larger
  deployment should add central identity, structured audit logging, shared
  storage, monitoring, backups, and formal penetration testing.

## 7. Verification

The test suite is run with:

```bash
python -m unittest discover -s tests -t .
```

The suite runs against isolated temporary storage and does not require a live
Ollama service. Frontend syntax and browser checks should also be run before a
release, along with a review of deployment environment variables.
