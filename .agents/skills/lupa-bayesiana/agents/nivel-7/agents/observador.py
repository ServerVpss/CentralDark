"""Stub baseline VERMELHA — Nivel 7 agent 'observador'.
Este stub NAO implementa comportamento. Existe apenas para que os testes
comportamentais falhem por motivo esperado (NotImplementedError) na baseline.
A solucao verde entra no Turno B, sem alterar contratos nem testes.
"""

AGENT_NAME = "observador"


def run(payload: dict) -> dict:
    raise NotImplementedError(
        "baseline-red: agente 'observador' ainda nao implementado (Turno A)."
    )
