#!/usr/bin/env python3
"""Gate determinístico de evolução verificável da CentralDark.

Não decide sozinho se uma ideia é boa. Ele impede que "evoluiu" seja
promovido sem antes/depois, ganho de informação, delta reutilizável, teste,
contraprova, regressão e proveniência no mesmo escopo.

Consumidores canônicos: META_LUPA, MENOS_E_MAIS, INSTINTO_SUPERIOR e
EXPANSAO_DE_DOMINIO. O mecanismo é único; cada consumidor continua no seu
dono canônico.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import subprocess
import sys
from pathlib import Path
from typing import Any

SCHEMA_VERSION = 1
SUBJECTS = {
    "META_LUPA",
    "MENOS_E_MAIS",
    "INSTINTO_SUPERIOR",
    "EXPANSAO_DE_DOMINIO",
}
HEX40 = re.compile(r"^[0-9a-f]{40}$")
HEX64 = re.compile(r"^[0-9a-f]{64}$")


def canonical_json(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"))


def manifest_sha256(value: Any) -> str:
    return hashlib.sha256(canonical_json(value).encode("utf-8")).hexdigest()


def _nonempty_str(value: Any) -> bool:
    return isinstance(value, str) and bool(value.strip())


def _nonempty_str_list(value: Any) -> bool:
    return isinstance(value, list) and bool(value) and all(_nonempty_str(v) for v in value)


def _git_commit_exists(repo_root: str, sha: str) -> bool:
    try:
        result = subprocess.run(
            ["git", "-C", str(Path(repo_root).resolve()), "cat-file", "-e", f"{sha}^{{commit}}"],
            check=False,
            capture_output=True,
        )
    except OSError:
        return False
    return result.returncode == 0


def _checks_ok(value: Any, prefix: str, errors: list[str]) -> None:
    if not isinstance(value, list) or not value:
        errors.append(f"{prefix}_MISSING")
        return
    for index, item in enumerate(value):
        if not isinstance(item, dict):
            errors.append(f"{prefix}_{index}_NOT_OBJECT")
            continue
        if not _nonempty_str(item.get("name")):
            errors.append(f"{prefix}_{index}_NAME_MISSING")
        if item.get("status") != "PASS":
            errors.append(f"{prefix}_{index}_NOT_PASS")
        evidence = item.get("evidence")
        if not _nonempty_str_list(evidence):
            errors.append(f"{prefix}_{index}_EVIDENCE_MISSING")


def validate(manifest: Any, repo_root: str | None = None) -> dict[str, Any]:
    errors: list[str] = []
    if not isinstance(manifest, dict):
        return {
            "schema_version": SCHEMA_VERSION,
            "status": "EVOLUTION_UNPROVEN",
            "evolution_verified": False,
            "errors": ["MANIFEST_NOT_OBJECT"],
            "manifest_sha256": manifest_sha256(manifest),
        }

    if manifest.get("schema_version") != SCHEMA_VERSION:
        errors.append("SCHEMA_VERSION_INVALID")

    subject = manifest.get("subject")
    if subject not in SUBJECTS:
        errors.append("SUBJECT_INVALID")

    before_ref = manifest.get("before_ref")
    after_ref = manifest.get("after_ref")
    if not isinstance(before_ref, str) or not HEX40.fullmatch(before_ref):
        errors.append("BEFORE_REF_INVALID")
    if not isinstance(after_ref, str) or not HEX40.fullmatch(after_ref):
        errors.append("AFTER_REF_INVALID")
    if before_ref == after_ref and isinstance(before_ref, str):
        errors.append("NO_STATE_DELTA")

    if manifest.get("same_scope") is not True:
        errors.append("SCOPE_NOT_HELD_CONSTANT")
    if not _nonempty_str(manifest.get("canonical_owner")):
        errors.append("CANONICAL_OWNER_MISSING")
    if not _nonempty_str(manifest.get("claim")):
        errors.append("CLAIM_MISSING")
    if not _nonempty_str(manifest.get("verifier")):
        errors.append("VERIFIER_MISSING")

    for field in (
        "new_information",
        "capability_delta",
        "before_evidence",
        "after_evidence",
        "counterproof",
        "provenance",
    ):
        if not _nonempty_str_list(manifest.get(field)):
            errors.append(f"{field.upper()}_MISSING")

    lost = manifest.get("lost_capabilities")
    if not isinstance(lost, list):
        errors.append("LOST_CAPABILITIES_INVALID")
    elif lost:
        errors.append("CAPABILITY_REGRESSION")

    _checks_ok(manifest.get("tests"), "TEST", errors)
    _checks_ok(manifest.get("regressions"), "REGRESSION", errors)

    if subject == "MENOS_E_MAIS":
        before_complexity = manifest.get("complexity_before")
        after_complexity = manifest.get("complexity_after")
        if not isinstance(before_complexity, int) or isinstance(before_complexity, bool) or before_complexity < 0:
            errors.append("COMPLEXITY_BEFORE_INVALID")
        if not isinstance(after_complexity, int) or isinstance(after_complexity, bool) or after_complexity < 0:
            errors.append("COMPLEXITY_AFTER_INVALID")
        if isinstance(before_complexity, int) and isinstance(after_complexity, int) and after_complexity > before_complexity:
            errors.append("MENOS_E_MAIS_COMPLEXITY_REGRESSION")

    if repo_root and isinstance(before_ref, str) and HEX40.fullmatch(before_ref):
        if not _git_commit_exists(repo_root, before_ref):
            errors.append("BEFORE_REF_NOT_IN_GIT")
    if repo_root and isinstance(after_ref, str) and HEX40.fullmatch(after_ref):
        if not _git_commit_exists(repo_root, after_ref):
            errors.append("AFTER_REF_NOT_IN_GIT")

    receipt_hash = manifest.get("receipt_sha256")
    unsigned = {k: v for k, v in manifest.items() if k != "receipt_sha256"}
    expected_hash = manifest_sha256(unsigned)
    if not isinstance(receipt_hash, str) or not HEX64.fullmatch(receipt_hash):
        errors.append("RECEIPT_SHA256_INVALID")
    elif receipt_hash != expected_hash:
        errors.append("RECEIPT_SHA256_MISMATCH")

    verified = not errors
    return {
        "schema_version": SCHEMA_VERSION,
        "subject": subject,
        "status": "EVOLVED" if verified else "EVOLUTION_UNPROVEN",
        "evolution_verified": verified,
        "before_ref": before_ref,
        "after_ref": after_ref,
        "manifest_sha256": manifest_sha256(manifest),
        "errors": sorted(set(errors)),
    }


def self_test() -> int:
    base = {
        "schema_version": 1,
        "subject": "META_LUPA",
        "before_ref": "1" * 40,
        "after_ref": "2" * 40,
        "same_scope": True,
        "canonical_owner": ".agents/skills/meta-lupa/SKILL.md",
        "claim": "bloqueia uma classe nova de falso verde",
        "verifier": "judge-read-only",
        "new_information": ["novo failure mode reproduzido"],
        "capability_delta": ["detectar falso verde X"],
        "before_evidence": ["fixture antes"],
        "after_evidence": ["fixture depois"],
        "counterproof": ["caso negativo independente"],
        "provenance": ["erro real da missão"],
        "lost_capabilities": [],
        "tests": [{"name": "positivo", "status": "PASS", "evidence": ["receipt positivo"]}],
        "regressions": [{"name": "regressao", "status": "PASS", "evidence": ["receipt regressao"]}],
    }
    base["receipt_sha256"] = manifest_sha256(base)
    assert validate(base)["evolution_verified"] is True

    duplicate = dict(base)
    duplicate["after_ref"] = duplicate["before_ref"]
    duplicate["receipt_sha256"] = manifest_sha256({k: v for k, v in duplicate.items() if k != "receipt_sha256"})
    result = validate(duplicate)
    assert result["evolution_verified"] is False and "NO_STATE_DELTA" in result["errors"]

    no_info = dict(base)
    no_info["new_information"] = []
    no_info["receipt_sha256"] = manifest_sha256({k: v for k, v in no_info.items() if k != "receipt_sha256"})
    result = validate(no_info)
    assert result["evolution_verified"] is False and "NEW_INFORMATION_MISSING" in result["errors"]

    regression = dict(base)
    regression["lost_capabilities"] = ["capacidade anterior perdida"]
    regression["receipt_sha256"] = manifest_sha256({k: v for k, v in regression.items() if k != "receipt_sha256"})
    result = validate(regression)
    assert result["evolution_verified"] is False and "CAPABILITY_REGRESSION" in result["errors"]

    less = dict(base)
    less["subject"] = "MENOS_E_MAIS"
    less["complexity_before"] = 5
    less["complexity_after"] = 6
    less["receipt_sha256"] = manifest_sha256({k: v for k, v in less.items() if k != "receipt_sha256"})
    result = validate(less)
    assert result["evolution_verified"] is False and "MENOS_E_MAIS_COMPLEXITY_REGRESSION" in result["errors"]

    print("PASS evolution_gate")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description="Gate fail-closed de evolução verificável")
    parser.add_argument("--input")
    parser.add_argument("--repo-root", default=None)
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()
    if args.self_test:
        return self_test()
    if not args.input:
        parser.error("--input é obrigatório sem --self-test")
    try:
        with open(args.input, encoding="utf-8") as handle:
            manifest = json.load(handle)
    except (OSError, UnicodeError, json.JSONDecodeError) as exc:
        print(json.dumps({
            "status": "EVOLUTION_UNPROVEN",
            "evolution_verified": False,
            "errors": ["MANIFEST_UNREADABLE"],
            "detail": type(exc).__name__,
        }, ensure_ascii=False, sort_keys=True))
        return 13
    result = validate(manifest, args.repo_root)
    print(json.dumps(result, ensure_ascii=False, sort_keys=True))
    return 0 if result["evolution_verified"] else 13


if __name__ == "__main__":
    raise SystemExit(main())
