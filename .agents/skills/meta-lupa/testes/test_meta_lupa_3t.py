from __future__ import annotations

import importlib.util
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ENGINE = ROOT / "scripts" / "meta_lupa.py"
spec = importlib.util.spec_from_file_location("meta_lupa", ENGINE)
m = importlib.util.module_from_spec(spec)
assert spec and spec.loader
spec.loader.exec_module(m)


def test_temperaturas():
    assert m.select_mode({"risk": "R0"}) == "FRIA"
    assert m.select_mode({"risk": "R1", "triggers": ["401"]}) == "MEDIA"
    assert m.select_mode({"risk": "R3"}) == "QUENTE"


def test_variantes_das_tres_temperaturas():
    fria = m.evaluate({"risk": "R0", "triggers": ["READBACK"]})
    assert fria["mode_used"] == "FRIA"
    assert fria["variant_used"] == "FRIA_READBACK"

    media = m.evaluate({
        "risk": "R1",
        "triggers": ["VISUAL_ACTION_NO_EFFECT"],
        "visual_recovery_class": "H01_STALE_RUNTIME_TARGET",
    })
    assert media["mode_used"] == "MEDIA"
    assert media["variant_used"] == "MEDIA_RECOVERY_VISUAL"

    quente = m.evaluate({"risk": "R0", "triggers": ["ALTERAR_LUPA"]})
    assert quente["mode_used"] == "QUENTE"
    assert quente["variant_used"] == "QUENTE_META_EVOLUCAO"


def test_recovery_recorrente_escala_para_quente():
    result = m.evaluate({"risk": "R0", "triggers": ["RECOVERY_RECURRENT"]})
    assert result["mode_used"] == "QUENTE"
    assert result["variant_used"] == "QUENTE_RECURRENCIA_ADVERSARIAL"


def test_media_variantes_discriminam_ferida():
    assert m.select_variant({"risk": "R2", "triggers": ["FALSO_VERDE"]}) == "MEDIA_FALSO_VERDE"
    assert m.select_variant({"risk": "R2", "triggers": ["DRIFT"]}) == "MEDIA_DRIFT_DISTRIBUIDO"
    assert m.select_variant({"risk": "R2", "triggers": ["INSTRUMENT_FAILURE"]}) == "MEDIA_INSTRUMENTO_INCERTO"


def test_falso_verde_bloqueado():
    result = m.evaluate({
        "risk": "R0",
        "success_claimed": True,
        "evidence_sufficient": False,
    })
    assert result["verdict"] == "BLOQUEAR"
    assert "FALSO_VERDE" in result["errors"]


def test_uma_variavel_e_delta():
    errors = m.validate({
        "risk": "R0",
        "variables_changed": ["provider", "model"],
        "claims_runtime_change": True,
    })
    assert "MULTIPLAS_VARIAVEIS_NO_MESMO_TESTE" in errors
    assert "DELTA_RUNTIME_AUSENTE" in errors


def test_autorizacao_e_rollback():
    result = m.evaluate({"risk": "R3", "source_truth": "git"})
    assert result["verdict"] == "BLOQUEAR"
    assert "AUTORIZACAO_AUSENTE" in result["errors"]
    assert "ROLLBACK_AUSENTE" in result["errors"]


def test_secret_guardrail():
    synthetic_token = "ghp_" + "abcdefghij1234567890ABCDEFGH"
    result = m.evaluate({"risk": "R0", "token": synthetic_token})
    assert result["verdict"] == "BLOQUEAR"
    assert "SECRET_DETECTADO" in result["errors"]


def test_mesmo_sha():
    result = m.evaluate({
        "risk": "R0",
        "head_sha": "a",
        "evidence_head": "b",
    })
    assert result["verdict"] == "BLOQUEAR"
    assert "EVIDENCIA_DE_OUTRO_SHA" in result["errors"]


def test_digest_estavel_e_sensivel():
    base = {"objective": "x", "target": "y"}
    assert m.contract_digest(base) == m.contract_digest(dict(base))
    assert m.contract_digest(base) != m.contract_digest({"objective": "z", "target": "y"})
