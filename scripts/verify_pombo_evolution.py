#!/usr/bin/env python3
from pathlib import Path
import hashlib
import json
import os
import sys
import zipfile
import stat

REPO = Path(__file__).resolve().parents[1]
CANON = REPO / "docs" / "CONSCIENCIA"
PARENT_EXPECTED = "3fb9cd2bf7eff428a36ef488e0aa8795d45142553e97088cad3d97434506af51"

lineage_path = CANON / "POMBO-LINEAGE.json"
manifest_path = CANON / "MANIFEST-R02.json"
sums_path = CANON / "SHA256SUMS-R02.txt"
sealed_path = CANON / "SEALED-NO-REPEAT.jsonl"
gaps_path = CANON / "OPEN-GAPS.jsonl"
receipt_template_path = CANON / "RECEIPT-TEMPLATE.json"
rule_path = CANON / "POMBO-LINEAGE-RULE.md"
test_result_path = CANON / "TEST-RESULT-R02.txt"

# Optional deep package location. The canonical repo intentionally permits the
# sealed parent package to live outside Git; byte identity remains referenced by
# POMBO64/receipt. When supplied, it is verified without changing semantic state.
package_root = Path(os.environ["POMBO_PACKAGE_ROOT"]).resolve() if os.environ.get("POMBO_PACKAGE_ROOT") else None
base = package_root / "BASE-SELADA" / "CENTRALDARK-PACOTAO-OURO-20260905-r01.zip" if package_root else None


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8-sig"))


def load_jsonl(path: Path):
    rows = []
    for raw in path.read_text(encoding="utf-8-sig").splitlines():
        raw = raw.strip()
        if raw:
            rows.append(json.loads(raw))
    return rows


fails = []
required_files = [
    lineage_path,
    manifest_path,
    sums_path,
    sealed_path,
    gaps_path,
    receipt_template_path,
    rule_path,
    test_result_path,
]
for required in required_files:
    if not required.exists():
        fails.append("CANONICAL_FILE_MISSING:" + str(required.relative_to(REPO)))

lineage = load_json(lineage_path) if lineage_path.exists() else {}
manifest = load_json(manifest_path) if manifest_path.exists() else {}
sealed = load_jsonl(sealed_path) if sealed_path.exists() else []
gaps = load_jsonl(gaps_path) if gaps_path.exists() else []
receipt = load_json(receipt_template_path) if receipt_template_path.exists() else {}
rule = rule_path.read_text(encoding="utf-8-sig") if rule_path.exists() else ""
test_result = test_result_path.read_text(encoding="utf-8-sig") if test_result_path.exists() else ""
sums_text = sums_path.read_text(encoding="utf-8-sig") if sums_path.exists() else ""

if lineage.get("POMBO_ID") != "20260905":
    fails.append("POMBO_ID_CHANGED")
if lineage.get("REVISION") != 2:
    fails.append("REVISION_INVALID")
if lineage.get("PARENT_REVISION") != 1:
    fails.append("PARENT_REVISION_INVALID")
if lineage.get("parent_package_sha256") != PARENT_EXPECTED:
    fails.append("LINEAGE_PARENT_MISMATCH")
if lineage.get("identity_policy") != "POMBO_ID_IMMUTABLE_REVISION_MONOTONIC":
    fails.append("LINEAGE_IDENTITY_POLICY_INVALID")
if lineage.get("canonical_owner") != "docs/CONSCIENCIA/02-PROTOCOLO-HANDOFF-IA.md":
    fails.append("LINEAGE_OWNER_CHANGED")
if lineage.get("current_zip_checksum_location") != "external POMBO64 envelope to avoid self-reference":
    fails.append("POMBO64_ENVELOPE_POLICY_CHANGED")

if manifest.get("POMBO_ID") != "20260905":
    fails.append("MANIFEST_POMBO_ID_CHANGED")
if manifest.get("REVISION") != 2 or manifest.get("PARENT_REVISION") != 1:
    fails.append("MANIFEST_REVISION_INVALID")
if manifest.get("parent_package_sha256") != PARENT_EXPECTED:
    fails.append("MANIFEST_PARENT_MISMATCH")

manifest_files = {row.get("path"): row for row in manifest.get("files", []) if isinstance(row, dict)}
base_entry = manifest_files.get("BASE-SELADA/CENTRALDARK-PACOTAO-OURO-20260905-r01.zip")
if not base_entry or base_entry.get("sha256") != PARENT_EXPECTED or base_entry.get("classification") != "SEALED_BASE_BLOB":
    fails.append("MANIFEST_SEALED_BASE_INVALID")

sealed_base = next((row for row in sealed if row.get("claim_key") == "BASE_PACKAGE::BYTE_IDENTITY"), None)
if not sealed_base:
    fails.append("SEALED_BASE_CLAIM_MISSING")
else:
    if sealed_base.get("state") != "SEALED":
        fails.append("SEALED_BASE_STATE_INVALID")
    if sealed_base.get("sha256") != PARENT_EXPECTED:
        fails.append("SEALED_BASE_HASH_MISMATCH")
    if sealed_base.get("reopen_only_with") != "HASH_MISMATCH_OR_NEW_CAUSAL_EVIDENCE":
        fails.append("SEALED_BASE_REOPEN_RULE_INVALID")

