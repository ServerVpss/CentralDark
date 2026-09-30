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

def load_text(arg: str) -> str:
    if arg == "-":
        return sys.stdin.read()
    return Path(arg).read_text(encoding="utf-8")

def main(argv: list[str]) -> int:
    if len(argv) != 2:
        print("usage: verify_recibo_telegram_gabarito.py <receipt.md|->", file=sys.stderr)
        return 2

    text = load_text(argv[1])
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

    if failures:
        print("RECIBO_INVALIDO")
        for failure in failures:
            print(f"- {failure}")
        return 1

    print("RECIBO_VALIDO")
    return 0

if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
