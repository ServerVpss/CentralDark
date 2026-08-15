#!/usr/bin/env python3
"""Gate determinístico de evolução verificável da CentralDark.

Não decide sozinho se uma ideia é boa. Impede que qualquer componente alegue
"evolução" sem antes/depois, ganho de informação, delta reutilizável, teste,
contraprova, regressão e proveniência no mesmo escopo.

Os donos META obrigatórios são: META_LUPA, MENOS_E_MAIS,
INSTINTO_SUPERIOR, EXPANSAO_DE_DOMINIO e METACOGNICAO_OPERACIONAL.
Outras capacidades também podem usar o mesmo contrato: evolução é universal,
o mecanismo de prova continua único.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import subprocess
from pathlib import Path
from typing import Any

SCHEMA_VERSION = 1
REQUIRED_META_SUBJECTS = {
    "META_LUPA",
    "MENOS_E_MAIS",
    "INSTINTO_SUPERIOR",
    "EXPANSAO_DE_DOMINIO",
    "METACOGNICAO_OPERACIONAL",
}
SUBJECT_RE = re.compile(r"^[A-Z][A-Z0-9_]{2,63}$")
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
        if not _nonempty_str_list(item.get("evidence")):
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
    if not isinstance(subject, str) or not SUBJECT_RE.fullmatch(subject):
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
        "required_meta_subject": subject in REQUIRED_META_SUBJECTS,
        "status": "EVOLVED" if verified else "EVOLUTION_UNPROVEN",
        "evolution_verified": verified,
        "before_ref": before_ref,
        "after_ref": after_ref,
        "manifest_sha256": manifest_sha256(manifest),
        "errors": sorted(set(errors)),
    }


def _signed_base(subject: str = "META_LUPA") -> dict[str, Any]:
    base: dict[str, Any] = {
        "schema_version": 1,
        "subject": subject,
        "before_ref": "1" * 40,
        "after_ref": "2" * 40,
        "same_scope": True,
        "canonical_owner": "owner.md",
        "claim": "capacidade aumentou sem regressão",
        "verifier": "judge-read-only",
        "new_information": ["novo failure mode reproduzido"],
        "capability_delta": ["nova capacidade reutilizável"],
        "before_evidence": ["fixture antes"],
        "after_evidence": ["fixture depois"],
        "counterproof": ["caso negativo independente"],
        "provenance": ["erro real da missão"],
        "lost_capabilities": [],
        "tests": [{"name": "positivo", "status": "PASS", "evidence": ["receipt positivo"]}],
        "regressions": [{"name": "regressao", "status": "PASS", "evidence": ["receipt regressao"]}],
    }
    if subject == "MENOS_E_MAIS":
        base["complexity_before"] = 5
        base["complexity_after"] = 4
    base["receipt_sha256"] = manifest_sha256(base)
    return base


def _resign(value: dict[str, Any]) -> dict[str, Any]:
    value["receipt_sha256"] = manifest_sha256({k: v for k, v in value.items() if k != "receipt_sha256"})
    return value


def self_test() -> int:
    for subject in sorted(REQUIRED_META_SUBJECTS):
        assert validate(_signed_base(subject))["evolution_verified"] is True

    # A lei vale também para uma capacidade futura: não é enum decorativo.
    assert validate(_signed_base("CAPACIDADE_FUTURA"))["evolution_verified"] is True

    duplicate = _signed_base()
    duplicate["after_ref"] = duplicate["before_ref"]
    result = validate(_resign(duplicate))
    assert not result["evolution_verified"] and "NO_STATE_DELTA" in result["errors"]

    no_info = _signed_base()
    no_info["new_information"] = []
    result = validate(_resign(no_info))
    assert not result["evolution_verified"] and "NEW_INFORMATION_MISSING" in result["errors"]

    regression = _signed_base()
    regression["lost_capabilities"] = ["capacidade anterior perdida"]
    result = validate(_resign(regression))
    assert not result["evolution_verified"] and "CAPABILITY_REGRESSION" in result["errors"]

    less = _signed_base("MENOS_E_MAIS")
    less["complexity_after"] = 6
    result = validate(_resign(less))
    assert not result["evolution_verified"] and "MENOS_E_MAIS_COMPLEXITY_REGRESSION" in result["errors"]

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
