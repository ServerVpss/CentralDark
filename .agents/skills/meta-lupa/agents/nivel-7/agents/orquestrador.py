"""Solucao verde N7 — Orquestrador com convocacao causal real."""
import pathlib
from ._guard import read_only
from . import observador, conversor

AGENT_NAME = "orquestrador"
ROOT = pathlib.Path(__file__).resolve().parents[1]


def _decidir(observacao: dict, conversao: dict) -> str:
    verdict = observacao.get("verdict")
    hipotese = conversao.get("hipotese")

    if not hipotese:
        return "PARAR"
    if verdict == "APROVAR":
        return "EXECUTAR"
    if verdict == "CONDICIONAR":
        return "REFINAR"
    return "PARAR"


@read_only
def run(payload: dict) -> dict:
    ledger = ROOT / "evidence" / "ledger.jsonl"
    linhas = [ln for ln in ledger.read_text(encoding="utf-8").splitlines() if ln.strip()]
    n = max(1, len(linhas))

    observacao = observador.run(payload)
    conversao = conversor.run({**(payload or {}), "observacao": observacao})
    decisao = _decidir(observacao, conversao)

    trace = [
        {
            "passo": "1-convocar",
            "evidencia_ref": observacao["evidence_refs"][0],
            "inferencia": f"observador executado com verdict={observacao['verdict']}",
        },
        {
            "passo": "2-converter",
            "evidencia_ref": conversao["erro_convertido"]["evidencia_ref"],
            "inferencia": "conversor executado e retornou hipotese testavel",
        },
        {
            "passo": "3-decidir",
            "evidencia_ref": f"evidence/ledger.jsonl#L{n}",
            "inferencia": f"decisao causal derivada das respostas: {decisao}",
        },
    ]
    return {
        "agent": "orquestrador",
        "precedence": ["evidencia", "leitura_canonica", "inferencia"],
        "decisao": decisao,
        "convocados": [observacao["agent"], conversao["agent"]],
        "ledger_ref": f"evidence/ledger.jsonl#L{n}",
        "lupa_trace": trace,
    }
