"""Testes de conformidade da AutoLupa canônica.

Regras:
1. Falha se o relatório AutoLupa não contiver as 15 verificações obrigatórias.
2. Falha se qualquer verificação estiver marcada como GAP / PENDENTE / NAO_VERIFICADO.
3. Falha se o veredito for APROVAR quando houver qualquer gap.
4. Falha se a convocação do comitê independente (XP-3) e seu resultado estiverem ausentes.
5. Falha se o git-blob SHA1 do SKILL.md local divergir do guard canônico.
6. Falha se o updater de hash voltar a aceitar marcador legado de autoridade.

Uso:
    AUTOLUPA_REPORT=caminho.md pytest .agents/skills/meta-lupa/testes/ -v
"""
from __future__ import annotations

import os
import re
import subprocess
from pathlib import Path

import pytest

REPO_ROOT = Path(__file__).resolve().parents[4]
SKILL_PATH = REPO_ROOT / ".agents/skills/meta-lupa/SKILL.md"
HASH_GUARD = REPO_ROOT / ".agents/skills/meta-lupa/AUTOLUPA_CANONICAL_SHA"
HASH_UPDATER = REPO_ROOT / "scripts/lupa/validar_autolupa_hash.py"

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
        "Se intencional, use scripts/lupa/validar_autolupa_hash.py --update em evento PR autenticado com label permito-segredo."
    )


def test_hash_updater_usa_autoridade_canonica():
    assert HASH_UPDATER.exists(), f"Updater ausente: {HASH_UPDATER}"
    source = HASH_UPDATER.read_text(encoding="utf-8")
    assert "PERMITO_PIVETE" not in source, "Updater voltou a aceitar marcador legado PERMITO_PIVETE"
    assert "authority-approval.mjs" in source, "Updater não consulta a fonte canônica de autoridade"
    assert "CANONICAL_AUTHORITY_RECEIPT" in source, "Updater não exige receipt canônico autenticado"
