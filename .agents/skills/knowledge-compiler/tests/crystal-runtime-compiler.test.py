import importlib.util, json
from pathlib import Path

HERE=Path(__file__).resolve().parent
MOD=HERE.parent/"scripts"/"crystal-runtime-compiler.py"
CRYSTAL=HERE.parent/"crystals"/"vmware-forge-obsidian-preserve-gold-sync.json"
spec=importlib.util.spec_from_file_location("c",MOD)
m=importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
c=json.loads(CRYSTAL.read_text(encoding="utf-8"))
m.validate(c)
a=m.hashes(c); b=m.hashes(json.loads(json.dumps(c)))
assert a==b
assert a["compiled_crystal_fingerprint"]
assert c["lineage"]["parent_package_sha256"]=="4da29cd8345591f25695909c2159dc54de393120c6f78673e2b0cd98689efde6"
print("CRYSTAL_RUNTIME_COMPILER_TEST=PASS")
