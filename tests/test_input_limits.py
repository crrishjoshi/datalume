"""Iteration 4: request size bounds, readable validation errors, chat history cap."""

import unittest
from unittest import mock

import tests  # noqa: F401  (isolated data dir)
from backend import main
from backend.main import app
from backend.models import get_session
from tests.asgi_client import signed_in_client, upload_sample


def _stub_answer(**kwargs):
    return {
        "answer": "ok", "sql": None, "explanation": None, "chart": None,
        "follow_up_questions": [], "result": None, "success": True, "elapsed": 0.0,
    }


class InputLimitsTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = signed_in_client(app)
        cls.session_id = upload_sample(cls.client)["session_id"]

    def test_oversized_chat_message_rejected_with_string_detail(self):
        with mock.patch.object(main, "answer_question", side_effect=AssertionError("must not run")):
            res = self.client.post("/chat", json={"session_id": self.session_id, "message": "x" * (main.MAX_CHAT_MESSAGE_CHARS + 1)})
        self.assertEqual(res.status, 422)
        detail = res.json()["detail"]
        self.assertIsInstance(detail, str)
        self.assertIn("message", detail)
        self.assertNotIn("x" * 100, res.text)  # rejected input is not echoed back

    def test_oversized_sql_rejected(self):
        res = self.client.post("/run-sql", json={"session_id": self.session_id, "sql": "SELECT 1 " + " " * main.MAX_SQL_CHARS})
        self.assertEqual(res.status, 422)

    def test_normal_sql_still_runs(self):
        res = self.client.post("/run-sql", json={"session_id": self.session_id, "sql": "SELECT region, SUM(sales) FROM sales GROUP BY region"})
        self.assertEqual(res.status, 200, res.text)

    def test_oversized_rename_rejected(self):
        res = self.client.request("PATCH", f"/session/{self.session_id}/table/sales", json={"new_name": "n" * 1000})
        self.assertEqual(res.status, 422)

    def test_missing_field_detail_is_string(self):
        res = self.client.post("/chat", json={"session_id": self.session_id})
        self.assertEqual(res.status, 422)
        self.assertIsInstance(res.json()["detail"], str)

    def test_chat_history_is_capped_but_query_log_kept(self):
        with mock.patch.object(main, "answer_question", side_effect=_stub_answer):
            for i in range(main.MAX_CHAT_HISTORY_ENTRIES):
                res = self.client.post("/chat", json={"session_id": self.session_id, "message": f"q{i}"})
                self.assertEqual(res.status, 200, res.text)
        session = get_session(self.session_id, touch=False)
        self.assertEqual(len(session.chat_history), main.MAX_CHAT_HISTORY_ENTRIES)
        self.assertEqual(session.chat_history[-2]["content"], f"q{main.MAX_CHAT_HISTORY_ENTRIES - 1}")
        self.assertGreaterEqual(len(session.query_log), main.MAX_CHAT_HISTORY_ENTRIES)


if __name__ == "__main__":
    unittest.main()
