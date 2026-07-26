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
    result = m.evaluate({"risk": "R0", "token": "ghp_abcdefghij1234567890ABCDEFGH"})
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
