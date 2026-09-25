#!/usr/bin/env bash
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"


CANONICAL_SCRATCH_WORKTREE="/root/CentralDark/_worktrees/main-pinned-runtime-fastpath"
RUNTIME_ROOT="/root/CentralDark"

assert_disposable_scratch() {
  local candidate="${1:-$CANONICAL_SCRATCH_WORKTREE}"
  local resolved
  resolved="$(readlink -f "$candidate" 2>/dev/null || true)"
  [ "$resolved" = "$CANONICAL_SCRATCH_WORKTREE" ] || {
    echo "BLOCKED: destructive scratch operation fora do worktree canônico: $resolved" >&2
    return 1
  }
  [ "$resolved" != "$RUNTIME_ROOT" ] || {
    echo "BLOCKED: runtime vivo nunca é scratch." >&2
    return 1
  }
}

MD="docs/CONSCIENCIA/MICRO-DEPLOY/MAIN-PINNED-RUNTIME-FAST-PATH-FALLBACK.md"
JSON="docs/CONSCIENCIA/MICRO-DEPLOY/MAIN-PINNED-RUNTIME-FAST-PATH-FALLBACK.json"
YML="docs/CONSCIENCIA/MICRO-DEPLOY/MAIN-PINNED-RUNTIME-FAST-PATH-FALLBACK.yml"
SKILL=".agents/skills/main-pinned-runtime-fast-path/SKILL.md"
BOT="apps/bot-telegram/CENTRALDARK-MANDATORY-RULES.yml"

for f in "$MD" "$JSON" "$YML" "$SKILL" "$BOT"; do
  [ -f "$f" ] || { echo "BLOCKED: fallback surface ausente: $f" >&2; exit 1; }
done

python3 -m json.tool "$JSON" >/dev/null

if [ "${CENTRALDARK_FALLBACK_ACTIVE:-0}" = "1" ]; then
  assert_disposable_scratch "$ROOT"
  [ "${CENTRALDARK_FALLBACK_LOCK_HELD:-0}" = "1" ] || {
    echo "BLOCKED: fallback ativo sem LOCK declarado." >&2
    exit 1
  }
fi

grep -q 'MAIN-PINNED RUNTIME FAST-PATH' "$MD"
grep -q 'main-pinned-runtime-fast-path' "$SKILL"
grep -q 'MAIN_PINNED_RUNTIME_FAST_PATH' "$BOT"

if git diff --cached --name-only | grep -E '^apps/modulos/|^scripts/|^\.github/' >/dev/null 2>&1; then
  if [ -z "${CENTRALDARK_RECEIPT_OK:-}" ] && [ ! -f .centraldark-receipt ]; then
    echo "BLOCKED: mudança material exige receipt/prova antes do push." >&2
    exit 1
  fi
fi

echo "MAIN_PINNED_FALLBACK_CONTRACT=PASS"
