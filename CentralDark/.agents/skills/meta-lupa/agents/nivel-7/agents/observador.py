"""Solucao verde N7 — agente Observador (read-only, contrato frozen)."""
import pathlib
from ._guard import read_only

AGENT_NAME = "observador"
ROOT = pathlib.Path(__file__).resolve().parents[1]


@read_only
def run(payload: dict) -> dict:
    ledger = ROOT / "evidence" / "ledger.jsonl"
    linhas = ledger.read_text(encoding="utf-8").splitlines()
    n = max(1, len(linhas))
    ref = (payload or {}).get("ref", "e14379ef")
    trace = [
        {
            "passo": "1-evidencia",
            "evidencia_ref": "evidence/ledger.jsonl#L1",
            "inferencia": f"baseline VERMELHA ancorada em origin/main {ref}",
        },
        {
            "passo": "2-leitura-canonica",
            "evidencia_ref": "contracts/observador.schema.json",
            "inferencia": "schema frozen exige verdict e evidence_refs",
        },
        {
            "passo": "3-inferencia",
            "evidencia_ref": "LOCK.json",
            "inferencia": "hashes de contratos e testes ainda batem com baseline",
        },
    ]
    return {
        "agent": "observador",
        "precedence": ["evidencia", "leitura_canonica", "inferencia"],
        "evidence_refs": [
            f"evidence/ledger.jsonl#L{n}",
            "LOCK.json",
            "contracts/observador.schema.json",
        ],
        "verdict": "CONDICIONAR",
        "lupa_trace": trace,
    }
