from __future__ import annotations

# #OBSERVACOES#
# @owner: apps/modulos/fixed-point-fabric/src/centraldark_fixed_point/policy.py
# @doc_ref: docs/CONSCIENCIA/RECEIPTS/2026-11-03-branches-891-funil-hud.md
# @last_updated: 2026-11-03T18:43:17.560Z
# @implementado: gates source exigem SHA de local, VPS e GitHub identico, falhando sem HEAD.
# @pendente: executar suite source e gates GitHub SAME_HEAD no PR #1977.
# @estado: SOURCE_PATCHED; CI=UNKNOWN; RUNTIME=NOT_TESTED_BY_SCOPE
# @next_cursor: validar P1 HEAD mismatch; nao declarar runtime nem merge sem gates.

from dataclasses import dataclass
import re
from datetime import datetime, timezone
from typing import Iterable

from .models import BaselineLock, FixedPointReceipt, ProbeReceipt, Snapshot, Status


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
        # P1 #1381: PASS isolado nao prova que os tres domínios viram o mesmo commit.
        # Screenpipe permanece sensor, sem claim de Git HEAD.
        head_claims = {"github": "main_head", "local": "head", "vps": "head_sha"}
        heads: dict[str, str] = {}
        for domain, claim in head_claims.items():
            if domain not in self.required_domains:
                continue
            receipt = by_domain.get(domain)
            if receipt is None:
                continue  # bloqueio MISSING ja registrado acima
            value = next((item.value for item in receipt.evidence if item.claim == claim), None)
            if not isinstance(value, str) or not re.fullmatch(r"[0-9a-fA-F]{40}", value):
                blockers.append(f"{domain}:HEAD_UNVERIFIED")
            else:
                heads[domain] = value.lower()
        candidate_head = heads.get("github") or heads.get("local") or heads.get("vps")
        if candidate_head:
            for domain, observed_head in heads.items():
                if observed_head != candidate_head:
                    blockers.append(f"{domain}:HEAD_MISMATCH")
        return sorted(set(blockers))

    def regressions_against(self, baseline: BaselineLock | dict, snapshot: Snapshot) -> list[str]:
        """Return only material downgrades from a protected baseline.

        The baseline remains untouched when this returns a non-empty list. A
        candidate may improve or add evidence, but it may not turn a proven
        domain into a non-PASS state.
        """
        baseline_id = baseline.snapshot_id if isinstance(baseline, BaselineLock) else baseline.get("snapshot_id")
        if not baseline_id:
            return ["baseline:INVALID"]
        candidate = {receipt.domain: receipt for receipt in snapshot.receipts}
        regressions: list[str] = []
        for domain in self.required_domains:
            receipt = candidate.get(domain)
            if receipt is None:
                regressions.append(f"{domain}:MISSING")
            elif receipt.status is not Status.PASS:
                regressions.append(f"{domain}:{receipt.status.value}")
        return sorted(set(regressions))

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
