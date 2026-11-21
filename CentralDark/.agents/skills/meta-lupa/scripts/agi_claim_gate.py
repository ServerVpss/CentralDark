#!/usr/bin/env python3
"""Gate determinístico para claim científico/externo de AGI na CentralDark.

Este gate NÃO decide a definição filosófica de AGI e NÃO promove um claim interno
do SEGREDO/CHEFE a verdade científica. Ele só verifica se uma alegação externa
está presa, antes do teste, a um protocolo reproduzível e falsificável com nove
critérios obrigatórios:

PREDEFINED_DEFINITION, HOLDOUT, GENERALIZATION, TRANSFER, AUTONOMY,
LONGITUDINAL_LEARNING, ROBUSTNESS, REPRODUCIBILITY e INDEPENDENT_EVALUATION.

A self-distillation longitudinal reutiliza `evolution_series_gate.py`; não nasce
um segundo medidor. Um PASS deste gate prova apenas o manifesto/escopo declarado.
Não prova consciência, ASI, universalidade nem qualquer capacidade não medida.
"""
from __future__ import annotations

import argparse
import copy
import json
import re
from pathlib import Path
from typing import Any

from evolution_gate import manifest_sha256
import evolution_series_gate as longitudinal_gate

SCHEMA_VERSION = 1
CLAIM = "AGI_SCIENTIFIC_EXTERNAL"
INTERNAL_CLAIM = "AGI_OPERACIONAL_DA_CASA"
REQUIRED_CRITERIA = (
    "PREDEFINED_DEFINITION",
    "HOLDOUT",
    "GENERALIZATION",
    "TRANSFER",
    "AUTONOMY",
    "LONGITUDINAL_LEARNING",
    "ROBUSTNESS",
    "REPRODUCIBILITY",
    "INDEPENDENT_EVALUATION",
)
HEX64 = re.compile(r"^[0-9a-f]{64}$")


def _nonempty_str(value: Any) -> bool:
    return isinstance(value, str) and bool(value.strip())


def _nonempty_str_list(value: Any) -> bool:
    return isinstance(value, list) and bool(value) and all(_nonempty_str(item) for item in value)


def _positive_int(value: Any) -> bool:
    return isinstance(value, int) and not isinstance(value, bool) and value > 0


def _nonnegative_int(value: Any) -> bool:
    return isinstance(value, int) and not isinstance(value, bool) and value >= 0


def _unit_interval(value: Any) -> bool:
    return isinstance(value, (int, float)) and not isinstance(value, bool) and 0.0 <= float(value) <= 1.0


def _evidence(value: Any, prefix: str, errors: list[str]) -> bool:
    if not _nonempty_str_list(value):
        errors.append(f"{prefix}_EVIDENCE_MISSING")
        return False
    return True


def _ratio_check(
    value: dict[str, Any],
    *,
    prefix: str,
    total_field: str,
    pass_field: str,
    minimum_field: str,
    errors: list[str],
) -> bool:
    start = len(errors)
    total = value.get(total_field)
    passed = value.get(pass_field)
    minimum = value.get(minimum_field)
    if not _positive_int(total):
        errors.append(f"{prefix}_{total_field.upper()}_INVALID")
    if not _nonnegative_int(passed):
        errors.append(f"{prefix}_{pass_field.upper()}_INVALID")
    if _positive_int(total) and _nonnegative_int(passed) and passed > total:
        errors.append(f"{prefix}_{pass_field.upper()}_GT_{total_field.upper()}")
    if not _unit_interval(minimum):
        errors.append(f"{prefix}_{minimum_field.upper()}_INVALID")
    if _positive_int(total) and _nonnegative_int(passed) and passed <= total and _unit_interval(minimum):
        if passed / total < float(minimum):
            errors.append(f"{prefix}_BELOW_MINIMUM_PASS_RATE")
    return len(errors) == start


