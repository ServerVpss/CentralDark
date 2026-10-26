#!/usr/bin/env python3
"""Verify Telegram/CentralDark receipts against the canonical anti-papagaio template.

Usage:
  python scripts/verify_recibo_telegram_gabarito.py path/to/receipt.md
  cat receipt.md | python scripts/verify_recibo_telegram_gabarito.py -

The verifier is intentionally small and deterministic: it checks for the required
semantic anchors that make a receipt auditable instead of merely repeated text.
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

REQUIRED_ALWAYS = {
    "📣": "cabeçalho / escopo",
    "⚠️": "pendências abertas / risco / UNKNOWN",
    "🎯": "próximo passo",
}
REQUIRED_PROGRESS = {"🟢", "🔴"}
PROOF_WORDS = re.compile(r"\b(commit|blob|arquivo|file|message_id|endpoint|rota|receipt|sha|PR|pull request)\b", re.I)
PERCENT_RE = re.compile(r"(?<![A-Za-z0-9])\d{1,3}\s*%")
FORBIDDEN_FALSE_GREEN = re.compile(r"UNKNOWN\s*=\s*PASS|ACTION\s*=\s*PROOF|DOCUMENTED\s*=\s*EXECUTED", re.I)

ABSENCE_CLAIM = re.compile(r"\b(?:não\s+(?:achei|encontrei|localizei|consta|há\s+evidência)|nenhum\s+resultado|zero\s+resultados|não\s+localizado|not\s+found|no\s+results|não\s+existe\b)", re.I)
PRESENCE_CLAIM = re.compile(r"\b(?:achei|encontrei|localizei|foi\s+encontrado|foi\s+localizado|está\s+presente|(?<!não )existe\b|implementado\s+em|confirmed\s+in|found\s+in)\b", re.I)
REPOSITORY = re.compile(r"(?:\b[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+\b|\brepositório\s*:\s*\S+)", re.I)
BRANCH = re.compile(r"\b(?:branch|ramo)\s*[:=]?\s*['\"]?[A-Za-z0-9._/-]+", re.I)
FILE_PATH = re.compile(r"(?:\b(?:[A-Za-z0-9_.-]+/)+[A-Za-z0-9_.-]+\b|\b[A-Za-z0-9_.-]+\.(?:py|md|yml|yaml|json|ts|tsx|js|cjs|ps1)\b)", re.I)
LINE_OR_SNIPPET = re.compile(r"(?:\b(?:linha|line|linhas|lines)\s*[:#]?\s*\d+\b|\bL\d+(?:-L?\d+)?\b|\btrecho\s*:\s*|\bsnippet\s*:\s*)", re.I)
SHA_OR_COMMIT = re.compile(r"\b(?:sha|commit)\s*[:=]\s*(?:[0-9a-f]{7,40}|unknown|indisponível|não\s+disponível|unavailable)\b", re.I)
SEARCH_SCOPE = re.compile(r"\b(?:busca|procurei|pesquisa|escopo|consulta|search)\s*[:=]", re.I)
ZERO_RESULT = re.compile(r"\b(?:zero|nenhum|nenhuma|0)\s+(?:resultado|resultados|ocorrência|ocorrências|matches)\b|\bresultado\s*[:=]\s*0\b|\bdeu\s+zero\b", re.I)


def load_text(arg: str) -> str:
    if arg == "-":
        return sys.stdin.read()
    return Path(arg).read_text(encoding="utf-8")


def validate(text: str) -> list[str]:
    failures: list[str] = []
    for emoji, meaning in REQUIRED_ALWAYS.items():
        if emoji not in text:
            failures.append(f"missing {emoji} ({meaning})")
    if not any(emoji in text for emoji in REQUIRED_PROGRESS):
        failures.append("missing progress state: expected 🟢 or 🔴")
    if PERCENT_RE.search(text) and "📊" not in text:
        failures.append("percentage detected but missing 📊")
    if PROOF_WORDS.search(text) and "📌" not in text:
        failures.append("proof anchor detected but missing 📌")
    if FORBIDDEN_FALSE_GREEN.search(text):
        failures.append("false-green invariant violated")

    if ABSENCE_CLAIM.search(text):
        if not REPOSITORY.search(text):
            failures.append("absence claim missing repository address (owner/repo)")
        if not BRANCH.search(text):
            failures.append("absence claim missing branch address")
        if not (FILE_PATH.search(text) or SEARCH_SCOPE.search(text)):
            failures.append("absence claim missing file path or explicit search scope")
        if not ZERO_RESULT.search(text):
            failures.append("absence search missing explicit result count/outcome")

    if PRESENCE_CLAIM.search(text):
        if not REPOSITORY.search(text):
            failures.append("presence claim missing repository address (owner/repo)")
        if not BRANCH.search(text):
            failures.append("presence claim missing branch address")
        if not FILE_PATH.search(text):
            failures.append("presence claim missing file path")
        if not LINE_OR_SNIPPET.search(text):
            failures.append("presence claim missing line number or snippet reference")
        if not SHA_OR_COMMIT.search(text):
            failures.append("presence claim missing commit/SHA (or explicit SHA field)")
    return failures


def main(argv: list[str]) -> int:
    if len(argv) != 2:
        print("usage: verify_recibo_telegram_gabarito.py <receipt.md|->", file=sys.stderr)
        return 2
    failures = validate(load_text(argv[1]))
    if failures:
        print("RECIBO_INVALIDO")
        for failure in failures:
            print(f"- {failure}")
        return 1
    print("RECIBO_VALIDO")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
