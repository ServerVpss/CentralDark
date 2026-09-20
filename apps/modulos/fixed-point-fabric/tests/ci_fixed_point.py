from __future__ import annotations

import json
import tempfile
from pathlib import Path

from centraldark_fixed_point.engine import FixedPointEngine
from centraldark_fixed_point.models import Evidence, ProbeReceipt, Status
from centraldark_fixed_point.policy import FixedPointPolicy
from centraldark_fixed_point.store import EventStore


class StableProbe:
    def __init__(self, domain: str):
        self.domain = domain

    def run(self):
        return ProbeReceipt(self.domain, Status.PASS, "ci-counterproof", (Evidence(self.domain, "same_head_fixture", True),))


def main() -> int:
    with tempfile.TemporaryDirectory() as directory:
        store = EventStore(Path(directory) / "ci-proof.db")
        engine = FixedPointEngine(
            [StableProbe(name) for name in ("local", "vps", "github", "screenpipe")],
            store,
            FixedPointPolicy(required_stable_samples=2),
            sample_interval_seconds=0,
            max_rounds=2,
        )
        snapshot, verdict = engine.run_until_fixed_point()
        chain_valid, event_count = store.verify_chain()
        result = {"snapshot_id": snapshot.snapshot_id, "signature": snapshot.signature, "fixed_point": verdict.to_dict(), "chain_valid": chain_valid, "event_count": event_count}
        print(json.dumps(result, ensure_ascii=False, indent=2))
        store.close()
        return 0 if verdict.reached and chain_valid else 1


if __name__ == "__main__":
    raise SystemExit(main())
