"""Iteration 1: provider/SQLite calls must not block the event loop."""

import asyncio
import time
import unittest
from unittest import mock

import tests  # noqa: F401  (isolated data dir)
from backend import main
from tests.asgi_client import Client

SLOW_SECONDS = 0.4


def _slow(value):
    def inner(*_args, **_kwargs):
        time.sleep(SLOW_SECONDS)
        return value
    return inner


class EventLoopResponsivenessTest(unittest.TestCase):
    def setUp(self):
        self.client = Client(main.app)
        self.client.post("/auth/register", json={"username": f"loop{time.time_ns()}", "password": "password123"})

    def _ticks_during(self, method, path, **kwargs):
        """Count how often a concurrent coroutine gets scheduled while the
        request runs. A blocked loop yields ~0 ticks."""
        async def scenario():
            ticks = 0
            stop = False

            async def ticker():
                nonlocal ticks
                while not stop:
                    ticks += 1
                    await asyncio.sleep(0.01)

            task = asyncio.create_task(ticker())
            await asyncio.sleep(0)
            response = await self.client.arequest(method, path, **kwargs)
            stop = True
            await task
            return response, ticks

        return asyncio.run(scenario())

    def test_health_does_not_block(self):
        status = {"reachable": True, "model_available": True, "model": "m"}
        with mock.patch.object(main.provider, "model_status", _slow(status)):
            response, ticks = self._ticks_during("GET", "/health")
        self.assertEqual(response.status, 200)
        self.assertGreater(ticks, 10)

    def test_models_does_not_block(self):
        with mock.patch.object(main.provider, "list_models", _slow(["m"])):
            response, ticks = self._ticks_during("GET", "/models")
        self.assertEqual(response.status, 200)
        self.assertEqual(response.json()["available"], ["m"])
        self.assertGreater(ticks, 10)

    def test_select_unknown_model_rejected_without_blocking(self):
        with mock.patch.object(main.provider, "list_models", _slow(["m"])):
            response, ticks = self._ticks_during("POST", "/models/select", json={"model": "nope"})
        self.assertEqual(response.status, 400)
        self.assertGreater(ticks, 10)


if __name__ == "__main__":
    unittest.main()
