"""Testes de conformidade da AutoLupa canônica.

Regras:
1. Falha se o relatório AutoLupa não contiver as 15 verificações obrigatórias.
2. Falha se qualquer verificação estiver marcada como GAP / PENDENTE / NAO_VERIFICADO.
3. Falha se o veredito for APROVAR quando houver qualquer gap.
4. Falha se a convocação do comitê independente (XP-3) e seu resultado estiverem ausentes.
5. Falha se o git-blob SHA1 do SKILL.md local divergir do guard canônico.
6. Falha se o guard deixar de explicar caminho, hash, validação, divergência e autoridade.
6. Falha se o updater de hash voltar a aceitar marcador legado de autoridade.

Uso:
    AUTOLUPA_REPORT=caminho.md pytest .agents/skills/meta-lupa/testes/ -v
"""
from __future__ import annotations

import importlib.util
import json
import os
import re
import subprocess
from pathlib import Path

import pytest

REPO_ROOT = Path(__file__).resolve().parents[4]
SKILL_PATH = REPO_ROOT / ".agents/skills/meta-lupa/SKILL.md"
HASH_GUARD = REPO_ROOT / ".agents/skills/meta-lupa/AUTOLUPA_CANONICAL_SHA"
HASH_UPDATER = REPO_ROOT / "scripts/lupa/validar_autolupa_hash.py"
META_LUPA_SCRIPT = REPO_ROOT / ".agents/skills/meta-lupa/scripts/meta_lupa.py"
PROOF_OWNERSHIP_CONTRACT = REPO_ROOT / "docs/CONSCIENCIA/PROOF-OWNERSHIP.json"

CHECKS_OBRIGATORIAS = [
    "XP-1", "XP-2", "XP-3", "XP-4",
    "AL-1", "AL-2", "AL-3", "AL-4", "AL-5",
    "AL-6", "AL-7", "AL-8", "AL-9", "AL-10",
    "AL-11",
]

GAP_TOKENS = ("GAP", "PENDENTE", "NAO_VERIFICADO", "NÃO VERIFICADO", "MISSING")


def _git_blob_sha1(path: Path) -> str:
    """Calcula o blob após os filtros Git, independente do EOL do checkout."""
    relative = path.relative_to(REPO_ROOT).as_posix()
    result = subprocess.run(
        ["git", "hash-object", "--stdin", f"--path={relative}"],
        cwd=REPO_ROOT,
        input=path.read_bytes(),
        capture_output=True,
        check=True,
    )
    return result.stdout.decode("ascii").strip()


def _load_meta_lupa():
    """Carrega o motor canônico sem criar segunda implementação para testá-lo."""
    spec = importlib.util.spec_from_file_location("meta_lupa_conformance", META_LUPA_SCRIPT)
    assert spec and spec.loader
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def _load_report() -> str:
    path = os.environ.get("AUTOLUPA_REPORT")
    if not path:
        pytest.skip("AUTOLUPA_REPORT não definido")
    p = Path(path)
    if not p.exists():
        pytest.fail(f"Relatório AutoLupa não encontrado: {path}")
    return p.read_text(encoding="utf-8")


def test_report_contem_15_verificacoes():
    report = _load_report()
    faltantes = [c for c in CHECKS_OBRIGATORIAS if c not in report]
    assert not faltantes, f"AutoLupa incompleta — verificações ausentes: {faltantes}"


def test_report_sem_gaps_de_evidencia():
    report_upper = _load_report().upper()
    for tok in GAP_TOKENS:
        for m in re.finditer(re.escape(tok), report_upper):
            janela = report_upper[max(0, m.start()-80):m.start()]
            if "RISCO RESIDUAL" not in janela and "AUTOLUPA" not in janela:
                pytest.fail(f"Gap de evidência detectado sem justificativa: {tok}")


def test_veredito_coerente_com_gaps():
    report = _load_report()
    tem_gap = any(tok in report.upper() for tok in GAP_TOKENS)
    m = re.search(r"VEREDITO\s*:\s*(APROVAR|CONDICIONAR|CORRIGIR|BLOQUEAR)", report, re.IGNORECASE)
    assert m, "VEREDITO ausente no relatório"
    if tem_gap and m.group(1).upper() == "APROVAR":
        pytest.fail("Veredito APROVAR incompatível com gaps presentes")


