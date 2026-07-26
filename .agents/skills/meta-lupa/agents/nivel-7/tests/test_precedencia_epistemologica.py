"""Cada agente deve declarar precedencia epistemologica explicita
(evidencia > leitura canonica > inferencia). Baseline VERMELHA falha
porque stubs nao expoem 'precedence'.
"""
import importlib
import pytest

AGENTS = ["observador", "conversor", "orquestrador"]
ORDEM_ESPERADA = ["evidencia", "leitura_canonica", "inferencia"]


@pytest.mark.parametrize("name", AGENTS)
def test_precedencia_explicita(name):
    mod = importlib.import_module(f"agents.{name}")
    out = mod.run({"missao": "turno-A"})
    assert isinstance(out, dict), "run() deve retornar dict"
    assert out.get("precedence") == ORDEM_ESPERADA, (
        f"precedence do agente {name} deve ser {ORDEM_ESPERADA}"
    )
