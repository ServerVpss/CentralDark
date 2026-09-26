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

def proof_node(*, claim: str, owner: str, consumer: str, failure_mode: str,
               evidence_ref: str, state_ref: str,
               negative_test_ref: str, external_anchor_ref: str) -> dict[str, str]:
    fields = {
        "claim": claim,
        "owner": owner,
        "consumer": consumer,
        "failure_mode": failure_mode,
        "evidence_ref": evidence_ref,
        "state_ref": state_ref,
        "negative_test_ref": negative_test_ref,
        "external_anchor_ref": external_anchor_ref,
    }
    if not all(fields.values()):
        raise ValueError("UNPROVEN_PROOF_NODE")
    return fields

def validate_proof_dag(nodes: list[dict[str, str]], edges: list[tuple[int, int]]) -> str:
    if not nodes:
        return "UNPROVEN"
    n = len(nodes)
    graph = {i: [] for i in range(n)}
    indeg = [0] * n
    for a, b in edges:
        if not (0 <= a < n and 0 <= b < n):
            raise ValueError("INVALID_PROOF_EDGE")
        graph[a].append(b)
        indeg[b] += 1
    q = [i for i, d in enumerate(indeg) if d == 0]
    seen = 0
    while q:
        cur = q.pop()
        seen += 1
        for nxt in graph[cur]:
            indeg[nxt] -= 1
            if indeg[nxt] == 0:
                q.append(nxt)
    if seen != n:
        return "CIRCULAR_PROOF"
    if any(not x.get("external_anchor_ref") for x in nodes):
        return "UNPROVEN"
    return "PROVEN"

def evidence_reuse(*, sealed: bool, state_changed: bool, frontier_affected: bool) -> str:
    if sealed and not state_changed:
        return "REUSE_SEALED_PROOF"
    if sealed and state_changed and not frontier_affected:
        return "REUSE_UNAFFECTED_PROOF"
    return "REOPEN_AFFECTED_FRONTIER"

def hermes_mode(*, gold_sealed: bool, frontier_changed: bool) -> str:
    if gold_sealed and not frontier_changed:
        return "CONSUME_GOLD"
    return "MEASURE_AFFECTED_FRONTIER"

def physical_archaeology(*, gap_proved: bool, suspected_artifact: bool=False) -> str:
    if not gap_proved:
        return "DO_NOT_SCAN_C_E"
    if suspected_artifact:
        return "METADATA_HASH_SCAN_NO_EXEC"
    return "TARGETED_METADATA_HASH"

def static_security_claim(*, recursive_inventory: bool, source_review: bool,
                          anti_malware_scan: bool, sandbox_execution: bool) -> str:
    if recursive_inventory and source_review and anti_malware_scan and sandbox_execution:
        return "EXECUTION_RISK_REDUCED_NOT_ZERO"
    if recursive_inventory and source_review:
        return "NO_OBVIOUS_MALICIOUS_INDICATORS_STATIC"
    return "UNPROVEN"
