#!/usr/bin/env python3
"""Gate determinístico de evolução verificável da CentralDark.

Não decide sozinho se uma ideia é boa. Impede que qualquer componente alegue
"evolução" sem antes/depois, ganho de informação, delta reutilizável, teste,
contraprova, regressão e proveniência no mesmo escopo.

Os donos META obrigatórios são: META_LUPA, MENOS_E_MAIS,
INSTINTO_SUPERIOR, EXPANSAO_DE_DOMINIO e METACOGNICAO_OPERACIONAL.
Outras capacidades também podem usar o mesmo contrato: evolução é universal,
o mecanismo de prova continua único.

CRISTAL não é uma sétima lente META. É um claim opcional e mais forte sobre a
saída do CROSS-META. Só pode ser chamado IRREDUTÍVEL quando o receipt prova,
no escopo declarado, retenção crítica, rastreabilidade, reconstrução,
compressão efetiva, densidade conservadora, busca de resíduo e ausência de
candidato Pareto-dominante entre os candidatos realmente avaliados.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import math
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
CROSS_META_LENSES = (
    "EXPANSAO_DE_DOMINIO",
    "META_MINERACAO",
    "MENOS_E_MAIS",
    "META_LUPA",
    "INSTINTO_SUPERIOR",
    "METACOGNICAO_OPERACIONAL",
)
CROSS_META_OUTCOMES = {"DELTA_ABSORBED", "NO_CHANGE", "NOT_APPLICABLE"}
CRYSTAL_CLAIMS = {"IRREDUCIBLE"}
CRYSTAL_OUTPUT_KIND = "CRISTAL_CONDENSADO_IRREDUTIVEL"
CRYSTAL_IRREDUCIBILITY_SCOPE = "DECLARED_RESIDUE_SET"
CRYSTAL_PARETO_SCOPE = "EVALUATED_CANDIDATE_SET"
CRYSTAL_REMOVAL_REJECTION = "REJECTED_BREAKS_CONTRACT"
CRYSTAL_BREAKABLE_CONTRACTS = {
    "CRITICAL_CAPABILITY",
    "TRACEABILITY",
    "RECONSTRUCTION",
    "PROOF_OWNERSHIP",
    "QUALITY_NONINFERIORITY",
    "AUTHORITY",
    "RUNTIME_CLAIM",
}
CONFIDENCE_GOALS = {"IMPROVEMENT", "NON_INFERIORITY"}
SUBJECT_RE = re.compile(r"^[A-Z][A-Z0-9_]{2,63}$")
HEX40 = re.compile(r"^[0-9a-f]{40}$")
HEX64 = re.compile(r"^[0-9a-f]{64}$")
NUMBER_TYPES = (int, float)


def canonical_json(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"))


def manifest_sha256(value: Any) -> str:
    return hashlib.sha256(canonical_json(value).encode("utf-8")).hexdigest()


def _nonempty_str(value: Any) -> bool:
    return isinstance(value, str) and bool(value.strip())


def _nonempty_str_list(value: Any) -> bool:
    return isinstance(value, list) and bool(value) and all(_nonempty_str(v) for v in value)


def _is_number(value: Any) -> bool:
    return isinstance(value, NUMBER_TYPES) and not isinstance(value, bool) and math.isfinite(float(value))


def _is_nonnegative_number(value: Any) -> bool:
    return _is_number(value) and float(value) >= 0.0


def _is_unit_interval(value: Any) -> bool:
    return _is_number(value) and 0.0 <= float(value) <= 1.0


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


def _cross_meta_ok(value: Any, errors: list[str]) -> None:
    if not isinstance(value, dict):
        errors.append("CROSS_META_REVIEW_MISSING")
        return
    if "META_CRISTAL" in value:
        errors.append("META_CRISTAL_IS_OUTPUT_NOT_LENS")
    for lens in CROSS_META_LENSES:
        item = value.get(lens)
        if not isinstance(item, dict):
            errors.append(f"CROSS_META_{lens}_MISSING")
            continue
        if item.get("status") not in CROSS_META_OUTCOMES:
            errors.append(f"CROSS_META_{lens}_STATUS_INVALID")
        if not _nonempty_str_list(item.get("evidence")):
            errors.append(f"CROSS_META_{lens}_EVIDENCE_MISSING")


def _crystal_metrics(value: Any, prefix: str, errors: list[str]) -> dict[str, float] | None:
    if not isinstance(value, dict):
        errors.append(f"{prefix}_METRICS_MISSING")
        return None

    required = (
        "effective_load_units",
        "quality_floor",
        "traceability_percent",
        "critical_retention_percent",
    )
    for field in required:
        if not _is_number(value.get(field)):
            errors.append(f"{prefix}_{field.upper()}_INVALID")

    load = value.get("effective_load_units")
    quality = value.get("quality_floor")
    trace = value.get("traceability_percent")
    critical = value.get("critical_retention_percent")

    if _is_number(load) and float(load) <= 0:
        errors.append(f"{prefix}_EFFECTIVE_LOAD_UNITS_NONPOSITIVE")
    if _is_number(quality) and not 0.0 <= float(quality) <= 1.0:
        errors.append(f"{prefix}_QUALITY_FLOOR_RANGE")
    for field, raw in (
        ("TRACEABILITY_PERCENT", trace),
        ("CRITICAL_RETENTION_PERCENT", critical),
    ):
        if _is_number(raw) and not 0.0 <= float(raw) <= 100.0:
            errors.append(f"{prefix}_{field}_RANGE")

    if not _nonempty_str_list(value.get("evidence")):
        errors.append(f"{prefix}_EVIDENCE_MISSING")

    if all(_is_number(value.get(field)) for field in required):
        return {
            "effective_load_units": float(load),
            "quality_floor": float(quality),
            "traceability_percent": float(trace),
            "critical_retention_percent": float(critical),
        }
    return None


def _dominates(candidate: dict[str, float], selected: dict[str, float]) -> bool:
    no_worse = (
        candidate["effective_load_units"] <= selected["effective_load_units"]
        and candidate["quality_floor"] >= selected["quality_floor"]
        and candidate["traceability_percent"] >= selected["traceability_percent"]
        and candidate["critical_retention_percent"] >= selected["critical_retention_percent"]
    )
    strictly_better = (
        candidate["effective_load_units"] < selected["effective_load_units"]
        or candidate["quality_floor"] > selected["quality_floor"]
        or candidate["traceability_percent"] > selected["traceability_percent"]
        or candidate["critical_retention_percent"] > selected["critical_retention_percent"]
    )
    return no_worse and strictly_better


def _crystal_ok(value: Any, manifest: dict[str, Any], errors: list[str]) -> dict[str, Any]:
    metrics: dict[str, Any] = {
        "claim": manifest.get("crystal_claim"),
        "verified": False,
        "compression_gain_percent": None,
        "density_gain_percent": None,
    }
    if not isinstance(value, dict):
        errors.append("CRYSTAL_CONTRACT_MISSING")
        return metrics

    if value.get("output_kind") != CRYSTAL_OUTPUT_KIND:
        errors.append("CRYSTAL_OUTPUT_KIND_INVALID")
    if value.get("fixed_point") is not True or manifest.get("meta_fixed_point") is not True:
        errors.append("CRYSTAL_FIXED_POINT_UNPROVEN")
    if value.get("meta_cristal_is_new_lens") is not False:
        errors.append("CRYSTAL_MUST_NOT_CREATE_META_LENS")

    critical = value.get("critical")
    if not isinstance(critical, dict):
        errors.append("CRYSTAL_CRITICAL_MISSING")
    else:
        if critical.get("retention_percent") != 100:
            errors.append("CRYSTAL_CRITICAL_RETENTION_NOT_100")
        lost = critical.get("lost_capabilities")
        if not isinstance(lost, list):
            errors.append("CRYSTAL_LOST_CRITICAL_INVALID")
        elif lost:
            errors.append("CRYSTAL_LOST_CRITICAL_CAPABILITY")
        if not _nonempty_str_list(critical.get("evidence")):
            errors.append("CRYSTAL_CRITICAL_EVIDENCE_MISSING")

    trace = value.get("traceability")
    if not isinstance(trace, dict):
        errors.append("CRYSTAL_TRACEABILITY_MISSING")
    else:
        applicable = trace.get("applicable_claims")
        resolved = trace.get("resolved_to_owner_hash_source")
        if not isinstance(applicable, int) or isinstance(applicable, bool) or applicable <= 0:
            errors.append("CRYSTAL_TRACEABILITY_DENOMINATOR_INVALID")
        if not isinstance(resolved, int) or isinstance(resolved, bool) or resolved < 0:
            errors.append("CRYSTAL_TRACEABILITY_NUMERATOR_INVALID")
        if (
            isinstance(applicable, int)
            and not isinstance(applicable, bool)
            and applicable > 0
            and isinstance(resolved, int)
            and not isinstance(resolved, bool)
            and resolved != applicable
        ):
            errors.append("CRYSTAL_TRACEABILITY_NOT_100")
        if not _nonempty_str_list(trace.get("evidence")):
            errors.append("CRYSTAL_TRACEABILITY_EVIDENCE_MISSING")

    reconstruction = value.get("reconstruction")
    if not isinstance(reconstruction, dict):
        errors.append("CRYSTAL_RECONSTRUCTION_MISSING")
    else:
        if reconstruction.get("status") != "PASS":
            errors.append("CRYSTAL_RECONSTRUCTION_NOT_PASS")
        if reconstruction.get("owner_path_preserved") is not True:
            errors.append("CRYSTAL_OWNER_PATH_NOT_PRESERVED")
        if not _nonempty_str_list(reconstruction.get("evidence")):
            errors.append("CRYSTAL_RECONSTRUCTION_EVIDENCE_MISSING")

    proof = value.get("proof_ownership")
    if not isinstance(proof, dict):
        errors.append("CRYSTAL_PROOF_OWNERSHIP_MISSING")
    else:
        if proof.get("status") != "PASS":
            errors.append("CRYSTAL_PROOF_OWNERSHIP_NOT_PASS")
        if not _nonempty_str(proof.get("invariant_id")):
            errors.append("CRYSTAL_PROOF_OWNERSHIP_INVARIANT_MISSING")
        if not _nonempty_str_list(proof.get("evidence")):
            errors.append("CRYSTAL_PROOF_OWNERSHIP_EVIDENCE_MISSING")
        if not _nonempty_str_list(proof.get("external_anchor_evidence")):
            errors.append("CRYSTAL_PROOF_OWNERSHIP_EXTERNAL_ANCHOR_MISSING")

    load = value.get("effective_load")
    baseline_units = candidate_units = None
    if not isinstance(load, dict):
        errors.append("CRYSTAL_EFFECTIVE_LOAD_MISSING")
    else:
        unit = load.get("unit")
        if not _nonempty_str(unit):
            errors.append("CRYSTAL_EFFECTIVE_LOAD_UNIT_MISSING")
        baseline_units = load.get("baseline_units")
        boot_units = load.get("boot_units")
        source_units = load.get("source_on_demand_units")
        effective_units = load.get("effective_units")
        for field, raw in (
            ("BASELINE_UNITS", baseline_units),
            ("BOOT_UNITS", boot_units),
            ("SOURCE_ON_DEMAND_UNITS", source_units),
            ("EFFECTIVE_UNITS", effective_units),
        ):
            if not _is_nonnegative_number(raw):
                errors.append(f"CRYSTAL_EFFECTIVE_LOAD_{field}_INVALID")
        if _is_number(baseline_units) and float(baseline_units) <= 0:
            errors.append("CRYSTAL_EFFECTIVE_LOAD_BASELINE_NONPOSITIVE")
        if _is_number(effective_units) and float(effective_units) <= 0:
            errors.append("CRYSTAL_EFFECTIVE_LOAD_CANDIDATE_NONPOSITIVE")

        if all(_is_number(raw) for raw in (boot_units, source_units, effective_units)):
            expected = float(boot_units) + float(source_units)
            if not math.isclose(float(effective_units), expected, rel_tol=1e-9, abs_tol=1e-9):
                errors.append("CRYSTAL_EFFECTIVE_LOAD_FORMULA_MISMATCH")

        source_applicable = load.get("source_on_demand_applicable")
        if not isinstance(source_applicable, bool):
            errors.append("CRYSTAL_SOURCE_ON_DEMAND_APPLICABILITY_INVALID")
        elif source_applicable:
            sample_count = load.get("workload_sample_count")
            if not isinstance(sample_count, int) or isinstance(sample_count, bool) or sample_count <= 0:
                errors.append("CRYSTAL_SOURCE_ON_DEMAND_WORKLOAD_DENOMINATOR_INVALID")
            if not _nonempty_str_list(load.get("workload_distribution_evidence")):
                errors.append("CRYSTAL_SOURCE_ON_DEMAND_WORKLOAD_EVIDENCE_MISSING")
        else:
            if _is_number(source_units) and float(source_units) != 0.0:
                errors.append("CRYSTAL_SOURCE_ON_DEMAND_NOT_APPLICABLE_BUT_NONZERO")

        if not _nonempty_str_list(load.get("evidence")):
            errors.append("CRYSTAL_EFFECTIVE_LOAD_EVIDENCE_MISSING")

        if _is_number(baseline_units) and _is_number(effective_units):
            if float(effective_units) >= float(baseline_units):
                errors.append("CRYSTAL_NO_EFFECTIVE_COMPRESSION")
            elif float(baseline_units) > 0:
                metrics["compression_gain_percent"] = 100.0 * (
                    1.0 - float(effective_units) / float(baseline_units)
                )
            candidate_units = effective_units

    quality = value.get("quality")
    before_floor = after_floor = None
    quality_goal = quality_epsilon = None
    if not isinstance(quality, dict):
        errors.append("CRYSTAL_QUALITY_MISSING")
    else:
        denominator = quality.get("denominator")
        if not isinstance(denominator, int) or isinstance(denominator, bool) or denominator <= 0:
            errors.append("CRYSTAL_QUALITY_DENOMINATOR_INVALID")
        if quality.get("denominator_frozen_before") is not True:
            errors.append("CRYSTAL_QUALITY_DENOMINATOR_NOT_PREDECLARED")

        before_floor = quality.get("baseline_floor")
        after_floor = quality.get("candidate_floor")
        if not _is_unit_interval(before_floor):
            errors.append("CRYSTAL_QUALITY_BASELINE_FLOOR_INVALID")
        elif float(before_floor) <= 0.0:
            errors.append("CRYSTAL_QUALITY_BASELINE_FLOOR_NONPOSITIVE")
        if not _is_unit_interval(after_floor):
            errors.append("CRYSTAL_QUALITY_CANDIDATE_FLOOR_INVALID")

        quality_goal = quality.get("goal")
        if quality_goal not in CONFIDENCE_GOALS:
            errors.append("CRYSTAL_QUALITY_GOAL_INVALID")
        quality_epsilon = quality.get("epsilon")
        if not _is_nonnegative_number(quality_epsilon):
            errors.append("CRYSTAL_QUALITY_EPSILON_INVALID")
        if quality.get("epsilon_predeclared") is not True:
            errors.append("CRYSTAL_QUALITY_EPSILON_NOT_PREDECLARED")
        if not _nonempty_str_list(quality.get("evidence")):
            errors.append("CRYSTAL_QUALITY_EVIDENCE_MISSING")

        stochastic = quality.get("stochastic")
        confidence = quality.get("confidence")
        if not isinstance(stochastic, bool):
            errors.append("CRYSTAL_QUALITY_STOCHASTIC_FLAG_INVALID")
        elif stochastic:
            if not isinstance(confidence, dict):
                errors.append("CRYSTAL_CONFIDENCE_MISSING")
            else:
                if confidence.get("method") != "PAIRED_BOOTSTRAP":
                    errors.append("CRYSTAL_CONFIDENCE_METHOD_INVALID")
                if confidence.get("level") != 0.95:
                    errors.append("CRYSTAL_CONFIDENCE_LEVEL_MUST_BE_95")
                lower = confidence.get("lower_bound_delta")
                sample_size = confidence.get("sample_size")
                if not _is_number(lower):
                    errors.append("CRYSTAL_CONFIDENCE_LOWER_BOUND_INVALID")
                if not isinstance(sample_size, int) or isinstance(sample_size, bool) or sample_size <= 0:
                    errors.append("CRYSTAL_CONFIDENCE_SAMPLE_SIZE_INVALID")
                if not _nonempty_str_list(confidence.get("evidence")):
                    errors.append("CRYSTAL_CONFIDENCE_EVIDENCE_MISSING")
                if _is_number(lower) and _is_nonnegative_number(quality_epsilon):
                    if quality_goal == "IMPROVEMENT" and float(lower) <= 0.0:
                        errors.append("CRYSTAL_CONFIDENCE_GAIN_NOT_PROVEN")
                    if (
                        quality_goal == "NON_INFERIORITY"
                        and float(lower) < -float(quality_epsilon)
                    ):
                        errors.append("CRYSTAL_CONFIDENCE_NONINFERIORITY_NOT_PROVEN")
        else:
            if not isinstance(confidence, dict) or confidence.get("method") != "EXACT_DETERMINISTIC":
                errors.append("CRYSTAL_DETERMINISTIC_MUST_NOT_FAKE_STATISTICAL_CI")
            else:
                if "level" in confidence or "lower_bound_delta" in confidence:
                    errors.append("CRYSTAL_DETERMINISTIC_MUST_NOT_FAKE_STATISTICAL_CI")
                if not _nonempty_str_list(confidence.get("evidence")):
                    errors.append("CRYSTAL_DETERMINISTIC_EVIDENCE_MISSING")
            if (
                _is_unit_interval(before_floor)
                and _is_unit_interval(after_floor)
                and _is_nonnegative_number(quality_epsilon)
            ):
                exact_delta = float(after_floor) - float(before_floor)
                if quality_goal == "IMPROVEMENT" and exact_delta <= 0.0:
                    errors.append("CRYSTAL_DETERMINISTIC_GAIN_NOT_PROVEN")
                if quality_goal == "NON_INFERIORITY" and exact_delta < -float(quality_epsilon):
                    errors.append("CRYSTAL_DETERMINISTIC_NONINFERIORITY_NOT_PROVEN")

    if (
        _is_number(baseline_units)
        and _is_number(candidate_units)
        and _is_unit_interval(before_floor)
        and _is_unit_interval(after_floor)
        and float(baseline_units) > 0
        and float(candidate_units) > 0
        and float(before_floor) > 0
    ):
        before_density = float(before_floor) / float(baseline_units)
        after_density = float(after_floor) / float(candidate_units)
        if after_density <= before_density:
            errors.append("CRYSTAL_QUALITY_DENSITY_NOT_IMPROVED")
        else:
            metrics["density_gain_percent"] = 100.0 * (after_density / before_density - 1.0)

    irreducibility = value.get("irreducibility")
    if not isinstance(irreducibility, dict):
        errors.append("CRYSTAL_IRREDUCIBILITY_MISSING")
    else:
        if irreducibility.get("scope") != CRYSTAL_IRREDUCIBILITY_SCOPE:
            errors.append("CRYSTAL_IRREDUCIBILITY_SCOPE_INVALID")
        if irreducibility.get("search_complete") is not True:
            errors.append("CRYSTAL_RESIDUE_SEARCH_INCOMPLETE")
        if irreducibility.get("no_removable_residue") is not True:
            errors.append("CRYSTAL_REMOVABLE_RESIDUE_REMAINS")
        if not _nonempty_str_list(irreducibility.get("search_evidence")):
            errors.append("CRYSTAL_RESIDUE_SEARCH_EVIDENCE_MISSING")
        searched_lenses = irreducibility.get("searched_lenses")
        if not isinstance(searched_lenses, list) or not all(_nonempty_str(v) for v in searched_lenses):
            errors.append("CRYSTAL_RESIDUE_SEARCHED_LENSES_INVALID")
        elif set(searched_lenses) != set(CROSS_META_LENSES):
            errors.append("CRYSTAL_RESIDUE_SEARCHED_LENSES_INCOMPLETE")

        candidates = irreducibility.get("residue_candidates")
        probes = irreducibility.get("removal_probes")
        if not isinstance(candidates, list) or not all(_nonempty_str(v) for v in candidates):
            errors.append("CRYSTAL_RESIDUE_CANDIDATES_INVALID")
            candidates = []
        if len(set(candidates)) != len(candidates):
            errors.append("CRYSTAL_RESIDUE_CANDIDATES_DUPLICATE")
        if not isinstance(probes, list):
            errors.append("CRYSTAL_REMOVAL_PROBES_INVALID")
            probes = []

        by_candidate: dict[str, list[dict[str, Any]]] = {}
        for index, probe in enumerate(probes):
            if not isinstance(probe, dict):
                errors.append(f"CRYSTAL_REMOVAL_PROBE_{index}_NOT_OBJECT")
                continue
            candidate = probe.get("candidate")
            if not _nonempty_str(candidate):
                errors.append(f"CRYSTAL_REMOVAL_PROBE_{index}_CANDIDATE_MISSING")
                continue
            by_candidate.setdefault(candidate, []).append(probe)
            if probe.get("status") != CRYSTAL_REMOVAL_REJECTION:
                errors.append(f"CRYSTAL_REMOVAL_PROBE_{index}_DID_NOT_BREAK_CONTRACT")
            broken = probe.get("broken_contracts")
            if not isinstance(broken, list) or not broken or not all(
                isinstance(item, str) and item in CRYSTAL_BREAKABLE_CONTRACTS for item in broken
            ):
                errors.append(f"CRYSTAL_REMOVAL_PROBE_{index}_BROKEN_CONTRACTS_INVALID")
            if not _nonempty_str_list(probe.get("evidence")):
                errors.append(f"CRYSTAL_REMOVAL_PROBE_{index}_EVIDENCE_MISSING")

        for candidate in candidates:
            if candidate not in by_candidate:
                errors.append(f"CRYSTAL_RESIDUE_UNPROBED:{candidate}")
        for candidate in by_candidate:
            if candidate not in set(candidates):
                errors.append(f"CRYSTAL_PROBE_OUTSIDE_DECLARED_RESIDUE:{candidate}")

        if irreducibility.get("global_powerset_minimality_claimed") is True:
            errors.append("CRYSTAL_GLOBAL_POWERSET_MINIMALITY_UNPROVEN")

    pareto = value.get("pareto")
    if not isinstance(pareto, dict):
        errors.append("CRYSTAL_PARETO_MISSING")
    else:
        if pareto.get("scope") != CRYSTAL_PARETO_SCOPE:
            errors.append("CRYSTAL_PARETO_SCOPE_INVALID")
        selected = _crystal_metrics(pareto.get("selected"), "CRYSTAL_PARETO_SELECTED", errors)
        if selected:
            expected_trace = None
            if isinstance(trace, dict):
                applicable = trace.get("applicable_claims")
                resolved = trace.get("resolved_to_owner_hash_source")
                if (
                    isinstance(applicable, int)
                    and not isinstance(applicable, bool)
                    and applicable > 0
                    and isinstance(resolved, int)
                    and not isinstance(resolved, bool)
                ):
                    expected_trace = 100.0 * float(resolved) / float(applicable)
            expected_critical = critical.get("retention_percent") if isinstance(critical, dict) else None
            linked = (
                _is_number(candidate_units)
                and _is_unit_interval(after_floor)
                and _is_number(expected_trace)
                and _is_number(expected_critical)
            )
            if not linked:
                errors.append("CRYSTAL_PARETO_SELECTED_LINK_UNPROVEN")
            else:
                expected_selected = {
                    "effective_load_units": float(candidate_units),
                    "quality_floor": float(after_floor),
                    "traceability_percent": float(expected_trace),
                    "critical_retention_percent": float(expected_critical),
                }
                for field, expected in expected_selected.items():
                    if not math.isclose(selected[field], expected, rel_tol=1e-9, abs_tol=1e-9):
                        errors.append(f"CRYSTAL_PARETO_SELECTED_{field.upper()}_MISMATCH")
        alternatives_raw = pareto.get("alternatives")
        if not isinstance(alternatives_raw, list) or not alternatives_raw:
            errors.append("CRYSTAL_PARETO_ALTERNATIVES_MISSING")
            alternatives_raw = []
        if not _nonempty_str_list(pareto.get("evidence")):
            errors.append("CRYSTAL_PARETO_EVIDENCE_MISSING")
        for index, alternative in enumerate(alternatives_raw):
            candidate = _crystal_metrics(alternative, f"CRYSTAL_PARETO_ALT_{index}", errors)
            if selected and candidate and _dominates(candidate, selected):
                errors.append(f"CRYSTAL_PARETO_DOMINATED_BY_ALT_{index}")

    if not any(error.startswith("CRYSTAL_") for error in errors):
        metrics["verified"] = True
    return metrics


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
    if subject == "META_CRISTAL":
        errors.append("META_CRISTAL_IS_OUTPUT_NOT_SUBJECT")

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

    is_required_meta = subject in REQUIRED_META_SUBJECTS
    crystal_claim = manifest.get("crystal_claim")
    if crystal_claim is not None and crystal_claim not in CRYSTAL_CLAIMS:
        errors.append("CRYSTAL_CLAIM_INVALID")

    if is_required_meta or crystal_claim == "IRREDUCIBLE":
        _cross_meta_ok(manifest.get("cross_meta_review"), errors)
        if manifest.get("meta_fixed_point") is not True:
            errors.append("META_FIXED_POINT_UNPROVEN")

    crystal_metrics = None
    if crystal_claim == "IRREDUCIBLE":
        crystal_metrics = _crystal_ok(manifest.get("crystal_contract"), manifest, errors)

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
        "required_meta_subject": is_required_meta,
        "meta_fixed_point": manifest.get("meta_fixed_point") if (is_required_meta or crystal_claim == "IRREDUCIBLE") else None,
        "crystal_claim": crystal_claim,
        "crystal_verified": (crystal_metrics["verified"] and verified) if crystal_metrics else None,
        "crystal_compression_gain_percent": (
            crystal_metrics["compression_gain_percent"] if crystal_metrics else None
        ),
        "crystal_density_gain_percent": crystal_metrics["density_gain_percent"] if crystal_metrics else None,
        "status": "EVOLVED" if verified else "EVOLUTION_UNPROVEN",
        "evolution_verified": verified,
        "before_ref": before_ref,
        "after_ref": after_ref,
        "manifest_sha256": manifest_sha256(manifest),
        "errors": sorted(set(errors)),
    }


def _meta_review(status: str = "NO_CHANGE") -> dict[str, dict[str, Any]]:
    return {
        lens: {
            "status": status,
            "evidence": [f"{lens}: avaliação cruzada concluída sem delta residual"],
        }
        for lens in CROSS_META_LENSES
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
    if subject in REQUIRED_META_SUBJECTS:
        base["cross_meta_review"] = _meta_review()
        base["meta_fixed_point"] = True
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

    no_cross_meta = _signed_base("META_LUPA")
    no_cross_meta.pop("cross_meta_review")
    result = validate(_resign(no_cross_meta))
    assert not result["evolution_verified"] and "CROSS_META_REVIEW_MISSING" in result["errors"]

    no_fixed_point = _signed_base("META_LUPA")
    no_fixed_point["meta_fixed_point"] = False
    result = validate(_resign(no_fixed_point))
    assert not result["evolution_verified"] and "META_FIXED_POINT_UNPROVEN" in result["errors"]

    missing_lens = _signed_base("META_LUPA")
    missing_lens["cross_meta_review"].pop("INSTINTO_SUPERIOR")
    result = validate(_resign(missing_lens))
    assert not result["evolution_verified"] and "CROSS_META_INSTINTO_SUPERIOR_MISSING" in result["errors"]

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
