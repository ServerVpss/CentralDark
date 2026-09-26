#!/usr/bin/env python3
"""Guarda de integridade da Meta Lupa canônica.

Compara o git-blob SHA1 do arquivo `.agents/skills/meta-lupa/SKILL.md` com o
hash esperado registrado em `.agents/skills/meta-lupa/AUTOLUPA_CANONICAL_SHA`.

Como ler o guard:
    linha 1 -> <git-blob SHA1 esperado><dois espaços><caminho protegido>
    linhas # -> explicação humana do que o hash prova e do que NÃO prova

Uso:
    python scripts/lupa/validar_autolupa_hash.py
        Valida SKILL.md local contra o guard.

    python scripts/lupa/validar_autolupa_hash.py --fetch
        Também compara o guard com o blob da `main` remota.

    python scripts/lupa/validar_autolupa_hash.py --update
        Atualiza o guard somente quando `authority-approval.mjs` devolver
        receipt canônico autenticado de SEGREDO/CHEFE.
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
SKILL_REPO_PATH = ".agents/skills/meta-lupa/SKILL.md"
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


def render_guard(expected_sha: str) -> str:
    """Renderiza o guard sem perder a explicação humana da primeira linha."""
    return (
        f"{expected_sha}  {SKILL_REPO_PATH}\n"
        "# O_QUE_E=Arquivo de identidade da Meta Lupa canônica. A primeira linha prende o conteúdo versionado do SKILL.md ao git-blob SHA1 esperado.\n"
        "# COMO_LER=campo_1: git-blob SHA1 esperado | campo_2: caminho exato protegido.\n"
        f"# CAMINHO_PROTEGIDO={SKILL_REPO_PATH}\n"
        "# REGRA_BYTE_A_BYTE=Se o conteúdo versionado do SKILL.md mudar, o git-blob SHA1 muda; divergência entre hash atual e esperado é FAIL, nunca PASS.\n"
        "# COMO_VALIDAR=python scripts/lupa/validar_autolupa_hash.py\n"
        "# SE_DIVERGIR=Não use a skill como identidade canônica até reconciliar o conteúdo, provar a mudança e atualizar este guard pelo fluxo autorizado.\n"
        "# AUTORIDADE=SEGREDO/CHEFE. O guard não concede permissão; apenas registra a identidade aprovada no escopo aplicável.\n"
        "# NAO_PROVA=merge, deploy, produção, runtime, autorização operacional ou sucesso ponta a ponta.\n"
    )


def read_guard() -> str:
    if not GUARD.exists():
        print(f"[FAIL] GUARDA_AUSENTE={GUARD}", file=sys.stderr)
        sys.exit(2)

    tokens = GUARD.read_text(encoding="utf-8").strip().split()
    if not tokens:
        print(f"[FAIL] GUARDA_VAZIA={GUARD}", file=sys.stderr)
        sys.exit(2)
    return tokens[0]


def print_identity(label: str, value: str) -> None:
    print(f"{label}={value}")


def canonical_authority_approved() -> tuple[bool, str]:
    """Consulta a fonte única de autoridade; não aceita marcador local como substituto."""
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
        print(f"[FAIL] SKILL_AUSENTE={SKILL}", file=sys.stderr)
        return 2

    local = git_blob_sha1(SKILL)
    esperado = read_guard()

    print_identity("CAMINHO_PROTEGIDO", SKILL_REPO_PATH)
    print_identity("HASH_ESPERADO", esperado)
    print_identity("HASH_LOCAL_ATUAL", local)

    if args.update:
        # Autoridade vem ANTES da mutação. Falha de aprovação deixa o guard byte a byte intacto.
        approved, receipt = canonical_authority_approved()
        if not approved:
            print(
                "[FAIL] --update requer autoridade canônica autenticada "
                "SEGREDO/CHEFE via github-label:permito-segredo",
                file=sys.stderr,
            )
            print(f"[AUTHORITY] {receipt}", file=sys.stderr)
            return 3

        GUARD.write_text(render_guard(local), encoding="utf-8")
        print("[OK] GUARD_ATUALIZADO=SIM")
        print_identity("NOVO_HASH_ESPERADO", local)
        print("SIGNIFICADO=O guard agora identifica exatamente o conteúdo versionado atual do SKILL.md.")
        print("NAO_PROVA=merge|deploy|producao|runtime|autorizacao_operacional")
        print(f"[AUTHORITY] {receipt}")
        return 0

    if local != esperado:
        print("[FAIL] IDENTIDADE_LOCAL=FAIL", file=sys.stderr)
        print(
            "SIGNIFICADO=O conteúdo versionado atual do SKILL.md não é o mesmo conteúdo "
            "identificado pelo guard canônico.",
            file=sys.stderr,
        )
        print("ACAO=Reconciliar a mudança antes de usar esta identidade como canônica.", file=sys.stderr)
        return 2

    print("[OK] IDENTIDADE_LOCAL=PASS")
    print("SIGNIFICADO=O SKILL.md local corresponde ao git-blob SHA1 registrado no guard.")

    if args.fetch:
        try:
            req = urllib.request.Request(API_URL, headers={"Accept": "application/vnd.github+json"})
            with urllib.request.urlopen(req, timeout=10) as r:
                remoto = json.loads(r.read())["sha"]
        except Exception as exc:
            print(f"[WARN] REMOTO_NAO_VERIFICADO={exc}", file=sys.stderr)
            print("REMOTO_STATUS=UNKNOWN")
            return 0

        print_identity("HASH_MAIN_REMOTA", remoto)
        if remoto != esperado:
            print("[FAIL] IDENTIDADE_REMOTA=FAIL", file=sys.stderr)
            print(
                "SIGNIFICADO=O guard local aponta para um blob diferente do SKILL.md da main remota.",
                file=sys.stderr,
            )
            return 2

        print("[OK] IDENTIDADE_REMOTA=PASS")
        print("SIGNIFICADO=guard local e SKILL.md da main remota apontam para o mesmo git-blob SHA1.")

    return 0


if __name__ == "__main__":
    sys.exit(main())
