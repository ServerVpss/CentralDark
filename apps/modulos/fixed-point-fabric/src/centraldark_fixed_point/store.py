from __future__ import annotations

import hashlib
import json
import os
import sqlite3
import time
from contextlib import contextmanager
from pathlib import Path
from typing import Any, Iterator

from .models import BaselineLock, FixedPointReceipt, Snapshot


AUDIT_FACT_STATUSES = {"PASS", "FAIL", "UNKNOWN", "BLOCKED", "STALE", "CONTRADICTION"}
AUDIT_FACT_FORBIDDEN_KEYS = {
    "chain_of_thought",
    "raw_chain_of_thought",
    "raw_reasoning",
    "private_reasoning",
    "hidden_reasoning",
}


def canonical_json(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"), default=str)


def _contains_forbidden_reasoning_key(value: Any) -> bool:
    if isinstance(value, dict):
        for key, nested in value.items():
            if str(key).strip().lower() in AUDIT_FACT_FORBIDDEN_KEYS:
                return True
            if _contains_forbidden_reasoning_key(nested):
                return True
        return False
    if isinstance(value, (list, tuple)):
        return any(_contains_forbidden_reasoning_key(item) for item in value)
    return False


class EventStore:
    def __init__(self, path: str | Path):
        self.path = Path(path)
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self.db = sqlite3.connect(self.path)
        self.db.row_factory = sqlite3.Row
        self.db.execute("PRAGMA journal_mode=WAL")
        self.db.executescript(
            """
            CREATE TABLE IF NOT EXISTS events (
              sequence INTEGER PRIMARY KEY AUTOINCREMENT,
              created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
              kind TEXT NOT NULL,
              payload TEXT NOT NULL,
              previous_hash TEXT,
              event_hash TEXT NOT NULL UNIQUE
            );
            CREATE TABLE IF NOT EXISTS snapshots (
              snapshot_id TEXT PRIMARY KEY,
              created_at TEXT NOT NULL,
              signature TEXT NOT NULL,
              payload TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS state (
              key TEXT PRIMARY KEY,
              value TEXT NOT NULL
            );
            """
        )
        self.db.commit()

    def close(self) -> None:
        self.db.close()

    def append(self, kind: str, payload: dict[str, Any]) -> str:
        previous = self.db.execute("SELECT event_hash FROM events ORDER BY sequence DESC LIMIT 1").fetchone()
        previous_hash = previous[0] if previous else "GENESIS"
        encoded = canonical_json(payload)
        event_hash = hashlib.sha256(f"{previous_hash}|{kind}|{encoded}".encode()).hexdigest()
        self.db.execute(
            "INSERT INTO events(kind,payload,previous_hash,event_hash) VALUES(?,?,?,?)",
            (kind, encoded, previous_hash, event_hash),
        )
        self.db.commit()
        return event_hash

    def record_audit_fact(
        self,
        *,
        event_type: str,
        claim: str,
        status: str,
        source: str,
        methods: tuple[str, ...] = (),
        context: dict[str, Any] | None = None,
        evidence_refs: tuple[str, ...] = (),
        counterproof_refs: tuple[str, ...] = (),
        blockers: tuple[str, ...] = (),
        belief_delta: dict[str, Any] | None = None,
    ) -> str:
        """Append one falsifiable fact to the shared hash-chained trail.

        The trail persists audit-ready facts, not private chain-of-thought.
        A PASS without evidence is rejected. Different claims about the same
        incident must be recorded independently (for example continuity PASS
        while provider validation remains BLOCKED).
        """
        normalized_status = str(status).strip().upper()
        normalized_event_type = str(event_type).strip().upper()
        normalized_claim = str(claim).strip()
        normalized_source = str(source).strip()

        if normalized_status not in AUDIT_FACT_STATUSES:
            raise ValueError(f"unsupported audit fact status: {normalized_status}")
        if not normalized_event_type:
            raise ValueError("event_type is required")
        if not normalized_claim:
            raise ValueError("claim is required")
        if not normalized_source:
            raise ValueError("source is required")
        if normalized_status == "PASS" and not evidence_refs:
            raise ValueError("PASS audit fact requires at least one evidence_ref")

        payload = {
            "schema": "CENTRALDARK_AUDIT_FACT_V1",
            "event_type": normalized_event_type,
            "claim": normalized_claim,
            "status": normalized_status,
            "source": normalized_source,
            "methods": list(methods),
            "context": dict(context or {}),
            "evidence_refs": list(evidence_refs),
            "counterproof_refs": list(counterproof_refs),
            "blockers": list(blockers),
            "belief_delta": dict(belief_delta or {}),
            "raw_chain_of_thought_persisted": False,
        }
        if _contains_forbidden_reasoning_key(payload):
            raise ValueError("raw/private reasoning fields are forbidden in the audit trail")
        return self.append("AUDIT_FACT", payload)

    def save_snapshot(self, snapshot: dict[str, Any]) -> None:
        self.db.execute(
            "INSERT OR REPLACE INTO snapshots(snapshot_id,created_at,signature,payload) VALUES(?,?,?,?)",
            (snapshot["snapshot_id"], snapshot["created_at"], snapshot["signature"], canonical_json(snapshot)),
        )
        self.db.commit()

    def latest_snapshot(self) -> dict[str, Any] | None:
        row = self.db.execute("SELECT payload FROM snapshots ORDER BY created_at DESC LIMIT 1").fetchone()
        return json.loads(row[0]) if row else None

    def set_state(self, key: str, value: Any, *, allow_protected: bool = False) -> None:
        if key == "last_good_state" and not allow_protected:
            existing = self.get_state(key)
            if existing is not None and canonical_json(existing) != canonical_json(value):
                raise RuntimeError("last_good_state is protected; promote a proven candidate instead")
        self.db.execute("INSERT OR REPLACE INTO state(key,value) VALUES(?,?)", (key, canonical_json(value)))
        self.db.commit()

    def get_state(self, key: str, default: Any = None) -> Any:
        row = self.db.execute("SELECT value FROM state WHERE key=?", (key,)).fetchone()
        return json.loads(row[0]) if row else default

    def get_last_good_state(self) -> dict[str, Any] | None:
        """Read the protected baseline without granting mutation authority."""
        return self.get_state("last_good_state")

    def promote_last_good_state(
        self,
        snapshot: Snapshot,
        decision: FixedPointReceipt,
        *,
        scope: str = "fixed-point",
        regressions: tuple[str, ...] = (),
    ) -> dict[str, Any]:
        """Advance the protected pointer only after a proven candidate.

        Previous values stay in the hash-chained event ledger. A failed or
        regressing candidate must never call this method.
        """
        if not decision.reached:
            raise ValueError("cannot promote a candidate without fixed point")
        if regressions:
            raise ValueError(f"candidate regresses baseline: {', '.join(regressions)}")
        candidate = BaselineLock(
            scope=scope,
            snapshot_id=snapshot.snapshot_id,
            signature=snapshot.signature,
            fixed_point_verdict=decision.verdict,
        ).to_dict()
        previous = self.get_last_good_state()
        if previous and previous.get("signature") == candidate["signature"]:
            return previous
        self.append(
            "BASELINE_ADVANCED" if previous else "BASELINE_LOCKED",
            {"current": candidate, "previous": previous},
        )
        self.set_state("last_good_state", candidate, allow_protected=True)
        self.set_state("rollback_target", candidate)
        return candidate

    def record_rollback_required(self, reason: str, *, target: dict[str, Any] | None = None) -> dict[str, Any]:
        """Persist a fail-closed recovery target while preserving the baseline."""
        payload = {"reason": reason, "target": target}
        self.append("ROLLBACK_REQUIRED", payload)
        self.set_state("rollback_target", target)
        return payload

    def list_events(self, kind: str | None = None, limit: int = 100) -> list[dict[str, Any]]:
        if not isinstance(limit, int) or limit < 1 or limit > 1000:
            raise ValueError("limit must be between 1 and 1000")
        if kind is None:
            rows = self.db.execute(
                "SELECT * FROM events ORDER BY sequence DESC LIMIT ?", (limit,)
            ).fetchall()
        else:
            rows = self.db.execute(
                "SELECT * FROM events WHERE kind=? ORDER BY sequence DESC LIMIT ?",
                (kind, limit),
            ).fetchall()
        return [
            {
                "sequence": row["sequence"],
                "created_at": row["created_at"],
                "kind": row["kind"],
                "payload": json.loads(row["payload"]),
                "previous_hash": row["previous_hash"],
                "event_hash": row["event_hash"],
            }
            for row in rows
        ]

    def append_once(
        self,
        dedupe_key: str,
        kind: str,
        payload: dict[str, Any],
        state_updates: dict[str, Any] | None = None,
    ) -> str | None:
        try:
            self.db.execute("BEGIN IMMEDIATE")
            duplicate = self.db.execute(
                "SELECT 1 FROM state WHERE key=?", (dedupe_key,)
            ).fetchone()
            if duplicate:
                self.db.rollback()
                return None
            previous = self.db.execute(
                "SELECT event_hash FROM events ORDER BY sequence DESC LIMIT 1"
            ).fetchone()
            previous_hash = previous[0] if previous else "GENESIS"
            encoded = canonical_json(payload)
            event_hash = hashlib.sha256(
                f"{previous_hash}|{kind}|{encoded}".encode()
            ).hexdigest()
            self.db.execute(
                "INSERT INTO events(kind,payload,previous_hash,event_hash) VALUES(?,?,?,?)",
                (kind, encoded, previous_hash, event_hash),
            )
            for key, value in (state_updates or {}).items():
                self.db.execute(
                    "INSERT OR REPLACE INTO state(key,value) VALUES(?,?)",
                    (key, canonical_json(value)),
                )
            self.db.execute(
                "INSERT INTO state(key,value) VALUES(?,?)",
                (dedupe_key, canonical_json(True)),
            )
            self.db.commit()
            return event_hash
        except Exception:
            self.db.rollback()
            raise

    def verify_chain(self) -> tuple[bool, int]:
        previous_hash = "GENESIS"
        count = 0
        for row in self.db.execute("SELECT * FROM events ORDER BY sequence"):
            expected = hashlib.sha256(f"{previous_hash}|{row['kind']}|{row['payload']}".encode()).hexdigest()
            if row["previous_hash"] != previous_hash or row["event_hash"] != expected:
                return False, count
            previous_hash = row["event_hash"]
            count += 1
        return True, count

    @contextmanager
    def writer_lease(self, name: str = "fixed-point-writer", ttl_seconds: int = 120) -> Iterator[None]:
        now = time.time()
        holder = {"pid": os.getpid(), "expires_at": now + ttl_seconds}
        current = self.get_state(f"lease:{name}")
        if current and float(current.get("expires_at", 0)) > now and current.get("pid") != os.getpid():
            raise RuntimeError(f"writer lease held by pid={current.get('pid')}")
        self.set_state(f"lease:{name}", holder)
        try:
            yield
        finally:
            current = self.get_state(f"lease:{name}")
            if current and current.get("pid") == os.getpid():
                self.db.execute("DELETE FROM state WHERE key=?", (f"lease:{name}",))
                self.db.commit()
