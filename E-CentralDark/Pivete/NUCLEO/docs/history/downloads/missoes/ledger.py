from __future__ import annotations
import hashlib, json
from pathlib import Path
from datetime import datetime, timezone
from uuid import uuid4

ZERO_HASH = "0" * 64

def canonical(data: dict) -> bytes:
    return json.dumps(data, sort_keys=True, ensure_ascii=False, separators=(",", ":")).encode("utf-8")

def record_hash(data: dict) -> str:
    return hashlib.sha256(canonical(data)).hexdigest()

class Ledger:
    def __init__(self, path: Path, mission_id: str):
        self.path = Path(path)
        self.mission_id = mission_id
        self.path.parent.mkdir(parents=True, exist_ok=True)

    def last_hash(self) -> str:
        if not self.path.exists() or self.path.stat().st_size == 0:
            return ZERO_HASH
        last = None
        for line in self.path.read_text(encoding="utf-8").splitlines():
            if line.strip():
                last = json.loads(line)
        return last["record_hash"] if last else ZERO_HASH

    def append(self, event: str, payload: dict, round_id: int | None = None) -> dict:
        base = {
            "event_id": str(uuid4()),
            "mission_id": self.mission_id,
            "round_id": round_id,
            "event": event,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "payload": payload,
            "prev_hash": self.last_hash(),
        }
        rec = dict(base)
        rec["record_hash"] = record_hash(base)
        with self.path.open("a", encoding="utf-8", newline="\n") as f:
            f.write(json.dumps(rec, ensure_ascii=False, sort_keys=True) + "\n")
            f.flush()
        return rec

    def validate(self) -> dict:
        if not self.path.exists():
            return {"valid": False, "total": 0, "begin": 0, "final": 0,
                    "bad_hash": 1, "orphan_begin": 0, "orphan_final": 0}
        prev, total, begin, final, bad = ZERO_HASH, 0, 0, 0, 0
        for raw in self.path.read_text(encoding="utf-8").splitlines():
            if not raw.strip():
                continue
            total += 1
            rec = json.loads(raw)
            begin += rec.get("event") == "BEGIN"
            final += rec.get("event") == "FINAL"
            base = {k: v for k, v in rec.items() if k != "record_hash"}
            if rec.get("prev_hash") != prev or rec.get("record_hash") != record_hash(base):
                bad += 1
            prev = rec.get("record_hash", ZERO_HASH)
        return {
            "valid": bad == 0,
            "total": total,
            "begin": begin,
            "final": final,
            "bad_hash": bad,
            "orphan_begin": max(begin-final, 0),
            "orphan_final": max(final-begin, 0),
        }
