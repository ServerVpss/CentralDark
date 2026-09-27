#!/usr/bin/env python3
"""Guarda de integridade da Meta Lupa canônica e do formato de resposta bloqueado.

Valida:
- `.agents/skills/meta-lupa/SKILL.md` contra `AUTOLUPA_CANONICAL_SHA`;
- o formato de resposta do KIT METAGRILL-METALUPA contra `FORMATO_CANONICAL_SHA`;
- o pin imutável do formato neste gate, impedindo troca silenciosa do arquivo + guard.

Uso:
    python scripts/lupa/validar_autolupa_hash.py
    python scripts/lupa/validar_autolupa_hash.py --fetch
    python scripts/lupa/validar_autolupa_hash.py --update

`--update` continua atualizando somente a identidade da Meta Lupa e exige
autoridade canônica autenticada de SEGREDO/CHEFE. O formato de resposta não
possui auto-update: mudança exige reconciliação explícita do cadeado.
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

FORMAT_REPO_PATH = ".agents/skills/meta-lupa/KITS/METAGRILL-METALUPA/FORMATO-RESPOSTA-CANONICO.md"
FORMAT_PATH = ROOT / FORMAT_REPO_PATH
FORMAT_GUARD = ROOT / ".agents/skills/meta-lupa/KITS/METAGRILL-METALUPA/FORMATO_CANONICAL_SHA"
FORMAT_API_URL = f"https://api.github.com/repos/ServerVpss/CentralDark/contents/{FORMAT_REPO_PATH}?ref=main"
FORMAT_PIN = "b3e31bdc271b53272ad42181b8246aa85f880868"

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
    """Renderiza o guard da identidade principal da Meta Lupa."""
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


def read_guard_path(path: Path, label: str) -> str:
    if not path.exists():
        print(f"[FAIL] {label}_AUSENTE={path}", file=sys.stderr)
        sys.exit(2)
    tokens = path.read_text(encoding="utf-8").strip().split()
    if not tokens:
        print(f"[FAIL] {label}_VAZIO={path}", file=sys.stderr)
        sys.exit(2)
    return tokens[0]


def read_guard() -> str:
    return read_guard_path(GUARD, "GUARDA")


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


def fetch_remote_blob(url: str) -> str:
    req = urllib.request.Request(url, headers={"Accept": "application/vnd.github+json"})
    with urllib.request.urlopen(req, timeout=10) as response:
        return json.loads(response.read())["sha"]


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--fetch", action="store_true")
    ap.add_argument("--update", action="store_true")
    args = ap.parse_args()

    if not SKILL.exists():
        print(f"[FAIL] SKILL_AUSENTE={SKILL}", file=sys.stderr)
        return 2
    if not FORMAT_PATH.exists():
        print(f"[FAIL] FORMATO_AUSENTE={FORMAT_PATH}", file=sys.stderr)
        return 2

    local = git_blob_sha1(SKILL)
    esperado = read_guard()
    format_local = git_blob_sha1(FORMAT_PATH)
    format_esperado = read_guard_path(FORMAT_GUARD, "FORMATO_GUARDA")

    print_identity("CAMINHO_PROTEGIDO", SKILL_REPO_PATH)
    print_identity("HASH_ESPERADO", esperado)
    print_identity("HASH_LOCAL_ATUAL", local)
    print_identity("FORMATO_PROTEGIDO", FORMAT_REPO_PATH)
    print_identity("FORMATO_HASH_ESPERADO", format_esperado)
    print_identity("FORMATO_HASH_LOCAL_ATUAL", format_local)
    print_identity("FORMATO_PIN_GATE", FORMAT_PIN)

    if format_esperado != FORMAT_PIN:
        print("[FAIL] CADEADO_FORMATO=ALTERADO", file=sys.stderr)
        print("ACAO=Reconciliar explicitamente com SEGREDO/CHEFE; troca silenciosa é proibida.", file=sys.stderr)
        return 2

    if format_local != format_esperado:
        print("[FAIL] FORMATO_RESPOSTA=DRIFT", file=sys.stderr)
        print("ACAO=Restaurar o formato canônico ou promover mudança explicitamente autorizada.", file=sys.stderr)
        return 2

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

        GUARD.write_text(render_guard(local), encoding="utf-8")
        print("[OK] GUARD_ATUALIZADO=SIM")
        print_identity("NOVO_HASH_ESPERADO", local)
        print("[OK] FORMATO_RESPOSTA=LOCKED")
        print("SIGNIFICADO=O guard principal foi atualizado; o formato permaneceu byte-a-byte bloqueado.")
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
    print("[OK] FORMATO_RESPOSTA=LOCKED")
    print("SIGNIFICADO=SKILL.md e formato de resposta correspondem aos cadeados canônicos.")

    if args.fetch:
        try:
            remoto = fetch_remote_blob(API_URL)
            formato_remoto = fetch_remote_blob(FORMAT_API_URL)
        except Exception as exc:
            print(f"[WARN] REMOTO_NAO_VERIFICADO={exc}", file=sys.stderr)
            print("REMOTO_STATUS=UNKNOWN")
            return 0

        print_identity("HASH_MAIN_REMOTA", remoto)
        print_identity("FORMATO_HASH_MAIN_REMOTA", formato_remoto)
        if remoto != esperado:
            print("[FAIL] IDENTIDADE_REMOTA=FAIL", file=sys.stderr)
            return 2
        if formato_remoto != FORMAT_PIN:
            print("[FAIL] FORMATO_REMOTO=DRIFT", file=sys.stderr)
            return 2

        print("[OK] IDENTIDADE_REMOTA=PASS")
        print("[OK] FORMATO_REMOTO=LOCKED")

    return 0


if __name__ == "__main__":
    sys.exit(main())
