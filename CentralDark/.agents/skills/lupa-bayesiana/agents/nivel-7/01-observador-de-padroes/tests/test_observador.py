"""Testes do Observador — narrativa e precedência."""
import json, os, re, pathlib

ROOT = pathlib.Path(__file__).resolve().parents[4]  # .agents/skills/lupa-bayesiana
PKG  = pathlib.Path(__file__).resolve().parents[2]  # agents/nivel-7
LEDGER = PKG / "evidence" / "ledger.jsonl"

def test_ledger_append_only_schema():
    assert LEDGER.exists()
    for line in LEDGER.read_text(encoding="utf-8").splitlines():
        if not line.strip(): continue
        obj = json.loads(line)
        for k in ("ts","kind","source","content","provenance"):
            assert k in obj, f"faltou {k} em {obj}"
        assert obj["kind"] in ("fato","resultado","inferencia","hipotese")

def test_hipotese_nao_rebaixa_fato_do_pivete():
    # Regra pura: se par (fato pivete, hipotese modelo) existe, veredito=DROP_HYPOTHESIS
    fato    = {"kind":"fato","source":"pivete","content":"executei X"}
    hipot   = {"kind":"hipotese","source":"tool:model","content":"provavelmente você quis Y"}
    from decisor import decidir_precedencia
    assert decidir_precedencia(fato, hipot) == "DROP_HYPOTHESIS"

def test_correlacionadas_contam_uma_vez():
    from decisor import contar_evidencias
    evs = [
        {"id":"a","correlates_with":[]},
        {"id":"b","correlates_with":["a"]},
        {"id":"c","correlates_with":["a"]},
    ]
    assert contar_evidencias(evs) == 1

def test_narrativa_muda_sem_retracao_e_violacao():
    from decisor import narrativa_violou
    janela = ["Passo A é seguro.", "Passo A é arriscado."]
    assert narrativa_violou(janela, retracoes=[]) is True
    assert narrativa_violou(janela, retracoes=["RETRAÇÃO: revi passo A"]) is False
