#!/usr/bin/env python3
"""Regressao do selo de ponto fixo + do recibo de XP do finish-use.

Roda sem dependencias: python testes/test_selo_ponto_fixo.py
Compativel com pytest.

Por que este arquivo existe
---------------------------
1) test_lupa.py produz TOTAL=52 PASS=52 tanto no motor COM a correcao do
   recibo quanto no motor SEM ela. Uma suite que passa identicamente nos dois
   lados nao mede a regressao daquela mudanca -- e o caso "verificacao passa
   no codigo novo" da tabela de falso verde de versionamento da SKILL.md.
   Os testes de recibo abaixo falham no motor antigo e passam no novo.

2) O motor aceita point_fixed_evidential=True com autolupa_executed=False:
   sela o resultado de um instrumento que nao rodou, e libera os 25 XP de
   ponto_fixo_atingido. Os testes de selo abaixo travam esse caminho.
"""
from __future__ import annotations

import importlib.util
import json
import os
import subprocess
import sys
import tempfile

TESTES = os.path.dirname(os.path.abspath(__file__))
SKILL = os.path.dirname(TESTES)
sys.path.insert(0, SKILL)

from scripts.meta_lupa import _final_receipt_line  # noqa: E402

_spec = importlib.util.spec_from_file_location(
    "validar_selo_ponto_fixo",
    os.path.join(SKILL, "guardrails", "validar_selo_ponto_fixo.py"),
)
selo = importlib.util.module_from_spec(_spec)
assert _spec and _spec.loader
_spec.loader.exec_module(selo)

LEDGER_CANONICO = os.path.join(SKILL, "references", "uso-ledger.jsonl")

HASH_LEGADO = "971f1efea856f84ef9056eb1725c869abcd1e61e331f0f64abcb8443e59c18d8"


def _final(**over):
    rec = {
        "event": "FINAL",
        "mission_id": "TESTE",
        "usage_id": "u-teste",
        "record_hash": "hash-novo-que-nao-esta-na-allowlist",
        "autolupa_executed": True,
        "point_fixed_evidential": True,
        "achievements": [],
        "xp_gained": 0,
    }
    rec.update(over)
    return rec


def _ledger_tmp(recs):
    tf = tempfile.NamedTemporaryFile("w", delete=False, suffix=".jsonl", encoding="utf-8")
    for r in recs:
        tf.write(json.dumps(r, ensure_ascii=False) + "\n")
    tf.close()
    return tf.name


# --------------------------------------------------------------- selo

def test_selo_bloqueia_point_fixed_sem_autolupa():
    rel = selo.auditar([_final(autolupa_executed=False, point_fixed_evidential=True)])
    assert rel["selo_ok"] is False
    assert len(rel["novas"]) == 1
    assert rel["novas"][0]["autolupa_executed"] is False


def test_selo_bloqueia_achievement_sem_autolupa():
    rec = _final(
        autolupa_executed=False,
        point_fixed_evidential=False,
        achievements=["ponto_fixo_atingido"],
    )
    rel = selo.auditar([rec])
    assert rel["selo_ok"] is False
    assert rel["novas"][0]["achievement_reivindicado"] is True


def test_selo_aceita_point_fixed_com_autolupa():
    rel = selo.auditar([
        _final(autolupa_executed=True, point_fixed_evidential=True,
               achievements=["ponto_fixo_atingido"])
    ])
    assert rel["selo_ok"] is True
    assert rel["novas"] == []


def test_selo_ignora_final_que_nao_sela():
    rel = selo.auditar([_final(autolupa_executed=False, point_fixed_evidential=False)])
    assert rel["selo_ok"] is True
    assert rel["novas"] == [] and rel["legado"] == []


def test_selo_ignora_evento_begin():
    rel = selo.auditar([{"event": "BEGIN", "autolupa_executed": False,
                         "point_fixed_evidential": True}])
    assert rel["finais_auditados"] == 0
    assert rel["selo_ok"] is True


def test_selo_trata_legado_como_aviso_e_nao_falha():
    rec = _final(autolupa_executed=False, record_hash=HASH_LEGADO)
    rel = selo.auditar([rec])
    assert rel["selo_ok"] is True
    assert len(rel["legado"]) == 1
    assert rel["xp_indevido_legado"] == 25


