"""Iteration 5: browser security headers and no inline scripts."""

import re
import unittest
from pathlib import Path

import tests  # noqa: F401  (isolated data dir)
from backend.main import app
from tests.asgi_client import Client

FRONTEND = Path(__file__).resolve().parent.parent / "frontend"


class SecurityHeadersTest(unittest.TestCase):
    def setUp(self):
        self.client = Client(app)

    def _assert_base_headers(self, res):
        self.assertEqual(res.headers.get("x-content-type-options"), "nosniff")
        self.assertEqual(res.headers.get("x-frame-options"), "DENY")
        self.assertEqual(res.headers.get("referrer-policy"), "no-referrer")

    def test_index_has_strict_csp(self):
        res = self.client.get("/")
        self.assertEqual(res.status, 200)
        self._assert_base_headers(res)
        csp = res.headers.get("content-security-policy", "")
        self.assertIn("script-src 'self'", csp)
        self.assertIn("frame-ancestors 'none'", csp)
        self.assertNotIn("unsafe-inline", csp)
        self.assertNotIn("unsafe-eval", csp)

    def test_unauthenticated_api_error_also_has_headers(self):
        res = self.client.get("/models")
        self.assertEqual(res.status, 401)
        self._assert_base_headers(res)
        self.assertIn("content-security-policy", res.headers)

    def test_theme_script_is_public(self):
        res = self.client.get("/theme-init.js")
        self.assertEqual(res.status, 200)
        self.assertIn("javascript", res.headers.get("content-type", ""))

    def test_docs_exempt_from_csp_but_keep_other_headers(self):
        res = self.client.get("/docs")
        self.assertEqual(res.status, 200)
        self._assert_base_headers(res)
        self.assertNotIn("content-security-policy", res.headers)

    def test_index_html_has_no_inline_script_or_handlers(self):
        html = (FRONTEND / "index.html").read_text(encoding="utf-8")
        for match in re.finditer(r"<script\b([^>]*)>(.*?)</script>", html, re.S):
            self.assertIn("src=", match.group(1), "inline <script> would be blocked by CSP")
            self.assertEqual(match.group(2).strip(), "")
        self.assertIsNone(re.search(r"\son[a-z]+\s*=", html), "inline event handler would be blocked by CSP")
        self.assertIsNone(re.search(r"\sstyle\s*=", html), "inline style attribute would be blocked by CSP")


if __name__ == "__main__":
    unittest.main()
