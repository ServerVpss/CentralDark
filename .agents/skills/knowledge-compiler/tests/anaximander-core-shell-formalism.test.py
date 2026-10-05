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
