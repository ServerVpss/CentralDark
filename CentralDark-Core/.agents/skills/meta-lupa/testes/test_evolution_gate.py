#!/usr/bin/env python3
import os
import sys
from pathlib import Path

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from scripts.evolution_gate import (  # noqa: E402
    CROSS_META_LENSES,
    REQUIRED_META_SUBJECTS,
    manifest_sha256,
    validate,
)


META_SUBJECTS = {
    "META_LUPA",
    "MENOS_E_MAIS",
    "INSTINTO_SUPERIOR",
    "EXPANSAO_DE_DOMINIO",
    "METACOGNICAO_OPERACIONAL",
}


def cross_meta_review(status="NO_CHANGE"):
    return {
        lens: {
            "status": status,
            "evidence": [f"{lens}: avaliado no estado final"],
        }
        for lens in CROSS_META_LENSES
    }


def signed(subject="META_LUPA"):
    manifest = {
        "schema_version": 1,
        "subject": subject,
        "before_ref": "1" * 40,
        "after_ref": "2" * 40,
        "same_scope": True,
        "canonical_owner": "owner.md",
        "claim": "capacidade aumentou sem regressão",
        "verifier": "judge-read-only",
        "new_information": ["failure mode novo"],
        "capability_delta": ["nova capacidade reutilizável"],
        "before_evidence": ["evidência antes"],
        "after_evidence": ["evidência depois"],
        "counterproof": ["contraprova independente"],
        "provenance": ["origem registrada"],
        "lost_capabilities": [],
        "tests": [{"name": "positivo", "status": "PASS", "evidence": ["receipt"]}],
        "regressions": [{"name": "regressão", "status": "PASS", "evidence": ["receipt"]}],
    }
    if subject in META_SUBJECTS:
        manifest["cross_meta_review"] = cross_meta_review()
        manifest["meta_fixed_point"] = True
    if subject == "MENOS_E_MAIS":
        manifest["complexity_before"] = 5
        manifest["complexity_after"] = 4
    manifest["receipt_sha256"] = manifest_sha256(manifest)
    return manifest


def crystal_contract(stochastic=False):
    quality = {
        "denominator": 100,
        "denominator_frozen_before": True,
        "baseline_floor": 0.90,
        "candidate_floor": 0.90,
        "goal": "NON_INFERIORITY",
        "epsilon": 0.01,
        "epsilon_predeclared": True,
        "stochastic": stochastic,
        "evidence": ["benchmark congelado antes do resultado"],
    }
    if stochastic:
        quality["confidence"] = {
            "method": "PAIRED_BOOTSTRAP",
            "level": 0.95,
            "lower_bound_delta": -0.005,
            "sample_size": 100,
            "evidence": ["bootstrap pareado nos mesmos 100 casos"],
        }
    else:
        quality["confidence"] = {
            "method": "EXACT_DETERMINISTIC",
            "evidence": ["resultado determinístico exato"],
        }

    return {
        "output_kind": "CRISTAL_CONDENSADO_IRREDUTIVEL",
        "fixed_point": True,
        "meta_cristal_is_new_lens": False,
        "critical": {
            "retention_percent": 100,
            "lost_capabilities": [],
            "evidence": ["suite crítica preservada 100%"],
        },
        "traceability": {
            "applicable_claims": 4,
            "resolved_to_owner_hash_source": 4,
            "evidence": ["4/4 claims voltam a owner+hash+fonte"],
        },
        "reconstruction": {
            "status": "PASS",
            "owner_path_preserved": True,
            "evidence": ["reconstrução do owner passou"],
        },
        "proof_ownership": {
            "status": "PASS",
            "invariant_id": "CRYSTAL_CONTRACT_TEST",
            "evidence": ["prova atribuída ao provador responsável"],
            "external_anchor_evidence": ["benchmark/teste independente da conclusão"],
        },
        "effective_load": {
            "unit": "TOKENS_EQUIVALENT",
            "baseline_units": 100,
            "boot_units": 30,
            "source_on_demand_units": 10,
            "effective_units": 40,
            "source_on_demand_applicable": True,
            "workload_sample_count": 100,
            "workload_distribution_evidence": ["100 consultas congeladas antes"],
            "evidence": ["boot + source-on-demand medidos"],
        },
        "quality": quality,
        "irreducibility": {
            "scope": "DECLARED_RESIDUE_SET",
            "search_complete": True,
            "no_removable_residue": True,
            "search_evidence": ["seis lentes procuraram resíduo"],
            "searched_lenses": list(CROSS_META_LENSES),
            "residue_candidates": ["regra-a", "regra-b"],
            "removal_probes": [
                {
                    "candidate": "regra-a",
                    "status": "REJECTED_BREAKS_CONTRACT",
                    "broken_contracts": ["RECONSTRUCTION"],
                    "evidence": ["remoção quebra reconstrução"],
                },
                {
                    "candidate": "regra-b",
                    "status": "REJECTED_BREAKS_CONTRACT",
                    "broken_contracts": ["CRITICAL_CAPABILITY"],
                    "evidence": ["remoção quebra teste crítico"],
                },
            ],
            "global_powerset_minimality_claimed": False,
        },
        "pareto": {
            "scope": "EVALUATED_CANDIDATE_SET",
            "selected": {
                "effective_load_units": 40,
                "quality_floor": 0.90,
                "traceability_percent": 100,
                "critical_retention_percent": 100,
                "evidence": ["selecionado é o mesmo candidato do receipt"],
            },
            "alternatives": [
                {
                    "effective_load_units": 50,
                    "quality_floor": 0.90,
                    "traceability_percent": 100,
                    "critical_retention_percent": 100,
                    "evidence": ["alternativa maior sem ganho"],
                }
            ],
            "evidence": ["nenhum candidato avaliado domina o selecionado"],
        },
    }


