from __future__ import annotations
from dataclasses import dataclass, asdict
from typing import Any

MATERIAL_KINDS = {
    "decision","finding","canonical_artifact","rule","promoted_test",
    "skill","gate","contract","commit","pull_request","absorbed_gold"
}

@dataclass(frozen=True)
class Contribution:
    actor: str
    role: str
    contribution: str
    evidence_ref: str
    state_ref: str
    timestamp: str | None = None

def material(kind: str) -> bool:
    return kind in MATERIAL_KINDS

def node(c: Contribution) -> dict[str, Any]:
    if not all((c.actor, c.role, c.contribution, c.evidence_ref, c.state_ref)):
        raise ValueError("UNPROVEN_PROVENANCE_NODE")
    return {k: v for k, v in asdict(c).items() if v is not None}

def percent(applicable: int, covered: int, unknown: int = 0) -> float | str:
    if applicable < 0 or covered < 0 or unknown < 0:
        raise ValueError("NEGATIVE_DENOMINATOR")
    if applicable == 0:
        return "NOT_APPLICABLE"
    if covered > applicable or covered + unknown > applicable:
        raise ValueError("INVALID_DENOMINATOR")
    if unknown:
        return "UNPROVEN_CLAIM"
    return round((covered / applicable) * 100, 2)

def receipt(*, kind: str, origin_intent: list[Contribution],
            discovered_by: list[Contribution] = [],
            formalized_by: list[Contribution] = [],
            implemented_by: list[Contribution] = [],
            counterproof_by: list[Contribution] = [],
            validated_by: list[Contribution] = [],
            absorbed_in: str | None = None) -> dict[str, Any]:
    if not material(kind):
        return {"material": False}
    graph = {
        "ORIGIN_INTENT": [node(x) for x in origin_intent],
        "DISCOVERED_BY": [node(x) for x in discovered_by],
        "FORMALIZED_BY": [node(x) for x in formalized_by],
        "IMPLEMENTED_BY": [node(x) for x in implemented_by],
        "COUNTERPROOF_BY": [node(x) for x in counterproof_by],
        "VALIDATED_BY": [node(x) for x in validated_by],
        "ABSORBED_IN": absorbed_in,
    }
    if not graph["ORIGIN_INTENT"]:
        raise ValueError("MISSING_ORIGIN_INTENT")
    if absorbed_in is not None and not validated_by:
        raise ValueError("ABSORPTION_WITHOUT_VALIDATION")
    return {"material": True, "provenance": graph}

def persist(tool_available: bool, artifact_ready: bool, human_explicit: bool=False) -> str:
    if tool_available:
        return "AGENT_PERSIST_AND_RECEIPT"
    if artifact_ready:
        return "DELIVER_ARTIFACT"
    return "MANUAL_IO" if human_explicit else "BLOCKED_TOOL_UNAVAILABLE"
