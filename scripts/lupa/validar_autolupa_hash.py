#!/usr/bin/env python3
"""Guarda de integridade da Lupa Bayesiana canônica.

Usa git-blob SHA1 (mesmo hash exibido pelo GitHub) para comparar o SKILL.md
local contra o guard e, opcionalmente, contra o blob remoto no repositório.

Uso:
    python scripts/lupa/validar_autolupa_hash.py            # local vs guard
    python scripts/lupa/validar_autolupa_hash.py --fetch    # + valida remoto
    PERMITO_PIVETE=1 python scripts/lupa/validar_autolupa_hash.py --update
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SKILL = ROOT / ".agents/skills/lupa-bayesiana/SKILL.md"
GUARD = ROOT / ".agents/skills/lupa-bayesiana/AUTOLUPA_CANONICAL_SHA"
API_URL = "https://api.github.com/repos/ServerVpss/CentralDark/contents/.agents/skills/lupa-bayesiana/SKILL.md?ref=main"


def git_blob_sha1(data: bytes) -> str:
    header = f"blob {len(data)}\0".encode()
    return hashlib.sha1(header + data).hexdigest()


def read_guard() -> str:
    if not GUARD.exists():
        print(f"[FAIL] guarda ausente: {GUARD}", file=sys.stderr)
        sys.exit(2)
    return GUARD.read_text(encoding="utf-8").strip().split()[0]


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--fetch", action="store_true")
    ap.add_argument("--update", action="store_true")
    args = ap.parse_args()

    if not SKILL.exists():
        print(f"[FAIL] SKILL.md ausente: {SKILL}", file=sys.stderr)
        return 2

    local = git_blob_sha1(SKILL.read_bytes())

    if args.update:
        if os.environ.get("PERMITO_PIVETE") != "1":
            print("[FAIL] --update requer PERMITO_PIVETE=1", file=sys.stderr)
            return 3
        GUARD.write_text(
            f"{local}  .agents/skills/lupa-bayesiana/SKILL.md\n"
            "# git-blob SHA1 canônico. Atualize somente com PERMITO PIVETE.\n",
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
            req = urllib.request.Request(API_URL, headers={"Accept": "application/vnd.github+json"})
            with urllib.request.urlopen(req, timeout=10) as r:
                remoto = json.loads(r.read())["sha"]
        except Exception as exc:
            print(f"[WARN] não foi possível consultar remoto: {exc}", file=sys.stderr)
            return 0
        if remoto != esperado:
            print(f"[FAIL] guard diverge do remoto\n  guard:  {esperado}\n  remoto: {remoto}", file=sys.stderr)
            return 2
        print(f"[OK] guard == remoto ({remoto[:12]}…)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
