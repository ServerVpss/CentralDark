from __future__ import annotations

import hashlib
import json
import time
import uuid
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Callable, Iterable

from .models import FixedPointReceipt, ProbeReceipt, Snapshot
from .policy import FixedPointPolicy
from .redaction import redact
from .store import EventStore, canonical_json


def _signature(receipts: Iterable[ProbeReceipt]) -> str:
    operational = []
    for receipt in sorted(receipts, key=lambda r: r.domain):
        operational.append({
            "domain": receipt.domain,
            "status": receipt.status.value,
            "blockers": sorted(receipt.blockers),
            "evidence": [
                {"source": item.source, "claim": item.claim, "value": redact(item.value)}
                for item in receipt.evidence
            ],
        })
    return hashlib.sha256(canonical_json(operational).encode()).hexdigest()


def _material_delta(previous: Snapshot | None, receipts: tuple[ProbeReceipt, ...]) -> tuple[bool, dict]:
    current = {r.domain: {"status": r.status.value, "blockers": sorted(r.blockers)} for r in receipts}
    if previous is None:
        return True, {"from": None, "to": current}
    before = {r.domain: {"status": r.status.value, "blockers": sorted(r.blockers)} for r in previous.receipts}
    return before != current, {"from": before, "to": current} if before != current else {}


@dataclass
class FixedPointEngine:
    probes: list
    store: EventStore
    policy: FixedPointPolicy
    sample_interval_seconds: float = 10.0
    max_rounds: int = 12
    snapshot_factory: Callable[[], str] = lambda: uuid.uuid4().hex

    def collect(self, round_number: int, previous: Snapshot | None) -> Snapshot:
        receipts = tuple(probe.run() for probe in self.probes)
        signature = _signature(receipts)
        material, delta = _material_delta(previous, receipts)
        snapshot = Snapshot(
            snapshot_id=self.snapshot_factory(),
            round_number=round_number,
            created_at=datetime.now(timezone.utc).isoformat(),
            receipts=receipts,
            signature=signature,
            material_delta=material,
            delta=delta,
        )
        self.store.save_snapshot(snapshot.to_dict())
        self.store.append("SNAPSHOT", snapshot.to_dict())
        return snapshot

    def run_once(self) -> tuple[Snapshot, FixedPointReceipt]:
        with self.store.writer_lease():
            snapshot = self.collect(1, None)
            decision = self.policy.decide(snapshot, None, 1)
            self.store.append("VERDICT", decision.to_dict())
            self.store.set_state("last_verdict", decision.to_dict())
            self._finalize_baseline(snapshot, decision)
            return snapshot, decision

    def run_until_fixed_point(self) -> tuple[Snapshot, FixedPointReceipt]:
        previous: Snapshot | None = None
        stable_samples = 0
        last_decision: FixedPointReceipt | None = None
        with self.store.writer_lease(ttl_seconds=max(120, int(self.max_rounds * self.sample_interval_seconds + 30))):
            for round_number in range(1, self.max_rounds + 1):
                snapshot = self.collect(round_number, previous)
                stable_samples = stable_samples + 1 if previous and previous.signature == snapshot.signature else 1
                last_decision = self.policy.decide(snapshot, previous, stable_samples)
                self.store.append("VERDICT", last_decision.to_dict())
                self.store.set_state("last_verdict", last_decision.to_dict())
                if last_decision.reached:
                    self._finalize_baseline(snapshot, last_decision)
                    return snapshot, last_decision
                previous = snapshot
                if round_number < self.max_rounds:
                    time.sleep(self.sample_interval_seconds)
            assert previous is not None and last_decision is not None
            self._finalize_baseline(previous, last_decision)
            return previous, last_decision

    def _finalize_baseline(self, snapshot: Snapshot, decision: FixedPointReceipt) -> None:
        baseline = self.store.get_last_good_state()
        if not decision.reached:
            if baseline:
                self.store.record_rollback_required(
                    ";".join(decision.blockers) or decision.verdict,
                    target=baseline,
                )
            return
        regressions = tuple(self.policy.regressions_against(baseline, snapshot)) if baseline else ()
        if regressions:
            self.store.record_rollback_required(";".join(regressions), target=baseline)
            return
        self.store.promote_last_good_state(snapshot, decision, regressions=regressions)


def receipt_json(snapshot: Snapshot, decision: FixedPointReceipt) -> str:
    return json.dumps({"snapshot": snapshot.to_dict(), "fixed_point": decision.to_dict()}, ensure_ascii=False, indent=2)
