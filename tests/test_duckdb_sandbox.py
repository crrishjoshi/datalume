"""Iteration 8: session DuckDB connections cannot reach the filesystem, even
for SQL that bypasses the guard, and the guard names table functions."""

import tempfile
import unittest
from pathlib import Path

import duckdb

import tests  # noqa: F401  (isolated data dir)
from backend import models
from backend.main import app
from backend.query.duckdb_session import connect_session_db
from backend.query.sql_guard import SqlRejected, validate_and_cap
from tests.asgi_client import multipart_file, signed_in_client, upload_sample


def _scalar(con: duckdb.DuckDBPyConnection, sql: str):
    row = con.execute(sql).fetchone()
    assert row is not None
    return row[0]


def _external_access(con: duckdb.DuckDBPyConnection) -> bool:
    return _scalar(con, "SELECT current_setting('enable_external_access')")


def _session(session_id: str) -> models.Session:
    session = models.get_session(session_id, touch=False)
    assert session is not None
    return session


class ConnectionSandboxTest(unittest.TestCase):
    def setUp(self):
        self.tmp = Path(tempfile.mkdtemp())
        self.secret = self.tmp / "secret.csv"
        self.secret.write_text("token\nhunter2\n", encoding="utf-8")
        self.con = connect_session_db(str(self.tmp / "s.duckdb"))
        self.addCleanup(self.con.close)

    def test_unguarded_sql_cannot_touch_files(self):
        blocked = [
            f"SELECT * FROM read_csv('{self.secret}')",
            f"SELECT * FROM read_text('{self.secret}')",
            f"SELECT * FROM glob('{self.tmp}/*')",
            f"ATTACH '{self.tmp / 'other.duckdb'}'",
            f"COPY (SELECT 1) TO '{self.tmp / 'out.csv'}'",
        ]
        for sql in blocked:
            with self.subTest(sql=sql), self.assertRaises(duckdb.Error):
                self.con.execute(sql)
        self.assertFalse((self.tmp / "out.csv").exists())
        self.assertFalse((self.tmp / "other.duckdb").exists())

    def test_sandbox_cannot_be_switched_off(self):
        for sql in ("SET enable_external_access = true", "SET lock_configuration = false"):
            with self.subTest(sql=sql), self.assertRaises(duckdb.Error):
                self.con.execute(sql)
        self.assertFalse(_external_access(self.con))

    def test_app_table_operations_still_work(self):
        import pandas as pd

        from backend.data.loaders import register_frames

        register_frames(self.con, {"t": pd.DataFrame({"a": [1, 2, 3]})})
        self.con.execute('ALTER TABLE "t" RENAME TO "u"')
        self.assertEqual(_scalar(self.con, 'SELECT sum(a) FROM "u"'), 6)
        self.assertEqual(self.con.execute('SELECT * FROM "u"').df().shape, (3, 1))


class SessionConnectionsAreSandboxedTest(unittest.TestCase):
    def setUp(self):
        self.client = signed_in_client(app)
        self.session_id = upload_sample(self.client)["session_id"]

    def test_uploaded_session_is_sandboxed_and_queryable(self):
        self.assertFalse(_external_access(_session(self.session_id).con))
        res = self.client.post("/run-sql", json={"session_id": self.session_id, "sql": "SELECT count(*) AS n FROM sales"})
        self.assertEqual(res.status, 200, res.text)
        self.assertEqual(res.json()["result"]["rows"], [[6]])

    def test_added_table_still_loads(self):
        body, headers = multipart_file("file", "extra.csv", b"k,v\na,1\nb,2\n")
        res = self.client.request("POST", f"/upload/{self.session_id}/add-table", body=body, headers=headers)
        self.assertEqual(res.status, 200, res.text)
        res = self.client.post("/run-sql", json={"session_id": self.session_id, "sql": "SELECT sum(v) FROM extra"})
        self.assertEqual(res.status, 200, res.text)
        self.assertEqual(res.json()["result"]["rows"], [[3]])

    def test_restored_session_is_sandboxed(self):
        session = models._SESSIONS.pop(self.session_id)
        session.con.close()
        restored = models.restore_persisted_sessions()
        self.assertIn(self.session_id, restored)
        con = _session(self.session_id).con
        self.assertFalse(_external_access(con))
        self.assertEqual(_scalar(con, "SELECT count(*) FROM sales"), 6)


class GuardRejectsTableFunctionsTest(unittest.TestCase):
    def test_table_functions_get_a_clear_reason(self):
        for sql in ("SELECT * FROM read_csv('/etc/hosts')", "SELECT * FROM glob('/*')", "SELECT * FROM range(3)"):
            with self.subTest(sql=sql), self.assertRaisesRegex(SqlRejected, "Table functions are not allowed"):
                validate_and_cap(sql, {"sales"})

    def test_ordinary_and_schema_qualified_tables_still_pass(self):
        self.assertIn("LIMIT 500", validate_and_cap("SELECT * FROM sales", {"sales"}))
        self.assertIn("LIMIT 500", validate_and_cap("SELECT * FROM main.sales", {"sales"}))


if __name__ == "__main__":
    unittest.main()
