from __future__ import annotations

import hashlib
import json
import os
import sqlite3
import time
from contextlib import contextmanager
from pathlib import Path
from typing import Any, Iterator


def canonical_json(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"), default=str)


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

    def save_snapshot(self, snapshot: dict[str, Any]) -> None:
        self.db.execute(
            "INSERT OR REPLACE INTO snapshots(snapshot_id,created_at,signature,payload) VALUES(?,?,?,?)",
            (snapshot["snapshot_id"], snapshot["created_at"], snapshot["signature"], canonical_json(snapshot)),
        )
        self.db.commit()

    def latest_snapshot(self) -> dict[str, Any] | None:
        row = self.db.execute("SELECT payload FROM snapshots ORDER BY created_at DESC LIMIT 1").fetchone()
        return json.loads(row[0]) if row else None

    def set_state(self, key: str, value: Any) -> None:
        self.db.execute("INSERT OR REPLACE INTO state(key,value) VALUES(?,?)", (key, canonical_json(value)))
        self.db.commit()

    def get_state(self, key: str, default: Any = None) -> Any:
        row = self.db.execute("SELECT value FROM state WHERE key=?", (key,)).fetchone()
        return json.loads(row[0]) if row else default

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
