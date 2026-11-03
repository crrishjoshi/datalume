# Datalume

*Chat with your data.*

Upload a CSV, Excel, or Power BI (`.pbix`) file. Get an auto-generated dashboard
and a chat interface that answers plain-English questions about the data —
*"which region underperformed last quarter?"* — by having an LLM write and run
real SQL against it, safely.

## Why this exists

I am very enthusiastic about data, analysis, and business, and I created
Datalume to bring those interests together in a practical product. It is a
prototype of the kind of tool a Business Analyst is actually asked to build:
turn a raw data file into something a non-technical stakeholder can interrogate
without writing formulas or queries themselves.

The project reflects my current knowledge across data analysis, business
thinking, software engineering, and responsible application security. I am
continuing to improve it as I learn more and validate the product against real
use cases.

For the business rationale, product positioning, USP, technology, and security
controls, see the [technical and security report](docs/TECHNICAL_SECURITY_REPORT.md).

## How it works

```
                         ┌─────────────────────┐
   .csv / .xlsx / .pbix  │      Frontend        │
   ───────────────────▶  │  (HTML/JS, no build) │
                         └──────────┬───────────┘
                                    │ fetch()
                                    ▼
                         ┌─────────────────────┐
                         │   FastAPI backend    │
                         │  /upload /chat       │
                         │  /dashboard/{id}     │
                         └──────────┬───────────┘
                                    │
              ┌─────────────────────┼─────────────────────┐
              ▼                     ▼                     ▼
     ┌────────────────┐   ┌─────────────────┐   ┌──────────────────┐
     │  data/loaders   │   │ dashboard/summary│   │   chat/agent      │
     │  CSV/XLSX/PBIX  │   │  stats + charts  │   │  tool-calling loop│
     │  → pandas       │   │  + suggested Qs  │   │                   │
     └────────┬────────┘   └─────────────────┘   └─────────┬─────────┘
              │                                             │
              ▼                                             ▼
     ┌────────────────┐                          ┌──────────────────┐
     │  DuckDB (one    │◀─────────────────────────│  query/sql_guard  │
     │  sandboxed file │   validated SELECT-only  │  (sqlglot AST     │
     │  per session,   │   SQL, row-capped         │  allow-list)      │
     │  per user)      │──────────────────────────▶│                  │
     └────────────────┘        results             └──────────────────┘
                                                              │
                                                              ▼
                                                    ┌──────────────────┐
                                                    │   llm/provider    │
                                                    │  (OllamaProvider  │
                                                    │  today; BYOK-     │
                                                    │  ready interface) │
                                                    └──────────────────┘
```

