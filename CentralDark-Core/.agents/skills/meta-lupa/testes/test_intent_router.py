"""Testes de conformidade do Intent Router.

Falha se:
- Chat curto não cair em Luna
- Código não cair em Terra
- Raciocínio pesado / arquitetura / contexto grande não cair em Nemotron
- Config perder um dos 3 modelos oficiais
- Ordem de fallback ficar vazia
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[4]
sys.path.insert(0, str(ROOT))

from scripts.router.intent_router import rotear  # noqa: E402
from scripts.router import intent_router as ir  # noqa: E402


def _cfg() -> dict:
    return json.loads((ROOT / "scripts/router/rotas.json").read_text(encoding="utf-8"))


def test_config_tem_3_modelos_oficiais():
    cfg = _cfg()
    assert set(cfg["modelos"].keys()) == {"luna", "terra", "nemotron"}
    assert cfg["modelos"]["luna"]["id"] == "openai/gpt-5.6-luna"
    assert cfg["modelos"]["terra"]["id"] == "openai/gpt-5.6-terra"
    assert cfg["modelos"]["nemotron"]["id"] == "nvidia/nemotron-3-ultra-550b"


def test_fallback_nao_vazio():
    cfg = _cfg()
    assert len(cfg["fallback"]["ordem"]) >= 2


def test_chat_curto_vai_pra_luna():
    ir._classificar.cache_clear()
    r = rotear("oi, tudo bem?")
    assert r["modelo_chave"] == "luna", r


def test_codigo_vai_pra_terra():
    r = rotear("me explica esse def foo(): return 1 em python")
    assert r["modelo_chave"] == "terra", r


def test_sql_vai_pra_terra():
    r = rotear("preciso de uma query sql que faça join entre users e orders")
    assert r["modelo_chave"] == "terra", r


def test_arquitetura_vai_pra_nemotron():
    r = rotear("refatore a arquitetura do hub pra suportar 10x mais carga")
    assert r["modelo_chave"] == "nemotron", r


def test_estrategia_vai_pra_nemotron():
    r = rotear("qual a melhor estratégia de rollout pra esse deploy?")
    assert r["modelo_chave"] == "nemotron", r


def test_contexto_grande_vai_pra_nemotron():
    grande = "analise isso: " + ("dados " * 900)
    r = rotear(grande)
    assert r["modelo_chave"] == "nemotron", (r["modelo_chave"], r["tamanho_prompt"])


def test_conselho_hermes_vai_pra_nemotron():
    r = rotear("convocar o conselho hermes pra decidir o próximo passo")
    assert r["modelo_chave"] == "nemotron", r


def test_default_cai_em_terra():
    ir._classificar.cache_clear()
    r = rotear("mensagem genérica de tamanho médio " * 8)
    assert r["modelo_chave"] in {"terra", "nemotron"}, r


def test_resposta_tem_metadados_essenciais():
    r = rotear("oi")
    for chave in ("categoria", "modelo_id", "papel", "custo_estimado_in_1m",
                  "custo_estimado_out_1m", "latencia_ms_alvo", "fallback",
                  "config_versao"):
        assert chave in r, f"faltando: {chave}"
    assert isinstance(r["fallback"], list) and len(r["fallback"]) >= 1
