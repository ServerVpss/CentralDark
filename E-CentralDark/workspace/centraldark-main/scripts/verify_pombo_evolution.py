#!/usr/bin/env python3
from pathlib import Path
import hashlib, json, zipfile, sys, stat

root = Path(__file__).resolve().parents[2]
parent_expected = "3fb9cd2bf7eff428a36ef488e0aa8795d45142553e97088cad3d97434506af51"
base = root / "BASE-SELADA/CENTRALDARK-PACOTAO-OURO-20260905-r01.zip"
lineage_path = root / "POMBO-LINEAGE.json"
schema_path = root / "DELTA/contracts/proof-receipt.schema.json"
contract_path = root / "DELTA/contracts/pombo-handoff.yaml"

def sha(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()

fails = []
if not base.exists(): fails.append("BASE_MISSING")
elif sha(base) != parent_expected: fails.append("PARENT_HASH_MISMATCH")

lineage = json.loads(lineage_path.read_text(encoding="utf-8"))
if lineage.get("POMBO_ID") != "20260905": fails.append("POMBO_ID_CHANGED")
if lineage.get("REVISION") != 2: fails.append("REVISION_INVALID")
if lineage.get("PARENT_REVISION") != 1: fails.append("PARENT_REVISION_INVALID")
if lineage.get("parent_package_sha256") != parent_expected: fails.append("LINEAGE_PARENT_MISMATCH")

schema = json.loads(schema_path.read_text(encoding="utf-8"))
required = set(schema.get("required", []))
must = set(["POMBO_ID", "REVISION", "CHEFE_INTENT", "DESTINATION_LOCK", "SOURCE_SURFACE", "TARGET_SURFACE", "OBSERVED_AT", "HEAD_SHA", "CONTENT_SHA256", "OWNER", "WRITER_SCOPE", "STATE", "EVIDENCE_REFS", "UNKNOWNS", "RESIDUAL", "NEXT_CURSOR", "NEXT_ACTION"])
if not must.issubset(required): fails.append("RECEIPT_REQUIRED_FIELDS_MISSING")

contract = contract_path.read_text(encoding="utf-8")
for token in [
    "POMBO_IS_NOT_CEREBRO","POMBO_IS_NOT_OWNER","POMBO_IS_NOT_WRITER",
    "POMBO_IS_NOT_JUIZ","POMBO_IS_NOT_AUTORIDADE",
    "CHECKSUM_IS_NOT_SEMANTIC_PROOF",
    "destination_preserved","provenance_preserved","unknown_preserved","next_cursor_preserved"
]:
    if token not in contract: fails.append("CONTRACT_TOKEN_MISSING:"+token)

# Validate nested sacred base ZIP safety without semantically re-reviewing it.
if base.exists():
    with zipfile.ZipFile(base, "r") as z:
        names = z.namelist()
        if len(names) != len(set(names)): fails.append("BASE_DUPLICATE_ZIP_MEMBER")
        for info in z.infolist():
            n = info.filename.replace("\\","/")
            if n.startswith("/") or ".." in Path(n).parts:
                fails.append("BASE_UNSAFE_PATH:"+n)
            mode = (info.external_attr >> 16) & 0o170000
            if mode == stat.S_IFLNK:
                fails.append("BASE_SYMLINK:"+n)
        if z.testzip() is not None: fails.append("BASE_ZIP_CRC_FAIL")

print("POMBO_ID=20260905")
print("REVISION=02")
print("PARENT_HASH_MATCH=" + ("PASS" if "PARENT_HASH_MISMATCH" not in fails else "FAIL"))
print("POMBO_CONTRACT=" + ("PASS" if not any(x.startswith("CONTRACT_") or x=="RECEIPT_REQUIRED_FIELDS_MISSING" for x in fails) else "FAIL"))
print("BASE_SAFE_ZIP=" + ("PASS" if not any(x.startswith("BASE_") and x!="BASE_MISSING" for x in fails) else "FAIL"))
print("POMBO_EVOLUTION_VERIFY=" + ("PASS" if not fails else "FAIL"))
for x in fails: print(x)
sys.exit(0 if not fails else 3)
