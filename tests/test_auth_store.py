"""Iteration 2: auth store connection handling and expired-session purging."""

import sqlite3
import time
import unittest
import warnings

import tests  # noqa: F401  (isolated data dir)
from backend import auth
from backend.auth import AuthError, auth_store
from backend.storage import AUTH_DB_PATH


def _session_rows() -> int:
    con = sqlite3.connect(AUTH_DB_PATH)
    try:
        return con.execute("SELECT COUNT(*) FROM auth_sessions").fetchone()[0]
    finally:
        con.close()


class AuthStoreTest(unittest.TestCase):
    def setUp(self):
        self.username = f"user{time.time_ns()}"
        auth_store.register(self.username, "password123")

    def test_login_round_trip_and_logout(self):
        token, user_id = auth_store.login(self.username, "password123")
        self.assertEqual(auth_store.user_for_token(token), user_id)
        auth_store.logout(token)
        self.assertIsNone(auth_store.user_for_token(token))

    def test_wrong_password_rejected(self):
        with self.assertRaises(AuthError):
            auth_store.login(self.username, "wrong-password")

    def test_connections_are_closed(self):
        with warnings.catch_warnings(record=True) as caught:
            warnings.simplefilter("always", ResourceWarning)
            token, _ = auth_store.login(self.username, "password123")
            for _ in range(5):
                auth_store.user_for_token(token)
            auth_store.has_users()
            import gc
            gc.collect()
        leaks = [w for w in caught if issubclass(w.category, ResourceWarning)]
        self.assertEqual(leaks, [])

    def test_expired_tokens_rejected_and_purged_on_interval(self):
        token, _ = auth_store.login(self.username, "password123")
        con = sqlite3.connect(AUTH_DB_PATH)
        with con:
            con.execute("UPDATE auth_sessions SET expires_at = 0 WHERE token_hash = ?", (auth._token_hash(token),))
        con.close()
        auth_store._next_purge_at = time.time() + 3600  # purge not yet due
        self.assertIsNone(auth_store.user_for_token(token))  # still rejected
        before = _session_rows()
        self.assertGreaterEqual(before, 1)
        auth_store._next_purge_at = 0.0  # purge due
        auth_store.user_for_token("anything")
        self.assertEqual(_session_rows(), before - 1)


if __name__ == "__main__":
    unittest.main()
