"""Iteration 11: once a session is deleted (or expires), nothing still in flight
for it can write its metadata back to disk."""

import asyncio
import threading
import unittest
from unittest import mock

import tests  # noqa: F401  (isolated data dir)
from backend import main, models
from backend.storage import session_db_path, session_metadata_path
from tests.asgi_client import signed_in_client, upload_sample


class _SlowNarrative:
    """Stands in for generate_narrative and returns only when released."""

    def __init__(self) -> None:
        self.started = threading.Event()
        self.release = threading.Event()

    def __call__(self, llm, dashboard) -> str:
        self.started.set()
        self.release.wait(5)
        return "Sales are concentrated in two regions."


class DeletedSessionStaysDeletedTest(unittest.TestCase):
    def setUp(self):
        self.client = signed_in_client(main.app)
        self.session_id = upload_sample(self.client)["session_id"]
        self.metadata = session_metadata_path(self.session_id)
        self.assertTrue(self.metadata.exists())

    def test_narrative_finishing_after_delete_does_not_recreate_metadata(self):
        slow = _SlowNarrative()

        async def scenario():
            narrative = asyncio.ensure_future(
                self.client.arequest("GET", f"/dashboard/{self.session_id}/narrative")
            )
            await asyncio.to_thread(slow.started.wait, 5)
            deleted = await self.client.arequest("DELETE", f"/session/{self.session_id}")
            slow.release.set()
            return deleted, await narrative

        with mock.patch.object(main, "generate_narrative", slow):
            deleted, narrative = asyncio.run(scenario())

        self.assertEqual(deleted.status, 200, deleted.text)
        self.assertEqual(narrative.status, 200, narrative.text)
        self.assertFalse(self.metadata.exists(), "deleted session's metadata was written back")
        self.assertFalse(session_db_path(self.session_id).exists())
        self.assertIsNone(models.get_session(self.session_id, touch=False))

    def test_persisting_an_expired_session_is_a_no_op(self):
        session = models.get_session(self.session_id, touch=False)
        assert session is not None
        session.last_accessed_at -= models.SESSION_TTL_SECONDS + 1
        self.assertIn(self.session_id, models.sweep_expired_sessions())
        self.assertFalse(self.metadata.exists())

        session.chat_history.append({"role": "user", "content": "late write"})
        models.persist_session(session)
        self.assertFalse(self.metadata.exists())
        self.assertFalse(self.metadata.with_suffix(".json.tmp").exists())

    def test_live_session_still_persists(self):
        session = models.get_session(self.session_id, touch=False)
        assert session is not None
        session.chat_history.append({"role": "user", "content": "kept"})
        models.persist_session(session)
        self.assertIn("kept", self.metadata.read_text(encoding="utf-8"))


if __name__ == "__main__":
    unittest.main()
