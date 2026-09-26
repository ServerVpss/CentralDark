from provenance_kernel import Contribution, percent, receipt, persist

c = Contribution("SEGREDO/CHEFE","ORIGIN","intenção","msg:1","state:1")
j = Contribution("Judge","VALIDATOR","contraprova","test:1","sha:abc")

assert percent(10,10) == 100.0
assert percent(10,9,1) == "UNPROVEN_CLAIM"
assert persist(True, False) == "AGENT_PERSIST_AND_RECEIPT"
assert persist(False, True) == "DELIVER_ARTIFACT"
assert persist(False, False) == "BLOCKED_TOOL_UNAVAILABLE"
assert persist(False, False, True) == "MANUAL_IO"

r = receipt(kind="rule", origin_intent=[c], validated_by=[j], absorbed_in="REAL_OWNER")
assert r["material"] is True
assert r["provenance"]["ABSORBED_IN"] == "REAL_OWNER"

assert receipt(kind="scratch", origin_intent=[c]) == {"material": False}

try:
    receipt(kind="rule", origin_intent=[c], absorbed_in="REAL_OWNER")
    raise AssertionError("expected failure")
except ValueError as e:
    assert str(e) == "ABSORPTION_WITHOUT_VALIDATION"

print("PASS provenance_kernel")

from provenance_kernel import (
    proof_node, validate_proof_dag, evidence_reuse,
    hermes_mode, physical_archaeology, static_security_claim
)

p1 = proof_node(
    claim="CAPACIDADE_NE_AUTORIDADE",
    owner="canonical-contract",
    consumer="active-loader",
    failure_mode="legacy_authority_promotion",
    evidence_ref="test:identity-negative",
    state_ref="sha:abc",
    negative_test_ref="test:legacy-cannot-authorize",
    external_anchor_ref="runtime:decision-denied",
)
p2 = proof_node(
    claim="ACTIVE_LOADER_ENFORCES",
    owner="loader",
    consumer="runtime",
    failure_mode="wrong-active-authority",
    evidence_ref="test:loader",
    state_ref="sha:abc",
    negative_test_ref="test:wrong-authority",
    external_anchor_ref="runtime:active-state",
)
assert validate_proof_dag([p1, p2], [(0, 1)]) == "PROVEN"
assert validate_proof_dag([p1, p2], [(0, 1), (1, 0)]) == "CIRCULAR_PROOF"

assert evidence_reuse(sealed=True, state_changed=False, frontier_affected=False) == "REUSE_SEALED_PROOF"
assert evidence_reuse(sealed=True, state_changed=True, frontier_affected=False) == "REUSE_UNAFFECTED_PROOF"
assert evidence_reuse(sealed=True, state_changed=True, frontier_affected=True) == "REOPEN_AFFECTED_FRONTIER"

assert hermes_mode(gold_sealed=True, frontier_changed=False) == "CONSUME_GOLD"
assert hermes_mode(gold_sealed=True, frontier_changed=True) == "MEASURE_AFFECTED_FRONTIER"

assert physical_archaeology(gap_proved=False) == "DO_NOT_SCAN_C_E"
assert physical_archaeology(gap_proved=True) == "TARGETED_METADATA_HASH"
assert physical_archaeology(gap_proved=True, suspected_artifact=True) == "METADATA_HASH_SCAN_NO_EXEC"

assert static_security_claim(
    recursive_inventory=True,
    source_review=True,
    anti_malware_scan=False,
    sandbox_execution=False,
) == "NO_OBVIOUS_MALICIOUS_INDICATORS_STATIC"

print("PASS proof_dag_and_gold_reuse")
