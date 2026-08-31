from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Iterable

from .models import FixedPointReceipt, ProbeReceipt, Snapshot, Status


def _age_seconds(timestamp: str) -> float:
    observed = datetime.fromisoformat(timestamp.replace("Z", "+00:00"))
    return (datetime.now(timezone.utc) - observed.astimezone(timezone.utc)).total_seconds()


@dataclass(frozen=True)
class FixedPointPolicy:
    required_domains: tuple[str, ...] = ("local", "vps", "github", "screenpipe")
    required_stable_samples: int = 2
    max_observation_age_seconds: int = 120
    max_open_promotion_prs: int = 1

    def blockers_for(self, receipts: Iterable[ProbeReceipt]) -> list[str]:
        by_domain = {r.domain: r for r in receipts}
        blockers: list[str] = []
        for domain in self.required_domains:
            receipt = by_domain.get(domain)
            if receipt is None:
                blockers.append(f"{domain}:MISSING")
                continue
            if receipt.status is not Status.PASS:
                blockers.append(f"{domain}:{receipt.status.value}")
            if _age_seconds(receipt.observed_at) > self.max_observation_age_seconds:
                blockers.append(f"{domain}:STALE")
            blockers.extend(f"{domain}:{item}" for item in receipt.blockers)
        return sorted(set(blockers))

    def decide(self, snapshot: Snapshot, previous: Snapshot | None, stable_samples: int) -> FixedPointReceipt:
        blockers = self.blockers_for(snapshot.receipts)
        if previous is None or previous.signature != snapshot.signature:
            stable_samples = 1
        reached = not blockers and stable_samples >= self.required_stable_samples
        verdict = "FIXED_POINT_REACHED" if reached else "RECONCILIATION_REQUIRED"
        return FixedPointReceipt(
            reached=reached,
            snapshot_id=snapshot.snapshot_id,
            final_signature=snapshot.signature,
            stable_samples=stable_samples,
            required_samples=self.required_stable_samples,
            verdict=verdict,
            blockers=tuple(blockers),
            previous_signature=previous.signature if previous else None,
        )

