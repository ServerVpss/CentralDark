#!/usr/bin/env python3
"""Scanner fail-closed para diffs de pull request.

Distingue referência executável a ambiente, como ``process.env.BOT_TOKEN``, de
credencial literal. Não imprime valores encontrados.
"""
from __future__ import annotations

import argparse
import re
from pathlib import Path

SENSITIVE_PATH = re.compile(
    r"(^|/)(\.env(?:\.|$)|secrets?(?:/|$)|tokens?(?:/|$)|sessions?(?:/|$)|\.ssh(?:/|$)|[^/]+\.(?:pem|key)$)",
    re.I,
)
OPERATIONAL_PATH = re.compile(
    r"(^|/)(\.github/workflows|scripts/(?:vps|webhook)|Dockerfile|docker-compose|Caddyfile|wuzapi|whatsapp|crm|migrations|prisma/migrations)(/|$)",
    re.I,
)
SPECIFIC_SECRET_PATTERNS = (
    re.compile(r"\bBea" + r"rer\s+[A-Za-z0-9._~+/=-]{12,}", re.I),
    re.compile(r"\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{5,}\.[A-Za-z0-9_-]{5,}\b"),
    re.compile(r"-----BEGIN " + r"[A-Z0-9 ]*PRIVATE KEY-----", re.I),
    re.compile(r"\bgh" + r"[pousr]_[A-Za-z0-9_]{20,}\b"),
    re.compile(r"\bsk" + r"-[A-Za-z0-9_-]{16,}\b"),
    re.compile(r"\b\d{8,12}:[A-Za-z0-9_-]{30,}\b"),
)
SECRET_NAME = r"(?:api[_-]?key|secret|password|passwd|token)"
QUOTED_ASSIGNMENT = re.compile(
    rf"(?i){SECRET_NAME}\s*[:=]\s*(['\"])([A-Za-z0-9._~+/=-]{{16,}})\1"
)
BARE_ASSIGNMENT = re.compile(
    rf"(?i){SECRET_NAME}\s*[:=]\s*([A-Za-z0-9._~+/=-]{{16,}})"
)
SAFE_REFERENCE = re.compile(
    r"(?i)^(?:process\.env(?:\.|$)|os\.environ(?:\.|$)|env\.|secrets\.|github\.|vars\.)"
)
PLACEHOLDER = re.compile(
    r"(?i)^(?:example|changeme|replace_me|redacted|placeholder|dummy|test|x+)$"
)


def added_text(patch: str) -> str:
    return "\n".join(
        line[1:]
        for line in patch.splitlines()
        if line.startswith("+") and not line.startswith("+++")
    )


def _is_placeholder(value: str) -> bool:
    normalized = re.sub(r"[^A-Za-z0-9]+", "", value)
    return bool(PLACEHOLDER.fullmatch(normalized))


def has_literal_secret(text: str) -> bool:
    if any(pattern.search(text) for pattern in SPECIFIC_SECRET_PATTERNS):
        return True

    for match in QUOTED_ASSIGNMENT.finditer(text):
        if not _is_placeholder(match.group(2)):
            return True

    for match in BARE_ASSIGNMENT.finditer(text):
        value = match.group(1)
        if SAFE_REFERENCE.match(value) or _is_placeholder(value):
            continue
        return True

    return False


def scan(names: list[str], patch: str) -> dict[str, str]:
    suspect = any(SENSITIVE_PATH.search(name) for name in names)
    if not suspect:
        suspect = has_literal_secret(added_text(patch))

    return {
        "secret_suspect": str(suspect).lower(),
        "touched_sensitive": str(any(OPERATIONAL_PATH.search(name) for name in names)).lower(),
        "touched_bot": str(any(name.startswith("CentralDark/apps/bot-server/") for name in names)).lower(),
        "changed_count": str(len(names)),
    }


def _as_added_patch(path: Path) -> str:
    return "\n".join(f"+{line}" for line in path.read_text(encoding="utf-8").splitlines())


def self_test() -> None:
    safe_patch = "\n".join((
        "+const BOT_TOKEN = process.env.BOT_TOKEN_CLAUDE || '';",
        "+let token = process.env[agente.tokenEnv] || process.env.BOT_TOKEN_AUTONOMIA || '';",
        "+token: ${{ secrets.GITHUB_TOKEN }}",
    ))
    assert scan([], safe_patch)["secret_suspect"] == "false"

    telegram = "123456789:" + ("A" * 35)
    github_token = "gh" + "p_" + ("a" * 30)
    password_value = "0123456789" + ("a" * 16)
    assert scan([], "+const BOT_TOKEN = '" + telegram + "';")["secret_suspect"] == "true"
    assert scan([], "+token = " + github_token)["secret_suspect"] == "true"
    assert scan([], "+password = '" + password_value + "'")["secret_suspect"] == "true"
    assert scan(["secrets/agent.env"], "+SAFE=value")["secret_suspect"] == "true"

    repo_root = Path(__file__).resolve().parents[2]
    assert scan(["scripts/lupa/pr_secret_scan.py"], _as_added_patch(Path(__file__)))["secret_suspect"] == "false"
    workflow = repo_root / ".github/workflows/pr-auto-review.yml"
    assert scan([".github/workflows/pr-auto-review.yml"], _as_added_patch(workflow))["secret_suspect"] == "false"
    print("PR_SECRET_SCAN_SELF_TEST_OK cases=7")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--changed-file", type=Path)
    parser.add_argument("--patch-file", type=Path)
    parser.add_argument("--github-output", type=Path)
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()

    if args.self_test:
        self_test()
        return 0

    if not args.changed_file or not args.patch_file or not args.github_output:
        parser.error("--changed-file, --patch-file e --github-output são obrigatórios")

    names = [
        part.decode("utf-8", "replace")
        for part in args.changed_file.read_bytes().split(b"\0")
        if part
    ]
    result = scan(names, args.patch_file.read_text(encoding="utf-8", errors="replace"))
    with args.github_output.open("a", encoding="utf-8") as output:
        for key, value in result.items():
            output.write(f"{key}={value}\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
