#!/usr/bin/env bash
set -euo pipefail

changed="$(git diff --cached --name-only)"
[ -n "$changed" ] || exit 0

if printf '%s\n' "$changed" | grep -E '(^|/)(\.env|secrets?/|tokens?/|sessions?/|\.ssh/|.*\.(pem|key)$)' >/dev/null; then
  echo 'BLOCKED: caminho sensível no commit. Segredo nunca entra no Git.' >&2
  exit 1
fi

if printf '%s\n' "$changed" | grep -Ev '(^docs/|^AGENTS\.md$|^\.github/|^scripts/hooks/)' >/dev/null; then
  if [ ! -f .centraldark-receipt ] && [ -z "${CENTRALDARK_RECEIPT_OK:-}" ]; then
    echo 'BLOCKED: mudança material requer receipt/prova. Crie .centraldark-receipt ou exporte CENTRALDARK_RECEIPT_OK=1.' >&2
    exit 1
  fi
fi
