#!/usr/bin/env python3
"""Guarda de integridade da Lupa Bayesiana canônica.

Antes de gerar qualquer TEX/relatório AutoLupa, este script:
1. Lê o SHA canônico gravado em .agents/skills/lupa-bayesiana/AUTOLUPA_CANONICAL_SHA.
2. Recalcula o SHA256 do arquivo SKILL.md local.
3. Falha (exit 2) se divergir — bloqueia geração do TEX com Lupa não canônica.
4. Opcional: --fetch baixa o blob do GitHub e compara também com o repositório.
5. Opcional: --update reescreve o guard (exige PERMITO_PIVETE=1 no ambiente).

Uso:
    python scripts/lupa/validar_autolupa_hash.py            # valida local vs guard
    python scripts/lupa/validar_autolupa_hash.py --fetch    # + valida contra GitHub
    PERMITO_PIVETE=1 python scripts/lupa/validar_autolupa_hash.py --update
"""
from __future__ import annotations

import argparse
import hashlib
import os
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SKILL = ROOT / ".agents/skills/lupa-bayesiana/SKILL.md"
GUARD = ROOT / ".agents/skills/lupa-bayesiana/AUTOLUPA_CANONICAL_SHA"
RAW_URL = "https://raw.githubusercontent.com/ServerVpss/CentralDark/main/.agents/skills/lupa-bayesiana/SKILL.md"


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def read_guard() -> str:
    if not GUARD.exists():
        print(f"[FAIL] guarda ausente: {GUARD}", file=sys.stderr)
        sys.exit(2)
    return GUARD.read_text(encoding="utf-8").strip().split()[0]


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--fetch", action="store_true", help="comparar também com blob do GitHub")
    ap.add_argument("--update", action="store_true", help="reescrever o guard (requer PERMITO_PIVETE=1)")
    args = ap.parse_args()

    if not SKILL.exists():
        print(f"[FAIL] SKILL.md ausente: {SKILL}", file=sys.stderr)
        return 2

    local = sha256_bytes(SKILL.read_bytes())

    if args.update:
        if os.environ.get("PERMITO_PIVETE") != "1":
            print("[FAIL] --update requer PERMITO_PIVETE=1", file=sys.stderr)
            return 3
        GUARD.write_text(
            f"{local}  .agents/skills/lupa-bayesiana/SKILL.md\n"
            "# Atualizado via --update com autorização PERMITO PIVETE.\n",
            encoding="utf-8",
        )
        print(f"[OK] guard atualizado -> {local}")
        return 0

    esperado = read_guard()
    if local != esperado:
        print(f"[FAIL] hash local diverge do guard\n  esperado: {esperado}\n  atual:    {local}", file=sys.stderr)
        return 2
    print(f"[OK] hash local == guard ({local[:12]}…)")

    if args.fetch:
        try:
            with urllib.request.urlopen(RAW_URL, timeout=10) as r:
                remoto = sha256_bytes(r.read())
        except Exception as exc:
            print(f"[WARN] não foi possível baixar remoto: {exc}", file=sys.stderr)
            return 0
        if remoto != esperado:
            print(f"[FAIL] guard diverge do remoto\n  guard:  {esperado}\n  remoto: {remoto}", file=sys.stderr)
            return 2
        print(f"[OK] guard == remoto ({remoto[:12]}…)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