def signed_crystal(stochastic=False):
    manifest = signed("METACOGNICAO_OPERACIONAL")
    manifest["crystal_claim"] = "IRREDUCIBLE"
    manifest["crystal_contract"] = crystal_contract(stochastic)
    return resign(manifest)


def resign(manifest):
    manifest["receipt_sha256"] = manifest_sha256(
        {k: v for k, v in manifest.items() if k != "receipt_sha256"}
    )
    return manifest


def test_five_meta_owners_can_be_verified_only_after_cross_meta_review():
    for subject in META_SUBJECTS:
        result = validate(signed(subject))
        assert result["evolution_verified"] is True
        assert result["required_meta_subject"] is True
        assert result["meta_fixed_point"] is True


def test_contract_is_universal_for_future_capabilities_without_forcing_meta_fields():
    result = validate(signed("CAPACIDADE_FUTURA"))
    assert result["evolution_verified"] is True
    assert result["required_meta_subject"] is False
    assert result["meta_fixed_point"] is None


def test_same_state_is_not_evolution():
    manifest = signed()
    manifest["after_ref"] = manifest["before_ref"]
    result = validate(resign(manifest))
    assert result["status"] == "EVOLUTION_UNPROVEN"
    assert "NO_STATE_DELTA" in result["errors"]


def test_no_information_gain_is_not_evolution():
    manifest = signed()
    manifest["new_information"] = []
    result = validate(resign(manifest))
    assert "NEW_INFORMATION_MISSING" in result["errors"]


def test_failed_test_blocks_evolution():
    manifest = signed()
    manifest["tests"][0]["status"] = "FAIL"
    result = validate(resign(manifest))
    assert "TEST_0_NOT_PASS" in result["errors"]


def test_regression_blocks_evolution():
    manifest = signed()
    manifest["lost_capabilities"] = ["capacidade anterior"]
    result = validate(resign(manifest))
    assert "CAPABILITY_REGRESSION" in result["errors"]


def test_menos_e_mais_cannot_get_more_complex_and_call_it_evolution():
    manifest = signed("MENOS_E_MAIS")
    manifest["complexity_after"] = manifest["complexity_before"] + 1
    result = validate(resign(manifest))
    assert "MENOS_E_MAIS_COMPLEXITY_REGRESSION" in result["errors"]


def test_receipt_tamper_is_detected():
    manifest = signed()
    manifest["claim"] = "texto alterado depois do selo"
    result = validate(manifest)
    assert "RECEIPT_SHA256_MISMATCH" in result["errors"]


