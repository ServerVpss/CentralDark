"""Anti-teatro: cada agente deve produzir 'lupa_trace' com >=3 passos reais
contendo campos 'passo', 'evidencia_ref' e 'inferencia'. Stubs falham.
"""
import importlib
import pytest

AGENTS = ["observador", "conversor", "orquestrador"]


@pytest.mark.parametrize("name", AGENTS)
def test_lupa_trace_real(name):
    mod = importlib.import_module(f"agents.{name}")
    out = mod.run({"missao": "turno-A"})
    trace = out.get("lupa_trace")
    assert isinstance(trace, list) and len(trace) >= 3, "lupa_trace insuficiente (teatro)"
    for passo in trace:
        for campo in ("passo", "evidencia_ref", "inferencia"):
            assert campo in passo, f"passo sem campo {campo}: {passo}"
