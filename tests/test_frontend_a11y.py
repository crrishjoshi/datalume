"""Iteration 12: every form control has an accessible name, and chat progress
and answers reach screen readers through a polite live region."""

import re
import unittest
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
INDEX = (ROOT / "frontend" / "index.html").read_text(encoding="utf-8")
APP_JS = (ROOT / "frontend" / "app.js").read_text(encoding="utf-8")


class _Controls(HTMLParser):
    """Collects form controls and whether each has an accessible name from a
    wrapping <label>, a <label for>, aria-label or aria-labelledby."""

    def __init__(self) -> None:
        super().__init__()
        self.label_depth = 0
        self.label_for: set[str] = set()
        self.controls: list[tuple[str, dict[str, str | None], bool]] = []
        self.by_id: dict[str, dict[str, str | None]] = {}

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if a.get("id"):
            self.by_id[a["id"] or ""] = a | {"__tag": tag}
        if tag == "label":
            self.label_depth += 1
            if a.get("for"):
                self.label_for.add(a["for"] or "")
        elif tag in ("input", "textarea", "select"):
            if tag == "input" and (a.get("type") in ("hidden", "submit", "button") or "hidden" in a):
                return  # not user-facing, or named by its value
            self.controls.append((tag, a, self.label_depth > 0))

    def handle_endtag(self, tag):
        if tag == "label":
            self.label_depth -= 1


def _parse() -> _Controls:
    parser = _Controls()
    parser.feed(INDEX)
    return parser


class FrontendAccessibilityTest(unittest.TestCase):
    def test_every_form_control_has_an_accessible_name(self):
        parser = _parse()
        self.assertTrue(parser.controls)
        unnamed = [
            a.get("id") or tag
            for tag, a, wrapped in parser.controls
            if not (wrapped or a.get("aria-label") or a.get("aria-labelledby") or a.get("id") in parser.label_for)
        ]
        # A placeholder disappears once typing starts and is not a reliable name.
        self.assertEqual(unnamed, [], "form controls named only by a placeholder (or not at all)")

    def test_chat_has_a_polite_live_region(self):
        announcer = _parse().by_id.get("chat-announcer")
        self.assertIsNotNone(announcer, "no #chat-announcer live region in index.html")
        assert announcer is not None
        self.assertEqual(announcer.get("role"), "status")
        self.assertEqual(announcer.get("aria-live"), "polite")
        self.assertIn("sr-only", (announcer.get("class") or "").split())
        css = (ROOT / "frontend" / "styles.css").read_text(encoding="utf-8")
        self.assertRegex(css, r"\.sr-only\s*\{")

    def test_chat_stream_events_are_announced(self):
        self.assertIn('getElementById("chat-announcer")', APP_JS)
        stream = APP_JS[APP_JS.index('fetch("/chat/stream"'):]
        stream = stream[: stream.index("\n}\n")]
        for event in ("status", "done"):
            with self.subTest(event=event):
                block = re.search(rf'evt\.type === "{event}"[^}}]*\}}', stream, flags=re.S)
                self.assertIsNotNone(block)
                assert block is not None
                self.assertIn("announceChat(", block.group(0))
        self.assertRegex(stream, r"announceChat\([^)]*answer")


if __name__ == "__main__":
    unittest.main()
