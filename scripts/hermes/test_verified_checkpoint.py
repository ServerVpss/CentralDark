#!/usr/bin/env python3
"""Regression tests for CentralDark/Hermes verified checkpoints."""
import json
import os
from pathlib import Path
import shlex
import subprocess
import sys
import tempfile
import unittest

SCRIPT = Path(__file__).with_name("verified-checkpoint.py")

class MissionProofTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory(prefix="centraldark-hermes-test-")
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)
        self.env = dict(os.environ, CENTRALDARK_HERMES_CHECKPOINTS=str(self.root / "state"))

    def run_cli(self, *args):
        return subprocess.run([sys.executable, str(SCRIPT), *args],
                              cwd=self.root, env=self.env, text=True,
                              capture_output=True, timeout=30)

    def test_no_proof_and_failed_proof_never_advance(self):
        x = self.run_cli("run", "--mission", "a", "--step", "unverified",
                         "--next", "x", "--", sys.executable, "-c", "print('OI')")
        self.assertEqual(x.returncode, 2)
        x = self.run_cli("run", "--mission", "a", "--step", "oi", "--next", "next",
                         "--expect", "OI", "--", sys.executable, "-c", "print('OI')")
        self.assertEqual(x.returncode, 0, x.stdout + x.stderr)
        x = self.run_cli("run", "--mission", "a", "--step", "wrong", "--next", "no",
                         "--expect", "CORRETO", "--", sys.executable, "-c", "print('ERRADO')")
        self.assertEqual(x.returncode, 1)
        status = json.loads(self.run_cli("status", "--mission", "a").stdout)
        self.assertEqual(status["next_cursor"], "next")
        self.assertEqual(status["verified"], 1)
        self.assertEqual(status["last_failure"], "wrong")
        self.assertIn("NEXT_CURSOR=next", self.run_cli("resume", "--mission", "a").stdout)

    def test_plan_restart_avoids_replaying_green(self):
        count = self.root / "counter"
        flag = self.root / "ready"
        script = f"from pathlib import Path; p=Path({str(count)!r}); p.write_text((p.read_text() if p.exists() else '')+'1'); print('PASS_1')"
        gate = f"from pathlib import Path; import sys; ok=Path({str(flag)!r}).exists(); print('PASS_2' if ok else 'WAIT'); sys.exit(0 if ok else 17)"
        doc = {"schema": "centraldark.hermes.execution-plan.v1", "mission": "b",
               "intent": "persistir continuidade",
               "steps": [{"id": "one", "argv": [sys.executable, "-c", script], "expect": "PASS_1"},
                         {"id": "two", "argv": [sys.executable, "-c", gate], "expect": "PASS_2"},
                         {"id": "three", "argv": [sys.executable, "-c", "print('PASS_3')"],
                          "expect": "PASS_3", "next_cursor": "FINISHED"}]}
        plan = self.root / "plan.json"
        plan.write_text(json.dumps(doc))
        self.assertEqual(self.run_cli("plan", "--mission", "b", "--file", str(plan)).returncode, 1)
        self.assertEqual(count.read_text(), "1")
        self.assertEqual(json.loads(self.run_cli("status", "--mission", "b").stdout)["next_cursor"], "two")
        flag.write_text("ready")
        good = self.run_cli("plan", "--mission", "b", "--file", str(plan))
        self.assertEqual(good.returncode, 0, good.stdout + good.stderr)
        self.assertEqual(self.run_cli("plan", "--mission", "b", "--file", str(plan)).returncode, 0)
        self.assertEqual(count.read_text(), "1")
        state = json.loads(self.run_cli("status", "--mission", "b").stdout)
        self.assertEqual((state["verified"], state["events"], state["next_cursor"]), (3, 4, "FINISHED"))
        self.assertEqual(json.loads(self.run_cli("verify", "--mission", "b").stdout)["status"], "HASH_CHAIN_PASS")

    def test_independent_verifier_and_tamper_detection(self):
        result = self.root / "evidence"
        action = f"from pathlib import Path; Path({str(result)!r}).write_text('OK')"
        check = f"from pathlib import Path; assert Path({str(result)!r}).read_text() == 'OK'"
        r = self.run_cli("run", "--mission", "c", "--step", "prove", "--next", "continue",
                         "--verify-command", shlex.join([sys.executable, "-c", check]),
                         "--", sys.executable, "-c", action)
        self.assertEqual(r.returncode, 0, r.stdout + r.stderr)
        journal = self.root / "state/c/events.jsonl"
        journal.write_text(journal.read_text().replace('"outcome":"VERIFIED"', '"outcome":"FAILED"'))
        broken = self.run_cli("verify", "--mission", "c")
        self.assertEqual(broken.returncode, 3)
        self.assertIn("JOURNAL_HASH_CHAIN_INVALID", broken.stderr)

if __name__ == "__main__":
    unittest.main(verbosity=2)
