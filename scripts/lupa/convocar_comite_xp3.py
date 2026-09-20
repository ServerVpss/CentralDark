#!/usr/bin/env python3
"""Registra a convocação do comitê independente (XP-3) da Lupa Bayesiana.

Saída: bloco markdown pronto para anexar ao relatório AutoLupa antes de
gerar o TEX. Falha se o resultado do comitê não for informado.

Uso:
    python scripts/lupa/convocar_comite_xp3.py \
        --missao "pesquisa-infra-cognitiva" \
        --membros "Codex,Hermes,DarkAI" \
        --resultado CONDICIONA \
        --nota "observabilidade pendente" >> relatorio.md
"""
from __future__ import annotations

import argparse
import datetime as dt
import sys

VALIDOS = {"APROVA", "REJEITA", "CONDICIONA"}


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--missao", required=True)
    ap.add_argument("--membros", required=True, help="lista separada por vírgula")
    ap.add_argument("--resultado", required=True, choices=sorted(VALIDOS))
    ap.add_argument("--nota", default="")
    args = ap.parse_args()

    ts = dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds")
    membros = [m.strip() for m in args.membros.split(",") if m.strip()]
    if len(membros) < 2:
        print("[FAIL] comitê precisa de pelo menos 2 membros independentes", file=sys.stderr)
        return 2

    print("## XP-3 — COMITÊ INDEPENDENTE CONVOCADO")
    print(f"- missão: {args.missao}")
    print(f"- timestamp: {ts}")
    print(f"- membros: {', '.join(membros)}")
    print(f"- COMITÊ RESULTADO: {args.resultado}")
    if args.nota:
        print(f"- nota: {args.nota}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
