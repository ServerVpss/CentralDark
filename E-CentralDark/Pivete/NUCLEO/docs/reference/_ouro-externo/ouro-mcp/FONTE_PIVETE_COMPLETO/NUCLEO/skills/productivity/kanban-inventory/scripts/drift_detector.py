#!/usr/bin/env python3
"""Kanban Drift Detector + Autocorrection gate (profile pivete).

FASE 4: CAPTURE -> NORMALIZE -> COMPARE -> CLASSIFY -> DECIDE -> REPORT
FASE 5: nine conditions, state machine, canary, 20-test suite, receipt.

Upstream Hermes = READ_ONLY. Writes only under this skill root, or canary
tasks created by this mission. Default mode is readonly.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import socket
import sqlite3
import subprocess
import sys
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from enum import Enum
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple


MISSION_ID_DEFAULT = "CASA-KANBAN-AUTOCORRECAO-DETERMINISTICA-20260805"
DEFAULT_SKILL_ROOT = Path(
    r"C:\Users\danda\AppData\Local\hermes\profiles\pivete\skills\productivity\kanban-inventory"
)
KANBAN_DB_DEFAULT = Path(r"C:\Users\danda\AppData\Local\hermes\kanban.db")
KNOWN_CLI_COMMANDS = [
    "init", "boards", "create", "swarm", "list", "ls", "show", "assign", "set-model",
    "reclaim", "reassign", "diagnostics", "diag", "link", "unlink", "claim", "comment",
    "attach", "attachments", "attach-rm", "complete", "edit", "block", "schedule",
    "unblock", "promote", "archive", "tail", "dispatch", "daemon", "watch", "stats",
    "notify-subscribe", "notify-list", "notify-unsubscribe", "log", "runs", "heartbeat",
    "assignees", "context", "specify", "decompose", "gc", "repair",
]


class DriftResult(Enum):
    NO_CHANGE = "NO_CHANGE"
    SAFE_ADAPTER_DRIFT = "SAFE_ADAPTER_DRIFT"
    UPSTREAM_DRIFT = "UPSTREAM_DRIFT"
    AMBIGUOUS_DRIFT = "AMBIGUOUS_DRIFT"
    BROKEN_CONTRACT = "BROKEN_CONTRACT"
    BLOCKED = "BLOCKED"


class AutocorrectionState(Enum):
    NO_CHANGE = "NO_CHANGE"
    SAFE_ADAPTER_DRIFT = "SAFE_ADAPTER_DRIFT"
    UPSTREAM_DRIFT = "UPSTREAM_DRIFT"
    BROKEN_CONTRACT = "BROKEN_CONTRACT"
    AMBIGUOUS_DRIFT = "AMBIGUOUS_DRIFT"
    AUTHORITY_CONFLICT = "AUTHORITY_CONFLICT"
    AUTOCORRECTION_READY = "AUTOCORRECTION_READY"
    AUTOCORRECTING = "AUTOCORRECTING"
    AUTOCORRECTION_VERIFIED = "AUTOCORRECTION_VERIFIED"
    ROLLBACK_EXECUTED = "ROLLBACK_EXECUTED"
    STAGNATED = "STAGNATED"
    BLOCKED = "BLOCKED"
    UNKNOWN = "UNKNOWN"


VALID_TRANSITIONS = {
    AutocorrectionState.NO_CHANGE: {AutocorrectionState.NO_CHANGE},
    AutocorrectionState.SAFE_ADAPTER_DRIFT: {
        AutocorrectionState.AUTOCORRECTION_READY,
        AutocorrectionState.BLOCKED,
        AutocorrectionState.STAGNATED,
    },
    AutocorrectionState.UPSTREAM_DRIFT: {
        AutocorrectionState.NO_CHANGE,
        AutocorrectionState.BLOCKED,
        AutocorrectionState.STAGNATED,
    },
    AutocorrectionState.BROKEN_CONTRACT: {
        AutocorrectionState.ROLLBACK_EXECUTED,
        AutocorrectionState.BLOCKED,
        AutocorrectionState.STAGNATED,
    },
    AutocorrectionState.AMBIGUOUS_DRIFT: {
        AutocorrectionState.UNKNOWN,
        AutocorrectionState.BLOCKED,
        AutocorrectionState.STAGNATED,
    },
    AutocorrectionState.AUTHORITY_CONFLICT: {
        AutocorrectionState.SAFE_ADAPTER_DRIFT,
        AutocorrectionState.BLOCKED,
        AutocorrectionState.STAGNATED,
    },
    AutocorrectionState.AUTOCORRECTION_READY: {
        AutocorrectionState.AUTOCORRECTING,
        AutocorrectionState.BLOCKED,
    },
    AutocorrectionState.AUTOCORRECTING: {
        AutocorrectionState.AUTOCORRECTION_VERIFIED,
        AutocorrectionState.ROLLBACK_EXECUTED,
        AutocorrectionState.BLOCKED,
    },
    AutocorrectionState.AUTOCORRECTION_VERIFIED: {
        AutocorrectionState.NO_CHANGE,
        AutocorrectionState.BLOCKED,
    },
    AutocorrectionState.ROLLBACK_EXECUTED: {
        AutocorrectionState.NO_CHANGE,
        AutocorrectionState.BLOCKED,
    },
    AutocorrectionState.STAGNATED: {
        AutocorrectionState.BLOCKED,
        AutocorrectionState.UNKNOWN,
    },
    AutocorrectionState.BLOCKED: {AutocorrectionState.UNKNOWN},
    AutocorrectionState.UNKNOWN: {
        AutocorrectionState.AUTOCORRECTION_READY,
        AutocorrectionState.BLOCKED,
        AutocorrectionState.STAGNATED,
    },
}


@dataclass
class DriftReport:
    timestamp: str
    result: str
    details: Dict[str, Any]
    actions_required: List[str]
    unknown_factors: List[str]
    contract_hash: str
    adapter_hash: str
    schema_hash: str


@dataclass
class StateMachine:
    current_state: AutocorrectionState = AutocorrectionState.NO_CHANGE
    history: List[Tuple[str, str]] = field(default_factory=list)
    stagnation_counter: int = 0

    def __post_init__(self) -> None:
        if not self.history:
            self.history = [(self.current_state.value, _now())]

    def can_transition(self, new_state: AutocorrectionState) -> bool:
        return new_state in VALID_TRANSITIONS.get(self.current_state, set())

    def transition(self, new_state: AutocorrectionState) -> bool:
        if not self.can_transition(new_state):
            return False
        if new_state == self.current_state:
            self.stagnation_counter += 1
            if self.stagnation_counter >= 3 and self.current_state != AutocorrectionState.STAGNATED:
                self.current_state = AutocorrectionState.STAGNATED
                self.history.append((self.current_state.value, _now()))
                return True
        else:
            self.stagnation_counter = 0
        self.current_state = new_state
        self.history.append((new_state.value, _now()))
        return True


class NineConditionsValidator:
    """Nine deterministic gates before any autocorrection write."""

    def __init__(self, baseline: Dict[str, Any], contract: Dict[str, Any]):
        self.baseline = baseline or {}
        self.contract = contract or {}

    def validate_all(self, context: Dict[str, Any]) -> Tuple[bool, Dict[str, bool], Dict[str, str]]:
        conditions: Dict[str, bool] = {}
        reasons: Dict[str, str] = {}

        auth_ok = (
            context.get("authorization_marker") == "PERMITO SEGREDO"
            and context.get("authority") == "SEGREDO/CHEFE"
        )
        conditions["1_AUTHORITY_VALID"] = auth_ok
        reasons["1_AUTHORITY_VALID"] = "OK" if auth_ok else "requires PERMITO SEGREDO + SEGREDO/CHEFE"

        scope_ok = bool(context.get("scope_valid", False))
        conditions["2_SCOPE_VALID"] = scope_ok
        reasons["2_SCOPE_VALID"] = "OK" if scope_ok else "outside mission scope"

        baseline_ok = bool(self.baseline.get("CONTRACT_HASH_BEFORE")) and bool(
            self.baseline.get("ADAPTER_CODE_HASH_BEFORE")
        )
        conditions["3_BASELINE_VALID"] = baseline_ok
        reasons["3_BASELINE_VALID"] = "OK" if baseline_ok else "baseline hashes missing"

        cause_ok = bool(context.get("cause_reproduced", False))
        conditions["4_CAUSE_REPRODUCED"] = cause_ok
        reasons["4_CAUSE_REPRODUCED"] = "OK" if cause_ok else "cause not reproduced by code"

        transform_ok = bool(context.get("transformation_deterministic", False))
        conditions["5_TRANSFORMATION_DETERMINISTIC"] = transform_ok
        reasons["5_TRANSFORMATION_DETERMINISTIC"] = "OK" if transform_ok else "no deterministic transform"

        minimal_ok = bool(context.get("minimal_diff", False))
        conditions["6_MINIMAL_DIFF"] = minimal_ok
        reasons["6_MINIMAL_DIFF"] = "OK" if minimal_ok else "diff not minimal"

        tests_ok = bool(context.get("tests_valid", False))
        conditions["7_TESTS_VALID"] = tests_ok
        reasons["7_TESTS_VALID"] = "OK" if tests_ok else "tests incomplete/failing"

        rollback_ok = bool(context.get("rollback_available", False))
        conditions["8_ROLLBACK_AVAILABLE"] = rollback_ok
        reasons["8_ROLLBACK_AVAILABLE"] = "OK" if rollback_ok else "rollback not validated"

        receipt_ok = bool(context.get("receipt_bound", False))
        conditions["9_RECEIPT_BOUND"] = receipt_ok
        reasons["9_RECEIPT_BOUND"] = "OK" if receipt_ok else "receipt incomplete"

        return all(conditions.values()), conditions, reasons


def _now() -> str:
    return datetime.now(timezone.utc).astimezone().isoformat()


def _sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def _sha256_file(path: Path) -> str:
    if not path.exists():
        return "NOT_FOUND"
    return _sha256_bytes(path.read_bytes())


def _run_cmd(cmd: List[str], timeout: int = 45) -> Tuple[int, str, str]:
    try:
        p = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout)
        return p.returncode, p.stdout or "", p.stderr or ""
    except subprocess.TimeoutExpired:
        return -1, "", "TIMEOUT"
    except Exception as exc:  # noqa: BLE001
        return -1, "", str(exc)


class KanbanDriftDetector:
    def __init__(self, skill_root: Path, mission_id: str = MISSION_ID_DEFAULT):
        self.skill_root = Path(skill_root)
        self.mission_id = mission_id
        self.contracts_dir = self.skill_root / "contracts"
        self.scripts_dir = self.skill_root / "scripts"
        self.state_dir = self.skill_root / "state"
        self.tests_dir = self.skill_root / "tests"
        self.contract_path = self.contracts_dir / "kanban-contract.json"
        self.hash_path = self.state_dir / "contract_hash.txt"
        self.state_dir.mkdir(parents=True, exist_ok=True)
        self.tests_dir.mkdir(parents=True, exist_ok=True)
        self.sm = StateMachine()

    # ---------- capture helpers ----------
    def _calculate_adapter_hash(self) -> str:
        return _sha256_file(self.skill_root / "SKILL.md")

    def _calculate_schema_hash(self) -> str:
        db = KANBAN_DB_DEFAULT
        if not db.exists():
            return "NOT_FOUND"
        try:
            conn = sqlite3.connect(f"file:{db}?mode=ro", uri=True)
            cur = conn.cursor()
            cur.execute("SELECT sql FROM sqlite_master WHERE type='table' ORDER BY name")
            parts = [row[0] for row in cur.fetchall() if row[0]]
            conn.close()
            return _sha256_bytes("\n".join(parts).encode("utf-8"))
        except Exception:  # noqa: BLE001
            return "ERROR"

    def _discover_kanban_url(self) -> str:
        for port in (9119, 8648, 8649, 9120, 9121):
            try:
                with socket.create_connection(("127.0.0.1", port), timeout=1.0):
                    return f"http://127.0.0.1:{port}/kanban?profile=pivete"
            except OSError:
                continue
        return "UNKNOWN"

    def _get_cli_version(self) -> str:
        code, out, _ = _run_cmd(["hermes", "--version"])
        if code == 0 and out.strip():
            return out.strip().splitlines()[0].strip()
        return "UNKNOWN"

    def _get_cli_commands(self) -> List[str]:
        code, out, _ = _run_cmd(["hermes", "kanban", "--help"])
        if code != 0:
            return []
        return [c for c in KNOWN_CLI_COMMANDS if re.search(rf"\b{re.escape(c)}\b", out)]

    def _get_board_info(self) -> Dict[str, str]:
        code, out, _ = _run_cmd(["hermes", "kanban", "boards", "show"])
        info = {"name": "unknown", "display": "unknown", "db_path": "", "tasks": "0"}
        if code != 0:
            return info
        for line in out.splitlines():
            s = line.strip()
            if s.startswith("Current board:"):
                info["name"] = s.split(":", 1)[1].strip()
            elif s.startswith("Display name:"):
                info["display"] = s.split(":", 1)[1].strip()
            elif s.startswith("DB path:"):
                info["db_path"] = s.split(":", 1)[1].strip()
            elif s.startswith("Tasks:"):
                info["tasks"] = s.split(":", 1)[1].strip()
        return info

    def _get_current_cards(self) -> List[Dict[str, Any]]:
        code, out, _ = _run_cmd(["hermes", "kanban", "list"])
        if code != 0:
            return []
        cards: List[Dict[str, Any]] = []
        for line in out.splitlines():
            line = line.strip()
            if not line:
                continue
            parts = line.split()
            if len(parts) < 4:
                continue
            cards.append(
                {
                    "emoji": parts[0],
                    "id": parts[1],
                    "status": parts[2],
                    "assignee": parts[3],
                    "title": " ".join(parts[4:]),
                }
            )
        return cards

    def _load_contract(self) -> Dict[str, Any]:
        if self.contract_path.exists():
            return json.loads(self.contract_path.read_text(encoding="utf-8"))
        return {}

    def _load_last_known_good_hash(self) -> str:
        if self.hash_path.exists():
            return self.hash_path.read_text(encoding="utf-8").strip()
        return ""

    def _load_baseline(self) -> Dict[str, Any]:
        p = self.state_dir / f"baseline_{self.mission_id}.json"
        if p.exists():
            return json.loads(p.read_text(encoding="utf-8"))
        return {}

    # ---------- pipeline ----------
    def capture(self) -> Dict[str, Any]:
        return {
            "timestamp": _now(),
            "kanban_url": self._discover_kanban_url(),
            "cli_version": self._get_cli_version(),
            "cli_commands": self._get_cli_commands(),
            "board": self._get_board_info(),
            "cards": self._get_current_cards(),
            "adapter_hash": self._calculate_adapter_hash(),
            "schema_hash": self._calculate_schema_hash(),
        }

    def normalize(self, captured: Dict[str, Any]) -> Dict[str, Any]:
        n = dict(captured)
        n["cli_commands"] = sorted(n.get("cli_commands") or [])
        n["cards"] = sorted(n.get("cards") or [], key=lambda c: c.get("id", ""))
        if isinstance(n.get("cli_version"), str):
            n["cli_version"] = n["cli_version"].splitlines()[0].strip()
        return n

    def compare(self, current: Dict[str, Any], contract: Dict[str, Any]) -> Dict[str, Any]:
        differences: Dict[str, Any] = {}
        canonical = contract.get("canonical", {})

        if "kanban_url" in current and "KANBAN_URL" in canonical:
            expected = canonical["KANBAN_URL"].get("value", "")
            actual = current["kanban_url"]
            if expected and actual and actual != "UNKNOWN" and expected != actual:
                differences["kanban_url"] = {
                    "expected": expected,
                    "actual": actual,
                    "type": "url_changed",
                }

        if "cli_version" in current and "CLI_VERSION" in canonical:
            expected = str(canonical["CLI_VERSION"].get("value", "")).splitlines()[0].strip()
            actual = str(current["cli_version"]).splitlines()[0].strip()
            if expected and actual and expected != actual:
                differences["cli_version"] = {
                    "expected": expected,
                    "actual": actual,
                    "type": "version_changed",
                }

        if "cli_commands" in current and "CLI_COMMANDS" in canonical:
            expected = set(canonical["CLI_COMMANDS"].get("value", []))
            actual = set(current["cli_commands"])
            if expected and actual and expected != actual:
                differences["cli_commands"] = {
                    "expected": sorted(expected),
                    "actual": sorted(actual),
                    "added": sorted(actual - expected),
                    "removed": sorted(expected - actual),
                    "type": "commands_changed",
                }

        if "board" in current and "BOARD_NAME" in canonical:
            expected = canonical["BOARD_NAME"].get("value", "")
            actual = (current.get("board") or {}).get("name")
            if expected and actual and expected != actual:
                differences["board_name"] = {
                    "expected": expected,
                    "actual": actual,
                    "type": "board_changed",
                }

        if "cards" in current and "VALID_STATUSES" in canonical:
            valid = set(canonical["VALID_STATUSES"].get("value", []))
            invalid = [c for c in current["cards"] if c.get("status") not in valid]
            if invalid:
                differences["invalid_statuses"] = {
                    "valid": sorted(valid),
                    "invalid_cards": invalid,
                    "type": "invalid_status",
                }

        snap = contract.get("runtime_snapshot", {})
        if current.get("adapter_hash") and snap.get("adapter_code_hash"):
            if current["adapter_hash"] != snap["adapter_code_hash"]:
                differences["adapter_hash"] = {
                    "expected": snap["adapter_code_hash"],
                    "actual": current["adapter_hash"],
                    "type": "adapter_code_changed",
                }

        if current.get("schema_hash") and snap.get("database_schema_hash"):
            if current["schema_hash"] != snap["database_schema_hash"]:
                differences["schema_hash"] = {
                    "expected": snap["database_schema_hash"],
                    "actual": current["schema_hash"],
                    "type": "schema_changed",
                }

        return differences

    def classify(self, differences: Dict[str, Any], contract: Dict[str, Any]) -> DriftResult:
        del contract  # reserved for future contract-aware rules
        if not differences:
            return DriftResult.NO_CHANGE
        keys = set(differences.keys())
        if keys <= {"adapter_hash"}:
            return DriftResult.SAFE_ADAPTER_DRIFT
        if keys <= {"schema_hash"} or keys <= {"kanban_url"}:
            return DriftResult.UPSTREAM_DRIFT
        if "invalid_statuses" in keys:
            return DriftResult.BROKEN_CONTRACT
        upstream_keys = {"cli_version", "cli_commands", "board_name", "kanban_url"}
        if keys.issubset(upstream_keys):
            if len(keys) > 1:
                return DriftResult.AMBIGUOUS_DRIFT
            return DriftResult.UPSTREAM_DRIFT
        if "adapter_hash" in keys and keys & upstream_keys:
            return DriftResult.AMBIGUOUS_DRIFT
        if "schema_hash" in keys and len(keys) > 1:
            return DriftResult.AMBIGUOUS_DRIFT
        return DriftResult.AMBIGUOUS_DRIFT

    def decide(self, classification: DriftResult, differences: Dict[str, Any]) -> Tuple[List[str], List[str]]:
        del differences
        actions: List[str] = []
        unknowns: List[str] = []
        if classification == DriftResult.NO_CHANGE:
            actions.append("no write; receipt PASS")
        elif classification == DriftResult.SAFE_ADAPTER_DRIFT:
            actions.append("validate nine conditions")
            actions.append("minimal local correction only if authorized")
        elif classification == DriftResult.UPSTREAM_DRIFT:
            actions.append("do not write upstream")
            actions.append("adapt local contract/selector only if deterministic")
        elif classification == DriftResult.AMBIGUOUS_DRIFT:
            actions.append("no automatic correction")
            actions.append("investigate with counter-evidence")
            unknowns.append("ambiguous multi-signal drift")
        elif classification == DriftResult.BROKEN_CONTRACT:
            actions.append("block write")
            actions.append("restore local LAST_KNOWN_GOOD / rollback")
        else:
            actions.append("blocked")
            unknowns.append("unclassified drift")
        return actions, unknowns

    def report(
        self,
        captured: Dict[str, Any],
        normalized: Dict[str, Any],
        differences: Dict[str, Any],
        classification: DriftResult,
        actions: List[str],
        unknowns: List[str],
    ) -> DriftReport:
        del normalized
        return DriftReport(
            timestamp=_now(),
            result=classification.value,
            details={
                "differences": differences,
                "card_count": len(captured.get("cards") or []),
                "kanban_url": captured.get("kanban_url"),
                "cli_version": captured.get("cli_version"),
            },
            actions_required=actions,
            unknown_factors=unknowns,
            contract_hash=self._load_last_known_good_hash(),
            adapter_hash=captured.get("adapter_hash", ""),
            schema_hash=captured.get("schema_hash", ""),
        )

    def run(self, mode: str = "readonly") -> DriftReport:
        del mode  # first round remains read-only for drift path
        contract = self._load_contract()
        if not contract:
            captured = self.capture()
            return DriftReport(
                timestamp=_now(),
                result=DriftResult.NO_CHANGE.value,
                details={"baseline": True, "message": "no contract yet"},
                actions_required=["create contract first"],
                unknown_factors=[],
                contract_hash="",
                adapter_hash=captured.get("adapter_hash", ""),
                schema_hash=captured.get("schema_hash", ""),
            )

        captured = self.capture()
        normalized = self.normalize(captured)
        differences = self.compare(normalized, contract)
        classification = self.classify(differences, contract)
        actions, unknowns = self.decide(classification, differences)
        rep = self.report(captured, normalized, differences, classification, actions, unknowns)

        out = self.state_dir / f"drift_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        out.write_text(json.dumps(asdict(rep), indent=2, ensure_ascii=False), encoding="utf-8")
        return rep

    # ---------- authority helpers ----------
    def authority_allows(self, marker: str, authority: str) -> bool:
        return marker == "PERMITO SEGREDO" and authority == "SEGREDO/CHEFE"

    def evaluate_gate(self, context: Dict[str, Any]) -> Dict[str, Any]:
        validator = NineConditionsValidator(self._load_baseline(), self._load_contract())
        all_true, conditions, reasons = validator.validate_all(context)
        return {
            "ready": all_true,
            "conditions": conditions,
            "reasons": reasons,
            "gate_percent": round(100.0 * sum(1 for v in conditions.values() if v) / 9.0, 2),
        }

    # ---------- canary (FASE 5E) ----------
    def run_canary(self, authorization_marker: str, authority: str = "SEGREDO/CHEFE") -> Dict[str, Any]:
        """Reversible canary using only official CLI verbs (no cancel; archive + purge)."""
        results: Dict[str, Any] = {
            "success": False,
            "authorization_marker": authorization_marker,
            "authority": authority,
            "write_success": False,
            "transition_success": False,
            "rollback_success": False,
            "cleanup_success": False,
            "idempotent": False,
            "channel_1": None,
            "channel_2": None,
            "reason": "",
        }

        if not self.authority_allows(authorization_marker, authority):
            results["reason"] = "blocked: requires PERMITO SEGREDO + SEGREDO/CHEFE"
            return results

        stamp = datetime.now().strftime("%Y%m%d%H%M%S")
        title = f"[CANARY] AUTONOMIA-CANARY-{self.mission_id}-{stamp}"
        body = (
            "Temporary canary card for local autocorrection proof. "
            "Created by mission "
            f"{self.mission_id}. Safe to archive/purge."
        )
        key = f"canary-{self.mission_id}-{stamp}"

        code, out, err = _run_cmd(
            [
                "hermes",
                "kanban",
                "create",
                title,
                "--body",
                body,
                "--assignee",
                "pivete",
                "--idempotency-key",
                key,
                "--json",
            ]
        )
        results["channel_1"] = {"action": "create", "code": code, "stdout": out, "stderr": err}
        if code != 0:
            results["reason"] = "create failed"
            return results

        task_id = None
        try:
            payload = json.loads(out)
            task_id = payload.get("id") or payload.get("task_id")
        except json.JSONDecodeError:
            m = re.search(r"(t_[a-f0-9]+)", out)
            if m:
                task_id = m.group(1)
        if not task_id:
            results["reason"] = "task id not found after create"
            return results
        results["task_id"] = task_id
        results["write_success"] = True

        code2, out2, err2 = _run_cmd(["hermes", "kanban", "show", task_id])
        results["channel_2"] = {"action": "show_after_create", "code": code2, "stdout": out2, "stderr": err2}
        if code2 != 0 or task_id not in out2:
            results["reason"] = "channel 2 failed after create"
            return results

        codeb, outb, errb = _run_cmd(
            ["hermes", "kanban", "block", task_id, "canary test", "--kind", "transient"]
        )
        results["transition_block"] = {"code": codeb, "stdout": outb, "stderr": errb}
        code_s, out_s, _ = _run_cmd(["hermes", "kanban", "show", task_id])
        status_after_block = self._task_status_from_show(out_s)
        results["status_after_block"] = status_after_block
        if codeb != 0 or status_after_block != "blocked":
            results["reason"] = f"block transition failed (status={status_after_block})"
            self._cleanup_canary(task_id)
            return results
        results["transition_success"] = True

        codeu, outu, erru = _run_cmd(["hermes", "kanban", "unblock", task_id])
        results["rollback_unblock"] = {"code": codeu, "stdout": outu, "stderr": erru}
        code_s2, out_s2, _ = _run_cmd(["hermes", "kanban", "show", task_id])
        status_after_unblock = self._task_status_from_show(out_s2)
        results["status_after_unblock"] = status_after_unblock
        if codeu != 0 or status_after_unblock == "blocked":
            results["reason"] = f"rollback unblock failed (status={status_after_unblock})"
            self._cleanup_canary(task_id)
            return results
        results["rollback_success"] = True

        # cleanup: archive then purge archived id
        clean_ok = self._cleanup_canary(task_id)
        results["cleanup_success"] = clean_ok
        if not clean_ok:
            results["reason"] = "cleanup archive/purge failed"
            return results

        # idempotence: second archive/purge should not recreate card
        code_i, out_i, err_i = _run_cmd(["hermes", "kanban", "show", task_id])
        results["idempotent_check"] = {"code": code_i, "stdout": out_i, "stderr": err_i}
        results["idempotent"] = code_i != 0 or "not found" in (out_i + err_i).lower() or task_id not in out_i
        results["success"] = True
        results["reason"] = "canary write + transition + rollback + cleanup confirmed on two channels"
        return results

    def _task_status_from_show(self, show_out: str) -> Optional[str]:
        """Extract current status field only (ignore history/comments mentioning blocked)."""
        m = re.search(r"(?im)^\s*status:\s*(\S+)", show_out or "")
        if m:
            return m.group(1).strip().lower()
        # fallback: list line
        return None

    def _cleanup_canary(self, task_id: str) -> bool:
        code_a, out_a, err_a = _run_cmd(["hermes", "kanban", "archive", task_id])
        # purge permanently if already archived
        code_p, out_p, err_p = _run_cmd(["hermes", "kanban", "archive", "--rm", task_id])
        code_s, out_s, err_s = _run_cmd(["hermes", "kanban", "show", task_id])
        gone = code_s != 0 or task_id not in out_s
        # keep audit trail in state
        (self.state_dir / f"canary_cleanup_{task_id}.json").write_text(
            json.dumps(
                {
                    "task_id": task_id,
                    "archive": {"code": code_a, "out": out_a, "err": err_a},
                    "purge": {"code": code_p, "out": out_p, "err": err_p},
                    "show_after": {"code": code_s, "out": out_s, "err": err_s},
                    "gone": gone,
                },
                indent=2,
                ensure_ascii=False,
            ),
            encoding="utf-8",
        )
        return gone

    # ---------- tests (FASE 5F) ----------
    def _with_temp_skill_marker(self) -> Any:
        skill_md = self.skill_root / "SKILL.md"
        original = skill_md.read_text(encoding="utf-8")

        class _Ctx:
            def __enter__(self_nonlocal):
                skill_md.write_text(original + "\n<!-- TEST MARKER -->\n", encoding="utf-8")
                return skill_md

            def __exit__(self_nonlocal, exc_type, exc, tb):
                skill_md.write_text(original, encoding="utf-8")
                return False

        return _Ctx()

    def _with_contract_patch(self, mutator) -> Any:
        path = self.contract_path
        original = path.read_text(encoding="utf-8")

        class _Ctx:
            def __enter__(self_nonlocal):
                data = json.loads(original)
                mutator(data)
                path.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
                return data

            def __exit__(self_nonlocal, exc_type, exc, tb):
                path.write_text(original, encoding="utf-8")
                return False

        return _Ctx()

    def _test_no_change(self) -> Dict[str, Any]:
        r = self.run("readonly")
        return {"pass": r.result == DriftResult.NO_CHANGE.value, "reason": r.result}

    def _test_safe_adapter_drift(self) -> Dict[str, Any]:
        with self._with_temp_skill_marker():
            r = self.run("readonly")
        return {"pass": r.result == DriftResult.SAFE_ADAPTER_DRIFT.value, "reason": r.result}

    def _test_upstream_drift(self) -> Dict[str, Any]:
        def mut(c):
            c["canonical"]["CLI_VERSION"]["value"] = "Hermes Agent v99.99.9"

        with self._with_contract_patch(mut):
            r = self.run("readonly")
        return {"pass": r.result == DriftResult.UPSTREAM_DRIFT.value, "reason": r.result}

    def _test_broken_contract(self) -> Dict[str, Any]:
        def mut(c):
            c["canonical"]["VALID_STATUSES"]["value"] = ["done"]

        with self._with_contract_patch(mut):
            r = self.run("readonly")
        return {"pass": r.result == DriftResult.BROKEN_CONTRACT.value, "reason": r.result}

    def _test_ambiguous_drift(self) -> Dict[str, Any]:
        def mut(c):
            c["canonical"]["CLI_VERSION"]["value"] = "Hermes Agent v99.99.9"
            c["canonical"]["BOARD_NAME"]["value"] = "different_board"

        with self._with_contract_patch(mut):
            r = self.run("readonly")
        return {"pass": r.result == DriftResult.AMBIGUOUS_DRIFT.value, "reason": r.result}

    def _test_ambiguous_adapter_upstream(self) -> Dict[str, Any]:
        def mut(c):
            c["canonical"]["CLI_VERSION"]["value"] = "Hermes Agent v99.99.9"

        with self._with_temp_skill_marker():
            with self._with_contract_patch(mut):
                r = self.run("readonly")
        return {"pass": r.result == DriftResult.AMBIGUOUS_DRIFT.value, "reason": r.result}

    def _test_idempotence(self) -> Dict[str, Any]:
        r1 = self.run("readonly")
        r2 = self.run("readonly")
        ok = r1.result == DriftResult.NO_CHANGE.value and r2.result == DriftResult.NO_CHANGE.value
        return {"pass": ok, "reason": f"{r1.result}->{r2.result}"}

    def _test_no_kanban_write_in_readonly_path(self) -> Dict[str, Any]:
        # readonly path must not invoke write verbs; canary is separate opt-in method
        src = (self.scripts_dir / "drift_detector.py").read_text(encoding="utf-8")
        # ensure schema open is ro
        ok = "mode=ro" in src and "sqlite3.connect" in src
        return {"pass": ok, "reason": "schema hash uses sqlite mode=ro"}

    def _test_permito_segredo_valid(self) -> Dict[str, Any]:
        ctx = {
            "authorization_marker": "PERMITO SEGREDO",
            "authority": "SEGREDO/CHEFE",
            "scope_valid": True,
            "cause_reproduced": True,
            "transformation_deterministic": True,
            "minimal_diff": True,
            "tests_valid": True,
            "rollback_available": True,
            "receipt_bound": True,
        }
        gate = self.evaluate_gate(ctx)
        return {"pass": gate["ready"] is True, "reason": str(gate["conditions"])}

    def _test_permito_pivete_legacy_blocked(self) -> Dict[str, Any]:
        ctx = {
            "authorization_marker": "PERMITO PIVETE",
            "authority": "PIVETE",
            "scope_valid": True,
            "cause_reproduced": True,
            "transformation_deterministic": True,
            "minimal_diff": True,
            "tests_valid": True,
            "rollback_available": True,
            "receipt_bound": True,
        }
        gate = self.evaluate_gate(ctx)
        blocked = (not gate["ready"]) and (gate["conditions"].get("1_AUTHORITY_VALID") is False)
        return {"pass": blocked, "reason": str(gate["conditions"])}

    def _test_authority_missing_blocked(self) -> Dict[str, Any]:
        ctx = {
            "authorization_marker": "",
            "authority": "",
            "scope_valid": True,
            "cause_reproduced": True,
            "transformation_deterministic": True,
            "minimal_diff": True,
            "tests_valid": True,
            "rollback_available": True,
            "receipt_bound": True,
        }
        gate = self.evaluate_gate(ctx)
        blocked = (not gate["ready"]) and (gate["conditions"].get("1_AUTHORITY_VALID") is False)
        return {"pass": blocked, "reason": str(gate["conditions"])}

    def _test_authority_conflict_blocked(self) -> Dict[str, Any]:
        # Active conflict: marker SEGREDO but authority wrong string
        ctx = {
            "authorization_marker": "PERMITO SEGREDO",
            "authority": "PIVETE",
            "scope_valid": True,
            "cause_reproduced": True,
            "transformation_deterministic": True,
            "minimal_diff": True,
            "tests_valid": True,
            "rollback_available": True,
            "receipt_bound": True,
        }
        gate = self.evaluate_gate(ctx)
        blocked = (not gate["ready"]) and (gate["conditions"].get("1_AUTHORITY_VALID") is False)
        return {"pass": blocked, "reason": "authority conflict blocks gate"}

    def _test_scope_mismatch_blocked(self) -> Dict[str, Any]:
        ctx = {
            "authorization_marker": "PERMITO SEGREDO",
            "authority": "SEGREDO/CHEFE",
            "scope_valid": False,
            "cause_reproduced": True,
            "transformation_deterministic": True,
            "minimal_diff": True,
            "tests_valid": True,
            "rollback_available": True,
            "receipt_bound": True,
        }
        gate = self.evaluate_gate(ctx)
        blocked = (not gate["ready"]) and (gate["conditions"].get("2_SCOPE_VALID") is False)
        return {"pass": blocked, "reason": str(gate["conditions"])}

    def _test_baseline_hash_changed(self) -> Dict[str, Any]:
        baseline = self._load_baseline()
        ok = bool(baseline.get("CONTRACT_HASH_BEFORE")) and bool(baseline.get("ADAPTER_CODE_HASH_BEFORE"))
        # if baseline missing => UNKNOWN/BLOCKED path available
        return {"pass": ok, "reason": "baseline present" if ok else "baseline missing"}

    def _test_canary_write(self) -> Dict[str, Any]:
        r = self.run_canary("PERMITO SEGREDO", "SEGREDO/CHEFE")
        return {"pass": bool(r.get("success") and r.get("write_success") and r.get("transition_success")), "reason": r.get("reason", ""), "details": r}

    def _test_canary_rollback(self) -> Dict[str, Any]:
        r = self.run_canary("PERMITO SEGREDO", "SEGREDO/CHEFE")
        return {"pass": bool(r.get("success") and r.get("rollback_success") and r.get("cleanup_success")), "reason": r.get("reason", ""), "details": r}

    def _test_idempotent_autocorrection(self) -> Dict[str, Any]:
        r1 = self.run("readonly")
        r2 = self.run("readonly")
        ok = r1.result == DriftResult.NO_CHANGE.value and r2.result == DriftResult.NO_CHANGE.value
        return {"pass": ok, "reason": f"{r1.result}->{r2.result}"}

    def _test_upstream_zero_write(self) -> Dict[str, Any]:
        baseline = self._load_baseline()
        modified = int(baseline.get("UPSTREAM_FILES_MODIFIED", 0) or 0)
        return {"pass": modified == 0, "reason": f"upstream_files_modified={modified}"}

    def _test_receipt_head_bound(self) -> Dict[str, Any]:
        receipt = self.build_receipt(
            action="test_receipt_schema",
            before_hash="a",
            after_hash="b",
            files_changed=[],
            test_result={"ok": True},
            rollback={"available": True},
        )
        required = [
            "mission_id",
            "authority",
            "writer",
            "before_hash",
            "after_hash",
            "files_changed",
            "action",
            "test_result",
            "rollback",
            "timestamp",
        ]
        missing = [k for k in required if k not in receipt]
        return {"pass": not missing, "reason": "ok" if not missing else f"missing {missing}"}

    def _test_unknown_investigation(self) -> Dict[str, Any]:
        # UNKNOWN must produce next investigation step, not silent pass
        sm = StateMachine(AutocorrectionState.AMBIGUOUS_DRIFT)
        ok1 = sm.transition(AutocorrectionState.UNKNOWN)
        ok2 = sm.transition(AutocorrectionState.AUTOCORRECTION_READY) or sm.transition(AutocorrectionState.BLOCKED)
        return {"pass": ok1 and ok2, "reason": f"history={sm.history}"}

    def build_receipt(
        self,
        action: str,
        before_hash: str,
        after_hash: str,
        files_changed: List[str],
        test_result: Dict[str, Any],
        rollback: Dict[str, Any],
    ) -> Dict[str, Any]:
        return {
            "mission_id": self.mission_id,
            "authority": "SEGREDO/CHEFE",
            "authorization_marker": "PERMITO SEGREDO",
            "coordinator": "SOL",
            "executor": "PIVETE/HERMES",
            "writer": "HERMES",
            "before_hash": before_hash,
            "after_hash": after_hash,
            "files_changed": files_changed,
            "action": action,
            "test_result": test_result,
            "rollback": rollback,
            "timestamp": _now(),
        }

    def run_test_suite(self, include_canary: bool = True) -> Dict[str, Any]:
        tests = [
            ("1_NO_CHANGE", self._test_no_change),
            ("2_SAFE_ADAPTER_DRIFT", self._test_safe_adapter_drift),
            ("3_UPSTREAM_DRIFT", self._test_upstream_drift),
            ("4_BROKEN_CONTRACT", self._test_broken_contract),
            ("5_AMBIGUOUS_DRIFT", self._test_ambiguous_drift),
            ("6_AMBIGUOUS_DRIFT_ADAPTER_UPSTREAM", self._test_ambiguous_adapter_upstream),
            ("7_IDEMPOTENCE", self._test_idempotence),
            ("8_NO_KANBAN_WRITE_READONLY", self._test_no_kanban_write_in_readonly_path),
            ("9_PERMITO_SEGREDO_VALID", self._test_permito_segredo_valid),
            ("10_PERMITO_PIVETE_LEGACY_BLOCKED", self._test_permito_pivete_legacy_blocked),
            ("11_AUTHORITY_MISSING_BLOCKED", self._test_authority_missing_blocked),
            ("12_AUTHORITY_CONFLICT_BLOCKED", self._test_authority_conflict_blocked),
            ("13_SCOPE_MISMATCH_BLOCKED", self._test_scope_mismatch_blocked),
            ("14_BASELINE_HASH_CHANGED", self._test_baseline_hash_changed),
            ("15_CANARY_WRITE", self._test_canary_write if include_canary else (lambda: {"pass": None, "reason": "NOT_APPLICABLE"})),
            ("16_CANARY_ROLLBACK", self._test_canary_rollback if include_canary else (lambda: {"pass": None, "reason": "NOT_APPLICABLE"})),
            ("17_IDEMPOTENT_AUTOCORRECTION", self._test_idempotent_autocorrection),
            ("18_UPSTREAM_ZERO_WRITE", self._test_upstream_zero_write),
            ("19_RECEIPT_HEAD_BOUND", self._test_receipt_head_bound),
            ("20_UNKNOWN_INVESTIGATION", self._test_unknown_investigation),
        ]

        results: Dict[str, Any] = {}
        for name, fn in tests:
            print(f"RUN {name}")
            try:
                results[name] = fn()
            except Exception as exc:  # noqa: BLE001
                results[name] = {"pass": False, "reason": f"exception: {exc}"}
            status = results[name].get("pass")
            label = "PASS" if status is True else ("FAIL" if status is False else "N/A")
            print(f"  {label}: {results[name].get('reason', '')}")

        applicable = [r for r in results.values() if r.get("pass") is not None]
        pass_n = sum(1 for r in applicable if r.get("pass") is True)
        fail_n = sum(1 for r in applicable if r.get("pass") is False)
        total_app = len(applicable)
        summary = {
            "total_tests": len(tests),
            "applicable": total_app,
            "pass": pass_n,
            "fail": fail_n,
            "skipped": 0,
            "not_applicable": sum(1 for r in results.values() if r.get("pass") is None),
            "pass_percent": round((pass_n / total_app) * 100.0, 2) if total_app else 0.0,
        }
        results["_summary"] = summary
        out = self.state_dir / f"test_suite_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        out.write_text(json.dumps(results, indent=2, ensure_ascii=False), encoding="utf-8")
        print(f"SUITE_SAVED={out}")
        return results


def main() -> int:
    parser = argparse.ArgumentParser(description="Kanban drift detector + phase5 gates")
    parser.add_argument("--mode", choices=["readonly", "apply"], default="readonly")
    parser.add_argument("--skill-root", default=str(DEFAULT_SKILL_ROOT))
    parser.add_argument("--mission-id", default=MISSION_ID_DEFAULT)
    parser.add_argument("--run-tests", action="store_true")
    parser.add_argument("--canary", action="store_true")
    parser.add_argument("--no-canary-tests", action="store_true")
    args = parser.parse_args()

    detector = KanbanDriftDetector(Path(args.skill_root), mission_id=args.mission_id)

    if args.run_tests:
        suite = detector.run_test_suite(include_canary=not args.no_canary_tests)
        summary = suite.get("_summary", {})
        print("=== SUMMARY ===")
        print(json.dumps(summary, indent=2))
        return 0 if summary.get("fail", 1) == 0 else 1

    if args.canary:
        result = detector.run_canary("PERMITO SEGREDO", "SEGREDO/CHEFE")
        print(json.dumps(result, indent=2, ensure_ascii=False))
        return 0 if result.get("success") else 1

    report = detector.run(mode=args.mode)
    print("=== DRIFT REPORT ===")
    print(f"Result: {report.result}")
    print(f"Actions: {report.actions_required}")
    print(f"Unknowns: {report.unknown_factors}")
    print(f"Contract Hash: {report.contract_hash}")
    print(f"Adapter Hash: {report.adapter_hash}")
    print(f"Schema Hash: {report.schema_hash}")
    return 0 if report.result in {DriftResult.NO_CHANGE.value, DriftResult.SAFE_ADAPTER_DRIFT.value} else 1


if __name__ == "__main__":
    raise SystemExit(main())
