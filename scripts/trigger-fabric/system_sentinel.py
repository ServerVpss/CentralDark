#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import subprocess
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[2]
STITCHER = ROOT / "scripts/trigger-fabric/stitch_all_notes.py"
CONTRACT = ROOT / "docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/SYSTEM-SENTINEL.yml"
STATE_PATH = ROOT / ".artifacts/system-sentinel/state.json"
EVENT_LOG = ROOT / ".artifacts/system-sentinel/events.jsonl"
DEFAULT_INTERVAL = 5.0
SEAL = "🧿"
NOTE_SEAL = "🪡🧿"
FIXED_ROUTE = [
    "INTENT",
    "CONTRACT_CURRENT",
    "SENSOR",
    "T0",
    "CURRENT_STATE",
    "EXISTING_OWNER",
    "COUNTERPROOF",
    "PROBES",
    "RECONCILIATION",
    "T1",
    "REALITY_JUDGE",
    "HUD",
    "NEXT_CURSOR",
]
FIXED_ROUTE_IDENTITY_FIELDS = (
    "target",
    "owner",
    "inputs_hash",
    "config_hash",
    "head_or_artifact_hash",
    "security_boundary",
)
FIXED_ROUTE_API_EVENT = "centraldark_sentinel_route"

TRIGGER_SEALS = {
    "TOOL_ERROR": "🛠️",
    "TEST_FAILURE": "🧪",
    "CI_RUNNER_ROUTE_FAILURE": "🏗️",
    "CONTRADICTION_FOUND": "⚔️",
    "POST_MUTATION": "🔁",
    "RUNTIME_DRIFT": "🛰️",
    "ANY_PR_OR_COMMIT": "🌿",
    "STATE_CHANGED": "🔄",
    "WRITER_CONFLICT": "✍️",
    "BOUNDARY_TOUCHED": "🧱",
    "MATERIAL_UNKNOWN_AFFECTS_MUTATION": "🟡",
    "PROOF_TARGET_MISMATCH": "🎯",
    "EVIDENCE_CONFLICT": "⚖️",
    "MODEL_UNAVAILABLE": "🧠",
    "DEPENDENCY_FAILURE": "🧩",
    "META_LUPA": "⊛",
    "CARACOL_REVERSO": "🐚",
    "RECONCILIAR": "🪡",
    "FAILOVER_ALLOWED_ROUTE": "🔀",
    "RETEST": "🧪",
}

ERROR_SIGNATURES = [
    ("PROVIDER_SPENDING_LIMIT", re.compile(r"personal-team-blocked:spending-limit|run out of credits|need a Grok subscription|out of credits", re.I)),
    ("MODEL_EXPIRED", re.compile(r"free period has ended|select a different model|model(?:\s+is)?\s+expired|free(?:\s+access|\s+period).*ended", re.I)),
    ("MISSING_PROVIDER_KEY", re.compile(r"missing environment variable\s*:\s*`?[A-Z0-9_]+_API_KEY`?|[A-Z0-9_]+_API_KEY.*(?:missing|ausente|not configured)", re.I)),
    ("HOUSE_PATH_DRIFT", re.compile(r"(?:^|[\s'\"])(?:C:\\\\CentralDark|C:\\CentralDark)(?:\\|/|$)", re.I)),
    ("SURFACE_ROUTE_DRIFT", re.compile(r"bypass.*omni|direct provider|provider.*direct|route.*outside.*omni", re.I)),
    ("HTTP_403", re.compile(r"HTTP\s*403|request was blocked|forbidden", re.I)),
    ("PYTHON_LOCK_RELEASE", re.compile(r"cannot release un-acquired lock", re.I)),
    ("TOOL_PROTOCOL_LEAK", re.compile(r"<longcat_tool_call>|<longcat_arg_key>|<longcat_arg_value>", re.I)),
    ("PROVIDER_RATE_LIMIT", re.compile(r"\b429\b|rate.?limit", re.I)),
    ("PROVIDER_TIMEOUT", re.compile(r"timeout|timed out", re.I)),
    ("PROVIDER_5XX", re.compile(r"\b5\d\d\b|temporarily unavailable", re.I)),
    ("MODEL_UNAVAILABLE", re.compile(r"model unavailable|model.*not found|unsupported model", re.I)),
    ("AUTH_CONFIG_ERROR", re.compile(r"\b401\b|auth error|token not configured|api key.*not configured|config error", re.I)),
]

