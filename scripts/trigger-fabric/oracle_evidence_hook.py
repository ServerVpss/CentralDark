#!/usr/bin/env python3
"""CentralDark Oracle query/evidence hook.

Pure adapter for the existing Trigger Fabric and Evidence Envelope.
No network, no credential handling, no new store.
"""

from __future__ import annotations

import argparse
import json
import sys
from datetime import datetime, timezone
from typing import Any

CANONICAL_PREFIX = "!CENTRALDARK #ACORDAR !CALIBRAR !MULTIBUSSOLA"
REQUIRED_CAUSAL_FIELDS = ("intent_id", "event_id", "causation_id", "surface_id", "attempt_id")


def _first(data: dict[str, Any], *names: str, default: Any = None) -> Any:
    for name in names:
        value = data.get(name)
        if value is not None and value != "":
            return value
    return default


def _text(value: Any, limit: int = 500) -> str:
    return str(value or "").strip()[:limit]


def _compact(data: dict[str, Any]) -> dict[str, Any]:
    return {key: value for key, value in data.items() if value not in (None, "", [], {})}


def normalize_input(raw: dict[str, Any]) -> dict[str, Any]:
    normalized = dict(raw)
    for field in REQUIRED_CAUSAL_FIELDS:
        normalized[field] = _first(raw, field, field.upper())
    missing = [field for field in REQUIRED_CAUSAL_FIELDS if not _text(normalized.get(field))]
    if missing:
        raise ValueError("ORACLE_CAUSAL_FIELDS_MISSING:" + ",".join(missing))
    return normalized


def build_oracle_query(raw: dict[str, Any]) -> str:
    data = normalize_input(raw)
    question = _text(_first(data, "question", "prompt", default=""), 8000)
    if not question:
        raise ValueError("ORACLE_QUESTION_REQUIRED")
    return "\n".join([
        CANONICAL_PREFIX,
        f"INTENT_ID={_text(data['intent_id'], 160)}",
        f"EVENT_ID={_text(data['event_id'], 160)}",
        f"CAUSATION_ID={_text(data['causation_id'], 160)}",
        f"SURFACE_ID={_text(data['surface_id'], 160)}",
        f"ATTEMPT_ID={_text(data['attempt_id'], 160)}",
        "CANONICAL_FIRST=true",
        "Consulte os owners/docs CURRENT aplicáveis antes de concluir, se esta superfície tiver acesso.",
        "Se não tiver acesso ao canônico/runtime necessário, declare essa limitação em EVIDENCE_LIMIT.",
        "A resposta é CANDIDATE; não escreva estado canônico e não declare PASS de runtime sem Reality Judge.",
        "",
        question,
    ])


def build_evidence_event(raw: dict[str, Any]) -> dict[str, Any]:
    data = normalize_input(raw)
    observed_at = _text(
        _first(data, "observed_at", "timestamp", default=datetime.now(timezone.utc).isoformat()),
        80,
    )
    context = _compact({
        "capability": _text(_first(data, "capability", default="CHATGPT_PREVIEW_CURRENT_TAB_RESPONSE_CAPTURE"), 180),
        "response_state": _text(_first(data, "response_state", "RESPONSE_STATE"), 80),
        "candidate_claim": _text(_first(data, "candidate_claim", "CANDIDATE_CLAIM"), 1200),
        "evidence_limit": _text(_first(data, "evidence_limit", "EVIDENCE_LIMIT"), 800),
        "counterproof": _text(_first(data, "counterproof", "COUNTERPROOF"), 1200),
        "next_readonly_probe": _text(_first(data, "next_readonly_probe", "NEXT_READONLY_PROBE"), 800),
        "replay_marker": _text(_first(data, "replay_marker", "REPLAY_MARKER"), 160),
        "model_binding": _text(_first(data, "model_binding", "MODEL_BINDING"), 160),
        "effort_binding": _text(_first(data, "effort_binding", "EFFORT_BINDING"), 80),
        "input_mode": _text(_first(data, "input_mode", "INPUT_MODE"), 80),
        "available_controls": _first(data, "available_controls", "AVAILABLE_CONTROLS", default=[]),
        "missing_controls": _first(data, "missing_controls", "MISSING_CONTROLS", default=[]),
        "elapsed_to_first_visible_ms": _first(data, "elapsed_to_first_visible_ms", "ELAPSED_TO_FIRST_VISIBLE_MS"),
        "elapsed_to_complete_ms": _first(data, "elapsed_to_complete_ms", "ELAPSED_TO_COMPLETE_MS"),
        "timing_source": "PREVIEW_OBSERVED",
        "provider_backend_latency_claimed": False,
    })
    return {
        "event": _text(_first(data, "event", default="oracle_response_captured"), 160),
        "producer": "hermes-oracle-surface",
        "target": "CHAT_GLOBAL",
        "mission_id": _text(data["intent_id"], 160),
        "writer_scope": "read-only-oracle",
        "sha": _text(_first(data, "sha", default="UNKNOWN"), 80) or "UNKNOWN",
        "event_id": _text(data["event_id"], 160),
        "causation_id": _text(data["causation_id"], 160),
        "surface_id": _text(data["surface_id"], 160),
        "attempt_id": _text(data["attempt_id"], 160),
        "trace_id": _text(_first(data, "trace_id", "TRACE_ID"), 160) or None,
        "timestamp": observed_at,
        "result": _text(_first(data, "result", default="OBSERVED"), 80).upper() or "OBSERVED",
        "context": context,
    }


def build_agent_log_payload(raw: dict[str, Any]) -> dict[str, Any]:
    event = build_evidence_event(raw)
    return {
        "agent": "Hermes",
        "area": "Oracle/CHAT_GLOBAL",
        "acao": event["event"],
        "alvo": event["surface_id"],
        "status": "info",
        "events": [event],
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input")
    parser.add_argument("--mode", choices=("query", "evidence"), default="evidence")
    args = parser.parse_args()

    raw = json.loads(open(args.input, "r", encoding="utf-8").read()) if args.input else json.load(sys.stdin)
    try:
        if args.mode == "query":
            print(build_oracle_query(raw))
        else:
            print(json.dumps(build_agent_log_payload(raw), ensure_ascii=False, indent=2))
        return 0
    except ValueError as exc:
        print(json.dumps({"status": "INVALID", "error": str(exc)}, ensure_ascii=False))
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
