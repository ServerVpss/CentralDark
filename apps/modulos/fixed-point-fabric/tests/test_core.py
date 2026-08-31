from __future__ import annotations

import os
import tempfile
import unittest
from pathlib import Path

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


if __name__ == "__main__":
    unittest.main()

