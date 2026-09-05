from __future__ import annotations

from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from enum import StrEnum
from typing import Any


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


class Status(StrEnum):
    PASS = "PASS"
    FAIL = "FAIL"
    UNKNOWN = "UNKNOWN"
    BLOCKED = "BLOCKED"
    STALE = "STALE"


@dataclass(frozen=True)
class Evidence:
    source: str
    claim: str
    value: Any
    observed_at: str = field(default_factory=utc_now)
    freshness_seconds: int = 0
    reference: str | None = None
    fingerprint: str | None = None


@dataclass(frozen=True)
class ProbeReceipt:
    domain: str
    status: Status
    summary: str
    evidence: tuple[Evidence, ...] = ()
    blockers: tuple[str, ...] = ()
    observed_at: str = field(default_factory=utc_now)

    def to_dict(self) -> dict[str, Any]:
        data = asdict(self)
        data["status"] = self.status.value
        return data


@dataclass(frozen=True)
class Snapshot:
    snapshot_id: str
    round_number: int
    created_at: str
    receipts: tuple[ProbeReceipt, ...]
    signature: str
    material_delta: bool
    delta: dict[str, Any]

    def to_dict(self) -> dict[str, Any]:
        return {
            "snapshot_id": self.snapshot_id,
            "round_number": self.round_number,
            "created_at": self.created_at,
            "signature": self.signature,
            "material_delta": self.material_delta,
            "delta": self.delta,
            "receipts": [r.to_dict() for r in self.receipts],
        }


@dataclass(frozen=True)
class FixedPointReceipt:
    reached: bool
    snapshot_id: str
    final_signature: str
    stable_samples: int
    required_samples: int
    verdict: str
    blockers: tuple[str, ...]
    previous_signature: str | None
    issued_at: str = field(default_factory=utc_now)

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)
