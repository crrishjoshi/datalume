"""Iteration 9: the README's run instructions and configuration table stay in
step with the code, so a new user can actually start the app."""

import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
README = (ROOT / "README.md").read_text(encoding="utf-8")


def _bash_blocks() -> list[str]:
    return re.findall(r"```bash\n(.*?)```", README, flags=re.S)


class ReadmeTest(unittest.TestCase):
    def test_every_datalume_env_var_is_documented(self):
        used = set()
        for path in (ROOT / "backend").rglob("*.py"):
            used |= set(re.findall(r"\bDATALUME_[A-Z_]+\b", path.read_text(encoding="utf-8")))
        self.assertTrue(used)
        missing = sorted(name for name in used if f"`{name}`" not in README)
        self.assertEqual(missing, [], "env vars read by the backend but not documented in README.md")

    def test_run_steps_work_from_the_project_root(self):
        steps = "\n".join(_bash_blocks())
        # uvicorn imports `backend.main`, which only resolves from the root.
        self.assertNotRegex(steps, r"(?m)^\s*cd backend\b")
        self.assertIn("uvicorn backend.main:app", steps)
        for requirement in re.findall(r"pip install -r (\S+)", steps):
            with self.subTest(requirement=requirement):
                self.assertTrue((ROOT / requirement).is_file(), f"{requirement} does not exist")
        self.assertTrue((ROOT / "backend" / "main.py").is_file())

    def test_documented_sample_file_exists(self):
        for path in re.findall(r"`(sample_data/[^`]+)`", README):
            with self.subTest(path=path):
                self.assertTrue((ROOT / path).is_file())


if __name__ == "__main__":
    unittest.main()