**Core design decision: text-to-SQL over DuckDB, not text-to-pandas-code.**
Letting an LLM generate arbitrary Python and `exec()` it is a real
code-execution risk once other people's data is involved. Instead, the model
gets one tool — `run_sql` — and every query it writes is parsed with
[`sqlglot`](https://github.com/tobymao/sqlglot) into an AST before it ever
touches DuckDB. Anything that isn't a single read-only `SELECT`/`WITH`/set
operation over a known table is rejected: no `INSERT`/`UPDATE`/`DELETE`,
no `DROP`/`CREATE`/`ALTER`, no `ATTACH`/`COPY`/`PRAGMA`/`CALL`, no multiple
statements. Results are capped at 500 rows before returning to the user and
truncated to 200 rows before being fed back to the model.

**Flow:** upload → file is parsed into DuckDB tables, with a data dictionary
(column types, null counts, sample values) and lightweight cross-table
relationship detection → an auto-generated dashboard (row/column counts,
missing values, numeric stats, top categories, suggested questions) is built
with plain heuristics, no LLM call, so upload stays fast → user asks a
question → the backend runs a tool-calling loop against a local Ollama model:
the model calls `run_sql`, the SQL is validated and executed, results go back
to the model, and it either retries (up to 3 times, on validation or DuckDB
errors) or calls `final_answer` with a plain-English answer, a short
explanation of what the query did, and an optional chart suggestion.

## Running it

Run everything from the project root (the folder containing `backend/`);
`backend.main` is imported as a package, so starting uvicorn from inside
`backend/` fails with `ModuleNotFoundError: No module named 'backend'`.

```bash
python3.13 -m venv .venv && source .venv/bin/activate
pip install -r backend/requirements.txt

# in another terminal, make sure Ollama is running with a tool-calling model:
ollama pull qwen2.5:7b-instruct
ollama serve

uvicorn backend.main:app --reload
```

Then open `http://localhost:8000` and create an account — the first screen is
a sign-in/register form, and every data route requires a signed-in user.

### Configuration

| Variable | Default | Purpose |
| --- | --- | --- |
| `DATALUME_DATA_DIR` | `.datalume` (relative to the working directory) | Where accounts (`auth.sqlite3`) and session data (`sessions/*.duckdb` + `*.json`) are stored. Back it up to keep users and uploads across reinstalls. |
| `DATALUME_COOKIE_SECURE` | `0` | Set to `1` when served over HTTPS so the auth cookie gets the `Secure` flag. |
| `DATALUME_ALLOWED_ORIGINS` | *(empty — same-origin only)* | Comma-separated origins allowed to call the API cross-origin with credentials. Leave empty when the bundled frontend is used. |

Ollama is expected at `http://localhost:11434`; the model defaults to
`qwen2.5:7b-instruct` and each user can switch to any other locally pulled
model from the model picker.

### Tests

```bash
python -m unittest discover -s tests -t .
```

The suite uses an in-process ASGI client and a temporary data directory, so it
needs neither a running server nor Ollama.

A synthetic "Sample Superstore"-style dataset is included at
`sample_data/sample_superstore.csv` for a quick test — try asking
*"which region underperformed last quarter?"*.

## Notable implementation details

- **SQL guard is the actual security boundary** (`backend/query/sql_guard.py`)
  — allow-list based on `sqlglot`'s AST, not a regex or keyword blocklist.
  Handles CTEs and set operations (`UNION`) correctly without weakening the
  read-only guarantee.
- **Column names are sanitized at load time** (spaces/hyphens → underscores)
  so the model never has to guess SQL identifier-quoting rules for a column
  like `Order Date`.
- **Date-like columns are coerced to real `datetime64` at load time**, so
  DuckDB stores them as `DATE`/`TIMESTAMP` and functions like `DATE_TRUNC`
  work without the model needing to cast a string.
- **The system prompt tells the model the data is historical**, not live —
  relative time phrases ("last quarter") are resolved against `MAX(date)` in
  the data, not the real-world current date.
- **A regex guard catches bind-parameter placeholders** (`?`, `$1`) before
  they reach DuckDB — a real failure mode observed with a local 7B
  tool-calling model, which occasionally tries to reference a computed value
  as if the tool supported parameter binding. Caught and corrected with a
  specific retry message instead of a generic DuckDB error.
- **`.pbix` support is real**, using [`pbixray`](https://github.com/Hugoberry/pbixray)
  to pull the embedded VertiPaq data model out of the file. Verified against
  several real Power BI Desktop files; some fail with an upstream `pbixray`
  decode limitation on certain column encodings — caught and surfaced as a
  clear message rather than a 500, with a fallback suggestion to export to
  CSV/Excel.
- **`.pbix` relationships come from Power BI's own data model, not a guess.**
  `pbixray`'s `.relationships` property exposes the real PK/FK links the
  report author defined (plus which side is active, for tables with more
  than one relationship). CSV/Excel uploads still fall back to name-based
  heuristic matching (shared `...ID` column names) since there's no model
  to read.
- **`LLMProvider` is an abstract interface** (`chat()` + `health_check()`)
  with one implementation today (`OllamaProvider`, local). Model selection is
  per user, so one user switching models never changes another's. Adding a
  hosted provider for the planned BYOK (bring-your-own-key) feature — where
  each connecting business supplies and pays for its own API key — is
  additive: a new provider class plus a per-account key lookup. The `Account`
  dataclass in `backend/models.py` is the unwired placeholder for that key.
- **Accounts and cookie auth are built in** (`backend/auth.py`) — PBKDF2
  password hashes in SQLite, an HttpOnly `SameSite=Lax` session cookie, and
  per-username and per-client throttling of failed sign-ins. Each data
  session belongs to the user who uploaded it; other users get a 404.
- **Sessions are durable but TTL-swept** — each upload is a DuckDB file plus
  a JSON metadata file under `DATALUME_DATA_DIR/sessions/`, restored on
  restart. Sessions idle for 30 minutes are deleted (data file included).
- **The DuckDB connection itself is sandboxed** — sessions are opened with
  `enable_external_access=false` and `lock_configuration=true`, so even SQL
  that slipped past the guard could not read, write, or attach files.
- **Security headers on every response** — a strict Content-Security-Policy
  (no inline script), `X-Frame-Options: DENY`, `nosniff`, and a restrictive
  referrer policy (`backend/security_headers.py`).
- **Chat responses stream over SSE** (`POST /chat/stream`) — a worker thread
  runs the tool-calling loop and bridges status updates back to the event
  loop via an `asyncio.Queue` + `call_soon_threadsafe`, so the frontend can
  show live progress ("running query…", "thinking…") instead of a blank
  wait for the whole loop to finish.

## What I'd build next

- Per-account API keys for hosted LLM providers (BYOK), stored encrypted.
- A shared, persistent sign-in throttle if the app is ever run as more than
  one process (today it is in-memory, per process).

## CV / portfolio summary

- Built a full-stack AI data-analysis tool (FastAPI + DuckDB + a local LLM)
  that lets non-technical users query uploaded CSV, Excel, and Power BI files
  in plain English.
- Designed a **text-to-SQL architecture with an AST-based security boundary**
  (`sqlglot`), avoiding the code-execution risk of a text-to-pandas approach —
  a deliberate design decision made with multi-tenant use in mind.
- Implemented real `.pbix` parsing (`pbixray`) to extract a Power BI file's
  embedded data model without needing Power BI installed.
- Built a **tool-calling agent loop** against a local LLM (Ollama) with
  validation-aware retries, and diagnosed and fixed several real model
  reliability issues (SQL identifier quoting, ambiguous relative-date
  reasoning, bind-parameter hallucination) through direct testing against the
  live model rather than assuming correctness.
- Designed the LLM integration behind a provider interface specifically to
  support a future bring-your-own-key model for multi-business use.
- Added defense in depth around user data: account auth with sign-in
  throttling, per-user session ownership, a filesystem-sandboxed DuckDB
  connection behind the SQL guard, and strict security headers.
