#!/usr/bin/env python3
"""Gate do hook Stop: resposta técnica exige dois blocos na ordem correta.

Entrada esperada do hook Claude Code: JSON em stdin contendo `transcript_path`.
O parser é tolerante a variações do JSONL e falha aberto somente quando não existe
resposta de assistente legível. Quando encontra resposta técnica fora do contrato,
retorna exit 2 e escreve a correção necessária em stderr para a IA continuar.

Uso manual:
    python scripts/lupa/validar-resposta-pivete.py --text arquivo.txt
    printf '{"transcript_path":"..."}' | python scripts/lupa/validar-resposta-pivete.py
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

TECNICO = re.compile(
    r"\b(?:c[oó]digo|fun[cç][aã]o|cli|argumento|github|pull request|\bpr\b|commit|"
    r"workflow|vps|mcp|bot|api|banco|deploy|diagn[oó]stico|governan[cç]a|teste|"
    r"automa[cç][aã]o|corre[cç][aã]o|branch|merge|sha|xp|ledger|guardrail|ci)\b",
    re.IGNORECASE,
)
TECNICO_HEADER = re.compile(r"(?:^|\n)\s*#{0,4}\s*(?:1[.)-]?\s*)?DIAGN[ÓO]STICO T[ÉE]CNICO\b", re.IGNORECASE)
PIVETE_HEADER = re.compile(r"(?:^|\n)\s*#{0,4}\s*(?:2[.)-]?\s*)?PAPO RETO DO PIVETE\b", re.IGNORECASE)


def _texto_de_objeto(obj: object) -> str:
    if isinstance(obj, str):
        return obj
    if isinstance(obj, list):
        partes = [_texto_de_objeto(item) for item in obj]
        return "\n".join(p for p in partes if p)
    if not isinstance(obj, dict):
        return ""

    partes: list[str] = []
    for chave in ("text", "content", "message", "output", "response"):
        if chave in obj:
            valor = _texto_de_objeto(obj[chave])
            if valor:
                partes.append(valor)
    return "\n".join(partes)


def ultima_resposta(transcript_path: Path) -> str:
    if not transcript_path.is_file():
        return ""
    candidatos: list[str] = []
    for linha in transcript_path.read_text(encoding="utf-8", errors="replace").splitlines():
        if not linha.strip():
            continue
        try:
            obj = json.loads(linha)
        except json.JSONDecodeError:
            continue
        if not isinstance(obj, dict):
            continue
        papel = str(obj.get("role") or obj.get("type") or obj.get("speaker") or "").lower()
        mensagem = obj.get("message")
        papel_interno = str(mensagem.get("role", "")).lower() if isinstance(mensagem, dict) else ""
        if "assistant" not in {papel, papel_interno} and papel not in {"assistant_message", "ai"}:
            continue
        texto = _texto_de_objeto(mensagem if mensagem is not None else obj)
        if texto.strip():
            candidatos.append(texto.strip())
    return candidatos[-1] if candidatos else ""


def avaliar(texto: str) -> tuple[bool, str]:
    limpo = texto.strip()
    if not limpo or len(limpo) < 120 or not TECNICO.search(limpo):
        return True, "NAO_TECNICO_OU_CURTO"

    tecnico = TECNICO_HEADER.search(limpo)
    pivete = PIVETE_HEADER.search(limpo)
    if not tecnico:
        return False, "BLOCO_DIAGNOSTICO_TECNICO_AUSENTE"
    if not pivete:
        return False, "BLOCO_PAPO_RETO_DO_PIVETE_AUSENTE"
    if tecnico.start() > pivete.start():
        return False, "ORDEM_INVALIDA_PAPO_RETO_VEIO_ANTES_DO_TECNICO"
    return True, "FORMATO_DUPLO_OK"


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--text", help="arquivo de texto para teste manual")
    args = ap.parse_args()

    if args.text:
        texto = Path(args.text).read_text(encoding="utf-8")
    else:
        try:
            entrada = json.load(sys.stdin)
        except (json.JSONDecodeError, OSError):
            return 0
        caminho = entrada.get("transcript_path") if isinstance(entrada, dict) else None
        if not caminho:
            return 0
        texto = ultima_resposta(Path(str(caminho)))

    ok, motivo = avaliar(texto)
    if ok:
        return 0

    print(
        "RESPOSTA_PIVETE_BLOQUEADA=" + motivo + "\n"
        "Corrija a resposta antes de encerrar. Use exatamente esta ordem:\n"
        "1. DIAGNÓSTICO TÉCNICO — erro exato, função/arquivo, alteração, conta e prova.\n"
        "2. PAPO RETO DO PIVETE — melhoria, perda, direção, por que não resolveu e decisão.",
        file=sys.stderr,
    )
    return 2


if __name__ == "__main__":
    raise SystemExit(main())
