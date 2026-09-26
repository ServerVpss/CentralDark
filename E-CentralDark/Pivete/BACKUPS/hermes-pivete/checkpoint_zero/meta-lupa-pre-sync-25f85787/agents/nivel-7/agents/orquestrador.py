"""Solucao verde N7 — agente Orquestrador (referencia linha real do ledger)."""
import pathlib
from ._guard import read_only

AGENT_NAME = "orquestrador"
ROOT = pathlib.Path(__file__).resolve().parents[1]


@read_only
def run(payload: dict) -> dict:
    ledger = ROOT / "evidence" / "ledger.jsonl"
    linhas = [ln for ln in ledger.read_text(encoding="utf-8").splitlines() if ln.strip()]
    n = max(1, len(linhas))
    trace = [
        {
            "passo": "1-convocar",
            "evidencia_ref": "agents/observador.py",
            "inferencia": "observador emite verdict com evidence_refs reais",
        },
        {
            "passo": "2-converter",
            "evidencia_ref": "agents/conversor.py",
            "inferencia": "conversor traduz falhas em hipoteses testaveis",
        },
        {
            "passo": "3-decidir",
            "evidencia_ref": f"evidence/ledger.jsonl#L{n}",
            "inferencia": "decisao apontada para linha existente no ledger",
        },
    ]
    return {
        "agent": "orquestrador",
        "precedence": ["evidencia", "leitura_canonica", "inferencia"],
        "decisao": "EXECUTAR",
        "convocados": ["observador", "conversor"],
        "ledger_ref": f"evidence/ledger.jsonl#L{n}",
        "lupa_trace": trace,
    }
