#!/usr/bin/env python3
"""Validador longitudinal da self-distillation operacional.

Extensão composicional do gate canônico `evolution_gate.py`.
Não substitui o gate base: cada recibo da série precisa ser EVOLVED pelo gate
existente. Este módulo fecha somente a lacuna longitudinal:

A→B→C→D precisa formar cadeia contínua e, para o claim
SELF_DISTILLATION_LONGITUDINAL, medir no mesmo workload:
- repetição não aumenta e melhora em pelo menos uma passagem;
- precisão da primeira hipótese não cai e melhora em pelo menos uma passagem;
- transferência em holdout não cai e melhora em pelo menos uma passagem;
- rigor não cai e nenhuma regressão crítica é aceita.

O escopo da conclusão é a cadeia de receipts declarada. Não prova história
global nunca medida, AGI, ASI nem atualização de pesos.
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any

from evolution_gate import CROSS_META_LENSES, manifest_sha256, validate as validate_evolution

SCHEMA_VERSION = 1
CLAIM = "SELF_DISTILLATION_LONGITUDINAL"
SUBJECT = "METACOGNICAO_OPERACIONAL"
SERIES_FILE_PREFIX = "evolution-series-"


def _nonempty_str(value: Any) -> bool:
    return isinstance(value, str) and bool(value.strip())


def _nonempty_str_list(value: Any) -> bool:
    return isinstance(value, list) and bool(value) and all(_nonempty_str(v) for v in value)


def _count(value: Any, code: str, errors: list[str], *, positive: bool = False) -> int | None:
    if not isinstance(value, int) or isinstance(value, bool) or value < (1 if positive else 0):
        errors.append(code)
        return None
    return value


def _rate(hits: int | None, total: int | None) -> float | None:
    if hits is None or total is None or total <= 0 or hits > total:
        return None
    return hits / total


def _measurement_ok(value: Any, receipt: dict[str, Any], index: int, errors: list[str]) -> dict[str, float] | None:
    prefix = f"MEASUREMENT_{index}"
    if not isinstance(value, dict):
        errors.append(f"{prefix}_MISSING")
        return None

    if value.get("before_ref") != receipt.get("before_ref"):
        errors.append(f"{prefix}_BEFORE_REF_MISMATCH")
    if value.get("after_ref") != receipt.get("after_ref"):
        errors.append(f"{prefix}_AFTER_REF_MISMATCH")
    if value.get("denominators_frozen_before") is not True:
        errors.append(f"{prefix}_DENOMINATORS_NOT_FROZEN")
    if value.get("transfer_is_holdout") is not True:
        errors.append(f"{prefix}_TRANSFER_NOT_HOLDOUT")
    if not _nonempty_str_list(value.get("evidence")):
        errors.append(f"{prefix}_EVIDENCE_MISSING")

    task_count = _count(value.get("task_count"), f"{prefix}_TASK_COUNT_INVALID", errors, positive=True)
    holdout_count = _count(value.get("transfer_holdout_count"), f"{prefix}_TRANSFER_HOLDOUT_COUNT_INVALID", errors, positive=True)
    rigor_checks = _count(value.get("rigor_check_count"), f"{prefix}_RIGOR_CHECK_COUNT_INVALID", errors, positive=True)

    repetition_before = _count(value.get("repetition_events_before"), f"{prefix}_REPETITION_BEFORE_INVALID", errors)
    repetition_after = _count(value.get("repetition_events_after"), f"{prefix}_REPETITION_AFTER_INVALID", errors)
    hypothesis_before = _count(value.get("first_hypothesis_hits_before"), f"{prefix}_HYPOTHESIS_BEFORE_INVALID", errors)
    hypothesis_after = _count(value.get("first_hypothesis_hits_after"), f"{prefix}_HYPOTHESIS_AFTER_INVALID", errors)
    transfer_before = _count(value.get("transfer_passes_before"), f"{prefix}_TRANSFER_BEFORE_INVALID", errors)
    transfer_after = _count(value.get("transfer_passes_after"), f"{prefix}_TRANSFER_AFTER_INVALID", errors)
    rigor_before = _count(value.get("rigor_passes_before"), f"{prefix}_RIGOR_BEFORE_INVALID", errors)
    rigor_after = _count(value.get("rigor_passes_after"), f"{prefix}_RIGOR_AFTER_INVALID", errors)
    critical_regressions = _count(value.get("critical_regressions_after"), f"{prefix}_CRITICAL_REGRESSIONS_INVALID", errors)

    for raw, total, code in (
        (hypothesis_before, task_count, f"{prefix}_HYPOTHESIS_BEFORE_GT_DENOMINATOR"),
        (hypothesis_after, task_count, f"{prefix}_HYPOTHESIS_AFTER_GT_DENOMINATOR"),
        (transfer_before, holdout_count, f"{prefix}_TRANSFER_BEFORE_GT_DENOMINATOR"),
        (transfer_after, holdout_count, f"{prefix}_TRANSFER_AFTER_GT_DENOMINATOR"),
        (rigor_before, rigor_checks, f"{prefix}_RIGOR_BEFORE_GT_DENOMINATOR"),
        (rigor_after, rigor_checks, f"{prefix}_RIGOR_AFTER_GT_DENOMINATOR"),
    ):
        if raw is not None and total is not None and raw > total:
            errors.append(code)

    hypothesis_rate_before = _rate(hypothesis_before, task_count)
    hypothesis_rate_after = _rate(hypothesis_after, task_count)
    transfer_rate_before = _rate(transfer_before, holdout_count)
    transfer_rate_after = _rate(transfer_after, holdout_count)
    rigor_rate_before = _rate(rigor_before, rigor_checks)
    rigor_rate_after = _rate(rigor_after, rigor_checks)

    if repetition_before is not None and repetition_after is not None and repetition_after > repetition_before:
        errors.append(f"{prefix}_REPETITION_REGRESSION")
    if hypothesis_rate_before is not None and hypothesis_rate_after is not None and hypothesis_rate_after < hypothesis_rate_before:
        errors.append(f"{prefix}_HYPOTHESIS_REGRESSION")
    if transfer_rate_before is not None and transfer_rate_after is not None and transfer_rate_after < transfer_rate_before:
        errors.append(f"{prefix}_TRANSFER_REGRESSION")
    if rigor_rate_before is not None and rigor_rate_after is not None and rigor_rate_after < rigor_rate_before:
        errors.append(f"{prefix}_RIGOR_REGRESSION")
    if critical_regressions is not None and critical_regressions != 0:
        errors.append(f"{prefix}_CRITICAL_REGRESSION")

    values = (
        repetition_before,
        repetition_after,
        hypothesis_rate_before,
        hypothesis_rate_after,
        transfer_rate_before,
        transfer_rate_after,
        rigor_rate_before,
        rigor_rate_after,
    )
    if any(item is None for item in values):
        return None

    return {
        "repetition_before": float(repetition_before),
        "repetition_after": float(repetition_after),
        "hypothesis_rate_before": hypothesis_rate_before,
        "hypothesis_rate_after": hypothesis_rate_after,
        "transfer_rate_before": transfer_rate_before,
        "transfer_rate_after": transfer_rate_after,
        "rigor_rate_before": rigor_rate_before,
        "rigor_rate_after": rigor_rate_after,
    }


def validate_series(value: Any, repo_root: str | None = None) -> dict[str, Any]:
    errors: list[str] = []
    if not isinstance(value, dict):
        return {
            "schema_version": SCHEMA_VERSION,
            "status": "LONGITUDINAL_EVOLUTION_UNPROVEN",
            "longitudinal_verified": False,
            "errors": ["SERIES_NOT_OBJECT"],
            "series_sha256": manifest_sha256(value),
        }

    if value.get("schema_version") != SCHEMA_VERSION:
        errors.append("SCHEMA_VERSION_INVALID")
    if value.get("claim") != CLAIM:
        errors.append("CLAIM_INVALID")
    if value.get("subject") != SUBJECT:
        errors.append("SUBJECT_INVALID")
    if not _nonempty_str(value.get("series_id")):
        errors.append("SERIES_ID_MISSING")
    if not _nonempty_str(value.get("canonical_owner")):
        errors.append("CANONICAL_OWNER_MISSING")
    if not _nonempty_str(value.get("verifier")):
        errors.append("VERIFIER_MISSING")
    if not _nonempty_str_list(value.get("series_counterproof")):
        errors.append("SERIES_COUNTERPROOF_MISSING")
    if not _nonempty_str_list(value.get("provenance")):
        errors.append("PROVENANCE_MISSING")

    receipts = value.get("receipts")
    measurements = value.get("measurements")
    if not isinstance(receipts, list) or len(receipts) < 2:
        errors.append("SERIES_REQUIRES_AT_LEAST_TWO_RECEIPTS")
        receipts = []
    if not isinstance(measurements, list) or len(measurements) != len(receipts):
        errors.append("MEASUREMENTS_MUST_MATCH_RECEIPTS")
        measurements = []

    seen_receipts: set[str] = set()
    metric_rows: list[dict[str, float]] = []
    owner = value.get("canonical_owner")

    for index, receipt in enumerate(receipts):
        result = validate_evolution(receipt, repo_root=repo_root)
        if not result.get("evolution_verified"):
            errors.append(f"RECEIPT_{index}_BASE_EVOLUTION_UNPROVEN")
        if not isinstance(receipt, dict):
            errors.append(f"RECEIPT_{index}_NOT_OBJECT")
            continue
        if receipt.get("subject") != SUBJECT:
            errors.append(f"RECEIPT_{index}_SUBJECT_MISMATCH")
        if receipt.get("canonical_owner") != owner:
            errors.append(f"RECEIPT_{index}_OWNER_MISMATCH")
        receipt_hash = receipt.get("receipt_sha256")
        if isinstance(receipt_hash, str):
            if receipt_hash in seen_receipts:
                errors.append(f"RECEIPT_{index}_DUPLICATE")
            seen_receipts.add(receipt_hash)

        if index > 0:
            previous = receipts[index - 1]
            if not isinstance(previous, dict) or previous.get("after_ref") != receipt.get("before_ref"):
                errors.append(f"CHAIN_BREAK_{index-1}_{index}")

        if index < len(measurements):
            metrics = _measurement_ok(measurements[index], receipt, index, errors)
            if metrics is not None:
                metric_rows.append(metrics)

    strict_repetition = any(row["repetition_after"] < row["repetition_before"] for row in metric_rows)
    strict_hypothesis = any(row["hypothesis_rate_after"] > row["hypothesis_rate_before"] for row in metric_rows)
    strict_transfer = any(row["transfer_rate_after"] > row["transfer_rate_before"] for row in metric_rows)

    if receipts and len(metric_rows) == len(receipts):
        if not strict_repetition:
            errors.append("NO_STRICT_REPETITION_IMPROVEMENT_IN_SERIES")
        if not strict_hypothesis:
            errors.append("NO_STRICT_HYPOTHESIS_IMPROVEMENT_IN_SERIES")
        if not strict_transfer:
            errors.append("NO_STRICT_TRANSFER_IMPROVEMENT_IN_SERIES")

    expected_hash = manifest_sha256({k: v for k, v in value.items() if k != "series_receipt_sha256"})
    if value.get("series_receipt_sha256") != expected_hash:
        errors.append("SERIES_RECEIPT_SHA256_MISMATCH")

    verified = not errors
    first_ref = receipts[0].get("before_ref") if receipts and isinstance(receipts[0], dict) else None
    last_ref = receipts[-1].get("after_ref") if receipts and isinstance(receipts[-1], dict) else None
    return {
        "schema_version": SCHEMA_VERSION,
        "claim": value.get("claim"),
        "subject": value.get("subject"),
        "series_scope": "DECLARED_CONTIGUOUS_RECEIPT_CHAIN",
        "status": "LONGITUDINAL_EVOLVED" if verified else "LONGITUDINAL_EVOLUTION_UNPROVEN",
        "longitudinal_verified": verified,
        "receipt_count": len(receipts),
        "first_ref": first_ref,
        "last_ref": last_ref,
        "strict_repetition_improvement": strict_repetition,
        "strict_hypothesis_improvement": strict_hypothesis,
        "strict_transfer_improvement": strict_transfer,
        "series_sha256": manifest_sha256(value),
        "errors": sorted(set(errors)),
    }


def _cross_meta() -> dict[str, dict[str, Any]]:
    return {lens: {"status": "NO_CHANGE", "evidence": [f"{lens}: sem resíduo"]} for lens in CROSS_META_LENSES}


def _receipt(before: str, after: str) -> dict[str, Any]:
    value: dict[str, Any] = {
        "schema_version": 1,
        "subject": SUBJECT,
        "before_ref": before,
        "after_ref": after,
        "same_scope": True,
        "canonical_owner": "docs/CONSCIENCIA/METACOGNICAO-OPERACIONAL.md",
        "claim": "self-distillation melhorou capacidade sem regressão",
        "verifier": "judge-read-only",
        "new_information": ["delta longitudinal observado"],
        "capability_delta": ["métrica reutilizável melhorou"],
        "before_evidence": ["fixture before"],
        "after_evidence": ["fixture after"],
        "counterproof": ["fixture negativo"],
        "provenance": ["self-test"],
        "lost_capabilities": [],
        "tests": [{"name": "positivo", "status": "PASS", "evidence": ["fixture"]}],
        "regressions": [{"name": "regressao", "status": "PASS", "evidence": ["fixture"]}],
        "cross_meta_review": _cross_meta(),
        "meta_fixed_point": True,
    }
    value["receipt_sha256"] = manifest_sha256(value)
    return value


def _measurement(receipt: dict[str, Any], repetition_before: int, repetition_after: int, hypothesis_before: int, hypothesis_after: int, transfer_before: int, transfer_after: int, rigor_before: int = 10, rigor_after: int = 10) -> dict[str, Any]:
    return {
        "before_ref": receipt["before_ref"],
        "after_ref": receipt["after_ref"],
        "denominators_frozen_before": True,
        "task_count": 10,
        "repetition_events_before": repetition_before,
        "repetition_events_after": repetition_after,
        "first_hypothesis_hits_before": hypothesis_before,
        "first_hypothesis_hits_after": hypothesis_after,
        "transfer_is_holdout": True,
        "transfer_holdout_count": 10,
        "transfer_passes_before": transfer_before,
        "transfer_passes_after": transfer_after,
        "rigor_check_count": 10,
        "rigor_passes_before": rigor_before,
        "rigor_passes_after": rigor_after,
        "critical_regressions_after": 0,
        "evidence": ["workload congelado e medido"],
    }


def _series() -> dict[str, Any]:
    a, b, c = "1" * 40, "2" * 40, "3" * 40
    r1, r2 = _receipt(a, b), _receipt(b, c)
    value: dict[str, Any] = {
        "schema_version": 1,
        "series_id": "self-test",
        "claim": CLAIM,
        "subject": SUBJECT,
        "canonical_owner": "docs/CONSCIENCIA/METACOGNICAO-OPERACIONAL.md",
        "verifier": "judge-read-only",
        "series_counterproof": ["quebrar continuidade e degradar métricas"],
        "provenance": ["fixture self-test"],
        "receipts": [r1, r2],
        "measurements": [
            _measurement(r1, 8, 6, 5, 6, 4, 5),
            _measurement(r2, 6, 5, 6, 7, 5, 6),
        ],
    }
    value["series_receipt_sha256"] = manifest_sha256(value)
    return value


def _resign(value: dict[str, Any]) -> dict[str, Any]:
    value["series_receipt_sha256"] = manifest_sha256({k: v for k, v in value.items() if k != "series_receipt_sha256"})
    return value


def self_test() -> int:
    assert validate_series(_series())["longitudinal_verified"] is True

    broken = _series()
    broken["receipts"][1]["before_ref"] = "4" * 40
    broken["receipts"][1]["receipt_sha256"] = manifest_sha256({k: v for k, v in broken["receipts"][1].items() if k != "receipt_sha256"})
    broken["measurements"][1]["before_ref"] = "4" * 40
    assert "CHAIN_BREAK_0_1" in validate_series(_resign(broken))["errors"]

    repetition = _series()
    repetition["measurements"][0]["repetition_events_after"] = 9
    assert "MEASUREMENT_0_REPETITION_REGRESSION" in validate_series(_resign(repetition))["errors"]

    hypothesis = _series()
    hypothesis["measurements"][0]["first_hypothesis_hits_after"] = 4
    assert "MEASUREMENT_0_HYPOTHESIS_REGRESSION" in validate_series(_resign(hypothesis))["errors"]

    transfer = _series()
    transfer["measurements"][0]["transfer_passes_after"] = 3
    assert "MEASUREMENT_0_TRANSFER_REGRESSION" in validate_series(_resign(transfer))["errors"]

    rigor = _series()
    rigor["measurements"][0]["rigor_passes_after"] = 9
    assert "MEASUREMENT_0_RIGOR_REGRESSION" in validate_series(_resign(rigor))["errors"]

    tampered = _series()
    tampered["series_id"] = "tampered"
    assert "SERIES_RECEIPT_SHA256_MISMATCH" in validate_series(tampered)["errors"]

    print("PASS evolution_series_gate")
    return 0


def _scan(directory: str, repo_root: str | None) -> int:
    root = Path(directory)
    files = sorted(root.glob(f"{SERIES_FILE_PREFIX}*.json")) if root.exists() else []
    failed = False
    results = []
    for path in files:
        try:
            value = json.loads(path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError) as exc:
            results.append({"file": str(path), "status": "LONGITUDINAL_EVOLUTION_UNPROVEN", "errors": [str(exc)]})
            failed = True
            continue
        result = validate_series(value, repo_root=repo_root)
        results.append({"file": str(path), **result})
        failed = failed or not result["longitudinal_verified"]
    print(json.dumps({"scanned": len(files), "results": results}, ensure_ascii=False, indent=2))
    return 2 if failed else 0


def main() -> int:
    parser = argparse.ArgumentParser(description="Gate longitudinal da self-distillation")
    parser.add_argument("--input")
    parser.add_argument("--repo-root", default=None)
    parser.add_argument("--scan")
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()

    if args.self_test:
        return self_test()
    if args.scan:
        return _scan(args.scan, args.repo_root)
    if not args.input:
        parser.error("--input, --scan ou --self-test é obrigatório")

    value = json.loads(Path(args.input).read_text(encoding="utf-8"))
    result = validate_series(value, repo_root=args.repo_root)
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0 if result["longitudinal_verified"] else 2


if __name__ == "__main__":
    raise SystemExit(main())