def test_missing_counterproof_blocks_evolution():
    manifest = signed()
    manifest["counterproof"] = []
    result = validate(resign(manifest))
    assert "COUNTERPROOF_MISSING" in result["errors"]


def test_invalid_subject_is_blocked():
    manifest = signed("META_LUPA")
    manifest["subject"] = "nome livre com espaço"
    result = validate(resign(manifest))
    assert "SUBJECT_INVALID" in result["errors"]


def test_meta_owner_without_cross_meta_review_is_unproven():
    manifest = signed("META_LUPA")
    manifest.pop("cross_meta_review")
    result = validate(resign(manifest))
    assert result["evolution_verified"] is False
    assert "CROSS_META_REVIEW_MISSING" in result["errors"]


def test_meta_owner_cannot_skip_a_mandatory_lens():
    manifest = signed("META_LUPA")
    manifest["cross_meta_review"].pop("INSTINTO_SUPERIOR")
    result = validate(resign(manifest))
    assert result["evolution_verified"] is False
    assert "CROSS_META_INSTINTO_SUPERIOR_MISSING" in result["errors"]


def test_meta_lens_without_evidence_is_unproven_even_when_status_is_no_change():
    manifest = signed("META_LUPA")
    manifest["cross_meta_review"]["MENOS_E_MAIS"]["evidence"] = []
    result = validate(resign(manifest))
    assert result["evolution_verified"] is False
    assert "CROSS_META_MENOS_E_MAIS_EVIDENCE_MISSING" in result["errors"]


def test_meta_lens_cannot_invent_freeform_status():
    manifest = signed("META_LUPA")
    manifest["cross_meta_review"]["META_MINERACAO"]["status"] = "MELHOROU_MUITO"
    result = validate(resign(manifest))
    assert result["evolution_verified"] is False
    assert "CROSS_META_META_MINERACAO_STATUS_INVALID" in result["errors"]


def test_delta_absorbed_is_valid_when_fixed_point_is_reached_afterwards():
    manifest = signed("METACOGNICAO_OPERACIONAL")
    manifest["cross_meta_review"]["META_MINERACAO"] = {
        "status": "DELTA_ABSORBED",
        "evidence": ["estrutura causal nova entrou no after_ref"],
    }
    result = validate(resign(manifest))
    assert result["evolution_verified"] is True
    assert result["meta_fixed_point"] is True


def test_meta_owner_without_fixed_point_is_unproven():
    manifest = signed("INSTINTO_SUPERIOR")
    manifest["meta_fixed_point"] = False
    result = validate(resign(manifest))
    assert result["evolution_verified"] is False
    assert "META_FIXED_POINT_UNPROVEN" in result["errors"]


def test_meta_cristal_is_output_and_never_a_seventh_meta_subject_or_lens():
    assert "META_CRISTAL" not in REQUIRED_META_SUBJECTS
    assert "META_CRISTAL" not in CROSS_META_LENSES

    manifest = signed("META_LUPA")
    manifest["subject"] = "META_CRISTAL"
    result = validate(resign(manifest))
    assert result["evolution_verified"] is False
    assert "META_CRISTAL_IS_OUTPUT_NOT_SUBJECT" in result["errors"]

    manifest = signed("META_LUPA")
    manifest["cross_meta_review"]["META_CRISTAL"] = {
        "status": "NO_CHANGE",
        "evidence": ["não deveria existir como lente"],
    }
    result = validate(resign(manifest))
    assert "META_CRISTAL_IS_OUTPUT_NOT_LENS" in result["errors"]


def test_irreducible_crystal_is_optional_stronger_claim_and_can_pass_scoped_proof():
    result = validate(signed_crystal())
    assert result["evolution_verified"] is True
    assert result["crystal_verified"] is True
    assert result["crystal_claim"] == "IRREDUCIBLE"
    assert result["crystal_compression_gain_percent"] == 60.0
    assert result["crystal_density_gain_percent"] > 0


def test_crystal_cannot_be_green_when_base_evolution_contract_is_red():
    manifest = signed_crystal()
    manifest["tests"][0]["status"] = "FAIL"
    result = validate(resign(manifest))
    assert result["evolution_verified"] is False
    assert result["crystal_verified"] is False
    assert "TEST_0_NOT_PASS" in result["errors"]


