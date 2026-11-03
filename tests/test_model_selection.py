"""Iteration 6: a user's model choice must not change the model for other users."""

import unittest
from unittest import mock

import tests  # noqa: F401  (isolated data dir)
from backend import main
from backend.llm.ollama_provider import OllamaProvider
from backend.main import app
from tests.asgi_client import Client, signed_in_client, upload_sample

PULLED = ["llama3:8b", "qwen2.5:7b-instruct"]


def _status(self):
    return {"reachable": True, "model_available": self.model in PULLED, "model": self.model}


def _stub_answer(**kwargs):
    _stub_answer.models.append(kwargs["provider"].model)
    return {
        "answer": "ok", "sql": None, "explanation": None, "chart": None,
        "follow_up_questions": [], "result": None, "success": True, "elapsed": 0.0,
    }


class ModelSelectionTest(unittest.TestCase):
    def setUp(self):
        patches = [
            mock.patch.object(OllamaProvider, "list_models", lambda self: list(PULLED)),
            mock.patch.object(OllamaProvider, "model_status", _status),
            mock.patch.dict(main._selected_models, clear=True),
        ]
        for p in patches:
            p.start()
            self.addCleanup(p.stop)
        self.default = main.provider.model
        self.alice = signed_in_client(app)
        self.bob = signed_in_client(app)

    def test_selection_is_per_user(self):
        res = self.alice.post("/models/select", json={"model": "llama3:8b"})
        self.assertEqual(res.status, 200)
        self.assertEqual(res.json()["model"], "llama3:8b")
        self.assertEqual(self.alice.get("/models").json()["current"], "llama3:8b")
        self.assertEqual(self.bob.get("/models").json()["current"], self.default)
        self.assertEqual(main.provider.model, self.default)  # shared default untouched

    def test_health_reports_the_callers_model(self):
        self.alice.post("/models/select", json={"model": "llama3:8b"})
        self.assertEqual(self.alice.get("/health").json()["llm"]["model"], "llama3:8b")
        self.assertEqual(self.bob.get("/health").json()["llm"]["model"], self.default)
        self.assertEqual(Client(app).get("/health").json()["llm"]["model"], self.default)

    def test_chat_uses_the_callers_model(self):
        self.alice.post("/models/select", json={"model": "llama3:8b"})
        alice_session = upload_sample(self.alice)["session_id"]
        bob_session = upload_sample(self.bob)["session_id"]
        _stub_answer.models = []
        with mock.patch.object(main, "answer_question", side_effect=_stub_answer):
            self.assertEqual(self.alice.post("/chat", json={"session_id": alice_session, "message": "hi"}).status, 200)
            self.assertEqual(self.bob.post("/chat", json={"session_id": bob_session, "message": "hi"}).status, 200)
            self.assertEqual(self.alice.post("/chat/stream", json={"session_id": alice_session, "message": "hi"}).status, 200)
        self.assertEqual(_stub_answer.models, ["llama3:8b", self.default, "llama3:8b"])

    def test_unpulled_model_rejected_and_selection_unchanged(self):
        res = self.alice.post("/models/select", json={"model": "not-pulled:1b"})
        self.assertEqual(res.status, 400)
        self.assertEqual(self.alice.get("/models").json()["current"], self.default)

    def test_select_requires_sign_in(self):
        res = Client(app).post("/models/select", json={"model": "llama3:8b"})
        self.assertEqual(res.status, 401)
        self.assertEqual(main._selected_models, {})


if __name__ == "__main__":
    unittest.main()
