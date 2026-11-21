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

    def test_receipt_roles_and_rendered_commit_pr_trailers(self):
        base = ("run", "--mission", "attr", "--step", "checked", "--next", "review", "--expect", "OK")
        roles = ("--authorized-by", "CHEFE (declarado)", "--responsible", "SOL",
                 "--executor", "SOL via GitHub", "--technical-owner", "scripts/hermes/verified-checkpoint.py",
                 "--source-commit", "65bac5b53161bd2e2cf2a1813da7152fa6752e4e", "--pr-ref", "#1994")
        good = self.run_cli(*base, *roles, "--", sys.executable, "-c", "print('OK')")
        self.assertEqual(good.returncode, 0, good.stderr)
        state = json.loads(self.run_cli("status", "--mission", "attr").stdout)
        self.assertTrue(state["attribution_complete"])
        self.assertEqual(state["attribution"]["executor"], "SOL via GitHub")
        detail = json.loads(self.run_cli("resume", "--mission", "attr", "--format", "json").stdout)
        self.assertEqual(detail["attribution"]["mission_owner"], "SOL")
        self.assertIn("RESPONSAVEL_MISSAO=SOL", self.run_cli("resume", "--mission", "attr").stdout)
        commit = self.run_cli("render", "--mission", "attr", "--format", "commit")
        self.assertEqual(commit.returncode, 0, commit.stderr)
        self.assertIn("CentralDark-Executor: SOL via GitHub", commit.stdout)
        self.assertIn("CentralDark-PR: #1994", commit.stdout)
        self.assertIn("CentralDark-Receipt-SHA256: " + detail["sha256"], commit.stdout)
        self.assertIn("DECLARED_COMPLETE_NOT_AUTHENTICATED", commit.stdout)
        pr = self.run_cli("render", "--mission", "attr", "--format", "pr")
        self.assertEqual(pr.returncode, 0, pr.stderr)
        self.assertIn("Identidade e prova do checkpoint", pr.stdout)
        self.assertIn("SOL via GitHub", pr.stdout)
        self.assertIn("DECLARED_COMPLETE_NOT_AUTHENTICATED", pr.stdout)
        repeated = self.run_cli(*base, *roles, "--", sys.executable, "-c", "print('OK')")
        self.assertEqual(repeated.returncode, 0)
        self.assertIn("REUSED_VERIFIED", repeated.stdout)
        self.assertEqual(json.loads(self.run_cli("status", "--mission", "attr").stdout)["events"], 1)

        legacy = self.run_cli("run", "--mission", "legacy", "--step", "old",
                              "--next", "new", "--expect", "OK",
                              "--", sys.executable, "-c", "print('OK')")
        self.assertEqual(legacy.returncode, 0, legacy.stderr)
        default_state = json.loads(self.run_cli("status", "--mission", "legacy").stdout)
        self.assertFalse(default_state["attribution_complete"])
        self.assertEqual(default_state["attribution"]["mission_owner"], "UNKNOWN")
        self.assertIn("CentralDark-Executor: UNKNOWN",
                      self.run_cli("render", "--mission", "legacy", "--format", "commit").stdout)

    def test_invalid_identity_and_plan_inheritance(self):
        invalid = self.run_cli("run", "--mission", "invalid", "--step", "bad",
                               "--next", "next", "--expect", "OK",
                               "--responsible", "SOL\nInjected: YES",
                               "--", sys.executable, "-c", "print('OK')")
        self.assertEqual(invalid.returncode, 2)
        self.assertIn("ATTRIBUTION_CONTROL_CHARACTER", invalid.stderr)
        plan = {"schema": "centraldark.hermes.execution-plan.v1", "mission": "planattr",
                "attribution": {"authorized_by": "CHEFE", "mission_owner": "SOL",
                                "executor": "Hermes", "technical_owner": "owner existente"},
                "steps": [{"id": "one", "argv": [sys.executable, "-c", "print('OK')"],
                           "expect": "OK", "attribution": {"executor": "SOL"}}]}
        p = self.root / "attribution-plan.json"
        p.write_text(json.dumps(plan))
        good = self.run_cli("plan", "--mission", "planattr", "--file", str(p))
        self.assertEqual(good.returncode, 0, good.stdout + good.stderr)
        state = json.loads(self.run_cli("status", "--mission", "planattr").stdout)
        self.assertEqual(state["attribution"]["executor"], "SOL")
        self.assertTrue(state["attribution_complete"])

    def test_historical_receipt_without_attribution_preserves_hash_chain(self):
        import hashlib
        old = {"schema": "centraldark.hermes.verified-execution.v1",
               "prev_sha256": "0" * 64, "outcome": "VERIFIED",
               "mission": "historic", "step": "before-attribution",
               "next_cursor": "continue", "at": "2026-11-20T00:00:00+00:00"}
        digest = hashlib.sha256(json.dumps(old, ensure_ascii=False,
                                           sort_keys=True, separators=(",", ":")).encode("utf-8")).hexdigest()
        old["sha256"] = digest
        folder = self.root / "state" / "historic"
        folder.mkdir(parents=True)
        (folder / "events.jsonl").write_text(json.dumps(old, ensure_ascii=False) + "\n")
        verify = self.run_cli("verify", "--mission", "historic")
        self.assertEqual(verify.returncode, 0, verify.stderr)
        self.assertEqual(json.loads(verify.stdout)["status"], "HASH_CHAIN_PASS")
        state = json.loads(self.run_cli("status", "--mission", "historic").stdout)
        self.assertFalse(state["attribution_complete"])
        self.assertEqual(state["attribution"]["executor"], "UNKNOWN")
        self.assertIn("CentralDark-Executor: UNKNOWN",
                      self.run_cli("render", "--mission", "historic", "--format", "commit").stdout)

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