def test_irreducible_claim_requires_explicit_crystal_contract():
    manifest = signed("METACOGNICAO_OPERACIONAL")
    manifest["crystal_claim"] = "IRREDUCIBLE"
    result = validate(resign(manifest))
    assert result["evolution_verified"] is False
    assert "CRYSTAL_CONTRACT_MISSING" in result["errors"]


def test_fixed_point_alone_does_not_prove_irreducibility():
    manifest = signed("METACOGNICAO_OPERACIONAL")
    assert manifest["meta_fixed_point"] is True
    result = validate(manifest)
    assert result["evolution_verified"] is True
    assert result["crystal_verified"] is None
    assert result["crystal_claim"] is None


def test_crystal_requires_100_percent_critical_retention_and_traceability():
    manifest = signed_crystal()
    manifest["crystal_contract"]["critical"]["retention_percent"] = 99
    manifest["crystal_contract"]["traceability"]["resolved_to_owner_hash_source"] = 3
    result = validate(resign(manifest))
    assert "CRYSTAL_CRITICAL_RETENTION_NOT_100" in result["errors"]
    assert "CRYSTAL_TRACEABILITY_NOT_100" in result["errors"]


def test_crystal_requires_proof_owner_with_external_anchor_evidence():
    manifest = signed_crystal()
    manifest["crystal_contract"]["proof_ownership"]["invariant_id"] = ""
    manifest["crystal_contract"]["proof_ownership"]["external_anchor_evidence"] = []
    result = validate(resign(manifest))
    assert "CRYSTAL_PROOF_OWNERSHIP_INVARIANT_MISSING" in result["errors"]
    assert "CRYSTAL_PROOF_OWNERSHIP_EXTERNAL_ANCHOR_MISSING" in result["errors"]


def test_effective_load_must_include_measured_source_on_demand_cost():
    manifest = signed_crystal()
    load = manifest["crystal_contract"]["effective_load"]
    load["effective_units"] = 30
    load["workload_sample_count"] = 0
    load["workload_distribution_evidence"] = []
    result = validate(resign(manifest))
    assert "CRYSTAL_EFFECTIVE_LOAD_FORMULA_MISMATCH" in result["errors"]
    assert "CRYSTAL_SOURCE_ON_DEMAND_WORKLOAD_DENOMINATOR_INVALID" in result["errors"]
    assert "CRYSTAL_SOURCE_ON_DEMAND_WORKLOAD_EVIDENCE_MISSING" in result["errors"]


def test_small_compact_payload_is_not_gain_if_effective_load_does_not_drop():
    manifest = signed_crystal()
    load = manifest["crystal_contract"]["effective_load"]
    load["boot_units"] = 90
    load["source_on_demand_units"] = 10
    load["effective_units"] = 100
    manifest["crystal_contract"]["pareto"]["selected"]["effective_load_units"] = 100
    result = validate(resign(manifest))
    assert "CRYSTAL_NO_EFFECTIVE_COMPRESSION" in result["errors"]


def test_quality_denominator_and_epsilon_must_be_frozen_before_result():
    manifest = signed_crystal()
    quality = manifest["crystal_contract"]["quality"]
    quality["denominator_frozen_before"] = False
    quality["epsilon_predeclared"] = False
    result = validate(resign(manifest))
    assert "CRYSTAL_QUALITY_DENOMINATOR_NOT_PREDECLARED" in result["errors"]
    assert "CRYSTAL_QUALITY_EPSILON_NOT_PREDECLARED" in result["errors"]


def test_deterministic_quality_must_meet_exact_predeclared_noninferiority_margin():
    manifest = signed_crystal()
    quality = manifest["crystal_contract"]["quality"]
    quality["candidate_floor"] = 0.87
    manifest["crystal_contract"]["pareto"]["selected"]["quality_floor"] = 0.87
    result = validate(resign(manifest))
    assert "CRYSTAL_DETERMINISTIC_NONINFERIORITY_NOT_PROVEN" in result["errors"]


def test_deterministic_quality_cannot_fake_statistical_confidence_interval():
    manifest = signed_crystal()
    quality = manifest["crystal_contract"]["quality"]
    quality["confidence"]["level"] = 0.95
    result = validate(resign(manifest))
    assert "CRYSTAL_DETERMINISTIC_MUST_NOT_FAKE_STATISTICAL_CI" in result["errors"]