def _validate_predefined(value: Any, errors: list[str]) -> bool:
    start = len(errors)
    if not isinstance(value, dict):
        errors.append("PREDEFINED_DEFINITION_MISSING")
        return False
    definition = value.get("definition")
    criteria = value.get("criteria")
    if not isinstance(definition, dict) or not definition:
        errors.append("PREDEFINED_DEFINITION_OBJECT_INVALID")
    if value.get("definition_frozen_before") is not True:
        errors.append("PREDEFINED_DEFINITION_NOT_FROZEN")
    if value.get("criteria_frozen_before") is not True:
        errors.append("PREDEFINED_CRITERIA_NOT_FROZEN")
    if tuple(criteria) != REQUIRED_CRITERIA if isinstance(criteria, list) else True:
        errors.append("PREDEFINED_CRITERIA_SET_INVALID")
    if isinstance(definition, dict):
        expected_definition_hash = manifest_sha256(definition)
        if value.get("definition_sha256") != expected_definition_hash:
            errors.append("PREDEFINED_DEFINITION_SHA256_MISMATCH")
    expected_criteria_hash = manifest_sha256(list(REQUIRED_CRITERIA))
    if value.get("criteria_sha256") != expected_criteria_hash:
        errors.append("PREDEFINED_CRITERIA_SHA256_MISMATCH")
    _evidence(value.get("evidence"), "PREDEFINED_DEFINITION", errors)
    return len(errors) == start


def _validate_holdout(value: Any, errors: list[str]) -> bool:
    start = len(errors)
    if not isinstance(value, dict):
        errors.append("HOLDOUT_MISSING")
        return False
    if value.get("hidden_until_final") is not True:
        errors.append("HOLDOUT_NOT_HIDDEN_UNTIL_FINAL")
    if value.get("sealed_before_optimization") is not True:
        errors.append("HOLDOUT_NOT_SEALED_BEFORE_OPTIMIZATION")
    if not _positive_int(value.get("task_count")):
        errors.append("HOLDOUT_TASK_COUNT_INVALID")
    if value.get("contamination_check") != "PASS":
        errors.append("HOLDOUT_CONTAMINATION_CHECK_NOT_PASS")
    overlap = value.get("training_overlap_count")
    if not _nonnegative_int(overlap):
        errors.append("HOLDOUT_TRAINING_OVERLAP_INVALID")
    elif overlap != 0:
        errors.append("HOLDOUT_TRAINING_OVERLAP_DETECTED")
    _evidence(value.get("evidence"), "HOLDOUT", errors)
    return len(errors) == start


def _validate_generalization(value: Any, errors: list[str]) -> bool:
    start = len(errors)
    if not isinstance(value, dict):
        errors.append("GENERALIZATION_MISSING")
        return False
    if value.get("novelty_verified") is not True:
        errors.append("GENERALIZATION_NOVELTY_UNPROVEN")
    if value.get("recipe_not_preprovided") is not True:
        errors.append("GENERALIZATION_RECIPE_PREPROVIDED_OR_UNKNOWN")
    _ratio_check(
        value,
        prefix="GENERALIZATION",
        total_field="novel_task_count",
        pass_field="passes",
        minimum_field="minimum_pass_rate",
        errors=errors,
    )
    _evidence(value.get("evidence"), "GENERALIZATION", errors)
    return len(errors) == start


def _validate_transfer(value: Any, errors: list[str]) -> bool:
    start = len(errors)
    if not isinstance(value, dict):
        errors.append("TRANSFER_MISSING")
        return False
    sources = value.get("source_domains")
    targets = value.get("target_domains")
    if not _nonempty_str_list(sources):
        errors.append("TRANSFER_SOURCE_DOMAINS_INVALID")
        sources = []
    if not _nonempty_str_list(targets):
        errors.append("TRANSFER_TARGET_DOMAINS_INVALID")
        targets = []
    if sources and targets and not (set(targets) - set(sources)):
        errors.append("TRANSFER_REQUIRES_NOVEL_TARGET_DOMAIN")
    if value.get("cross_domain") is not True:
        errors.append("TRANSFER_CROSS_DOMAIN_UNPROVEN")
    _ratio_check(
        value,
        prefix="TRANSFER",
        total_field="holdout_task_count",
        pass_field="passes",
        minimum_field="minimum_pass_rate",
        errors=errors,
    )
    _evidence(value.get("evidence"), "TRANSFER", errors)
    return len(errors) == start


