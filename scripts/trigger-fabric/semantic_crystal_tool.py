#!/usr/bin/env python3
"""CentralDark semantic crystal tool.

Deterministic helper for capability routing and fixed-point receipt validation.
It does not invent owners, authority, runtime availability, causality, or proof.
Those facts must be supplied as observed evidence.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Any

PASSES = [
    "FORWARD",
    "REVERSE",
    "TOP_DOWN",
    "BOTTOM_UP",
    "ROUND_TRIP",
    "TEMPORAL_T0_T1",
    "DEPENDENCY_BLAST_RADIUS",
    "ADVERSARIAL_FALSE_GREEN",
    "MINUS_IS_MORE_COMPRESSION",
    "FIXED_POINT_REMEASUREMENT",
]

LENSES = [
    "INTENT",
    "AUTHORITY",
    "IDENTITY_ROLE",
    "STATE",
    "CAPABILITY",
    "OWNER_CONSUMER",
    "SIGNAL_CAUSALITY",
    "TERRITORY_ROUTE",
    "MUTATION_WRITER",
    "PROOF_JUDGE",
    "CONTINUITY_RECEIPT",
    "LEARNING_CRYSTAL",
]

ALLOWED_CELL_STATUS = {"PASS", "SKIP_JUSTIFICADO", "FAIL", "UNKNOWN"}
PLACEHOLDERS = {"PENDING", "UNKNOWN", "NONE", "N/A", "TODO", "UNRESOLVED"}
SHA40 = re.compile(r"^[0-9a-fA-F]{40}$")


def _load_json(path: str) -> dict[str, Any]:
    if path == "-":
        return json.load(sys.stdin)
    return json.loads(Path(path).read_text(encoding="utf-8"))


def _emit(payload: dict[str, Any]) -> None:
    print(json.dumps(payload, ensure_ascii=False, sort_keys=True, indent=2))


def _missing(obj: dict[str, Any], fields: list[str]) -> list[str]:
    return [field for field in fields if obj.get(field) in (None, "")]


def _proven_ref(value: Any) -> bool:
    text = str(value or "").strip()
    return bool(text) and text.upper() not in PLACEHOLDERS


@dataclass(frozen=True)
class Provider:
    name: str
    owner: str
    capabilities: tuple[str, ...]
    territories: tuple[str, ...]
    available: Any
    authorized_scopes: tuple[str, ...]
    canonical_owner: bool
    evidence: str

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> "Provider":
        return cls(
            name=str(data.get("name", "")),
            owner=str(data.get("owner", "")),
            capabilities=tuple(map(str, data.get("capabilities", []))),
            territories=tuple(map(str, data.get("territories", []))),
            available=data.get("available", "unknown"),
            authorized_scopes=tuple(map(str, data.get("authorized_scopes", []))),
            canonical_owner=bool(data.get("canonical_owner", False)),
            evidence=str(data.get("evidence", "")),
        )


def route_capability(payload: dict[str, Any]) -> dict[str, Any]:
    request = payload.get("request") or {}
    required = [
        "intent",
        "target",
        "semantic_territory",
        "required_capability",
        "authority_scope",
        "mutation_scope",
        "proof_target",
    ]
    missing = _missing(request, required)
    if missing:
        return {"status": "INVALID_REQUEST", "missing": missing}

    providers = [Provider.from_dict(p) for p in payload.get("providers", [])]
    capability = str(request["required_capability"])
    territory = str(request["semantic_territory"])
    scope = str(request["authority_scope"])

    matching_capability = [p for p in providers if capability in p.capabilities or "*" in p.capabilities]
    matching_territory = [p for p in matching_capability if territory in p.territories or "*" in p.territories]
    canonical = [p for p in matching_territory if p.canonical_owner]
    authorized = [p for p in canonical if scope in p.authorized_scopes or "*" in p.authorized_scopes]
    evidenced = [p for p in authorized if _proven_ref(p.evidence)]
    available = [p for p in evidenced if p.available is True]
    unknown = [p for p in evidenced if p.available not in (True, False)]
    unevidenced = [p for p in authorized if not _proven_ref(p.evidence)]

    base = {
        "target": request["target"],
        "territory": territory,
        "required_capability": capability,
        "proof_target": request["proof_target"],
        "mutation_scope": request["mutation_scope"],
        "candidate_count": len(available),
    }

    if len(available) == 1:
        p = available[0]
        return {
            **base,
            "status": "ROUTED",
            "owner": p.owner,
            "provider": p.name,
            "evidence": p.evidence,
            "writer": "UNRESOLVED",
            "proof": "REQUIRED",
            "next_cursor": "ACQUIRE_WRITER_IF_MUTATION",
        }
    if len(available) > 1:
        return {
            **base,
            "status": "AMBIGUOUS",
            "providers": sorted(p.name for p in available),
            "reason": "MULTIPLE_AVAILABLE_CANONICAL_ROUTES",
            "next_cursor": "DISCRIMINATING_TEST",
        }
    if unknown:
        return {
            **base,
            "status": "UNKNOWN",
            "providers": sorted(p.name for p in unknown),
            "reason": "CAPABILITY_AVAILABILITY_NOT_PROVEN",
            "next_cursor": "MEASURE_CAPABILITY",
        }
    if unevidenced:
        return {
            **base,
            "status": "UNKNOWN",
            "providers": sorted(p.name for p in unevidenced),
            "reason": "CANONICAL_ROUTE_WITHOUT_EVIDENCE",
            "next_cursor": "COLLECT_PROVIDER_EVIDENCE",
        }
    return {
        **base,
        "status": "BLOCKED",
        "reason": "NO_PROVEN_CANONICAL_ROUTE",
        "next_cursor": "RECOVERY_OWNER_OR_HUMAN_FRONTIER",
    }


def validate_fixed_point(payload: dict[str, Any]) -> dict[str, Any]:
    cells = payload.get("cells") or []
    expected = {(p, l) for p in PASSES for l in LENSES}
    seen: dict[tuple[str, str], str] = {}
    invalid: list[dict[str, Any]] = []

    for cell in cells:
        key = (str(cell.get("pass", "")), str(cell.get("lens", "")))
        status = str(cell.get("status", ""))
        if key not in expected or status not in ALLOWED_CELL_STATUS or key in seen:
            invalid.append(cell)
            continue
        seen[key] = status

    missing = sorted([{"pass": p, "lens": l} for p, l in expected - set(seen)], key=lambda x: (x["pass"], x["lens"]))
    blockers = sorted(
        [{"pass": p, "lens": l, "status": status} for (p, l), status in seen.items() if status in {"FAIL", "UNKNOWN"}],
        key=lambda x: (x["pass"], x["lens"]),
    )

    meta_required = [
        "target",
        "head_sha",
        "writer",
        "judge",
        "final_remeasurement_ref",
        "external_judge_ref",
    ]
    missing_meta = _missing(payload, meta_required)
    bad_refs: list[str] = []
    for key in ("final_remeasurement_ref", "external_judge_ref"):
        if key not in missing_meta and not _proven_ref(payload.get(key)):
            bad_refs.append(key)
    if payload.get("head_sha") and not SHA40.fullmatch(str(payload.get("head_sha"))):
        bad_refs.append("head_sha")

    writer = str(payload.get("writer", "")).strip()
    judge = str(payload.get("judge", "")).strip()
    circular_judge = bool(writer and judge and writer == judge)
    new_information = payload.get("new_information")

    fixed = (
        not invalid
        and not missing
        and not blockers
        and not missing_meta
        and not bad_refs
        and not circular_judge
        and new_information is False
    )
    return {
        "status": "FIXED_POINT" if fixed else "NOT_FIXED_POINT",
        "expected_cells": 120,
        "observed_cells": len(seen),
        "invalid_cells": invalid,
        "missing_cells": missing,
        "blockers": blockers,
        "missing_metadata": missing_meta,
        "bad_refs": sorted(set(bad_refs)),
        "circular_judge": circular_judge,
        "new_information": new_information,
        "self_proof_is_pass": False,
        "merge_to_main_proven": False,
    }


def self_test() -> int:
    request = {
        "request": {
            "intent": "prove route",
            "target": "ci",
            "semantic_territory": "CI_PIPELINE",
            "required_capability": "RUN_TEST",
            "authority_scope": "repo",
            "mutation_scope": "workflow",
            "proof_target": "same-head",
        },
        "providers": [
            {
                "name": "hermes",
                "owner": "PIVETE/HERMES",
                "capabilities": ["RUN_TEST"],
                "territories": ["CI_PIPELINE"],
                "available": True,
                "authorized_scopes": ["repo"],
                "canonical_owner": True,
                "evidence": "fixture:provider-evidence",
            }
        ],
    }
    routed = route_capability(request)
    if routed.get("status") != "ROUTED" or routed.get("provider") != "hermes":
        print("SEMANTIC_CRYSTAL_TOOL_SELF_TEST=FAIL")
        return 1

    unknown_request = json.loads(json.dumps(request))
    unknown_request["providers"][0]["available"] = "unknown"
    if route_capability(unknown_request).get("status") != "UNKNOWN":
        print("SEMANTIC_CRYSTAL_TOOL_SELF_TEST=FAIL")
        return 1

    no_evidence_request = json.loads(json.dumps(request))
    no_evidence_request["providers"][0]["evidence"] = ""
    if route_capability(no_evidence_request).get("status") != "UNKNOWN":
        print("SEMANTIC_CRYSTAL_TOOL_SELF_TEST=FAIL")
        return 1

    cells = [
        {"pass": p, "lens": l, "status": "PASS"}
        for p in PASSES
        for l in LENSES
    ]
    receipt = {
        "target": "fixture",
        "head_sha": "0" * 40,
        "writer": "fixture-writer",
        "judge": "fixture-external-judge",
        "final_remeasurement_ref": "fixture:t1",
        "external_judge_ref": "fixture:judge-proof",
        "new_information": False,
        "cells": cells,
    }
    if validate_fixed_point(receipt).get("status") != "FIXED_POINT":
        print("SEMANTIC_CRYSTAL_TOOL_SELF_TEST=FAIL")
        return 1

    receipt_unknown = json.loads(json.dumps(receipt))
    receipt_unknown["cells"][0]["status"] = "UNKNOWN"
    if validate_fixed_point(receipt_unknown).get("status") != "NOT_FIXED_POINT":
        print("SEMANTIC_CRYSTAL_TOOL_SELF_TEST=FAIL")
        return 1

    receipt_circular = json.loads(json.dumps(receipt))
    receipt_circular["judge"] = receipt_circular["writer"]
    if validate_fixed_point(receipt_circular).get("status") != "NOT_FIXED_POINT":
        print("SEMANTIC_CRYSTAL_TOOL_SELF_TEST=FAIL")
        return 1

    receipt_placeholder = json.loads(json.dumps(receipt))
    receipt_placeholder["external_judge_ref"] = "PENDING"
    if validate_fixed_point(receipt_placeholder).get("status") != "NOT_FIXED_POINT":
        print("SEMANTIC_CRYSTAL_TOOL_SELF_TEST=FAIL")
        return 1

    print("SEMANTIC_CRYSTAL_TOOL_SELF_TEST=PASS")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--self-test", action="store_true")
    sub = parser.add_subparsers(dest="command")

    route = sub.add_parser("route")
    route.add_argument("json_path")

    fixed = sub.add_parser("fixed-point")
    fixed.add_argument("json_path")

    args = parser.parse_args()
    if args.self_test:
        return self_test()
    if args.command == "route":
        _emit(route_capability(_load_json(args.json_path)))
        return 0
    if args.command == "fixed-point":
        result = validate_fixed_point(_load_json(args.json_path))
        _emit(result)
        return 0 if result["status"] == "FIXED_POINT" else 2
    parser.print_help()
    return 2


if __name__ == "__main__":
    raise SystemExit(main())