if PARENT_EXPECTED not in sums_text:
    fails.append("POMBO64_PARENT_HASH_MISSING")
for expected_path in [
    "POMBO-LINEAGE.json",
    "MANIFEST-R02.json",
    "DELTA/contracts/pombo-handoff.yaml",
    "DELTA/contracts/proof-receipt.schema.json",
]:
    if expected_path not in sums_text:
        fails.append("POMBO64_ENTRY_MISSING:" + expected_path)

required_receipt = {
    "POMBO_ID", "REVISION", "CHEFE_INTENT", "DESTINATION_LOCK", "SOURCE_SURFACE",
    "TARGET_SURFACE", "OBSERVED_AT", "HEAD_SHA", "CONTENT_SHA256", "OWNER",
    "WRITER_SCOPE", "STATE", "EVIDENCE_REFS", "UNKNOWNS", "RESIDUAL",
    "NEXT_CURSOR", "NEXT_ACTION",
}
if not required_receipt.issubset(set(receipt.keys())):
    fails.append("RECEIPT_REQUIRED_FIELDS_MISSING")

for token in [
    "CHECKSUM != PROVA_SEMANTICA",
    "POMBO != CEREBRO",
    "POMBO != OWNER",
    "POMBO != WRITER",
    "POMBO != JUIZ",
    "POMBO != AUTORIDADE",
    "NO_NEW_INFORMATION",
    "REUSE_PROOF",
]:
    if token not in rule:
        fails.append("LINEAGE_RULE_TOKEN_MISSING:" + token)

if not gaps:
    fails.append("OPEN_GAPS_EMPTY")
else:
    allowed_states = {"UNKNOWN", "NOT_PROVEN", "BLOCKED", "OFF_OBSERVED"}
    if any(row.get("state") not in allowed_states for row in gaps):
        fails.append("OPEN_GAPS_FALSE_GREEN")
    if not any(row.get("state") in {"UNKNOWN", "NOT_PROVEN", "BLOCKED"} for row in gaps):
        fails.append("OPEN_GAPS_MATERIAL_UNKNOWN_NOT_PRESERVED")

for token in [
    "PARENT_HASH_MATCH=PASS",
    "POMBO_CONTRACT=PASS",
    "BASE_SAFE_ZIP=PASS",
    "POMBO_EVOLUTION_VERIFY=PASS",
    "DEEP_REVIEW_BASE=SKIPPED_BY_SEAL",
]:
    if token not in test_result:
        fails.append("HISTORICAL_TEST_RECEIPT_MISSING:" + token)

deep_status = "SKIPPED_BY_SEAL"
if base is not None:
    if not base.exists():
        fails.append("BASE_MISSING_AT_POMBO_PACKAGE_ROOT")
        deep_status = "FAIL"
    elif sha(base) != PARENT_EXPECTED:
        fails.append("PARENT_HASH_MISMATCH")
        deep_status = "FAIL"
    else:
        with zipfile.ZipFile(base, "r") as z:
            names = z.namelist()
            if len(names) != len(set(names)):
                fails.append("BASE_DUPLICATE_ZIP_MEMBER")
            for info in z.infolist():
                n = info.filename.replace("\\", "/")
                if n.startswith("/") or ".." in Path(n).parts:
                    fails.append("BASE_UNSAFE_PATH:" + n)
                mode = (info.external_attr >> 16) & 0o170000
                if mode == stat.S_IFLNK:
                    fails.append("BASE_SYMLINK:" + n)
            if z.testzip() is not None:
                fails.append("BASE_ZIP_CRC_FAIL")
        deep_status = "PASS" if not any(
            item.startswith("BASE_") or item == "PARENT_HASH_MISMATCH" for item in fails
        ) else "FAIL"

print("POMBO_ID=20260905")
print("REVISION=02")
print("PARENT_HASH_MATCH=" + ("PASS" if lineage.get("parent_package_sha256") == PARENT_EXPECTED and manifest.get("parent_package_sha256") == PARENT_EXPECTED else "FAIL"))
print("POMBO64_LINEAGE=" + ("PASS" if not any(x.startswith("POMBO64_") or x.startswith("SEALED_BASE_") for x in fails) else "FAIL"))
print("POMBO_CONTRACT=" + ("PASS" if not any(
    x.startswith("RECEIPT_") or x.startswith("LINEAGE_RULE_") or x.startswith("LINEAGE_OWNER") or x.startswith("LINEAGE_IDENTITY")
    for x in fails
) else "FAIL"))
print("UNKNOWN_PRESERVED=" + ("PASS" if not any(x.startswith("OPEN_GAPS_") for x in fails) else "FAIL"))
print("BASE_DEEP_REVIEW=" + deep_status)
print("POMBO_EVOLUTION_VERIFY=" + ("PASS" if not fails else "FAIL"))
for item in fails:
    print(item)
sys.exit(0 if not fails else 3)