def _validate_autonomy(value: Any, errors: list[str]) -> bool:
    start = len(errors)
    if not isinstance(value, dict):
        errors.append("AUTONOMY_MISSING")
        return False
    episodes = value.get("episode_count")
    interventions = value.get("human_interventions")
    max_rate = value.get("max_human_intervention_rate")
    if not _positive_int(episodes):
        errors.append("AUTONOMY_EPISODE_COUNT_INVALID")
    if not _nonnegative_int(interventions):
        errors.append("AUTONOMY_HUMAN_INTERVENTIONS_INVALID")
    if _positive_int(episodes) and _nonnegative_int(interventions) and interventions > episodes:
        errors.append("AUTONOMY_HUMAN_INTERVENTIONS_GT_EPISODES")
    if not _unit_interval(max_rate):
        errors.append("AUTONOMY_MAX_HUMAN_INTERVENTION_RATE_INVALID")
    if _positive_int(episodes) and _nonnegative_int(interventions) and interventions <= episodes and _unit_interval(max_rate):
        if interventions / episodes > float(max_rate):
            errors.append("AUTONOMY_HUMAN_INTERVENTION_RATE_TOO_HIGH")
    if value.get("goal_given_once") is not True:
        errors.append("AUTONOMY_GOAL_NOT_GIVEN_ONCE")
    if value.get("continuous_human_routing") is not False:
        errors.append("AUTONOMY_CONTINUOUS_HUMAN_ROUTING_PRESENT_OR_UNKNOWN")
    if value.get("self_correction_observed") is not True:
        errors.append("AUTONOMY_SELF_CORRECTION_UNPROVEN")
    if value.get("plan_execute_verify_loop_observed") is not True:
        errors.append("AUTONOMY_PLAN_EXECUTE_VERIFY_LOOP_UNPROVEN")
    _evidence(value.get("evidence"), "AUTONOMY", errors)
    return len(errors) == start


def _validate_longitudinal_learning(value: Any, errors: list[str], repo_root: str | None) -> bool:
    start = len(errors)
    if not isinstance(value, dict):
        errors.append("LONGITUDINAL_LEARNING_MISSING")
        return False
    series = value.get("series")
    result = longitudinal_gate.validate_series(series, repo_root=repo_root)
    if result.get("longitudinal_verified") is not True:
        errors.append("LONGITUDINAL_LEARNING_SERIES_UNPROVEN")
        for code in result.get("errors", []):
            errors.append(f"LONGITUDINAL:{code}")
    if value.get("self_distillation_operational") is not True:
        errors.append("LONGITUDINAL_SELF_DISTILLATION_NOT_DECLARED")
    _evidence(value.get("evidence"), "LONGITUDINAL_LEARNING", errors)
    return len(errors) == start


def _validate_robustness(value: Any, errors: list[str]) -> bool:
    start = len(errors)
    if not isinstance(value, dict):
        errors.append("ROBUSTNESS_MISSING")
        return False
    trials = value.get("trial_count")
    contexts = value.get("context_count")
    if not isinstance(trials, int) or isinstance(trials, bool) or trials < 3:
        errors.append("ROBUSTNESS_REQUIRES_AT_LEAST_3_TRIALS")
    if not isinstance(contexts, int) or isinstance(contexts, bool) or contexts < 2:
        errors.append("ROBUSTNESS_REQUIRES_AT_LEAST_2_CONTEXTS")
    _ratio_check(
        value,
        prefix="ROBUSTNESS",
        total_field="trial_count",
        pass_field="passes",
        minimum_field="minimum_pass_rate",
        errors=errors,
    )
    if value.get("perturbations_tested") is not True:
        errors.append("ROBUSTNESS_PERTURBATIONS_UNPROVEN")
    regressions = value.get("critical_regressions")
    if not _nonnegative_int(regressions):
        errors.append("ROBUSTNESS_CRITICAL_REGRESSIONS_INVALID")
    elif regressions != 0:
        errors.append("ROBUSTNESS_CRITICAL_REGRESSION")
    _evidence(value.get("evidence"), "ROBUSTNESS", errors)
    return len(errors) == start