def test_stochastic_quality_requires_95pct_lower_bound_and_predeclared_margin():
    manifest = signed_crystal(stochastic=True)
    result = validate(manifest)
    assert result["evolution_verified"] is True

    manifest = signed_crystal(stochastic=True)
    manifest["crystal_contract"]["quality"]["confidence"]["lower_bound_delta"] = -0.02
    result = validate(resign(manifest))
    assert "CRYSTAL_CONFIDENCE_NONINFERIORITY_NOT_PROVEN" in result["errors"]


def test_stochastic_before_after_does_not_accept_unpaired_wilson_shortcut():
    manifest = signed_crystal(stochastic=True)
    manifest["crystal_contract"]["quality"]["confidence"]["method"] = "WILSON"
    result = validate(resign(manifest))
    assert "CRYSTAL_CONFIDENCE_METHOD_INVALID" in result["errors"]


def test_density_uses_conservative_quality_floor_over_effective_load():
    manifest = signed_crystal()
    quality = manifest["crystal_contract"]["quality"]
    quality["candidate_floor"] = 0.35
    quality["epsilon"] = 1.0
    manifest["crystal_contract"]["pareto"]["selected"]["quality_floor"] = 0.35
    # 0.35 / 40 < 0.90 / 100, so compression alone cannot manufacture density gain.
    result = validate(resign(manifest))
    assert "CRYSTAL_QUALITY_DENSITY_NOT_IMPROVED" in result["errors"]


def test_irreducibility_requires_all_cross_meta_lenses_to_search_residue():
    manifest = signed_crystal()
    manifest["crystal_contract"]["irreducibility"]["searched_lenses"].remove("META_LUPA")
    result = validate(resign(manifest))
    assert "CRYSTAL_RESIDUE_SEARCHED_LENSES_INCOMPLETE" in result["errors"]


def test_every_declared_residue_must_have_discriminating_removal_probe():
    manifest = signed_crystal()
    manifest["crystal_contract"]["irreducibility"]["removal_probes"].pop()
    result = validate(resign(manifest))
    assert "CRYSTAL_RESIDUE_UNPROBED:regra-b" in result["errors"]


def test_removal_probe_must_name_which_required_contract_breaks():
    manifest = signed_crystal()
    manifest["crystal_contract"]["irreducibility"]["removal_probes"][0]["broken_contracts"] = []
    result = validate(resign(manifest))
    assert "CRYSTAL_REMOVAL_PROBE_0_BROKEN_CONTRACTS_INVALID" in result["errors"]


def test_declared_residue_irreducibility_must_not_be_mislabeled_global_powerset_minimality():
    manifest = signed_crystal()
    manifest["crystal_contract"]["irreducibility"]["global_powerset_minimality_claimed"] = True
    result = validate(resign(manifest))
    assert "CRYSTAL_GLOBAL_POWERSET_MINIMALITY_UNPROVEN" in result["errors"]


def test_pareto_claim_is_only_over_evaluated_candidates_and_selected_metrics_are_linked():
    manifest = signed_crystal()
    manifest["crystal_contract"]["pareto"]["selected"]["effective_load_units"] = 41
    result = validate(resign(manifest))
    assert "CRYSTAL_PARETO_SELECTED_EFFECTIVE_LOAD_UNITS_MISMATCH" in result["errors"]


def test_evaluated_candidate_that_pareto_dominates_selected_blocks_crystal():
    manifest = signed_crystal()
    manifest["crystal_contract"]["pareto"]["alternatives"][0].update(
        {
            "effective_load_units": 30,
            "quality_floor": 0.90,
            "traceability_percent": 100,
            "critical_retention_percent": 100,
        }
    )
    result = validate(resign(manifest))
    assert "CRYSTAL_PARETO_DOMINATED_BY_ALT_0" in result["errors"]


