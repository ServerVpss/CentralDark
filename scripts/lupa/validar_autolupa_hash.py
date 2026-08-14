#!/usr/bin/env python3
"""Guarda de integridade da Lupa Bayesiana canônica.

Usa git-blob SHA1 (mesmo hash exibido pelo GitHub) para comparar o SKILL.md
local contra o guard e, opcionalmente, contra o blob remoto no repositório.

Uso:
    python scripts/lupa/validar_autolupa_hash.py            # local vs guard
    python scripts/lupa/validar_autolupa_hash.py --fetch    # + valida remoto
    python scripts/lupa/validar_autolupa_hash.py --update   # requer evento PR autenticado com label permito-segredo
"""
from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SKILL = ROOT / ".agents/skills/meta-lupa/SKILL.md"
GUARD = ROOT / ".agents/skills/meta-lupa/AUTOLUPA_CANONICAL_SHA"
AUTHORITY_APPROVAL = ROOT / "scripts/lupa/authority-approval.mjs"
API_URL = "https://api.github.com/repos/ServerVpss/CentralDark/contents/.agents/skills/meta-lupa/SKILL.md?ref=main"
CANONICAL_AUTHORITY_RECEIPT = "AUTHORITY_APPROVED=true AUTHORITY=SEGREDO/CHEFE SOURCE=github-label:permito-segredo"


def git_blob_sha1(path: Path) -> str:
    """Calcula o blob após os filtros Git, independente do EOL do checkout."""
    relative = path.relative_to(ROOT).as_posix()
    result = subprocess.run(
        ["git", "hash-object", "--stdin", f"--path={relative}"],
        cwd=ROOT,
        input=path.read_bytes(),
        capture_output=True,
        check=True,
    )
    return result.stdout.decode("ascii").strip()


def read_guard() -> str:
    if not GUARD.exists():
        print(f"[FAIL] guarda ausente: {GUARD}", file=sys.stderr)
        sys.exit(2)
    return GUARD.read_text(encoding="utf-8").strip().split()[0]


def canonical_authority_approved() -> tuple[bool, str]:
    """Consulta a fonte única de autoridade; não aceita env-marker legado."""
    if not AUTHORITY_APPROVAL.exists():
        return False, "authority-approval.mjs ausente"

    env = os.environ.copy()
    env.pop("GITHUB_OUTPUT", None)
    result = subprocess.run(
        ["node", str(AUTHORITY_APPROVAL)],
        cwd=ROOT,
        env=env,
        text=True,
        capture_output=True,
        check=False,
    )
    receipt = (result.stdout or "").strip()
    approved = result.returncode == 0 and CANONICAL_AUTHORITY_RECEIPT in receipt
    if approved:
        return True, receipt
    reason = receipt or (result.stderr or "").strip() or f"authority-approval exit={result.returncode}"
    return False, reason


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--fetch", action="store_true")
    ap.add_argument("--update", action="store_true")
    args = ap.parse_args()

    if not SKILL.exists():
        print(f"[FAIL] SKILL.md ausente: {SKILL}", file=sys.stderr)
        return 2

    local = git_blob_sha1(SKILL)

    if args.update:
        approved, receipt = canonical_authority_approved()
        if not approved:
            print(
                "[FAIL] --update requer autoridade canônica autenticada "
                "SEGREDO/CHEFE via github-label:permito-segredo",
                file=sys.stderr,
            )
            print(f"[AUTHORITY] {receipt}", file=sys.stderr)
            return 3
        GUARD.write_text(
            f"{local}  .agents/skills/meta-lupa/SKILL.md\n"
            "# git-blob SHA1 canônico. Atualize somente com autorização vigente de SEGREDO/CHEFE.\n",
            encoding="utf-8",
        )
        print(f"[OK] guard atualizado -> {local}")
        print(f"[AUTHORITY] {receipt}")
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
