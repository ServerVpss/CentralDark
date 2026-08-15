#!/usr/bin/env python3
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from scripts.evolution_gate import (  # noqa: E402
    CROSS_META_LENSES,
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
        "evidence": ["fonte de maior resolução expôs estrutura causal nova e ela entrou no after_ref"],
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