def test_crystal_contract_remains_canonical_in_metacognition_owner():
    repo_root = Path(__file__).resolve().parents[4]
    owner = repo_root / "docs/CONSCIENCIA/METACOGNICAO-OPERACIONAL.md"
    content = owner.read_text(encoding="utf-8")
    required_markers = (
        "META_CRISTAL_IS_NEW_LENS=false",
        "CRISTAL_IS_CROSS_META_OUTPUT=true",
        "FIXED_POINT != IRREDUCIBLE",
        "IRREDUCIBILITY_SCOPE=DECLARED_RESIDUE_SET",
        "GLOBAL_POWERSET_MINIMALITY=UNPROVEN_UNLESS_EXHAUSTIVE",
        "CONFIDENCE_METHOD=PAIRED_BOOTSTRAP",
        "PARETO_SCOPE=EVALUATED_CANDIDATE_SET",
        "CRISTAL_CLAIM_DOES_NOT_UPGRADE_BASE_FAILURE=true",
    )
    for marker in required_markers:
        assert marker in content, f"CRYSTAL_CANONICAL_MARKER_MISSING={marker}"


def test_pdf_mining_keeps_biblioteca_elfica_pinned_in_canonical_scaffold():
    repo_root = Path(__file__).resolve().parents[4]
    owner = repo_root / "docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/CAPACIDADES-COGNITIVAS.md"
    content = owner.read_text(encoding="utf-8")

    required_markers = (
        "BIBLIOTECA_ELFICA_SOURCE_PINNED=true",
        "PDF_MINING_SOURCE_POOL+=BIBLIOTECA_ELFICA",
        "ALWAYS_IN_PDF_SOURCE_POOL=true",
        "NO_AUTH_QUOTA_CAPTCHA_BYPASS=true",
        "SOURCE_PROVIDED_BULK_CHANNEL_PREFERRED=true",
        "EXTERNAL_PDF_BYTES_NOT_COMMITTED_TO_CANONICAL_REPO_BY_DEFAULT=true",
    )
    for marker in required_markers:
        assert marker in content, f"BIBLIOTECA_ELFICA_CANONICAL_MARKER_MISSING={marker}"


def test_zero_silent_learning_is_house_invariant_and_not_chat_or_private_cot_dump():
    repo_root = Path(__file__).resolve().parents[4]
    owner = repo_root / "docs/CONSCIENCIA/METACOGNICAO-OPERACIONAL.md"
    boot = repo_root / "LEIA-ME-IA.md"
    content = owner.read_text(encoding="utf-8")
    boot_content = boot.read_text(encoding="utf-8")

    required_markers = (
        "ZERO_SILENT_LEARNING=true",
        "ZERO_SILENT_LEARNING_SCOPE=HOUSE",
        "MATERIAL_LEARNING_MUST_SURFACE=true",
        "MATERIAL_LEARNING_REQUIRES_EVIDENCE=true",
        "MATERIAL_LEARNING_REQUIRES_OWNER=true",
        "MATERIAL_LEARNING_REQUIRES_REUSABLE_DELTA=true",
        "MATERIAL_LEARNING_MUST_OUTLIVE_EXECUTOR_WHEN_REUSABLE=true",
        "MATERIAL_LEARNING_CANNOT_LIVE_ONLY_IN_SESSION=true",
        "MATERIAL_LEARNING_MUST_BE_INSPECTABLE_BY_SEGREDO_CHEFE=true",
        "MATERIAL_LEARNING_SURFACE=CONCLUSION+EVIDENCE+DELTA+IMPACT+OWNER+STATE",
        "PRIVATE_CHAIN_OF_THOUGHT_NOT_REQUIRED=true",
        "NO_NEW_INFORMATION_OR_REUSABLE_DELTA=NO_CHANGE",
        "UNPROVEN_MATERIAL_LEARNING=CANDIDATE",
        "UNSURFACED_MATERIAL_LEARNING=UNPROVEN",
        "SILENT_CANONICAL_PROMOTION=FORBIDDEN",
        "NO_NEW_MEMORY_ENGINE_REQUIRED=true",
        "NO_NEW_WORKFLOW_REQUIRED=true",
    )
    for marker in required_markers:
        assert marker in content, f"ZERO_SILENT_LEARNING_MARKER_MISSING={marker}"

    assert "docs/CONSCIENCIA/METACOGNICAO-OPERACIONAL.md" in boot_content
    assert "não um formato de chat" in content
    assert "não exige cadeia de pensamento privada" in content