TRIGGER_ROUTE = {
    "PROVIDER_SPENDING_LIMIT": ["MODEL_UNAVAILABLE", "MARK_ROUTE_BROKEN", "MEASURE_ALTERNATIVE_ENGINE_CAPABILITY", "FAILOVER_ALLOWED_ROUTE", "RETEST"],
    "MODEL_EXPIRED": ["MODEL_UNAVAILABLE", "REFRESH_MODEL_CATALOG", "MARK_ROUTE_BROKEN", "MEASURE_ALTERNATIVE_ENGINE_CAPABILITY", "FAILOVER_ALLOWED_ROUTE", "RETEST"],
    "MISSING_PROVIDER_KEY": ["DEPENDENCY_FAILURE", "MARK_OPTIONAL_ROUTE_UNCONFIGURED", "SURFACE_ROUTE_DRIFT_CHECK", "TRY_NEXT_PROVEN_ALLOWED_ROUTE", "RETEST"],
    "HOUSE_PATH_DRIFT": ["STATE_CHANGED", "META_LUPA", "CLASSIFY_HOUSE_VS_EXTERNAL_DEPENDENCY", "CARACOL_REVERSO", "RECONCILIAR"],
    "SURFACE_ROUTE_DRIFT": ["EVIDENCE_CONFLICT", "META_LUPA", "RESOLVE_SINGLE_ROUTER_ENTRYPOINT", "CARACOL_REVERSO", "RECONCILIAR"],
    "HTTP_403": ["META_LUPA", "IDENTIFY_BLOCKING_LAYER", "RECONCILIAR"],
    "PYTHON_LOCK_RELEASE": ["META_LUPA", "OWNER_RUNTIME", "MINIMAL_REMEDIATION", "RETEST"],
    "TOOL_PROTOCOL_LEAK": ["BOUNDARY_TOUCHED", "SANITIZE_RENDER_PATH", "RETEST"],
    "PROVIDER_RATE_LIMIT": ["MODEL_UNAVAILABLE", "MEASURE_ALTERNATIVE_ENGINE_CAPABILITY", "FAILOVER_ALLOWED_ROUTE", "RETEST"],
    "PROVIDER_TIMEOUT": ["MODEL_UNAVAILABLE", "MEASURE_ALTERNATIVE_ENGINE_CAPABILITY", "FAILOVER_ALLOWED_ROUTE", "RETEST"],
    "PROVIDER_5XX": ["MODEL_UNAVAILABLE", "MEASURE_ALTERNATIVE_ENGINE_CAPABILITY", "FAILOVER_ALLOWED_ROUTE", "RETEST"],
    "MODEL_UNAVAILABLE": ["MODEL_UNAVAILABLE", "MEASURE_ALTERNATIVE_ENGINE_CAPABILITY", "FAILOVER_ALLOWED_ROUTE", "RETEST"],
    "AUTH_CONFIG_ERROR": ["DEPENDENCY_FAILURE", "MARK_ROUTE_BROKEN", "TRY_NEXT_PROVEN_ALLOWED_ROUTE"],
    "UNKNOWN_ERROR": ["TOOL_ERROR", "META_LUPA", "RECONCILIAR"],
    "NOTE_OUT_OF_LINE": ["STATE_CHANGED", "META_LUPA", "CARACOL_REVERSO", "RECONCILIAR"],
}


def now_utc() -> str:
    return datetime.now(timezone.utc).isoformat()


