#!/usr/bin/env python3
"""MetaLupa Bayesiana - calculadora determinística.

Substitui cálculo manual (SKILL.md Fase 5). Todos os cálculos são
reprodutíveis e sem dependências externas.

Uso:
  python lupa_bayesiana.py --prior 0.3 --lr 5 2
  python lupa_bayesiana.py --entropia 0.5
  python lupa_bayesiana.py --voi 10 2 1
"""
import argparse
import math


def odds(p: float) -> float:
    if p <= 0 or p >= 1:
        raise ValueError("prior deve estar estritamente em (0,1); 0 e 1 tornam crenca dogmatica")
    return p / (1 - p)


def prob(o: float) -> float:
    return o / (1 + o)


def posterior(prior: float, lrs: list[float]) -> float:
    o = odds(prior)
    for lr in lrs:
        o *= lr
    return prob(o)


def entropia(p: float) -> float:
    if p <= 0 or p >= 1:
        return 0.0
    return -p * math.log2(p) - (1 - p) * math.log2(1 - p)


def voi(perda_antes: float, perda_depois: float, custo: float) -> float:
    return perda_antes - perda_depois - custo


def main() -> None:
    ap = argparse.ArgumentParser(description="MetaLupa Bayesiana - calculo deterministico")
    ap.add_argument("--prior", type=float, help="probabilidade prior em (0,1)")
    ap.add_argument("--lr", type=float, nargs="*", default=[], help="likelihood ratios (ou ordinais convertidos)")
    ap.add_argument("--entropia", type=float, help="calcula H(p) para p dado")
    ap.add_argument("--voi", nargs=3, type=float, metavar=("ANTES", "DEPOIS", "CUSTO"),
                    help="valor esperado da informacao")
    args = ap.parse_args()

    if args.entropia is not None:
        print(f"H({args.entropia:.4f}) = {entropia(args.entropia):.4f} bits")

    if args.prior is not None:
        post = posterior(args.prior, args.lr)
        h0 = entropia(args.prior)
        h1 = entropia(post)
        print(f"prior={args.prior} LR={args.lr} -> posterior={post:.4f}")
        print(f"entropia antes={h0:.4f} depois={h1:.4f} reducao={h0 - h1:.4f}")

    if args.voi is not None:
        a, d, c = args.voi
        print(f"VOI = {voi(a, d, c):.4f}")


if __name__ == "__main__":
    main()
