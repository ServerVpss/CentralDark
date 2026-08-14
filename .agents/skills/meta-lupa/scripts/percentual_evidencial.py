#!/usr/bin/env python3
"""Percentual evidencial fail-closed para a Meta Lupa.

Mede somente escopos finitos e declarados. 100% significa exatamente
NUMERADOR == DENOMINADOR no contrato fornecido; nunca certeza universal.

Uso:
  python scripts/percentual_evidencial.py measure --input manifest.json
  python scripts/percentual_evidencial.py self-test
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
HEAD_SHA_RE = re.compile(r"^[0-9a-f]{40}$")
ALLOWED_STATUS = {
    "PASS",
    "FAIL",
    "BLOCKED",
    "UNKNOWN",
    "SKIPPED",
    "NOT_APPLICABLE",
}
UNRESOLVED_STATUS = {"FAIL", "BLOCKED", "UNKNOWN", "SKIPPED"}


def canonical_json(data: Any) -> str:
    return json.dumps(data, ensure_ascii=False, sort_keys=True, separators=(",", ":"))


def manifest_sha256(data: Any) -> str:
    return hashlib.sha256(canonical_json(data).encode("utf-8")).hexdigest()


def current_head_sha() -> str:
    """Resolve o HEAD real do checkout; self-audit sem HEAD vivo não sela 100%."""
    try:
        result = subprocess.run(
            ["git", "rev-parse", "HEAD"],
            check=True,
            capture_output=True,
            text=True,
        )
    except (OSError, subprocess.CalledProcessError) as exc:
        raise RuntimeError("HEAD_SHA_UNAVAILABLE") from exc
    value = result.stdout.strip()
    if not HEAD_SHA_RE.fullmatch(value):
        raise RuntimeError("HEAD_SHA_INVALID")
    return value


def _evidence_ok(value: Any) -> bool:
    return (
        isinstance(value, list)
        and bool(value)
        and all(isinstance(item, str) and item.strip() for item in value)
    )


def _blank_result(data: Any, errors: list[str]) -> dict[str, Any]:
    return {
        "schema_version": SCHEMA_VERSION,
        "scope": data.get("scope") if isinstance(data, dict) else None,
        "head_sha": data.get("head_sha") if isinstance(data, dict) else None,
        "manifest_sha256": manifest_sha256(data),
        "status": "BLOCKED",
        "numerator": 0,
        "denominator": None,
        "coverage_percent": None,
        "unresolved": None,
        "resolution_plan_percent": None,
        "claim_100_allowed": False,
        "errors": sorted(set(errors)),
        "unresolved_ids": [],
        "counts": {},
    }


def measure_manifest(data: Any) -> dict[str, Any]:
    """Mede cobertura sem permitir que UNKNOWN/SKIPPED virem PASS.

    O denominador é declarado pelo chamador e precisa ser idêntico à quantidade
    de checks `required=true`. Isso impede reduzir o denominador depois de ver o
    resultado. Todo PASS exige evidência; toda lacuna requerida exige `next_test`,
    que representa exatamente o que pode preencher a lacuna na próxima rodada.
    """
    if not isinstance(data, dict):
        return _blank_result(data, ["MANIFEST_NOT_OBJECT"])

    errors: list[str] = []
    if data.get("schema_version") != SCHEMA_VERSION:
        errors.append("SCHEMA_VERSION_INVALID")
    if not isinstance(data.get("scope"), str) or not data["scope"].strip():
        errors.append("SCOPE_MISSING")
    if not HEAD_SHA_RE.fullmatch(str(data.get("head_sha", ""))):
        errors.append("HEAD_SHA_INVALID")

    declared = data.get("declared_denominator")
    if not isinstance(declared, int) or isinstance(declared, bool) or declared <= 0:
        errors.append("DENOMINATOR_INVALID")

    checks = data.get("checks")
    if not isinstance(checks, list) or not checks:
        errors.append("CHECKS_MISSING")
        return _blank_result(data, errors)

    seen: set[str] = set()
    required_checks: list[dict[str, Any]] = []
    counts = {status: 0 for status in sorted(ALLOWED_STATUS)}

    for index, check in enumerate(checks):
        prefix = f"CHECK_{index}"
        if not isinstance(check, dict):
            errors.append(f"{prefix}_NOT_OBJECT")
            continue

        check_id = check.get("id")
        if not isinstance(check_id, str) or not check_id.strip():
            errors.append(f"{prefix}_ID_INVALID")
            continue
        if check_id in seen:
            errors.append(f"DUPLICATE_ID:{check_id}")
        seen.add(check_id)

        required = check.get("required")
        if not isinstance(required, bool):
            errors.append(f"REQUIRED_FLAG_INVALID:{check_id}")
            continue

        status = check.get("status")
        if status not in ALLOWED_STATUS:
            errors.append(f"STATUS_INVALID:{check_id}")
            continue
        counts[status] += 1

        if required:
            required_checks.append(check)
            if status == "NOT_APPLICABLE":
                errors.append(f"REQUIRED_NOT_APPLICABLE:{check_id}")
            if status == "PASS" and not _evidence_ok(check.get("evidence")):
                errors.append(f"PASS_WITHOUT_EVIDENCE:{check_id}")
            if status in UNRESOLVED_STATUS:
                next_test = check.get("next_test")
                if not isinstance(next_test, str) or not next_test.strip():
                    errors.append(f"UNRESOLVED_WITHOUT_NEXT_TEST:{check_id}")
        elif status == "NOT_APPLICABLE" and not _evidence_ok(check.get("evidence")):
            errors.append(f"NOT_APPLICABLE_WITHOUT_JUSTIFICATION:{check_id}")

    if isinstance(declared, int) and not isinstance(declared, bool):
        if declared != len(required_checks):
            errors.append(
                f"DENOMINATOR_MISMATCH:declared={declared}:required={len(required_checks)}"
            )

    if errors:
        result = _blank_result(data, errors)
        result["counts"] = counts
        return result

    denominator = declared
    numerator = sum(1 for check in required_checks if check["status"] == "PASS")
    unresolved_checks = [
        check for check in required_checks if check["status"] != "PASS"
    ]
    unresolved = len(unresolved_checks)
    fillers = sum(
        1
        for check in unresolved_checks
        if isinstance(check.get("next_test"), str) and check["next_test"].strip()
    )

    coverage = numerator * 100.0 / denominator
    resolution_plan = None if unresolved == 0 else fillers * 100.0 / unresolved
    claim_100 = numerator == denominator and unresolved == 0

    return {
        "schema_version": SCHEMA_VERSION,
        "scope": data["scope"],
        "head_sha": data["head_sha"],
        "manifest_sha256": manifest_sha256(data),
        "status": "PASS" if claim_100 else "PARTIAL",
        "numerator": numerator,
        "denominator": denominator,
        "coverage_percent": round(coverage, 2),
        "unresolved": unresolved,
        "resolution_plan_percent": None if resolution_plan is None else round(resolution_plan, 2),
        "claim_100_allowed": claim_100,
        "errors": [],
        "unresolved_ids": [check["id"] for check in unresolved_checks],
        "counts": counts,
    }


def _manifest(statuses: list[str], *, with_next: bool = True) -> dict[str, Any]:
    checks = []
    for index, status in enumerate(statuses, 1):
        check: dict[str, Any] = {
            "id": f"C{index}",
            "required": True,
            "status": status,
            "evidence": [f"evidence:C{index}"] if status == "PASS" else [],
        }
        if status in UNRESOLVED_STATUS and with_next:
            check["next_test"] = f"test:C{index}"
        checks.append(check)
    return {
        "schema_version": SCHEMA_VERSION,
        "scope": "META_LUPA_PERCENTUAL_EVIDENCIAL_SELF_TEST",
        "head_sha": "a" * 40,
        "declared_denominator": len(checks),
        "checks": checks,
    }


def run_self_test() -> dict[str, Any]:
    """Executa contraprovas e mede a própria suíte com o mesmo algoritmo."""
    tests: list[tuple[str, bool]] = []

    r = measure_manifest(_manifest(["PASS", "PASS", "PASS"]))
    tests.append(("all_pass_allows_exact_100", r["coverage_percent"] == 100.0 and r["claim_100_allowed"]))
    tests.append(("no_gaps_resolution_plan_is_not_measured", r["resolution_plan_percent"] is None))

    r = measure_manifest(_manifest(["PASS", "PASS", "UNKNOWN"]))
    tests.append(("unknown_counts_against_denominator", r["coverage_percent"] == 66.67 and not r["claim_100_allowed"]))
    tests.append(("unknown_has_explicit_filler", r["resolution_plan_percent"] == 100.0 and r["unresolved_ids"] == ["C3"]))

    m = _manifest(["PASS"])
    m["checks"][0]["evidence"] = []
    r = measure_manifest(m)
    tests.append(("pass_without_evidence_blocks", "PASS_WITHOUT_EVIDENCE:C1" in r["errors"] and r["status"] == "BLOCKED"))

    r = measure_manifest(_manifest(["UNKNOWN"], with_next=False))
    tests.append(("unknown_without_filler_blocks", "UNRESOLVED_WITHOUT_NEXT_TEST:C1" in r["errors"]))

    r = measure_manifest(_manifest(["SKIPPED"]))
    tests.append(("skipped_never_becomes_pass", r["coverage_percent"] == 0.0 and not r["claim_100_allowed"]))

    m = _manifest(["PASS", "PASS"])
    m["declared_denominator"] = 1
    r = measure_manifest(m)
    tests.append(("denominator_tampering_blocks", any(error.startswith("DENOMINATOR_MISMATCH") for error in r["errors"])))

    m = _manifest(["PASS", "PASS"])
    m["checks"][1]["id"] = "C1"
    r = measure_manifest(m)
    tests.append(("duplicate_ids_block", "DUPLICATE_ID:C1" in r["errors"]))

    m = _manifest(["PASS"])
    m["checks"][0]["status"] = "NOT_APPLICABLE"
    m["checks"][0]["evidence"] = ["justification"]
    r = measure_manifest(m)
    tests.append(("required_na_cannot_shrink_denominator", "REQUIRED_NOT_APPLICABLE:C1" in r["errors"]))

    m = _manifest(["PASS"])
    m["declared_denominator"] = 0
    r = measure_manifest(m)
    tests.append(("zero_denominator_is_not_measured", "DENOMINATOR_INVALID" in r["errors"] and r["coverage_percent"] is None))

    m = _manifest(["FAIL"])
    r = measure_manifest(m)
    tests.append(("failure_is_partial_with_next_test", r["status"] == "PARTIAL" and r["coverage_percent"] == 0.0 and r["resolution_plan_percent"] == 100.0))

    digest_a = manifest_sha256(_manifest(["PASS", "UNKNOWN"]))
    digest_b = manifest_sha256(_manifest(["PASS", "UNKNOWN"]))
    tests.append(("manifest_digest_is_deterministic", digest_a == digest_b and len(digest_a) == 64))

    live_head = current_head_sha()
    tests.append(("self_audit_binds_live_git_head", bool(HEAD_SHA_RE.fullmatch(live_head))))

    self_checks = [
        {
            "id": name,
            "required": True,
            "status": "PASS" if ok else "FAIL",
            "evidence": [f"self-test:{name}"] if ok else [],
            "next_test": "corrigir a contraprova e repetir self-test" if not ok else "",
        }
        for name, ok in tests
    ]
    audit_manifest = {
        "schema_version": SCHEMA_VERSION,
        "scope": "META_LUPA_PERCENTUAL_EVIDENCIAL_SELF_AUDIT",
        "head_sha": live_head,
        "declared_denominator": len(self_checks),
        "checks": self_checks,
    }
    audit = measure_manifest(audit_manifest)
    audit["tests"] = [{"id": name, "pass": ok} for name, ok in tests]
    return audit


def _print(result: dict[str, Any]) -> None:
    print(json.dumps(result, ensure_ascii=False, sort_keys=True, indent=2))


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Percentual evidencial fail-closed da Meta Lupa")
    sub = parser.add_subparsers(dest="command", required=True)

    measure = sub.add_parser("measure", help="medir um manifesto JSON de checks")
    measure.add_argument("--input", required=True)

    sub.add_parser("self-test", help="rodar contraprovas e dogfood do medidor")
    args = parser.parse_args(argv)

    if args.command == "measure":
        try:
            data = json.loads(Path(args.input).read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError) as exc:
            _print(_blank_result({}, [f"INPUT_INVALID:{type(exc).__name__}"]))
            return 1
        result = measure_manifest(data)
        _print(result)
        if result["status"] == "PASS":
            return 0
        if result["status"] == "PARTIAL":
            return 2
        return 1

    audit = run_self_test()
    _print(audit)
    if audit["claim_100_allowed"]:
        print(
            "META_LUPA_PERCENTUAL_EVIDENCIAL="
            f"{audit['numerator']}/{audit['denominator']}="
            f"{audit['coverage_percent']:.2f}%"
        )
        print("CLAIM_100_ALLOWED=SIM_NO_ESCOPO_FECHADO")
        return 0
    print("CLAIM_100_ALLOWED=NAO")
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
