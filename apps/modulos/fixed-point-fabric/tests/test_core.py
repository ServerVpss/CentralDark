from __future__ import annotations

# #OBSERVACOES#
# @owner: apps/modulos/fixed-point-fabric/tests/test_core.py
# @doc_ref: docs/CONSCIENCIA/RECEIPTS/2026-11-03-branches-891-funil-hud.md
# @last_updated: 2026-11-03T18:21:11.636Z
# @implementado: contraprovas config, HMAC, symlink, redacao, probe e ledger.
# @pendente: CI e revisão source SAME_HEAD; runtime fora do escopo.
# @estado: SOURCE_CORRECTED; STATIC_GATES=PENDING; RUNTIME=NOT_TESTED_BY_SCOPE
# @next_cursor: confrontar gates e review debts de #1381 no PR #1977.

import os
import json
import zipfile
from unittest.mock import patch
import tempfile
import unittest
from pathlib import Path

from centraldark_fixed_point.codec import compact_project
from centraldark_fixed_point.config import load_config
from centraldark_fixed_point.probes.vps import VPSProbe
from centraldark_fixed_point.engine import FixedPointEngine
from centraldark_fixed_point.models import Evidence, ProbeReceipt, Status
from centraldark_fixed_point.policy import FixedPointPolicy
from centraldark_fixed_point.redaction import redact
from centraldark_fixed_point.store import EventStore


class StaticProbe:
    def __init__(self, domain, status=Status.PASS, blockers=()):
        self.domain = domain
        self.status = status
        self.blockers = blockers

    def run(self):
        return ProbeReceipt(self.domain, self.status, self.domain, (Evidence(self.domain, "alive", True),), self.blockers)


def probes(screenpipe_status=Status.PASS):
    return [StaticProbe("local"), StaticProbe("vps"), StaticProbe("github"), StaticProbe("screenpipe", screenpipe_status)]


class FixedPointTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.store = EventStore(Path(self.temp.name) / "state.db")

    def tearDown(self):
        self.store.close()
        self.temp.cleanup()

    def engine(self, ps):
        return FixedPointEngine(ps, self.store, FixedPointPolicy(required_stable_samples=2), sample_interval_seconds=0, max_rounds=3)

    def test_two_stable_samples_reach_fixed_point(self):
        _, result = self.engine(probes()).run_until_fixed_point()
        self.assertTrue(result.reached)
        self.assertEqual(result.stable_samples, 2)

    def test_screenpipe_blocked_prevents_false_green(self):
        _, result = self.engine(probes(Status.BLOCKED)).run_until_fixed_point()
        self.assertFalse(result.reached)
        self.assertIn("screenpipe:BLOCKED", result.blockers)

    def test_unknown_never_becomes_pass(self):
        _, result = self.engine([StaticProbe("local"), StaticProbe("vps", Status.UNKNOWN), StaticProbe("github"), StaticProbe("screenpipe")]).run_until_fixed_point()
        self.assertFalse(result.reached)

    def test_hash_chain_detects_tamper(self):
        self.store.append("A", {"ok": True})
        self.store.append("B", {"ok": True})
        self.assertEqual(self.store.verify_chain(), (True, 2))
        self.store.db.execute("UPDATE events SET payload='{}' WHERE sequence=1")
        self.store.db.commit()
        self.assertEqual(self.store.verify_chain(), (False, 0))

    def test_writer_lease_blocks_second_writer(self):
        self.store.set_state("lease:fixed-point-writer", {"pid": os.getpid() + 1000, "expires_at": 9999999999})
        with self.assertRaises(RuntimeError):
            with self.store.writer_lease():
                pass

    def test_secrets_are_redacted(self):
        value = redact({"token": "abc", "message": "Authorization: Bearer supersecret"})
        self.assertEqual(value["token"], "[REDACTED]")
        self.assertNotIn("supersecret", value["message"])

    def test_fixed_point_locks_last_good_and_exposes_rollback_target(self):
        _, result = self.engine(probes()).run_until_fixed_point()
        baseline = self.store.get_last_good_state()
        self.assertTrue(result.reached)
        self.assertIsNotNone(baseline)
        self.assertEqual(self.store.get_state("rollback_target"), baseline)
        with self.assertRaises(RuntimeError):
            self.store.set_state("last_good_state", {"signature": "tampered"})

    def test_failed_candidate_preserves_baseline_and_records_rollback(self):
        self.engine(probes()).run_until_fixed_point()
        baseline = self.store.get_last_good_state()
        _, result = self.engine(probes(Status.FAIL)).run_until_fixed_point()
        self.assertFalse(result.reached)
        self.assertEqual(self.store.get_last_good_state(), baseline)
        self.assertEqual(self.store.get_state("rollback_target"), baseline)
        self.assertTrue(any(event["kind"] == "ROLLBACK_REQUIRED" for event in self.store.list_events()))

    def test_baseline_guard_rejects_material_regression(self):
        snapshot, result = self.engine(probes()).run_until_fixed_point()
        baseline = self.store.get_last_good_state()
        candidate = snapshot.__class__(
            snapshot_id="candidate",
            round_number=1,
            created_at=snapshot.created_at,
            receipts=tuple(probe.run() for probe in probes(Status.FAIL)),
            signature="candidate-signature",
            material_delta=True,
            delta={},
        )
        self.assertTrue(result.reached)
        self.assertEqual(
            self.engine([]).policy.regressions_against(baseline, candidate),
            ["screenpipe:FAIL"],
        )


    def test_config_rejects_one_sample_fixed_point(self):
        path = Path(self.temp.name) / "invalid.json"
        path.write_text(json.dumps({"policy": {"required_stable_samples": 1}}), encoding="utf-8")
        with self.assertRaisesRegex(ValueError, "required_stable_samples"):
            load_config(path)

    def test_vps_without_hmac_secret_is_blocked_before_network(self):
        with patch("centraldark_fixed_point.probes.vps.fetch_json", side_effect=AssertionError("network must not run")):
            receipt = VPSProbe({"heartbeat_url": "https://example.invalid/health"}).run()
        self.assertEqual(receipt.status, Status.BLOCKED)
        self.assertIn("HMAC_SECRET_MISSING", receipt.blockers)

    def test_evidence_redacted_before_persist(self):
        class SecretProbe:
            domain = "local"
            def run(self):
                return ProbeReceipt("local", Status.PASS, "ok", (Evidence("local", "secret", {"credential": "TOPSECRET"}),))
        snapshot, _ = self.engine([SecretProbe(), StaticProbe("vps"), StaticProbe("github"), StaticProbe("screenpipe")]).run_once()
        self.assertEqual(snapshot.receipts[0].evidence[0].value["credential"], "[REDACTED]")
        self.assertNotIn("TOPSECRET", json.dumps(self.store.list_events()))

    def test_probe_exception_blocks_final_verdict(self):
        class BrokenProbe:
            domain = "vps"
            def run(self):
                raise RuntimeError("boom")
        _, result = self.engine([StaticProbe("local"), BrokenProbe(), StaticProbe("github"), StaticProbe("screenpipe")]).run_until_fixed_point()
        self.assertFalse(result.reached)
        self.assertIn("vps:BLOCKED", result.blockers)

    def test_tampered_ledger_never_reaches_fixed_point(self):
        self.store.append("A", {"ok": True})
        self.store.db.execute("UPDATE events SET payload='{}' WHERE sequence=1")
        self.store.db.commit()
        with self.assertRaisesRegex(RuntimeError, "EVENT_CHAIN_INVALID"):
            self.engine(probes()).run_until_fixed_point()

    def test_project_pack_does_not_follow_outside_symlink(self):
        source = Path(self.temp.name) / "source"
        source.mkdir()
        (source / "safe.txt").write_text("inside", encoding="utf-8")
        outside = Path(self.temp.name) / "secret.txt"
        outside.write_text("private", encoding="utf-8")
        try:
            (source / "linked.txt").symlink_to(outside)
        except (OSError, NotImplementedError):
            self.skipTest("symlinks unavailable")
        destination = Path(self.temp.name) / "snapshot.zip"
        manifest = compact_project(source, destination)
        self.assertEqual([item["path"] for item in manifest["files"]], ["safe.txt"])
        with zipfile.ZipFile(destination) as archive:
            self.assertNotIn("linked.txt", archive.namelist())


if __name__ == "__main__":
    unittest.main()
