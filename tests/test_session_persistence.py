"""Iteration 7: reads must not rewrite session metadata every time; writes still persist at once."""

import json
import unittest
from unittest import mock

import tests  # noqa: F401  (isolated data dir)
from backend import main, models
from backend.main import app
from backend.storage import session_metadata_path
from tests.asgi_client import signed_in_client, upload_sample


def _stub_answer(**kwargs):
    return {
        "answer": "ok", "sql": None, "explanation": None, "chart": None,
        "follow_up_questions": [], "result": None, "success": True, "elapsed": 0.0,
    }


class SessionPersistenceTest(unittest.TestCase):
    def setUp(self):
        self.client = signed_in_client(app)
        self.session_id = upload_sample(self.client)["session_id"]
        self.session = models.get_session(self.session_id, touch=False)

    def _stored(self) -> dict:
        with session_metadata_path(self.session_id).open(encoding="utf-8") as handle:
            return json.load(handle)

    def test_repeated_reads_do_not_rewrite_metadata(self):
        # persist_session writes a temp file and renames it over the target,
        # so any rewrite (from whichever module) changes the file's inode.
        inode = session_metadata_path(self.session_id).stat().st_ino
        for path in ("", "/history", "/insight-fields"):
            for _ in range(3):
                res = self.client.get(f"/dashboard/{self.session_id}{path}")
                self.assertEqual(res.status, 200)
        self.assertEqual(session_metadata_path(self.session_id).stat().st_ino, inode)

    def test_stale_access_time_is_persisted_on_next_read(self):
        self.session.persisted_at -= models.ACCESS_PERSIST_INTERVAL_SECONDS + 1
        before = self._stored()["last_accessed_at"]
        with mock.patch.object(models, "persist_session", wraps=models.persist_session) as persist:
            self.assertEqual(self.client.get(f"/dashboard/{self.session_id}").status, 200)
            self.assertEqual(self.client.get(f"/dashboard/{self.session_id}").status, 200)
        self.assertEqual(persist.call_count, 1)
        self.assertGreater(self._stored()["last_accessed_at"], before)

    def test_in_memory_access_time_still_advances_without_a_write(self):
        self.session.last_accessed_at -= 30
        stale = self.session.last_accessed_at
        self.client.get(f"/dashboard/{self.session_id}")
        self.assertGreater(self.session.last_accessed_at, stale)

    def test_changes_are_still_persisted_immediately(self):
        with mock.patch.object(main, "answer_question", side_effect=_stub_answer):
            res = self.client.post("/chat", json={"session_id": self.session_id, "message": "persist me"})
        self.assertEqual(res.status, 200)
        self.assertIn({"role": "user", "content": "persist me"}, self._stored()["chat_history"])

    def test_persisted_at_is_not_written_to_metadata(self):
        self.assertNotIn("persisted_at", self._stored())


if __name__ == "__main__":
    unittest.main()