def _validate_reproducibility(value: Any, errors: list[str]) -> bool:
    start = len(errors)
    if not isinstance(value, dict):
        errors.append("REPRODUCIBILITY_MISSING")
        return False
    reproducers = value.get("independent_reproducer_count")
    same = value.get("same_conclusion_count")
    if not _positive_int(reproducers):
        errors.append("REPRODUCIBILITY_INDEPENDENT_REPRODUCER_COUNT_INVALID")
    if not _nonnegative_int(same):
        errors.append("REPRODUCIBILITY_SAME_CONCLUSION_COUNT_INVALID")
    if _positive_int(reproducers) and _nonnegative_int(same) and same != reproducers:
        errors.append("REPRODUCIBILITY_NOT_ALL_INDEPENDENT_REPRODUCERS_AGREE")
    if value.get("protocol_supplied") is not True:
        errors.append("REPRODUCIBILITY_PROTOCOL_NOT_SUPPLIED")
    hashes = value.get("artifact_hashes")
    if not _nonempty_str_list(hashes) or any(not HEX64.fullmatch(item) for item in hashes):
        errors.append("REPRODUCIBILITY_ARTIFACT_HASHES_INVALID")
    _evidence(value.get("evidence"), "REPRODUCIBILITY", errors)
    return len(errors) == start


def _validate_independent_evaluation(value: Any, errors: list[str]) -> bool:
    start = len(errors)
    if not isinstance(value, dict):
        errors.append("INDEPENDENT_EVALUATION_MISSING")
        return False
    builder = value.get("builder")
    judge = value.get("judge")
    if not _nonempty_str(builder):
        errors.append("INDEPENDENT_EVALUATION_BUILDER_MISSING")
    if not _nonempty_str(judge):
        errors.append("INDEPENDENT_EVALUATION_JUDGE_MISSING")
    if _nonempty_str(builder) and _nonempty_str(judge) and builder == judge:
        errors.append("INDEPENDENT_EVALUATION_BUILDER_IS_JUDGE")
    if value.get("judge_independent") is not True:
        errors.append("INDEPENDENT_EVALUATION_JUDGE_INDEPENDENCE_UNPROVEN")
    if value.get("blind_or_sealed") is not True:
        errors.append("INDEPENDENT_EVALUATION_NOT_BLIND_OR_SEALED")
    if value.get("judge_did_not_train_candidate") is not True:
        errors.append("INDEPENDENT_EVALUATION_JUDGE_TRAINING_SEPARATION_UNPROVEN")
    if value.get("external_observer_can_recompute") is not True:
        errors.append("INDEPENDENT_EVALUATION_NOT_RECOMPUTABLE")
    _evidence(value.get("evidence"), "INDEPENDENT_EVALUATION", errors)
    return len(errors) == start