def sha256_text(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8", errors="replace")).hexdigest()


def atomic_write_json(path: Path, data: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(path.suffix + ".tmp")
    tmp.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    os.replace(tmp, path)


def load_state() -> dict[str, Any]:
    try:
        return json.loads(STATE_PATH.read_text(encoding="utf-8"))
    except Exception:
        return {"schema": "centraldark.system-sentinel-state.v1", "notes": {}, "last_cursor": None}


def append_event(event: dict[str, Any]) -> None:
    EVENT_LOG.parent.mkdir(parents=True, exist_ok=True)
    with EVENT_LOG.open("a", encoding="utf-8") as fh:
        fh.write(json.dumps(event, ensure_ascii=False) + "\n")


def classify_signature(text: str) -> str:
    for name, pattern in ERROR_SIGNATURES:
        if pattern.search(text or ""):
            return name
    return "UNKNOWN_ERROR"


def route_seals(route: list[str]) -> list[dict[str, str]]:
    return [{"trigger": trigger, "seal": TRIGGER_SEALS.get(trigger, "•")} for trigger in route]


def normalize_event(raw: dict[str, Any]) -> dict[str, Any]:
    error_text = str(raw.get("error_text") or raw.get("message") or raw.get("detail") or "")
    signature = str(raw.get("signature") or classify_signature(error_text))
    state = str(raw.get("state") or "FAILURE").upper()
    source_surface = str(raw.get("source_surface") or raw.get("surface") or "UNKNOWN")
    route = TRIGGER_ROUTE.get(signature, TRIGGER_ROUTE["UNKNOWN_ERROR"])
    event = {
        "schema": "centraldark.sentinel-event.v1",
        "seal": SEAL,
        "observed_at": raw.get("observed_at") or now_utc(),
        "source_surface": source_surface,
        "event_class": str(raw.get("event_class") or "OPERATIONAL_ERROR"),
        "signature": signature,
        "state": state,
        "evidence_ref": raw.get("evidence_ref") or f"sha256:{sha256_text(error_text or json.dumps(raw, sort_keys=True, ensure_ascii=False))}",
        "goal_ref": raw.get("goal_ref") or os.getenv("CENTRALDARK_GOAL_REF") or "UNKNOWN",
        "last_proven_cursor": raw.get("last_proven_cursor") or os.getenv("CENTRALDARK_LAST_PROVEN_CURSOR") or "UNKNOWN",
        "owner": raw.get("owner") or "EXISTING_OWNER_REQUIRED",
        "route": route,
        "route_seals": route_seals(route),
        "caracol_reverse": True,
        "invalidate_dependent_claims_only": True,
        "preserve_independent_proofs": True,
        "auto_mutation_authority": False,
    }
    for key in (
        "app_name", "window_name", "process_name", "url_or_route", "repo", "branch", "head_sha",
        "provider", "model", "http_status", "frame_id", "note_path", "note_sha256",
    ):
        if raw.get(key) is not None:
            event[key] = raw[key]
    if error_text:
        event["error_text_sanitized"] = error_text[:2000]
    return event


def fixed_route_identity(raw: dict[str, Any]) -> tuple[dict[str, str], list[str]]:
    identity = {
        "target": str(raw.get("target") or "").strip(),
        "owner": str(raw.get("owner") or "").strip(),
        "inputs_hash": str(raw.get("inputs_hash") or "").strip(),
        "config_hash": str(raw.get("config_hash") or "").strip(),
        "head_or_artifact_hash": str(raw.get("head_sha") or raw.get("artifact_hash") or "").strip(),
        "security_boundary": str(raw.get("security_boundary") or "").strip(),
    }
    missing = [key for key in FIXED_ROUTE_IDENTITY_FIELDS if not identity.get(key)]
    return identity, missing


def build_fixed_route_receipt(
    raw: dict[str, Any],
    *,
    state: dict[str, Any] | None = None,
    persist: bool = True,
) -> dict[str, Any]:
    current_state = state if isinstance(state, dict) else load_state()
    identity, missing = fixed_route_identity(raw)
    fingerprint = None if missing else sha256_text(
        json.dumps(identity, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
    )
    previous = current_state.get("fixed_route") if isinstance(current_state.get("fixed_route"), dict) else {}
    previous_fingerprint = previous.get("dependency_fingerprint")
    requested_state = str(raw.get("state") or "STATE_CHANGED").upper()
    local_fixed_point = requested_state in {"FIXED_POINT", "FIXED_POINT_LOCAL", "PASS"}
    proof_ready = bool(
        local_fixed_point
        and fingerprint
        and str(raw.get("counterproof") or "").upper() == "PASS"
        and str(raw.get("reality_judge") or "").upper() == "PASS"
        and raw.get("t0")
        and raw.get("t1")
        and raw.get("evidence_ref")
    )

    if missing:
        decision = "RUN_DETERMINISTIC_ROUTE"
        reason = "FINGERPRINT_INCOMPLETE"
    elif previous_fingerprint == fingerprint and previous.get("proof_state") == "PROVEN":
        decision = "REUSE_PROOF_NO_REPEAT"
        reason = "UNCHANGED_DEPENDENCY_FINGERPRINT"
    elif previous_fingerprint and previous_fingerprint != fingerprint:
        decision = "REVALIDATE_AFFECTED_CHAIN_ONLY"
        reason = "DEPENDENCY_FINGERPRINT_CHANGED"
    elif proof_ready:
        decision = "FIXED_POINT_SEALED"
        reason = "COUNTERPROOF_AND_REALITY_JUDGE_PASS"
    else:
        decision = "RUN_DETERMINISTIC_ROUTE"
        reason = "NO_REUSABLE_FIXED_POINT"

    receipt = {
        "schema": "centraldark.sentinel-fixed-route.v1",
        "seal": SEAL,
        "api_transport": "GITHUB_REPOSITORY_DISPATCH",
        "api_event": FIXED_ROUTE_API_EVENT,
        "route": FIXED_ROUTE,
        "route_is_deterministic": True,
        "route_is_authority": False,
        "same_fingerprint_no_full_replay": True,
        "minimal_liveness_remeasure_still_required": True,
        "dependency_fingerprint": fingerprint,
        "fingerprint_identity": identity,
        "fingerprint_missing": missing,
        "proof_state": "PROVEN" if proof_ready else ("REUSED" if decision == "REUSE_PROOF_NO_REPEAT" else "NOT_PROVEN"),
        "decision": decision,
        "reason": reason,
        "source_surface": str(raw.get("source_surface") or "UNKNOWN"),
        "event_class": str(raw.get("event_class") or "STATE_CHANGED"),
        "evidence_ref": raw.get("evidence_ref"),
        "next_cursor": raw.get("next_cursor") or "REMEASURE_CURRENT_STATE",
        "fixed_point_scope": str(raw.get("fixed_point_scope") or "SENTINEL_ROUTE_LOCAL"),
        "auto_mutation_authority": False,
        "unknown_is_pass": False,
    }

    if persist:
        current_state["updated_at"] = now_utc()
        current_state["last_route_receipt"] = receipt
        if proof_ready:
            current_state["fixed_route"] = {
                "proof_state": "PROVEN",
                "dependency_fingerprint": fingerprint,
                "identity": identity,
                "evidence_ref": raw.get("evidence_ref"),
                "next_cursor": receipt["next_cursor"],
                "sealed_at": now_utc(),
            }
        atomic_write_json(STATE_PATH, current_state)
    return receipt


def run_stitch_inventory() -> dict[str, Any]:
    proc = subprocess.run(
        [sys.executable, str(STITCHER), "--inventory"],
        cwd=ROOT,
        capture_output=True,
        text=True,
        check=False,
    )
    if proc.returncode != 0:
        raise RuntimeError(f"STITCHER_FAILED:{proc.stderr.strip() or proc.stdout.strip()}")
    return json.loads(proc.stdout)


def note_map(inventory: dict[str, Any]) -> dict[str, str]:
    return {str(item["path"]): str(item["sha256"]) for item in inventory.get("notes", [])}


def diff_notes(previous: dict[str, str], current: dict[str, str]) -> list[dict[str, Any]]:
    events: list[dict[str, Any]] = []
    all_paths = sorted(set(previous) | set(current))
    for path in all_paths:
        before = previous.get(path)
        after = current.get(path)
        if before == after:
            continue
        change = "CHANGED"
        if before is None:
            change = "ADDED"
        elif after is None:
            change = "DELETED"
        events.append(normalize_event({
            "source_surface": "SECOND_BRAIN_NOTES",
            "event_class": "NOTE_ALIGNMENT_DRIFT",
            "signature": "NOTE_OUT_OF_LINE",
            "state": "FAILURE",
            "note_path": path,
            "note_sha256": after or before,
            "error_text": f"{change}:{path}:{before or 'NONE'}->{after or 'NONE'}",
            "evidence_ref": f"note:{path}:{after or before}",
        }))
    return events


def scan_notes_once() -> dict[str, Any]:
    state = load_state()
    inventory = run_stitch_inventory()
    current = note_map(inventory)
    previous = state.get("notes") or {}
    events = diff_notes(previous, current) if previous else []
    for event in events:
        append_event(event)
    state.update({
        "schema": "centraldark.system-sentinel-state.v1",
        "updated_at": now_utc(),
        "notes": current,
        "note_count": len(current),
        "last_note_delta_count": len(events),
        "last_cursor": events[-1]["evidence_ref"] if events else state.get("last_cursor"),
    })
    atomic_write_json(STATE_PATH, state)
    return {
        "ok": True,
        "seal": NOTE_SEAL,
        "note_count": len(current),
        "delta_count": len(events),
        "events": events,
    }


def ingest_event_json(payload: str) -> dict[str, Any]:
    raw = json.loads(payload)
    if not isinstance(raw, dict):
        raise ValueError("EVENT_JSON_MUST_BE_OBJECT")
    event = normalize_event(raw)
    append_event(event)
    state = load_state()
    state["updated_at"] = now_utc()
    state["last_cursor"] = event["evidence_ref"]
    atomic_write_json(STATE_PATH, state)
    return {"ok": True, "event": event}


def self_test() -> int:
    cases = {
        "403": classify_signature("HTTP 403: Your request was blocked") == "HTTP_403",
        "spending_limit": classify_signature('HTTP 403: {"code":"personal-team-blocked:spending-limit","error":"You have run out of credits"}') == "PROVIDER_SPENDING_LIMIT",
        "model_expired": classify_signature('nous_http_404:{"status":404,"message":"This model free period has ended. Please select a different model to continue!"}') == "MODEL_EXPIRED",
        "missing_provider_key": classify_signature("Missing environment variable: `ABACUS_API_KEY`") == "MISSING_PROVIDER_KEY",
        "house_path_drift": classify_signature(r"owner ainda aponta C:\CentralDark\Pivete") == "HOUSE_PATH_DRIFT",
        "surface_route_drift": classify_signature("direct provider bypass Omni Router") == "SURFACE_ROUTE_DRIFT",
        "lock": classify_signature("RuntimeError: cannot release un-acquired lock") == "PYTHON_LOCK_RELEASE",
        "tool_leak": classify_signature("<longcat_tool_call>vision_analyze") == "TOOL_PROTOCOL_LEAK",
        "rate_limit": classify_signature("429 rate limit") == "PROVIDER_RATE_LIMIT",
        "timeout": classify_signature("request timeout") == "PROVIDER_TIMEOUT",
        "unknown": classify_signature("weird local failure") == "UNKNOWN_ERROR",
    }
    sample = normalize_event({"source_surface": "SOL_APP", "message": "HTTP 403: Your request was blocked"})
    expired = normalize_event({"source_surface": "SOL_APP", "message": "This model free period has ended"})
    cases["caracol"] = sample["caracol_reverse"] is True and sample["route"][0] == "META_LUPA"
    cases["sealed_route"] = bool(expired["route_seals"]) and expired["route_seals"][0]["seal"] == "🧠"
    cases["no_auto_authority"] = sample["auto_mutation_authority"] is False
    cases["contract_exists"] = CONTRACT.exists()
    cases["stitcher_exists"] = STITCHER.exists()
    route_base = {
        "source_surface": "SELF_TEST",
        "event_class": "FIXED_POINT",
        "state": "FIXED_POINT_LOCAL",
        "target": "CENTRALDARK_SENTINELA",
        "owner": "scripts/sentinela/run.mjs",
        "inputs_hash": "a" * 64,
        "config_hash": "b" * 64,
        "head_sha": "c" * 40,
        "security_boundary": "SELF_HOSTED_READ_ONLY",
        "counterproof": "PASS",
        "reality_judge": "PASS",
        "t0": "2026-09-24T00:00:00Z",
        "t1": "2026-09-24T00:00:01Z",
        "evidence_ref": "sha256:" + ("d" * 64),
        "next_cursor": "WAIT_FOR_MATERIAL_DELTA",
    }
    sealed = build_fixed_route_receipt(route_base, state={}, persist=False)
    reused = build_fixed_route_receipt(
        {**route_base, "state": "STATE_CHANGED"},
        state={
            "fixed_route": {
                "proof_state": "PROVEN",
                "dependency_fingerprint": sealed["dependency_fingerprint"],
            }
        },
        persist=False,
    )
    changed = build_fixed_route_receipt(
        {**route_base, "inputs_hash": "e" * 64, "state": "STATE_CHANGED"},
        state={
            "fixed_route": {
                "proof_state": "PROVEN",
                "dependency_fingerprint": sealed["dependency_fingerprint"],
            }
        },
        persist=False,
    )
    cases["fixed_route_order"] = sealed["route"] == FIXED_ROUTE
    cases["fixed_point_seals"] = sealed["decision"] == "FIXED_POINT_SEALED" and sealed["proof_state"] == "PROVEN"
    cases["same_fingerprint_reuses"] = reused["decision"] == "REUSE_PROOF_NO_REPEAT"
    cases["changed_fingerprint_revalidates"] = changed["decision"] == "REVALIDATE_AFFECTED_CHAIN_ONLY"
    failed = [name for name, ok in cases.items() if not ok]
    print(json.dumps({"ok": not failed, "checks": cases, "failed": failed}, ensure_ascii=False))
    return 1 if failed else 0


def main() -> int:
    parser = argparse.ArgumentParser(description="🧿 CentralDark system-wide alignment sentinel")
    parser.add_argument("--self-test", action="store_true")
    parser.add_argument("--scan-notes", action="store_true")
    parser.add_argument("--watch-notes", action="store_true")
    parser.add_argument("--interval", type=float, default=DEFAULT_INTERVAL)
    parser.add_argument("--event-json", type=str, default="")
    parser.add_argument("--route-json", type=str, default="")
    args = parser.parse_args()

    if args.self_test:
        return self_test()
    if args.event_json:
        print(json.dumps(ingest_event_json(args.event_json), ensure_ascii=False, indent=2))
        return 0
    if args.route_json:
        raw = json.loads(args.route_json)
        if not isinstance(raw, dict):
            raise ValueError("ROUTE_JSON_MUST_BE_OBJECT")
        print(json.dumps(build_fixed_route_receipt(raw), ensure_ascii=False, indent=2))
        return 0
    if args.scan_notes:
        print(json.dumps(scan_notes_once(), ensure_ascii=False, indent=2))
        return 0
    if args.watch_notes:
        while True:
            try:
                result = scan_notes_once()
                if result["delta_count"]:
                    print(json.dumps(result, ensure_ascii=False), flush=True)
            except KeyboardInterrupt:
                return 0
            except Exception as exc:
                event = normalize_event({
                    "source_surface": "SYSTEM_SENTINEL",
                    "event_class": "SENTINEL_ERROR",
                    "message": str(exc),
                })
                append_event(event)
                print(json.dumps({"ok": False, "event": event}, ensure_ascii=False), file=sys.stderr, flush=True)
            time.sleep(max(1.0, args.interval))
    parser.print_help()
    return 2


if __name__ == "__main__":
    raise SystemExit(main())