def test_convocacao_comite_xp3_registrada():
    report = _load_report()
    conv = re.search(r"COMIT[ÊE]\s+INDEPENDENTE|XP-3.*(CONVOCADO|CONVOCA[ÇC][ÃA]O)", report, re.IGNORECASE)
    assert conv, "Convocação do comitê independente (XP-3) não registrada. Use scripts/lupa/convocar_comite_xp3.py."
    res = re.search(r"COMIT[ÊE]\s+RESULTADO\s*:\s*(APROVA|REJEITA|CONDICIONA|PENDENTE)", report, re.IGNORECASE)
    assert res, "Resultado do comitê XP-3 ausente"
    assert res.group(1).upper() != "PENDENTE", "Comitê XP-3 pendente — bloqueia veredito"


def test_hash_canonico_lupa_bate():
    if not HASH_GUARD.exists():
        pytest.fail(f"Guarda ausente: {HASH_GUARD}")
    if not SKILL_PATH.exists():
        pytest.skip("SKILL.md não presente")
    atual = _git_blob_sha1(SKILL_PATH)
    esperado = HASH_GUARD.read_text(encoding="utf-8").strip().split()[0]
    assert atual == esperado, (
        f"Hash da Lupa divergente do canônico.\n  esperado: {esperado}\n  atual:    {atual}\n"
        "Se intencional, rode scripts/lupa/validar_autolupa_hash.py --update somente com autorização aplicável de SEGREDO/CHEFE."
    )


def test_guard_explica_a_identidade_sem_enigma():
    if not HASH_GUARD.exists():
        pytest.fail(f"Guarda ausente: {HASH_GUARD}")

    text = HASH_GUARD.read_text(encoding="utf-8")
    first_line = text.splitlines()[0]
    parts = first_line.split()

    assert len(parts) >= 2, "Guard deve declarar hash e caminho na primeira linha"
    assert re.fullmatch(r"[0-9a-f]{40}", parts[0]), "Primeiro campo do guard deve ser git-blob SHA1"
    assert parts[1] == ".agents/skills/meta-lupa/SKILL.md", "Guard deve apontar para o SKILL.md canônico"

    required_markers = (
        "O_QUE_E=",
        "COMO_LER=",
        "CAMINHO_PROTEGIDO=",
        "REGRA_BYTE_A_BYTE=",
        "COMO_VALIDAR=",
        "SE_DIVERGIR=",
        "AUTORIDADE=SEGREDO/CHEFE",
        "NAO_PROVA=",
    )
    missing = [marker for marker in required_markers if marker not in text]
    assert not missing, f"Guard sem explicação suficiente: {missing}"


def test_hash_updater_usa_autoridade_canonica():
    assert HASH_UPDATER.exists(), f"Updater ausente: {HASH_UPDATER}"
    source = HASH_UPDATER.read_text(encoding="utf-8")
    assert "PERMITO_PIVETE" not in source, "Updater voltou a aceitar marcador legado PERMITO_PIVETE"
    assert "authority-approval.mjs" in source, "Updater não consulta a fonte canônica de autoridade"
    assert "CANONICAL_AUTHORITY_RECEIPT" in source, "Updater não exige receipt canônico autenticado"


def test_oracle_autodeclarado_nao_prova_independencia():
    """A MetaLupa deve falhar fechado quando a independência do oracle não existe."""
    m = _load_meta_lupa()
    outcome = {
        "oracle_independent": False,
        "discriminative_test_before": True,
        "correct_action_score": 2,
        "correct_action_score_max": 2,
        "hidden_failures_reported": True,
        "modules_correct_preserved": True,
        "authorization_confidence_separated": True,
    }
    errors = m.validate_outcome_evidence(outcome)
    assert "OUTCOME_EVIDENCE_INVALID:oracle_independent" in errors


def test_meta_lupa_herda_proof_ownership_anti_auto_prova():
    """Cristaliza a regra existente sem duplicar um segundo provador na MetaLupa."""
    assert PROOF_OWNERSHIP_CONTRACT.exists(), f"Contrato ausente: {PROOF_OWNERSHIP_CONTRACT}"
    contract = json.loads(PROOF_OWNERSHIP_CONTRACT.read_text(encoding="utf-8"))
    rules = contract.get("global_rules", {})

    assert contract.get("status") == "CANONICAL"
    assert contract.get("coverage_status") == "PARTIAL_EXPLICIT"
    assert rules.get("self_validation_without_independent_counterproof") == "UNPROVEN"
    assert rules.get("circular_proof") == "UNPROVEN"
    assert rules.get("proof_graph_must_be_acyclic") is True
    assert rules.get("proof_must_end_in_external_anchor") is True
    assert rules.get("graph_structure_ok_is_not_invariant_proof") is True