def validate_external_agi_claim(value: Any, repo_root: str | None = None) -> dict[str, Any]:
    errors: list[str] = []
    if not isinstance(value, dict):
        return {
            "schema_version": SCHEMA_VERSION,
            "claim": CLAIM,
            "status": "AGI_EXTERNAL_CLAIM_UNPROVEN",
            "external_agi_verified": False,
            "criteria_total": len(REQUIRED_CRITERIA),
            "criteria_passed": 0,
            "criteria_results": {criterion: False for criterion in REQUIRED_CRITERIA},
            "errors": ["AGI_CLAIM_NOT_OBJECT"],
            "claim_sha256": manifest_sha256(value),
        }

    if value.get("schema_version") != SCHEMA_VERSION:
        errors.append("AGI_SCHEMA_VERSION_INVALID")
    if value.get("claim") != CLAIM:
        errors.append("AGI_CLAIM_TYPE_INVALID")
    if value.get("internal_house_claim") not in (None, INTERNAL_CLAIM):
        errors.append("AGI_INTERNAL_HOUSE_CLAIM_INVALID")
    if value.get("external_claim_is_distinct_from_internal") is not True:
        errors.append("AGI_INTERNAL_EXTERNAL_CLAIMS_NOT_SEPARATED")
    if not _nonempty_str_list(value.get("provenance")):
        errors.append("AGI_PROVENANCE_MISSING")
    if not _nonempty_str_list(value.get("counterproof")):
        errors.append("AGI_COUNTERPROOF_MISSING")

    criteria_results = {
        "PREDEFINED_DEFINITION": _validate_predefined(value.get("predefined_definition"), errors),
        "HOLDOUT": _validate_holdout(value.get("holdout"), errors),
        "GENERALIZATION": _validate_generalization(value.get("generalization"), errors),
        "TRANSFER": _validate_transfer(value.get("transfer"), errors),
        "AUTONOMY": _validate_autonomy(value.get("autonomy"), errors),
        "LONGITUDINAL_LEARNING": _validate_longitudinal_learning(value.get("longitudinal_learning"), errors, repo_root),
        "ROBUSTNESS": _validate_robustness(value.get("robustness"), errors),
        "REPRODUCIBILITY": _validate_reproducibility(value.get("reproducibility"), errors),
        "INDEPENDENT_EVALUATION": _validate_independent_evaluation(value.get("independent_evaluation"), errors),
    }

    expected_hash = manifest_sha256({k: v for k, v in value.items() if k != "external_claim_receipt_sha256"})
    if value.get("external_claim_receipt_sha256") != expected_hash:
        errors.append("AGI_EXTERNAL_CLAIM_RECEIPT_SHA256_MISMATCH")

    criteria_passed = sum(1 for ok in criteria_results.values() if ok)
    verified = not errors and criteria_passed == len(REQUIRED_CRITERIA)
    return {
        "schema_version": SCHEMA_VERSION,
        "claim": value.get("claim"),
        "internal_house_claim": value.get("internal_house_claim"),
        "status": "AGI_SCIENTIFIC_EXTERNALLY_DEMONSTRATED" if verified else "AGI_EXTERNAL_CLAIM_UNPROVEN",
        "external_agi_verified": verified,
        "criteria_total": len(REQUIRED_CRITERIA),
        "criteria_passed": criteria_passed,
        "coverage_percent": 100.0 * criteria_passed / len(REQUIRED_CRITERIA),
        "criteria_results": criteria_results,
        "claim_scope": "DECLARED_EXTERNAL_TEST_PROTOCOL_ONLY",
        "claim_sha256": manifest_sha256(value),
        "errors": sorted(set(errors)),
    }


def _agi_manifest() -> dict[str, Any]:
    criteria = list(REQUIRED_CRITERIA)
    definition = {
        "name": "AGI scientific external claim fixture",
        "rule": "all nine frozen criteria must pass on unseen evaluation",
    }
    value: dict[str, Any] = {
        "schema_version": SCHEMA_VERSION,
        "claim": CLAIM,
        "internal_house_claim": INTERNAL_CLAIM,
        "external_claim_is_distinct_from_internal": True,
        "provenance": ["deterministic self-test fixture"],
        "counterproof": ["flip any required criterion or tamper receipt hash"],
        "predefined_definition": {
            "definition": definition,
            "definition_frozen_before": True,
            "criteria": criteria,
            "criteria_frozen_before": True,
            "definition_sha256": manifest_sha256(definition),
            "criteria_sha256": manifest_sha256(criteria),
            "evidence": ["definition and criteria sealed before fixture evaluation"],
        },
        "holdout": {
            "hidden_until_final": True,
            "sealed_before_optimization": True,
            "task_count": 20,
            "contamination_check": "PASS",
            "training_overlap_count": 0,
            "evidence": ["sealed holdout fixture"],
        },
        "generalization": {
            "novelty_verified": True,
            "recipe_not_preprovided": True,
            "novel_task_count": 20,
            "passes": 18,
            "minimum_pass_rate": 0.8,
            "evidence": ["novel fixture tasks"],
        },
        "transfer": {
            "source_domains": ["code"],
            "target_domains": ["operations"],
            "cross_domain": True,
            "holdout_task_count": 10,
            "passes": 9,
            "minimum_pass_rate": 0.8,
            "evidence": ["cross-domain holdout fixture"],
        },
        "autonomy": {
            "episode_count": 10,
            "human_interventions": 1,
            "max_human_intervention_rate": 0.2,
            "goal_given_once": True,
            "continuous_human_routing": False,
            "self_correction_observed": True,
            "plan_execute_verify_loop_observed": True,
            "evidence": ["autonomy fixture episodes"],
        },
        "longitudinal_learning": {
            "series": longitudinal_gate._series(),
            "self_distillation_operational": True,
            "evidence": ["validated contiguous self-distillation series"],
        },
        "robustness": {
            "trial_count": 6,
            "context_count": 3,
            "passes": 6,
            "minimum_pass_rate": 0.8,
            "perturbations_tested": True,
            "critical_regressions": 0,
            "evidence": ["robustness fixture"],
        },
        "reproducibility": {
            "independent_reproducer_count": 2,
            "same_conclusion_count": 2,
            "protocol_supplied": True,
            "artifact_hashes": ["a" * 64, "b" * 64],
            "evidence": ["two independent fixture reproductions"],
        },
        "independent_evaluation": {
            "builder": "builder-fixture",
            "judge": "judge-fixture",
            "judge_independent": True,
            "blind_or_sealed": True,
            "judge_did_not_train_candidate": True,
            "external_observer_can_recompute": True,
            "evidence": ["independent sealed judge fixture"],
        },
    }
    value["external_claim_receipt_sha256"] = manifest_sha256(value)
    return value


