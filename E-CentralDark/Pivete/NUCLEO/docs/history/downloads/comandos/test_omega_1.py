from __future__ import annotations
import copy
import hashlib
import json
import os
import tempfile
import threading
import unittest
from pathlib import Path

from omega_generator import make_bundle
from omega_solver import solve, canonical_bytes, append_event, verify_ledger


class OmegaReconciliationTests(unittest.TestCase):
    def test_001_baseline(self):
        bundle, expected = make_bundle(1)
        out = solve(bundle)
        for key in ("schema", "services", "prs", "metrics", "actions", "paths"):
            self.assertEqual(out[key], expected[key])

    def test_002_200_seed_adversarial_reconciliation(self):
        for seed in range(200):
            bundle, expected = make_bundle(seed)
            out = solve(bundle)
            self.assertEqual(out["services"], expected["services"], seed)
            self.assertEqual(out["prs"], expected["prs"], seed)
            self.assertEqual(out["metrics"], expected["metrics"], seed)
            self.assertEqual(out["actions"], expected["actions"], seed)

    def test_003_deterministic_under_reordering(self):
        bundle, _ = make_bundle(9)
        a = canonical_bytes(solve(bundle))
        bundle["observations"] = list(reversed(bundle["observations"]))
        b = canonical_bytes(solve(bundle))
        self.assertEqual(a, b)

    def test_004_fixed_point(self):
        bundle, _ = make_bundle(7)
        first = solve(bundle)
        second = solve({"schema": "omega-canonical-replay-v1", "canonical": first})
        self.assertEqual(canonical_bytes(first), canonical_bytes(second))

    def test_005_no_secret_leak(self):
        bundle, _ = make_bundle(3)
        raw = canonical_bytes(solve(bundle)).decode("utf-8")
        forbidden = ("ghp_", "Bearer ", "postgres://", "super-secret", "senha@")
        self.assertFalse(any(x in raw for x in forbidden), raw)

    def test_006_denominators_preserved(self):
        bundle, _ = make_bundle(4)
        metrics = solve(bundle)["metrics"]
        self.assertEqual(
            [(m["numerator"], m["denominator"], m["universe"]) for m in metrics],
            [(6, 22, "subconjunto_higienizado"), (14, 34, "issues_restantes")]
        )

    def test_007_intentional_off_is_not_failure(self):
        bundle, _ = make_bundle(5)
        services = solve(bundle)["services"]
        for name in ("gateway-multizap", "install", "open-webui", "builder"):
            self.assertEqual(services[name], "EXPECTED_OFF")

    def test_008_authorization_scope(self):
        bundle, _ = make_bundle(6)
        actions = solve(bundle)["actions"]
        self.assertEqual(actions["allowed"], ["comment_issue"])
        self.assertEqual(actions["blocked"], ["deploy", "merge", "restart"])

    def test_009_windows_path_canonicalization(self):
        bundle, _ = make_bundle(8)
        self.assertEqual(
            solve(bundle)["paths"]["skill"],
            ".agents/skills/lupa-bayesiana/SKILL.md"
        )

    def test_010_correlated_duplicates_do_not_change_result(self):
        bundle, _ = make_bundle(11)
        base = canonical_bytes(solve(bundle))
        bundle["observations"] += copy.deepcopy(bundle["observations"]) * 3
        self.assertEqual(base, canonical_bytes(solve(bundle)))


