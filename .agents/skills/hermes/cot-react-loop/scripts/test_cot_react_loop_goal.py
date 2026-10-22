#!/usr/bin/env python3
"""Focused regression checks for the existing Hermes CoT-ReAct mission loop."""
import contextlib
import hashlib
import io
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

from cot_react_loop import CotReactExecutor


class GoalLoopTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.one = self.root / "one.txt"
        self.two = self.root / "two.txt"
        self.one.write_text("um", encoding="utf-8")
        self.two.write_text("dois", encoding="utf-8")

    def run_goal(self, clauses, steps, limit=5):
        executor = CotReactExecutor(max_iter=limit, output_dir=str(self.root))
        with contextlib.redirect_stdout(io.StringIO()):
            records = executor.run_loop(
                {"success_predicate": "all required verifier observations", "goal_clauses": clauses},
                steps,
            )
        return executor, records

    def proof(self, file, clause):
        return {
            "tool": "sha256",
            "args": {"path": str(file)},
            "verification_only": True,
            "verifies": clause,
        }

    def clause(self, file, clause):
        digest = hashlib.sha256(file.read_bytes()).hexdigest()
        return {"id": clause, "expected_stdout_contains": digest}

    def test_one_green_step_does_not_end_incomplete_goal(self):
        clauses = [self.clause(self.one, "G01"), self.clause(self.two, "G02")]
        executor, records = self.run_goal(
            clauses, [self.proof(self.one, "G01"), self.proof(self.two, "G02")]
        )
        self.assertEqual(len(records), 2)
        self.assertEqual([r.decide for r in records], ["CONTINUE", "STOP"])
        self.assertEqual(executor.goal_status, "FIXED_POINT_CANDIDATE")
        self.assertEqual(executor.pending_clauses, [])

    def test_missing_verifier_does_not_pass(self):
        clause = [self.clause(self.one, "G01")]
        unverified = {"tool": "sha256", "args": {"path": str(self.one)}, "verifies": "G01"}
        executor, records = self.run_goal(clause, [unverified])
        self.assertEqual(records[-1].decide, "BLOCK")
        self.assertEqual(executor.goal_status, "BLOCKED_INCOMPLETE")
        self.assertEqual(executor.pending_clauses, ["G01"])

    def test_wrong_marker_fails_closed(self):
        clause = [{"id": "G01", "expected_stdout_contains": "incorrect-digest"}]
        executor, records = self.run_goal(clause, [self.proof(self.one, "G01")])
        self.assertEqual(records[-1].decide, "BLOCK")
        self.assertEqual(executor.pending_clauses, ["G01"])

    def test_budget_exhaustion_does_not_forge_fixed_point(self):
        clauses = [self.clause(self.one, "G01"), self.clause(self.two, "G02")]
        executor, records = self.run_goal(
            clauses, [self.proof(self.one, "G01"), self.proof(self.two, "G02")], limit=1,
        )
        self.assertEqual(len(records), 1)
        self.assertEqual(records[-1].decide, "BLOCK")
        self.assertEqual(executor.pending_clauses, ["G02"])

    def test_invalidation_requires_new_proof(self):
        clauses = [self.clause(self.one, "G01"), self.clause(self.two, "G02")]
        steps = [
            self.proof(self.one, "G01"),
            {**self.proof(self.two, "G02"), "invalidates": ["G01"]},
        ]
        executor, records = self.run_goal(clauses, steps)
        self.assertEqual(records[-1].decide, "BLOCK")
        self.assertEqual(executor.pending_clauses, ["G01"])

    def test_legacy_behavior_preserved_without_clauses(self):
        executor, records = self.run_goal([], [
            self.proof(self.one, "G01"), self.proof(self.two, "G02")
        ])
        self.assertEqual(len(records), 1)
        self.assertEqual(records[-1].decide, "STOP")
        self.assertEqual(executor.goal_status, "LEGACY_SINGLE_STEP")

    def test_goal_receipt_excludes_raw_execution_text(self):
        secret = "NOT_FOR_JSONL_SENSITIVE_MARKER"
        executor, records = self.run_goal(
            [{"id": "G01", "expected_stdout_contains": "EXPECTED_OTHER_VALUE"}],
            [{"tool": "terminal", "args": {"command": "echo " + secret}}],
        )
        self.assertEqual(records[-1].decide, "BLOCK")
        raw = executor.log_file.read_text(encoding="utf-8")
        self.assertNotIn(secret, raw)
        self.assertNotIn("command", raw)
        self.assertNotIn("stdout\":", raw)
        self.assertIn("stdout_sha256", raw)
        self.assertIn("G01", raw)

    def test_cli_reads_brief_and_steps_from_json(self):
        brief_file = self.root / "goal.json"
        steps_file = self.root / "steps.json"
        output_dir = self.root / "cli-receipts"
        brief_file.write_text(json.dumps({
            "success_predicate": "two proofs",
            "goal_clauses": [self.clause(self.one, "G01"), self.clause(self.two, "G02")],
        }), encoding="utf-8")
        steps_file.write_text(json.dumps([
            self.proof(self.one, "G01"), self.proof(self.two, "G02")
        ]), encoding="utf-8")
        program = Path(__file__).with_name("cot_react_loop.py")
        child = subprocess.run([
            sys.executable, str(program), "--brief", str(brief_file),
            "--steps", str(steps_file), "--max-iter", "3",
            "--output-dir", str(output_dir),
        ], capture_output=True, text=True, timeout=15)
        self.assertEqual(child.returncode, 0, child.stderr)
        self.assertIn("Goal status: FIXED_POINT_CANDIDATE", child.stdout)
        self.assertIn("Total iterations: 2", child.stdout)
        receipts = list(output_dir.glob("*.jsonl"))
        self.assertEqual(len(receipts), 1)
        events = [json.loads(line) for line in receipts[0].read_text().splitlines()]
        self.assertEqual(len(events), 2)
        self.assertEqual(events[-1]["verified_clauses"], ["G01", "G02"])
        self.assertEqual(events[-1]["pending_clauses"], [])
        self.assertNotIn("act", events[-1])

    def test_cli_rejects_missing_steps(self):
        program = Path(__file__).with_name("cot_react_loop.py")
        child = subprocess.run(
            [sys.executable, str(program), "--brief", "not_a_file.json"],
            capture_output=True, text=True, timeout=12,
        )
        self.assertNotEqual(child.returncode, 0)
        self.assertIn("required together", child.stderr)

    def test_cli_rejects_unbounded_iterations(self):
        program = Path(__file__).with_name("cot_react_loop.py")
        child = subprocess.run(
            [sys.executable, str(program), "--max-iter", "99999"],
            capture_output=True, text=True, timeout=12,
        )
        self.assertNotEqual(child.returncode, 0)
        self.assertIn("1..50", child.stderr)

    def test_duplicate_clause_fails_before_execution(self):
        with self.assertRaisesRegex(ValueError, "GOAL_CLAUSE_MISSING_ID_OR_EXPECTATION"):
            self.run_goal([self.clause(self.one, "G01"), self.clause(self.two, "G01")], [])


if __name__ == "__main__":
    unittest.main()
