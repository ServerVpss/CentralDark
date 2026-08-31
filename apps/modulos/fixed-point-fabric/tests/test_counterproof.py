from __future__ import annotations

import tempfile
import unittest
from pathlib import Path

from centraldark_fixed_point.engine import FixedPointEngine
from centraldark_fixed_point.models import Evidence, ProbeReceipt, Status
from centraldark_fixed_point.policy import FixedPointPolicy
from centraldark_fixed_point.store import EventStore


class SequenceProbe:
    def __init__(self, domain, statuses):
        self.domain = domain
        self.statuses = iter(statuses)
        self.last = statuses[-1]

    def run(self):
        try:
            self.last = next(self.statuses)
        except StopIteration:
            pass
        return ProbeReceipt(self.domain, self.last, self.domain, (Evidence(self.domain, "status", self.last.value),))


class CounterproofTests(unittest.TestCase):
    def test_service_dies_between_samples(self):
        with tempfile.TemporaryDirectory() as directory:
            store = EventStore(Path(directory) / "x.db")
            engine = FixedPointEngine(
                [SequenceProbe("local", [Status.PASS, Status.FAIL, Status.FAIL]), SequenceProbe("vps", [Status.PASS] * 3), SequenceProbe("github", [Status.PASS] * 3), SequenceProbe("screenpipe", [Status.PASS] * 3)],
                store,
                FixedPointPolicy(required_stable_samples=2),
                sample_interval_seconds=0,
                max_rounds=3,
            )
            _, result = engine.run_until_fixed_point()
            self.assertFalse(result.reached)
            self.assertIn("local:FAIL", result.blockers)
            store.close()


if __name__ == "__main__":
    unittest.main()
