"""Iteration 10: a streamed chat turn is recorded even if the client goes away
before the final event, and a failure nobody is listening for is still logged."""

import asyncio
import json
import threading
import time
import unittest
from typing import Any
from unittest import mock

import tests  # noqa: F401  (isolated data dir)
from backend import main, models
from backend.storage import session_metadata_path
from tests.asgi_client import signed_in_client, upload_sample


def _result(answer: str) -> dict[str, Any]:
    return {
        "answer": answer,
        "sql": "SELECT 1",
        "explanation": None,
        "chart": None,
        "follow_up_questions": [],
        "result": None,
        "success": True,
        "elapsed": 0.0,
    }


class _SlowAnswer:
    """Stands in for answer_question: emits a status, then finishes only when
    the test releases it, so the client can disconnect in between."""

    def __init__(self, *, fail: bool = False) -> None:
        self.release = threading.Event()
        self.fail = fail

    def __call__(self, **kwargs: Any) -> dict[str, Any]:
        kwargs["on_status"]("Querying your data...")
        self.release.wait(5)
        if self.fail:
            raise RuntimeError("model fell over")
        return _result(f"answer to {kwargs['question']}")


def _pending_tasks() -> set:
    return getattr(main, "_background_chat_tasks", set())


async def _stream_then_disconnect(client, session_id: str, message: str, slow: _SlowAnswer) -> list[dict]:
    """Drive /chat/stream over raw ASGI, hang up after the first event, and
    only then let the (fake) model finish."""
    body = json.dumps({"session_id": session_id, "message": message}).encode()
    first_event = asyncio.Event()
    events: list[dict] = []
    sent_body = False

    async def receive() -> Any:
        nonlocal sent_body
        if not sent_body:
            sent_body = True
            return {"type": "http.request", "body": body, "more_body": False}
        await first_event.wait()
        return {"type": "http.disconnect"}

    async def send(message: Any) -> None:
        if message["type"] == "http.response.body" and message.get("body"):
            for line in message["body"].decode().splitlines():
                if line.startswith("data: "):
                    events.append(json.loads(line[6:]))
            first_event.set()

    scope = {
        "type": "http",
        "asgi": {"version": "3.0"},
        "http_version": "1.1",
        "method": "POST",
        "scheme": "http",
        "path": "/chat/stream",
        "raw_path": b"/chat/stream",
        "query_string": b"",
        "root_path": "",
        "headers": [
            (b"host", b"testserver"),
            (b"content-type", b"application/json"),
            (b"content-length", str(len(body)).encode()),
            (b"cookie", "; ".join(f"{k}={v}" for k, v in client.cookies.items()).encode()),
        ],
        "client": ("127.0.0.1", 50000),
        "server": ("testserver", 80),
    }
    await main.app(scope, receive, send)
    slow.release.set()
    # The turn keeps running without the client; give it a moment to land.
    deadline = time.monotonic() + 5
    while _pending_tasks() and time.monotonic() < deadline:
        await asyncio.sleep(0.02)
    return events


class ChatStreamDisconnectTest(unittest.TestCase):
    def setUp(self):
        self.client = signed_in_client(main.app)
        self.session_id = upload_sample(self.client)["session_id"]

    def _session(self) -> models.Session:
        session = models.get_session(self.session_id, touch=False)
        assert session is not None
        return session

    def test_turn_is_recorded_when_client_disconnects_mid_stream(self):
        slow = _SlowAnswer()
        with mock.patch.object(main, "answer_question", slow):
            events = asyncio.run(_stream_then_disconnect(self.client, self.session_id, "total sales?", slow))
        self.assertEqual([e["type"] for e in events], ["status"])  # never saw 'done'
        session = self._session()
        self.assertEqual(
            session.chat_history[-2:],
            [{"role": "user", "content": "total sales?"}, {"role": "assistant", "content": "answer to total sales?"}],
        )
        self.assertEqual(session.query_log[-1]["question"], "total sales?")
        # ...and it is on disk, so it survives a restart.
        persisted = json.loads(session_metadata_path(self.session_id).read_text(encoding="utf-8"))
        self.assertEqual(persisted["query_log"][-1]["question"], "total sales?")
        self.assertFalse(_pending_tasks())

    def test_failure_after_disconnect_is_logged_not_lost(self):
        slow = _SlowAnswer(fail=True)
        with mock.patch.object(main, "answer_question", slow), self.assertLogs(main.logger, "ERROR") as logs:
            asyncio.run(_stream_then_disconnect(self.client, self.session_id, "boom?", slow))
        self.assertTrue(any("boom?" in line for line in logs.output), logs.output)
        self.assertNotIn({"role": "user", "content": "boom?"}, self._session().chat_history)

    def test_connected_client_still_gets_status_then_done(self):
        # A fake that returns at once can finish before to_thread's future is
        # chained, which once let 'done' overtake the status; repeat to catch it.
        slow = _SlowAnswer()
        slow.release.set()
        for attempt in range(5):
            with self.subTest(attempt=attempt), mock.patch.object(main, "answer_question", slow):
                res = self.client.post("/chat/stream", json={"session_id": self.session_id, "message": "hi"})
                self.assertEqual(res.status, 200, res.text)
                events = [json.loads(line[6:]) for line in res.text.splitlines() if line.startswith("data: ")]
                self.assertEqual([e["type"] for e in events], ["status", "done"])
                self.assertEqual(events[-1]["answer"], "answer to hi")
                self.assertTrue(events[-1]["id"])
                self.assertEqual(self._session().query_log[-1]["id"], events[-1]["id"])

    def test_error_event_when_model_fails_while_connected(self):
        slow = _SlowAnswer(fail=True)
        slow.release.set()
        with mock.patch.object(main, "answer_question", slow), self.assertLogs(main.logger, "ERROR"):
            res = self.client.post("/chat/stream", json={"session_id": self.session_id, "message": "x"})
        events = [json.loads(line[6:]) for line in res.text.splitlines() if line.startswith("data: ")]
        self.assertEqual(events[-1], {"type": "error", "message": "model fell over"})


if __name__ == "__main__":
    unittest.main()
