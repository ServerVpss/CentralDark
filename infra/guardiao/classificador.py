"""Classifica um arquivo .md em qual pasta de CONSCIENCIA ele deveria estar."""
import logging
import re
from pathlib import Path

log = logging.getLogger("guardiao.classificador")

# Confiança mínima para gerar uma proposta (abaixo disso, descarta em silêncio).
# 0.6 = exige mais que um único regex fraco (reduz falso-positivo). Calibrado
# com os dados reais da fila: corta as propostas de baixa confiança na geração.
THRESHOLD_CONFIANCA = 0.6
# Pontuação máxima considerada para normalização da confiança
PONTOS_MAX = 5.0


def classificar(caminho_relativo: str, regras: dict) -> dict | None:
    """
    Retorna {pasta_correta, confianca, motivo} ou None se não conseguir decidir.

    Pontuação:
      - regex no nome do arquivo: peso 2
      - palavra-chave no nome:     peso 1
    Confiança = min(pontos / PONTOS_MAX, 1.0). Abaixo de THRESHOLD_CONFIANCA, descarta.
    Se o arquivo já está na pasta correta, retorna None.
    """
    nome = Path(caminho_relativo).name.lower()
    pasta_atual = str(Path(caminho_relativo).parent).replace("\\", "/")
    scores: dict[str, tuple[float, list[str]]] = {}

    for pasta, cfg in regras.get("pastas", {}).items():
        pontos = 0.0
        motivos: list[str] = []
        for padrao in cfg.get("nome_regex", []) or []:
            if re.search(padrao, nome, re.IGNORECASE):
                pontos += 2.0
                motivos.append(f"nome bate /{padrao}/")
        for palavra in cfg.get("palavras_chave", []) or []:
            if palavra.lower() in nome:
                pontos += 1.0
                motivos.append(f"contém '{palavra}'")
        if pontos > 0:
            scores[pasta] = (pontos, motivos)

    if not scores:
        return None

    pasta_melhor, (pontos, motivos) = max(scores.items(), key=lambda x: x[1][0])

    confianca = min(pontos / PONTOS_MAX, 1.0)
    if confianca < THRESHOLD_CONFIANCA:
        log.debug(
            "Confiança baixa para %s (%.2f < %.2f) — descartando",
            caminho_relativo, confianca, THRESHOLD_CONFIANCA,
        )
        return None

    if pasta_melhor == pasta_atual:
        return None

    return {
        "pasta_correta": pasta_melhor,
        "confianca": confianca,
        "motivo": "; ".join(motivos[:3]),
    }
