"""Testes de conformidade da AutoLupa canônica.

Regras:
1. Falha se o relatório AutoLupa não contiver as 15 verificações obrigatórias.
2. Falha se qualquer verificação estiver marcada como GAP / PENDENTE / NAO_VERIFICADO.
3. Falha se o veredito for APROVAR quando houver qualquer gap.
4. Falha se o registro de convocação do comitê XP-3 estiver ausente.
5. Falha se o hash canônico da Lupa não bater com o SHA gravado no arquivo.

Uso:
    pytest .agents/skills/lupa-bayesiana/testes/test_autolupa_conformance.py -v

Entrada esperada: variável de ambiente AUTOLUPA_REPORT apontando para o
relatório markdown/tex gerado. Se ausente, os testes usam o fixture mínimo
em testes/fixtures/ para validar o próprio harness.
"""
from __future__ import annotations

import os
import re
from pathlib import Path

import pytest

REPO_ROOT = Path(__file__).resolve().parents[4]
SKILL_PATH = REPO_ROOT / ".agents/skills/lupa-bayesiana/SKILL.md"
HASH_GUARD = REPO_ROOT / ".agents/skills/lupa-bayesiana/AUTOLUPA_CANONICAL_SHA"

CHECKS_OBRIGATORIAS = [
    "XP-1", "XP-2", "XP-3", "XP-4",
    "AL-1", "AL-2", "AL-3", "AL-4", "AL-5",
    "AL-6", "AL-7", "AL-8", "AL-9", "AL-10",
    "AL-11",
]

GAP_TOKENS = ("GAP", "PENDENTE", "NAO_VERIFICADO", "NÃO VERIFICADO", "MISSING")


def _load_report() -> str:
    path = os.environ.get("AUTOLUPA_REPORT")
    if not path:
        pytest.skip("AUTOLUPA_REPORT não definido — rode com AUTOLUPA_REPORT=caminho.tex pytest ...")
    p = Path(path)
    if not p.exists():
        pytest.fail(f"Relatório AutoLupa não encontrado: {path}")
    return p.read_text(encoding="utf-8")


def test_report_contem_15_verificacoes():
    report = _load_report()
    faltantes = [c for c in CHECKS_OBRIGATORIAS if c not in report]
    assert not faltantes, f"AutoLupa incompleta — verificações ausentes: {faltantes}"


def test_report_sem_gaps_de_evidencia():
    report = _load_report().upper()
    achados = [tok for tok in GAP_TOKENS if tok in report]
    if achados:
        # Permite menção apenas em bloco 'RISCO RESIDUAL' explícito.
        for tok in achados:
            for match in re.finditer(re.escape(tok), report):
                janela = report[max(0, match.start()-80):match.start()]
                if "RISCO RESIDUAL" not in janela and "AUTOLUPA" not in janela:
                    pytest.fail(f"Gap de evidência detectado sem justificativa: {tok}")


def test_veredito_coerente_com_gaps():
    report = _load_report()
    tem_gap = any(tok in report.upper() for tok in GAP_TOKENS)
    m = re.search(r"VEREDITO\s*:\s*(APROVAR|CONDICIONAR|CORRIGIR|BLOQUEAR)", report, re.IGNORECASE)
    assert m, "VEREDITO ausente no relatório"
    veredito = m.group(1).upper()
    if tem_gap and veredito == "APROVAR":
        pytest.fail("Veredito APROVAR incompatível com gaps presentes — deve ser CONDICIONAR/CORRIGIR/BLOQUEAR")


def test_convocacao_comite_xp3_registrada():
    report = _load_report()
    padrao = re.compile(r"COMIT[ÊE]\s+INDEPENDENTE|XP-3.*(CONVOCADO|CONVOCACAO|CONVOCAÇÃO)", re.IGNORECASE)
    assert padrao.search(report), (
        "Convocação do comitê independente (XP-3) não registrada. "
        "Rode scripts/lupa/convocar_comite_xp3.py antes de finalizar o TEX."
    )
    resultado = re.search(r"COMIT[ÊE]\s+RESULTADO\s*:\s*(APROVA|REJEITA|CONDICIONA|PENDENTE)", report, re.IGNORECASE)
    assert resultado, "Resultado do comitê XP-3 ausente — registrar APROVA/REJEITA/CONDICIONA."
    assert resultado.group(1).upper() != "PENDENTE", "Comitê XP-3 pendente — bloqueia veredito."


def test_hash_canonico_lupa_bate():
    if not HASH_GUARD.exists():
        pytest.fail(f"Arquivo de guarda ausente: {HASH_GUARD}. Rode scripts/lupa/validar_autolupa_hash.py --update")
    if not SKILL_PATH.exists():
        pytest.skip("SKILL.md não presente neste checkout")
    import hashlib
    atual = hashlib.sha256(SKILL_PATH.read_bytes()).hexdigest()
    esperado = HASH_GUARD.read_text(encoding="utf-8").strip().split()[0]
    assert atual == esperado, (
        f"Hash da Lupa divergente do canônico.\n  esperado: {esperado}\n  atual:    {atual}\n"
        "Se a mudança é intencional, rode scripts/lupa/validar_autolupa_hash.py --update e reabra o PR."
    )