def test_selo_legado_nao_esconde_violacao_nova():
    rel = selo.auditar([
        _final(autolupa_executed=False, record_hash=HASH_LEGADO),
        _final(autolupa_executed=False, usage_id="u-nova"),
    ])
    assert rel["selo_ok"] is False
    assert len(rel["legado"]) == 1 and len(rel["novas"]) == 1


def test_ledger_canonico_sem_violacao_nova():
    recs = selo.ler_ledger(selo.Path(LEDGER_CANONICO))
    rel = selo.auditar(recs)
    assert rel["selo_ok"] is True, rel["novas"]


def test_cli_do_guardrail_retorna_1_em_violacao():
    import subprocess
    caminho = _ledger_tmp([_final(autolupa_executed=False)])
    r = subprocess.run(
        [sys.executable, os.path.join(SKILL, "guardrails", "validar_selo_ponto_fixo.py"),
         "--ledger", caminho],
        capture_output=True, text=True,
    )
    assert r.returncode == 1, r.stdout + r.stderr
    assert "SELO_SEM_AUTOLUPA" in r.stdout


def test_cli_do_guardrail_fecha_em_ledger_ausente_ou_invalido():
    with tempfile.TemporaryDirectory() as tmp:
        for nome, conteudo in (("ausente", None), ("invalido", "nao-json\n")):
            caminho = os.path.join(tmp, nome + ".jsonl")
            if conteudo is not None:
                with open(caminho, "w", encoding="utf-8") as arquivo:
                    arquivo.write(conteudo)
            r = subprocess.run(
                [sys.executable, os.path.join(SKILL, "guardrails", "validar_selo_ponto_fixo.py"),
                 "--ledger", str(caminho), "--json"],
                capture_output=True, text=True,
            )
            rel = json.loads(r.stdout)
            assert r.returncode == 2
            assert rel["selo_ok"] is False
            assert rel["erro_entrada"]


# --------------------------------------------------------- recibo de XP

def test_recibo_expoe_antes_e_depois():
    linha = _final_receipt_line({
        "xp_before": 855, "xp_after": 895, "xp_gained": 40,
        "level_before": 6, "level_after": 7,
        "tier_before": "OPACA", "tier_after": "OPACA",
        "next_level_xp": 215, "achievements": ["a", "b", "c"],
    })
    assert linha == ("FINAL_XP XP=855->895 GANHO=40 LEVEL=6->7 "
                     "TIER=OPACA->OPACA FALTAM=215 ACHIEVEMENTS=3")


def test_recibo_mostra_penalidade_e_motivo_de_zero_xp():
    linha = _final_receipt_line({
        "xp_before": 100, "xp_after": 100, "xp_gained": 0,
        "level_before": 2, "level_after": 2,
        "tier_before": "OPACA", "tier_after": "OPACA",
        "achievements": [], "penalties": ["falso_verde_declarado"],
        "no_xp_reason": "EVENTO_JA_REGISTRADO",
    })
    assert "GANHO=0" in linha
    assert "PENALTIES=1" in linha
    assert "NO_XP_REASON=EVENTO_JA_REGISTRADO" in linha


def test_recibo_omite_faltam_quando_campo_ausente():
    linha = _final_receipt_line({"xp_before": 1, "xp_after": 2, "xp_gained": 1})
    assert "FALTAM=" not in linha
    assert "PENALTIES=" not in linha
    assert "NO_XP_REASON=" not in linha


def test_recibo_sobrevive_a_registro_vazio():
    # RISCO_RESIDUAL declarado no PR #410: se o schema renomear os campos,
    # o recibo exibe None e NAO quebra a execucao do finish-use.
    linha = _final_receipt_line({})
    assert linha.startswith("FINAL_XP ")
    assert "XP=None->None" in linha
    assert "ACHIEVEMENTS=0" in linha


if __name__ == "__main__":
    tests = [v for k, v in sorted(globals().items()) if k.startswith("test_") and callable(v)]
    falhas = 0
    for t in tests:
        try:
            t()
            print("PASS %s" % t.__name__)
        except Exception as e:
            falhas += 1
            print("FAIL %s: %s" % (t.__name__, e))
    print("\nTOTAL=%d PASS=%d FAIL=%d" % (len(tests), len(tests) - falhas, falhas))
    sys.exit(1 if falhas else 0)
