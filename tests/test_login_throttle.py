"""Iteration 3: login brute-force throttling and unknown-user timing."""

import time
import unittest
from unittest import mock

import tests  # noqa: F401  (isolated data dir)
from backend import auth
from backend.auth import AuthError, auth_store, login_throttle
from backend.main import app
from tests.asgi_client import Client


class LoginThrottleTest(unittest.TestCase):
    def setUp(self):
        login_throttle._failures.clear()
        self.username = f"thr{time.time_ns()}"
        auth_store.register(self.username, "password123")
        self.client = Client(app)

    def _login(self, password, username=None):
        return self.client.post("/auth/login", json={"username": username or self.username, "password": password})

    def test_locks_after_repeated_failures_even_for_correct_password(self):
        for _ in range(auth.MAX_LOGIN_FAILURES_PER_USERNAME):
            self.assertEqual(self._login("wrong-password").status, 401)
        res = self._login("password123")
        self.assertEqual(res.status, 429)
        self.assertGreater(int(res.headers["retry-after"]), 0)

    def test_username_key_is_case_insensitive(self):
        for _ in range(auth.MAX_LOGIN_FAILURES_PER_USERNAME):
            self._login("wrong-password", username=self.username.upper())
        self.assertEqual(self._login("password123").status, 429)

    def test_success_resets_username_counter(self):
        for _ in range(auth.MAX_LOGIN_FAILURES_PER_USERNAME - 1):
            self._login("wrong-password")
        self.assertEqual(self._login("password123").status, 200)
        self.assertEqual(self._login("wrong-password").status, 401)  # not 429

    def test_window_expiry_unlocks(self):
        for _ in range(auth.MAX_LOGIN_FAILURES_PER_USERNAME):
            self._login("wrong-password")
        later = time.time() + auth.LOGIN_FAILURE_WINDOW_SECONDS + 1
        with mock.patch.object(auth.time, "time", return_value=later):
            self.assertEqual(login_throttle.retry_after(self.username, "testclient"), 0)

    def test_client_limit_spans_usernames(self):
        for i in range(auth.MAX_LOGIN_FAILURES_PER_CLIENT):
            login_throttle.record_failure(f"spray{i}", "10.0.0.9")
        self.assertGreater(login_throttle.retry_after("someone-else", "10.0.0.9"), 0)
        self.assertEqual(login_throttle.retry_after("someone-else", "10.0.0.10"), 0)

    def test_oversized_password_rejected_before_hashing(self):
        res = self._login("x" * 5000)
        self.assertEqual(res.status, 422)

    def test_unknown_username_still_runs_pbkdf2(self):
        with mock.patch.object(auth, "_password_digest", wraps=auth._password_digest) as digest:
            with self.assertRaises(AuthError):
                auth_store.login(f"nobody{time.time_ns()}", "whatever123")
        self.assertEqual(digest.call_count, 1)


if __name__ == "__main__":
    unittest.main()