def _resign(value: dict[str, Any]) -> dict[str, Any]:
    value["external_claim_receipt_sha256"] = manifest_sha256(
        {k: v for k, v in value.items() if k != "external_claim_receipt_sha256"}
    )
    return value


def self_test() -> int:
    positive = validate_external_agi_claim(_agi_manifest())
    assert positive["external_agi_verified"] is True
    assert positive["criteria_passed"] == len(REQUIRED_CRITERIA)
    assert positive["coverage_percent"] == 100.0

    missing = _agi_manifest()
    missing["predefined_definition"]["criteria"].pop()
    assert "PREDEFINED_CRITERIA_SET_INVALID" in validate_external_agi_claim(_resign(missing))["errors"]

    contaminated = _agi_manifest()
    contaminated["holdout"]["training_overlap_count"] = 1
    assert "HOLDOUT_TRAINING_OVERLAP_DETECTED" in validate_external_agi_claim(_resign(contaminated))["errors"]

    weak_generalization = _agi_manifest()
    weak_generalization["generalization"]["passes"] = 10
    assert "GENERALIZATION_BELOW_MINIMUM_PASS_RATE" in validate_external_agi_claim(_resign(weak_generalization))["errors"]

    routed = _agi_manifest()
    routed["autonomy"]["continuous_human_routing"] = True
    assert "AUTONOMY_CONTINUOUS_HUMAN_ROUTING_PRESENT_OR_UNKNOWN" in validate_external_agi_claim(_resign(routed))["errors"]

    same_judge = _agi_manifest()
    same_judge["independent_evaluation"]["judge"] = same_judge["independent_evaluation"]["builder"]
    assert "INDEPENDENT_EVALUATION_BUILDER_IS_JUDGE" in validate_external_agi_claim(_resign(same_judge))["errors"]

    broken_longitudinal = _agi_manifest()
    broken_longitudinal["longitudinal_learning"]["series"]["series_id"] = "tampered"
    result = validate_external_agi_claim(_resign(broken_longitudinal))
    assert "LONGITUDINAL_LEARNING_SERIES_UNPROVEN" in result["errors"]

    tampered = _agi_manifest()
    tampered["robustness"]["passes"] = 5
    assert "AGI_EXTERNAL_CLAIM_RECEIPT_SHA256_MISMATCH" in validate_external_agi_claim(tampered)["errors"]

    print("PASS agi_claim_gate 9/9 criteria + negative counterproofs")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description="Gate do claim científico/externo de AGI")
    parser.add_argument("--input")
    parser.add_argument("--repo-root", default=None)
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()

    if args.self_test:
        return self_test()
    if not args.input:
        parser.error("--input ou --self-test é obrigatório")

    value = json.loads(Path(args.input).read_text(encoding="utf-8"))
    result = validate_external_agi_claim(value, repo_root=args.repo_root)
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0 if result["external_agi_verified"] else 2


if __name__ == "__main__":
    raise SystemExit(main())
