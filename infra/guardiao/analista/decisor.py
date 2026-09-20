"""
Decisor — camada de decisão dentro do Analista.

Função pura: recebe um evento + contexto e devolve (acao, score, motivo).
Sem I/O, sem efeito colateral. Quem executa a ação é o analista.py.

Score 0–100 = 100 * (wC*C + wI*I + wF*F)
Pesos default: wC=0.3, wI=0.7, wF=0.0 (editáveis em guardiao_rules.yaml → decisor:)
O sub-score de impacto (I) usa a confiança do classificador (payload.confianca),
que é o melhor sinal de qualidade da proposta. wF=0 porque, para propostas da
Consciência, repetição é ruído (já tratado pelo cache do guardiao.py), não sinal.

Faixas (calibradas com os dados reais da fila):
  >=55  -> "propor"   (manda pro Telegram, prefixo [D:NN])
  40-54 -> "agrupar"  (não envia agora; aparece em resumo)
  25-39 -> "ignorar"  (só log)
  <25   -> "elevar"   (caso raro de baixíssimo score — trata como atenção humana)

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
    "wC": 0.3,
    "wI": 0.7,
    "wF": 0.0,
    "impacto_default": 0.5,
    "freq_janela_max": 10,   # repetições/10min que saturam F em 1.0
    "faixa_propor":  55,
    "faixa_agrupar": 40,
    "faixa_ignorar": 25,
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
    """Impacto = confiança do classificador (payload.confianca), quando houver;
    senão procura 'source.key' na tabela; senão default 0.5."""
    conf = (event.get("payload") or {}).get("confianca")
    if isinstance(conf, (int, float)):
        return _clamp(float(conf))
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
