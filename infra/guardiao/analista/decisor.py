"""
Decisor — camada de decisão dentro do Analista.

Função pura: recebe um evento + contexto e devolve (acao, score, motivo).
Sem I/O, sem efeito colateral. Quem executa a ação é o analista.py.

Score 0–100 = 100 * (wC*C + wI*I + wF*F)
Pesos default: wC=0.4, wI=0.4, wF=0.2 (editáveis em guardiao_rules.yaml → decisor:)

Faixas:
  >=70  -> "propor"   (manda pro Telegram, prefixo [D:NN])
  40-69 -> "agrupar"  (buffer interno, resumo a cada 5min)
  20-39 -> "ignorar"  (só log)
  <20   -> "elevar"   (append em docs/PENDENCIAS.md)

Bypass: severity == "critico" sempre vira "propor".
Flag DECISOR_ENABLED=false no analista.py reverte pro comportamento antigo.
"""

from dataclasses import dataclass
from typing import Any

# Pesos default por severidade (sub-score C — confiança).
PESO_SEVERIDADE = {
    "critico": 1.0,
    "erro":    0.8,
    "aviso":   0.5,
    "info":    0.3,
}

# Defaults dos pesos da fórmula. YAML pode sobrescrever.
DEFAULTS = {
    "wC": 0.4,
    "wI": 0.4,
    "wF": 0.2,
    "impacto_default": 0.5,
    "freq_janela_max": 10,   # repetições/10min que saturam F em 1.0
    "faixa_propor":  70,
    "faixa_agrupar": 40,
    "faixa_ignorar": 20,
}


@dataclass
class Decisao:
    acao: str       # "propor" | "agrupar" | "ignorar" | "elevar"
    score: int      # 0–100, arredondado
    motivo: str     # explicação curta pro log


def _clamp(v: float, lo: float = 0.0, hi: float = 1.0) -> float:
    return max(lo, min(hi, v))


def _sub_score_confianca(severity: str) -> float:
    return PESO_SEVERIDADE.get((severity or "").lower(), 0.3)


def _sub_score_impacto(event: dict, tabela_impacto: dict) -> float:
    """Procura por 'source.key' na tabela; default 0.5."""
    src = event.get("source", "")
    key = event.get("key", "")
    chave = f"{src}.{key}" if src else key
    return _clamp(float(tabela_impacto.get(chave, DEFAULTS["impacto_default"])))


def _sub_score_frequencia(repeticoes_10min: int, janela_max: int) -> float:
    if janela_max <= 0:
        return 0.0
    return _clamp(repeticoes_10min / janela_max)


def decidir(event: dict, contexto: dict, regras: dict | None = None) -> Decisao:
    """
    event:    {"severity": "...", "source": "...", "key": "...", ...}
    contexto: {"repeticoes_10min": int, "orcamento_estourado": bool, "modo_panico": bool}
    regras:   seção decisor: do guardiao_rules.yaml (opcional)
    """
    r = {**DEFAULTS, **(regras or {})}
    tabela_impacto = (regras or {}).get("impacto", {}) if regras else {}

    severity = (event.get("severity") or "").lower()

    # Bypass de segurança: crítico sempre propõe.
    if severity == "critico":
        # Em modo pânico, o analista decide silenciar — aqui só sinalizamos.
        if contexto.get("modo_panico"):
            return Decisao("propor", 100, "critico em modo pânico (analista silencia os demais)")
        return Decisao("propor", 100, "bypass de severidade critica")

    # Orçamento diário estourado: só crítico passa (já tratado acima).
    if contexto.get("orcamento_estourado"):
        return Decisao("ignorar", 0, "orcamento diario de notificacoes estourado")

    C = _sub_score_confianca(severity)
    I = _sub_score_impacto(event, tabela_impacto)
    F = _sub_score_frequencia(int(contexto.get("repeticoes_10min", 0)), int(r["freq_janela_max"]))

    bruto = 100.0 * (float(r["wC"]) * C + float(r["wI"]) * I + float(r["wF"]) * F)
    score = int(round(_clamp(bruto, 0.0, 100.0)))

    if score >= r["faixa_propor"]:
        acao = "propor"
    elif score >= r["faixa_agrupar"]:
        acao = "agrupar"
    elif score >= r["faixa_ignorar"]:
        acao = "ignorar"
    else:
        acao = "elevar"

    motivo = f"C={C:.2f} I={I:.2f} F={F:.2f} -> score={score} -> {acao}"
    return Decisao(acao, score, motivo)
