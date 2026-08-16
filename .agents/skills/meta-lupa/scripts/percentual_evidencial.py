#!/usr/bin/env python3
"""Percentual evidencial fail-closed para a Meta Lupa.

Mede somente escopos finitos e declarados. 100% significa exatamente
NUMERADOR == DENOMINADOR no contrato fornecido; nunca certeza universal.
Medição longitudinal exige baseline, rubrica, dimensões, pesos, numeradores,
denominadores e evidência comparável; sem isso o resultado é NOT_MEASURED.
Baseline não é benchmark e medição longitudinal não exige deploy.

Uso:
  python scripts/percentual_evidencial.py measure --input manifest.json
  python scripts/percentual_evidencial.py longitudinal --input manifest.json
  python scripts/percentual_evidencial.py self-test
"""
from __future__ import annotations

import argparse
import hashlib
import json
import math
import re
import subprocess
import sys
from pathlib import Path
from typing import Any

SCHEMA_VERSION = 1
HEAD_SHA_RE = re.compile(r"^[0-9a-f]{40}$")
LONGITUDINAL_KIND = "LONGITUDINAL_DELTA"
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


def _finite_number(value: Any) -> bool:
    return (
        isinstance(value, (int, float))
        and not isinstance(value, bool)
        and math.isfinite(float(value))
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


def _longitudinal_blank_result(data: Any, errors: list[str]) -> dict[str, Any]:
    return {
        "schema_version": SCHEMA_VERSION,
        "scope": data.get("scope") if isinstance(data, dict) else None,
        "head_sha": data.get("head_sha") if isinstance(data, dict) else None,
        "manifest_sha256": manifest_sha256(data),
        "measurement_kind": LONGITUDINAL_KIND,
        "status": "NOT_MEASURED",
        "rubric_name": data.get("rubric_name") if isinstance(data, dict) else None,
        "baseline_ref": data.get("baseline_ref") if isinstance(data, dict) else None,
        "current_ref": data.get("current_ref") if isinstance(data, dict) else None,
        "baseline_percent": None,
        "current_percent": None,
        "delta_percentage_points": None,
        "relative_change_percent": None,
        "weight_denominator": None,
        "dimensions": [],
        "claim_class": "RUBRIC_COVERAGE_ONLY",
        "underlying_capability_claim_proven": False,
        "baseline_is_benchmark": False,
        "benchmark_required": False,
        "deploy_required": False,
        "errors": sorted(set(errors)),
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


def measure_longitudinal_manifest(data: Any) -> dict[str, Any]:
    """Mede mudança A→B na mesma rubrica sem exigir benchmark ou deploy.

    Cada dimensão precisa declarar peso e fração observável tanto no baseline
    quanto no estado atual. Percentual sem baseline, dimensão, peso, numerador,
    denominador ou evidência comparável não é estimado: fica NOT_MEASURED.

    O resultado mede somente cobertura da rubrica declarada. Uma rubrica chamada
    `AGI-LIKE`, por exemplo, continua sendo cobertura daquela rubrica e não prova
    AGI, consciência, inteligência geral ou qualquer claim externo à régua.
    """
    if not isinstance(data, dict):
        return _longitudinal_blank_result(data, ["MANIFEST_NOT_OBJECT"])

    errors: list[str] = []
    if data.get("schema_version") != SCHEMA_VERSION:
        errors.append("SCHEMA_VERSION_INVALID")
    if data.get("measurement_kind") != LONGITUDINAL_KIND:
        errors.append("MEASUREMENT_KIND_INVALID")
    if not isinstance(data.get("scope"), str) or not data["scope"].strip():
        errors.append("SCOPE_MISSING")
    if not HEAD_SHA_RE.fullmatch(str(data.get("head_sha", ""))):
        errors.append("HEAD_SHA_INVALID")
    if not isinstance(data.get("rubric_name"), str) or not data["rubric_name"].strip():
        errors.append("RUBRIC_NAME_MISSING")
    if not isinstance(data.get("baseline_ref"), str) or not data["baseline_ref"].strip():
        errors.append("BASELINE_REF_MISSING")
    if not isinstance(data.get("current_ref"), str) or not data["current_ref"].strip():
        errors.append("CURRENT_REF_MISSING")

    dimensions = data.get("dimensions")
    if not isinstance(dimensions, list) or not dimensions:
        errors.append("DIMENSIONS_MISSING")
        return _longitudinal_blank_result(data, errors)

    seen: set[str] = set()
    measured: list[dict[str, Any]] = []
    weighted_baseline = 0.0
    weighted_current = 0.0
    total_weight = 0.0

    for index, dimension in enumerate(dimensions):
        prefix = f"DIMENSION_{index}"
        if not isinstance(dimension, dict):
            errors.append(f"{prefix}_NOT_OBJECT")
            continue

        dimension_id = dimension.get("id")
        if not isinstance(dimension_id, str) or not dimension_id.strip():
            errors.append(f"{prefix}_ID_INVALID")
            continue
        if dimension_id in seen:
            errors.append(f"DUPLICATE_DIMENSION:{dimension_id}")
        seen.add(dimension_id)

        weight = dimension.get("weight")
        if not _finite_number(weight) or float(weight) <= 0:
            errors.append(f"WEIGHT_INVALID:{dimension_id}")
            continue

        endpoints: dict[str, tuple[float, float, float]] = {}
        endpoint_ok = True
        for endpoint_name in ("baseline", "current"):
            endpoint = dimension.get(endpoint_name)
            if not isinstance(endpoint, dict):
                errors.append(f"{endpoint_name.upper()}_MISSING:{dimension_id}")
                endpoint_ok = False
                continue

            numerator = endpoint.get("numerator")
            denominator = endpoint.get("denominator")
            if not _finite_number(numerator):
                errors.append(f"{endpoint_name.upper()}_NUMERATOR_INVALID:{dimension_id}")
                endpoint_ok = False
            if not _finite_number(denominator) or float(denominator) <= 0:
                errors.append(f"{endpoint_name.upper()}_DENOMINATOR_INVALID:{dimension_id}")
                endpoint_ok = False
            if (
                _finite_number(numerator)
                and _finite_number(denominator)
                and float(denominator) > 0
                and not 0.0 <= float(numerator) <= float(denominator)
            ):
                errors.append(f"{endpoint_name.upper()}_FRACTION_RANGE:{dimension_id}")
                endpoint_ok = False
            if not _evidence_ok(endpoint.get("evidence")):
                errors.append(f"{endpoint_name.upper()}_EVIDENCE_MISSING:{dimension_id}")
                endpoint_ok = False

            if endpoint_ok and _finite_number(numerator) and _finite_number(denominator):
                percent = 100.0 * float(numerator) / float(denominator)
                endpoints[endpoint_name] = (float(numerator), float(denominator), percent)

        if not endpoint_ok or len(endpoints) != 2:
            continue

        baseline_percent = endpoints["baseline"][2]
        current_percent = endpoints["current"][2]
        dimension_weight = float(weight)
        total_weight += dimension_weight
        weighted_baseline += baseline_percent * dimension_weight
        weighted_current += current_percent * dimension_weight
        measured.append({
            "id": dimension_id,
            "weight": dimension_weight,
            "baseline": {
                "numerator": endpoints["baseline"][0],
                "denominator": endpoints["baseline"][1],
                "percent": round(baseline_percent, 2),
            },
            "current": {
                "numerator": endpoints["current"][0],
                "denominator": endpoints["current"][1],
                "percent": round(current_percent, 2),
            },
            "delta_percentage_points": round(current_percent - baseline_percent, 2),
        })

    if errors or len(measured) != len(dimensions) or total_weight <= 0:
        return _longitudinal_blank_result(data, errors or ["DIMENSIONS_NOT_MEASURABLE"])

    baseline_percent = weighted_baseline / total_weight
    current_percent = weighted_current / total_weight
    delta_pp = current_percent - baseline_percent
    relative_change = None
    if baseline_percent > 0:
        relative_change = 100.0 * delta_pp / baseline_percent

    return {
        "schema_version": SCHEMA_VERSION,
        "scope": data["scope"],
        "head_sha": data["head_sha"],
        "manifest_sha256": manifest_sha256(data),
        "measurement_kind": LONGITUDINAL_KIND,
        "status": "MEASURED",
        "rubric_name": data["rubric_name"],
        "baseline_ref": data["baseline_ref"],
        "current_ref": data["current_ref"],
        "baseline_percent": round(baseline_percent, 2),
        "current_percent": round(current_percent, 2),
        "delta_percentage_points": round(delta_pp, 2),
        "relative_change_percent": None if relative_change is None else round(relative_change, 2),
        "weight_denominator": round(total_weight, 6),
        "dimensions": measured,
        "claim_class": "RUBRIC_COVERAGE_ONLY",
        "underlying_capability_claim_proven": False,
        "baseline_is_benchmark": False,
        "benchmark_required": False,
        "deploy_required": False,
        "errors": [],
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


def _longitudinal_manifest() -> dict[str, Any]:
    return {
        "schema_version": SCHEMA_VERSION,
        "measurement_kind": LONGITUDINAL_KIND,
        "scope": "META_LUPA_LONGITUDINAL_SELF_TEST",
        "head_sha": "a" * 40,
        "rubric_name": "AGI-LIKE TEST RUBRIC",
        "baseline_ref": "session:start",
        "current_ref": "session:current",
        "dimensions": [
            {
                "id": "D1",
                "weight": 1,
                "baseline": {"numerator": 1, "denominator": 2, "evidence": ["baseline:D1"]},
                "current": {"numerator": 2, "denominator": 2, "evidence": ["current:D1"]},
            },
            {
                "id": "D2",
                "weight": 1,
                "baseline": {"numerator": 1, "denominator": 1, "evidence": ["baseline:D2"]},
                "current": {"numerator": 1, "denominator": 1, "evidence": ["current:D2"]},
            },
        ],
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

    r = measure_longitudinal_manifest(_longitudinal_manifest())
    tests.append(("longitudinal_requires_explicit_same_rubric", r["status"] == "MEASURED" and r["baseline_percent"] == 75.0 and r["current_percent"] == 100.0 and r["delta_percentage_points"] == 25.0))
    tests.append(("longitudinal_is_rubric_coverage_not_agi_proof", r["claim_class"] == "RUBRIC_COVERAGE_ONLY" and not r["underlying_capability_claim_proven"]))
    tests.append(("longitudinal_needs_no_benchmark_or_deploy", not r["benchmark_required"] and not r["deploy_required"] and not r["baseline_is_benchmark"]))

    m = _longitudinal_manifest()
    del m["baseline_ref"]
    r = measure_longitudinal_manifest(m)
    tests.append(("longitudinal_without_baseline_is_not_measured", r["status"] == "NOT_MEASURED" and "BASELINE_REF_MISSING" in r["errors"]))

    m = _longitudinal_manifest()
    del m["dimensions"][0]["weight"]
    r = measure_longitudinal_manifest(m)
    tests.append(("longitudinal_without_weight_is_not_measured", r["status"] == "NOT_MEASURED" and "WEIGHT_INVALID:D1" in r["errors"]))

    m = _longitudinal_manifest()
    m["dimensions"][0]["current"]["evidence"] = []
    r = measure_longitudinal_manifest(m)
    tests.append(("longitudinal_without_evidence_is_not_measured", r["status"] == "NOT_MEASURED" and "CURRENT_EVIDENCE_MISSING:D1" in r["errors"]))

    m = _longitudinal_manifest()
    m["dimensions"][0]["baseline"]["denominator"] = 0
    r = measure_longitudinal_manifest(m)
    tests.append(("longitudinal_without_denominator_is_not_measured", r["status"] == "NOT_MEASURED" and "BASELINE_DENOMINATOR_INVALID:D1" in r["errors"]))

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


def _load_input(path: str) -> dict[str, Any]:
    return json.loads(Path(path).read_text(encoding="utf-8"))


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Percentual evidencial fail-closed da Meta Lupa")
    sub = parser.add_subparsers(dest="command", required=True)

    measure = sub.add_parser("measure", help="medir um manifesto JSON de checks")
    measure.add_argument("--input", required=True)

    longitudinal = sub.add_parser("longitudinal", help="medir delta A→B na mesma rubrica declarada")
    longitudinal.add_argument("--input", required=True)

    sub.add_parser("self-test", help="rodar contraprovas e dogfood do medidor")
    args = parser.parse_args(argv)

    if args.command in {"measure", "longitudinal"}:
        try:
            data = _load_input(args.input)
        except (OSError, json.JSONDecodeError) as exc:
            if args.command == "longitudinal":
                _print(_longitudinal_blank_result({}, [f"INPUT_INVALID:{type(exc).__name__}"]))
            else:
                _print(_blank_result({}, [f"INPUT_INVALID:{type(exc).__name__}"]))
            return 1

        if args.command == "longitudinal":
            result = measure_longitudinal_manifest(data)
            _print(result)
            return 0 if result["status"] == "MEASURED" else 1

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
