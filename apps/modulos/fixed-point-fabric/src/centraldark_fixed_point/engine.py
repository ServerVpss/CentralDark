from __future__ import annotations

# #OBSERVACOES#
# @owner: apps/modulos/fixed-point-fabric/src/centraldark_fixed_point/engine.py
# @doc_ref: docs/CONSCIENCIA/RECEIPTS/2026-11-03-branches-891-funil-hud.md
# @last_updated: 2026-11-03T18:21:11.636Z
# @implementado: excecoes de probes viram BLOCKED; evidencias redigidas; hash chain validado.
# @pendente: gates static source pendentes; sem runtime.
# @estado: SOURCE_PATCHED; CI=UNKNOWN; RUNTIME=NOT_TESTED_BY_SCOPE
# @next_cursor: verificar reviews P1 #1381 no SHA.

import hashlib
import json
import time
import uuid
from dataclasses import dataclass, replace
from datetime import datetime, timezone
from typing import Callable, Iterable

from .models import FixedPointReceipt, ProbeReceipt, Snapshot, Status
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
    current = {
        receipt.domain: {"status": receipt.status.value, "blockers": sorted(receipt.blockers)}
        for receipt in receipts
    }
    if previous is None:
        return True, {"from": None, "to": current}
    before = {
        receipt.domain: {"status": receipt.status.value, "blockers": sorted(receipt.blockers)}
        for receipt in previous.receipts
    }
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
        receipts_list: list[ProbeReceipt] = []
        for probe in self.probes:
            try:
                receipt = probe.run()
            except Exception as error:
                receipt = ProbeReceipt(
                    domain=str(getattr(probe, "domain", "unknown")),
                    status=Status.BLOCKED,
                    summary="Probe failed closed",
                    evidence=(),
                    blockers=(f"PROBE_EXCEPTION:{type(error).__name__}",),
                )
            receipts_list.append(replace(
                receipt,
                summary=redact(receipt.summary),
                blockers=tuple(redact(item) for item in receipt.blockers),
                evidence=tuple(replace(item, value=redact(item.value)) for item in receipt.evidence),
            ))
        receipts = tuple(receipts_list)
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

    def _require_valid_ledger(self) -> None:
        valid, _ = self.store.verify_chain()
        if not valid:
            raise RuntimeError("EVENT_CHAIN_INVALID")

    def run_once(self) -> tuple[Snapshot, FixedPointReceipt]:
            self._require_valid_ledger()
            # Collect probes OUTSIDE writer_lease to avoid Windows subprocess issues
            snapshot = self.collect(1, None)
            self._require_valid_ledger()
            with self.store.writer_lease():
                decision = self.policy.decide(snapshot, None, 1)
                self.store.append("VERDICT", decision.to_dict())
                self.store.set_state("last_verdict", decision.to_dict())
                self._require_valid_ledger()
                self._finalize_baseline(snapshot, decision)
            return snapshot, decision

    def run_until_fixed_point(self) -> tuple[Snapshot, FixedPointReceipt]:
            self._require_valid_ledger()
            previous: Snapshot | None = None
            stable_samples = 0
            last_decision: FixedPointReceipt | None = None
            ttl_seconds = max(120, int(self.max_rounds * self.sample_interval_seconds + 30))

            # First collection outside lease
            snapshot = self.collect(1, None)
            self._require_valid_ledger()
            with self.store.writer_lease(ttl_seconds=ttl_seconds):
                stable_samples = 1
                last_decision = self.policy.decide(snapshot, previous, stable_samples)
                self.store.append("VERDICT", last_decision.to_dict())
                self.store.set_state("last_verdict", last_decision.to_dict())

                if last_decision.reached:
                    self._require_valid_ledger()
                    self._finalize_baseline(snapshot, last_decision)
                    return snapshot, last_decision

                previous = snapshot

                for round_number in range(2, self.max_rounds + 1):
                    # Collect probes OUTSIDE lease for subprocess compatibility
                    # (lease released during sleep, re-acquired for write)
                    snapshot = self.collect(round_number, previous)
                    self._require_valid_ledger()
                    stable_samples = (
                        stable_samples + 1
                        if previous and previous.signature == snapshot.signature
                        else 1
                    )
                    last_decision = self.policy.decide(snapshot, previous, stable_samples)
                    self.store.append("VERDICT", last_decision.to_dict())
                    self.store.set_state("last_verdict", last_decision.to_dict())

                    if last_decision.reached:
                        self._require_valid_ledger()
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
    return json.dumps(
        {"snapshot": snapshot.to_dict(), "fixed_point": decision.to_dict()},
        ensure_ascii=False,
        indent=2,
    )
