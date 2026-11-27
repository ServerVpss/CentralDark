from __future__ import annotations

# #OBSERVACOES#
# @owner: apps/modulos/fixed-point-fabric/tests/test_counterproof.py
# @doc_ref: docs/CONSCIENCIA/RECEIPTS/2026-11-03-branches-891-funil-hud.md
# @last_updated: 2026-11-03T18:44:11.351Z
# @implementado: fixtures de cenários fornecem SHA idêntico; regressão continua fail-closed.
# @pendente: CI e verificação unitária no mesmo HEAD; runtime não solicitado.
# @estado: SOURCE_PATCHED; CI=UNKNOWN; RUNTIME=NOT_TESTED_BY_SCOPE
# @next_cursor: obter PASS da suíte no PR e ler checks do mesmo SHA.

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
        head_claim = {"local": "head", "vps": "head_sha", "github": "main_head"}.get(self.domain)
        evidence = (Evidence(self.domain, "status", self.last.value),)
        if head_claim:
            evidence += (Evidence(self.domain, head_claim, "a" * 40),)
        return ProbeReceipt(self.domain, self.last, self.domain, evidence)


def probes_with_scenario(target_domain: str, statuses: list[Status], rounds: int = 3):
    domains = ("local", "vps", "github", "screenpipe")
    probes = []
    for domain in domains:
        sequence = statuses if domain == target_domain else [Status.PASS] * rounds
        probes.append(SequenceProbe(domain, sequence))
    return probes


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

    def test_scenario_matrix_blocks_every_non_pass_state(self):
        """Table-driven simulation harness: personas/scenarios are fixtures, never authority."""
        scenarios = (
            ("casa_regression", "local", Status.FAIL),
            ("vps_not_measured", "vps", Status.UNKNOWN),
            ("github_gate_blocked", "github", Status.BLOCKED),
            ("screenpipe_evidence_stale", "screenpipe", Status.STALE),
        )

        for scenario_name, domain, state in scenarios:
            with self.subTest(scenario=scenario_name), tempfile.TemporaryDirectory() as directory:
                store = EventStore(Path(directory) / "scenario.db")
                engine = FixedPointEngine(
                    probes_with_scenario(domain, [state] * 3),
                    store,
                    FixedPointPolicy(required_stable_samples=2),
                    sample_interval_seconds=0,
                    max_rounds=3,
                )
                _, result = engine.run_until_fixed_point()
                self.assertFalse(result.reached)
                self.assertIn(f"{domain}:{state.value}", result.blockers)
                store.close()

    def test_closed_loop_recovery_requires_two_stable_pass_samples(self):
        """A correction may recover, but promotion waits for stability after the deviation."""
        with tempfile.TemporaryDirectory() as directory:
            store = EventStore(Path(directory) / "closed-loop.db")
            engine = FixedPointEngine(
                probes_with_scenario("local", [Status.FAIL, Status.PASS, Status.PASS]),
                store,
                FixedPointPolicy(required_stable_samples=2),
                sample_interval_seconds=0,
                max_rounds=3,
            )
            _, result = engine.run_until_fixed_point()
            self.assertTrue(result.reached)
            self.assertEqual(result.stable_samples, 2)
            store.close()


if __name__ == "__main__":
    unittest.main()
