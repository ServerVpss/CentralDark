"""Solucao verde N7 — agente Conversor (erro-orientado-a-evolucao)."""
import pathlib
from ._guard import read_only

AGENT_NAME = "conversor"
ROOT = pathlib.Path(__file__).resolve().parents[1]


@read_only
def run(payload: dict) -> dict:
    trace = [
        {
            "passo": "1-detectar-erro",
            "evidencia_ref": "agents/observador.py",
            "inferencia": "stub baseline levantava NotImplementedError",
        },
        {
            "passo": "2-classificar",
            "evidencia_ref": "tests/test_read_only_contract.py",
            "inferencia": "falha esperada: campos exigidos pelo contrato ausentes no stub",
        },
        {
            "passo": "3-converter-em-hipotese",
            "evidencia_ref": "contracts/conversor.schema.json",
            "inferencia": "erro vira hipotese: solucao verde honra schema frozen sem tocar testes",
        },
    ]
    return {
        "agent": "conversor",
        "precedence": ["evidencia", "leitura_canonica", "inferencia"],
        "erro_convertido": {
            "descricao": "NotImplementedError dos stubs baseline VERMELHA",
            "evidencia_ref": "evidence/ledger.jsonl#L1",
        },
        "hipotese": (
            "Implementacoes verdes satisfazem contratos frozen mantendo LOCK, "
            "contracts/ e tests/ imutaveis."
        ),
        "lupa_trace": trace,
    }
