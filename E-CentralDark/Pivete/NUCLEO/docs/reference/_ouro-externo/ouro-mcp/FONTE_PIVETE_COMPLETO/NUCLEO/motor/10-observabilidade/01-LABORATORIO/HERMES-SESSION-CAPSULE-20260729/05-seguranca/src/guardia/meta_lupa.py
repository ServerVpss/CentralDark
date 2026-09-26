from dataclasses import dataclass, field

@dataclass
class Counterproof:
    claim: str
    attacked_assumptions: list[str] = field(default_factory=list)
    evidence_for: list[str] = field(default_factory=list)
    evidence_against: list[str] = field(default_factory=list)
    discriminating_tests: list[str] = field(default_factory=list)

def inspect(event):
    cp = Counterproof(claim=event.metadata.get("claim", event.event_type))
    cp.evidence_for.extend(event.evidence)
    if event.event_type in {"EVIDENCE_CONFLICT", "PROOF_TARGET_MISMATCH"}:
        cp.attacked_assumptions.append("current evidence proves the exact target")
        cp.discriminating_tests.append("remeasure exact target with fresh provenance")
    if event.event_type == "BOUNDARY_PRESSURE":
        cp.attacked_assumptions.append("requested action stays inside authorized boundary")
        cp.discriminating_tests.append("compare requested scope with boundary lock")
    if event.event_type == "HEARTBEAT_LOST":
        cp.attacked_assumptions.append("silence proves semantic failure")
        cp.evidence_against.append("heartbeat absence alone is not failure proof")
        cp.discriminating_tests.append("independent process/health measurement")
    if event.event_type == "MODEL_DISAGREEMENT":
        cp.attacked_assumptions.append("model majority implies truth/authority")
        cp.evidence_against.append("model consensus is not authority")
        cp.discriminating_tests.append("compare against external measured evidence")
    if not cp.discriminating_tests:
        cp.discriminating_tests.append("collect one fresh measurement that can falsify the claim")
    return cp
