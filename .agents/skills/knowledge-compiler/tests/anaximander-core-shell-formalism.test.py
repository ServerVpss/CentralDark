import importlib.util, json
from pathlib import Path

HERE = Path(__file__).resolve().parent
MOD = HERE.parent / "scripts" / "crystal-runtime-compiler.py"
CRYSTAL = HERE.parent / "crystals" / "anaximander-core-shell-formalism.json"

spec = importlib.util.spec_from_file_location("centraldark_crystal_runtime", MOD)
m = importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)

c = json.loads(CRYSTAL.read_text(encoding="utf-8"))
m.validate(c)

plans = {target: m.compile_plan(c, target) for target in ("windows", "vmware", "vps")}

# Invariantes/semântica devem sobreviver à troca de corpo/binding.
assert plans["windows"]["invariants"] == plans["vmware"]["invariants"] == plans["vps"]["invariants"]
assert plans["windows"]["sequence"] == plans["vmware"]["sequence"] == plans["vps"]["sequence"]
assert plans["windows"]["proof_plan"] == plans["vmware"]["proof_plan"] == plans["vps"]["proof_plan"]

# O ambiente precisa realmente divergir; caso contrário não estaríamos testando bindings.
assert plans["windows"]["binding"] != plans["vmware"]["binding"]
assert plans["vmware"]["binding"] != plans["vps"]["binding"]
assert plans["windows"]["binding"] != plans["vps"]["binding"]

# A identidade do cristal exclui bindings de ambiente.
fps = {plans[t]["hashes"]["compiled_crystal_fingerprint"] for t in plans}
assert len(fps) == 1

inv = plans["windows"]["invariants"]
assert inv["CORE_IS_INVARIANT_SHELL_IS_MUTABLE"] is True
assert inv["NO_SINGLE_BODY_IS_SYSTEM_IDENTITY"] is True
assert inv["NO_SINGLE_ROUTE_IS_GLOBAL_AUTHORITY"] is True
assert inv["TIME_REQUIRES_REMEASUREMENT"] is True
assert inv["CLOCK_TRIGGERS_MEASUREMENT_NOT_TRUTH"] is True
assert inv["MECHANISM_EXPLAINS_EFFECT"] is True
assert inv["IDENTITY_SURVIVES_BINDING_CHANGE"] is True
assert inv["UNKNOWN_IS_NOT_PASS"] is True
assert inv["REALITY_IS_JUDGE"] is True
assert inv["CHEFE_CURRENT_CANONICAL_DOCS_PREVAIL_OVER_SKILLS"] is True
assert inv["SKILL_CONFLICT_WITH_CURRENT_CANONICAL_DOC"] == "SKILL_YIELDS"
assert inv["SKILL_IS_CAPABILITY_NOT_AUTHORITY"] is True
assert inv["HISTORICAL_DOC_IS_NOT_CURRENT_CANONICAL_DOC"] is True
assert inv["CURRENT_DEFINES_PRESENT_STATE"] is True
assert inv["HISTORY_IS_EVIDENCE"] is True
assert inv["HISTORY_MUST_NOT_BE_ERASED"] is True
assert inv["LIVE_CURRENT_CANNOT_ERASE_RELEVANT_HISTORY"] is True
assert inv["STALE_HISTORY_CANNOT_OVERRIDE_LIVE_CURRENT_STATE"] is True
assert inv["PROVEN_HISTORICAL_LOCKS_INHERIT_INTO_CURRENT"] is True
assert inv["PAST_GOLD_IS_PRESERVED"] is True
assert inv["EXTEND_EXISTING_NOT_REPLACE"] is True
assert inv["CARAPACA_IS_MUTABLE_SHELL"] is True
assert inv["MOLTING_PRESERVES_IDENTITY_LINEAGE"] is True
assert inv["THEMATIC_SPACES_USE_EXISTING_LIBRARY_SECTORS"] is True
assert inv["RITUAL_EVENT_IS_NOT_AUTHORIZATION_GATE"] is True
assert inv["REVELATION_SUBMISSION_IS_CANON_CANDIDATE"] is True
assert inv["REVELATION_AUTO_PROMOTION"] is False
assert inv["EVENT_ENDED_DOES_NOT_END_EVIDENCE"] is True
assert inv["DECLARED_PRINCIPLE_WITHOUT_PRACTICE_IS_NOT_INTEGRATED"] is True
assert inv["BEHAVIOR_CONTRADICTING_CANON_IS_ALIGNMENT_DRIFT"] is True
assert inv["METRIC_SUCCESS_IS_NOT_MISSION_SUCCESS"] is True
assert inv["OPTIMIZATION_MUST_RESPECT_INTENT"] is True
assert inv["LIVED_ALIGNMENT_REQUIRES_REPEATED_OBSERVATION"] is True
assert inv["CANON_MUST_BE_TESTABLE_AGAINST_BEHAVIOR"] is True
assert inv["PAST_BEHAVIOR_INFORMS_ALIGNMENT_TRAJECTORY"] is True
assert inv["CURRENT_BEHAVIOR_DOES_NOT_ERASE_PAST_DRIFT"] is True
assert inv["CORRECTION_DOES_NOT_ERASE_PROVENANCE"] is True
assert inv["GREEN_CHECK_IS_NOT_LIVED_ALIGNMENT_BY_ITSELF"] is True
assert c["lived_alignment"]["equation"] == "Alignment(p,t)=MATCH(Declared(p),ObservedBehavior(p,t))"
assert "INTENT_ALIGNMENT" in c["lived_alignment"]["objective"]

# Contraprova estrutural: tentar remover uma invariante herdada deve falhar fechado.
broken = json.loads(json.dumps(c))
broken["invariants"]["UNKNOWN_IS_NOT_PASS"] = False
try:
    m.validate(broken)
except SystemExit as exc:
    assert "CRYSTAL_INVARIANTS=FAIL" in str(exc)
else:
    raise AssertionError("broken invariant was incorrectly accepted")

print("ANAXIMANDER_CORE_SHELL_FORMALISM_TEST=PASS")
print("TARGETS=windows,vmware,vps")
print("SEMANTICS_EQUAL=PASS")
print("BINDINGS_DIFFER=PASS")
print("FINGERPRINT_STABLE_ACROSS_BINDINGS=PASS")
print("BROKEN_INVARIANT_REJECTED=PASS")
print("CURRENT_CANONICAL_DOC_PRECEDENCE_OVER_SKILL=PASS")
print("HISTORY_PRESERVED_CURRENT_REMEASURED=PASS")
print("REVELATION_AUTO_PROMOTION_BLOCKED=PASS")
print("LIVED_ALIGNMENT_CONTRACT=PASS")
