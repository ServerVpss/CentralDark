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