class OmegaLedgerTests(unittest.TestCase):
    def event(self, usage_id="u1", phase="BEGIN", payload=None):
        return {
            "usage_id": usage_id,
            "phase": phase,
            "payload": payload or {"mission": "omega"},
        }

    def test_011_begin_idempotent(self):
        with tempfile.TemporaryDirectory() as td:
            p = Path(td) / "ledger.jsonl"
            a = append_event(p, self.event())
            b = append_event(p, self.event())
            self.assertEqual(a["record_hash"], b["record_hash"])
            self.assertEqual(len(p.read_text(encoding="utf-8").splitlines()), 1)

    def test_012_final_idempotent(self):
        with tempfile.TemporaryDirectory() as td:
            p = Path(td) / "ledger.jsonl"
            append_event(p, self.event())
            a = append_event(p, self.event(phase="FINAL", payload={"result": "PASS"}))
            b = append_event(p, self.event(phase="FINAL", payload={"result": "PASS"}))
            self.assertEqual(a["record_hash"], b["record_hash"])
            self.assertEqual(len(p.read_text(encoding="utf-8").splitlines()), 2)

    def test_013_divergent_final_conflict(self):
        with tempfile.TemporaryDirectory() as td:
            p = Path(td) / "ledger.jsonl"
            append_event(p, self.event())
            append_event(p, self.event(phase="FINAL", payload={"result": "PASS"}))
            with self.assertRaises(Exception):
                append_event(p, self.event(phase="FINAL", payload={"result": "FAIL"}))

    def test_014_hash_chain_valid(self):
        with tempfile.TemporaryDirectory() as td:
            p = Path(td) / "ledger.jsonl"
            append_event(p, self.event())
            append_event(p, self.event(phase="FINAL", payload={"result": "PASS"}))
            result = verify_ledger(p)
            self.assertTrue(result["valid"])
            self.assertEqual(result["records"], 2)

    def test_015_tamper_detection(self):
        with tempfile.TemporaryDirectory() as td:
            p = Path(td) / "ledger.jsonl"
            append_event(p, self.event())
            append_event(p, self.event(phase="FINAL", payload={"result": "PASS"}))
            text = p.read_text(encoding="utf-8").replace('"PASS"', '"FAIL"', 1)
            p.write_text(text, encoding="utf-8")
            self.assertFalse(verify_ledger(p)["valid"])

    def test_016_truncated_last_line_recovery(self):
        with tempfile.TemporaryDirectory() as td:
            p = Path(td) / "ledger.jsonl"
            append_event(p, self.event())
            append_event(p, self.event(phase="FINAL", payload={"result": "PASS"}))
            with p.open("a", encoding="utf-8") as f:
                f.write('{"usage_id":')
            result = verify_ledger(p)
            self.assertTrue(result["valid"])
            self.assertEqual(result["records"], 2)
            self.assertTrue(result["truncated_tail_ignored"])

    def test_017_middle_corruption_blocks(self):
        with tempfile.TemporaryDirectory() as td:
            p = Path(td) / "ledger.jsonl"
            append_event(p, self.event("u1"))
            append_event(p, self.event("u1", "FINAL", {"result": "PASS"}))
            append_event(p, self.event("u2"))
            lines = p.read_text(encoding="utf-8").splitlines()
            lines[1] = "{corrupt"
            p.write_text("\n".join(lines) + "\n", encoding="utf-8")
            self.assertFalse(verify_ledger(p)["valid"])

    def test_018_concurrent_begin_exactly_once(self):
        with tempfile.TemporaryDirectory() as td:
            p = Path(td) / "ledger.jsonl"
            errors = []
            def worker():
                try:
                    append_event(p, self.event("same"))
                except Exception as exc:
                    errors.append(exc)
            threads = [threading.Thread(target=worker) for _ in range(32)]
            for t in threads: t.start()
            for t in threads: t.join()
            self.assertEqual(errors, [])
            self.assertEqual(len(p.read_text(encoding="utf-8").splitlines()), 1)
            self.assertTrue(verify_ledger(p)["valid"])

    def test_019_concurrent_independent_events(self):
        with tempfile.TemporaryDirectory() as td:
            p = Path(td) / "ledger.jsonl"
            errors = []
            def worker(i):
                try:
                    append_event(p, self.event(f"u{i}"))
                except Exception as exc:
                    errors.append(exc)
            threads = [threading.Thread(target=worker, args=(i,)) for i in range(50)]
            for t in threads: t.start()
            for t in threads: t.join()
            self.assertEqual(errors, [])
            result = verify_ledger(p)
            self.assertTrue(result["valid"])
            self.assertEqual(result["records"], 50)

    def test_020_record_hash_recomputation(self):
        with tempfile.TemporaryDirectory() as td:
            p = Path(td) / "ledger.jsonl"
            record = append_event(p, self.event())
            without = dict(record)
            stored = without.pop("record_hash")
            raw = json.dumps(without, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode()
            self.assertEqual(stored, hashlib.sha256(raw).hexdigest())


class OmegaSafetyTests(unittest.TestCase):
    def test_021_input_not_mutated(self):
        bundle, _ = make_bundle(12)
        before = copy.deepcopy(bundle)
        solve(bundle)
        self.assertEqual(bundle, before)

    def test_022_canonical_bytes_are_stable(self):
        value = {"b": [3, 2, 1], "a": {"z": 1, "x": 2}}
        self.assertEqual(canonical_bytes(value), canonical_bytes(copy.deepcopy(value)))
        self.assertTrue(canonical_bytes(value).startswith(b'{"a":'))

    def test_023_no_unknown_action_becomes_allowed(self):
        bundle, _ = make_bundle(13)
        bundle["requested_actions"].append("delete_database")
        result = solve(bundle)["actions"]
        self.assertNotIn("delete_database", result["allowed"])

    def test_024_stale_agent_cannot_override_git(self):
        bundle, _ = make_bundle(14)
        self.assertEqual(solve(bundle)["prs"]["309"]["state"], "MERGED")

    def test_025_output_contains_evidence_summary(self):
        bundle, _ = make_bundle(15)
        out = solve(bundle)
        self.assertIn("evidence", out)
        self.assertGreaterEqual(out["evidence"]["unique_correlations"], 1)
        self.assertGreaterEqual(out["evidence"]["redactions"], 1)


if __name__ == "__main__":
    unittest.main()
