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
LIVE_MD="docs/CONSCIENCIA/MICRO-DEPLOY/CENTRALDARK-LIVE-EDITING-FABRIC.md"
LIVE_JSON="docs/CONSCIENCIA/MICRO-DEPLOY/CENTRALDARK-LIVE-EDITING-FABRIC.json"
LIVE_YML="docs/CONSCIENCIA/MICRO-DEPLOY/CENTRALDARK-LIVE-EDITING-FABRIC.yml"
LIVE_SKILL=".agents/skills/centraldark-live-editing-fabric/SKILL.md"
BOT="apps/bot-telegram/CENTRALDARK-MANDATORY-RULES.yml"
BINDING="docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/MICRO-DEPLOY-CONTINUO-BINDING.yml"

for f in "$MD" "$JSON" "$YML" "$SKILL" "$LIVE_MD" "$LIVE_JSON" "$LIVE_YML" "$LIVE_SKILL" "$BOT" "$BINDING"; do
  [ -f "$f" ] || { echo "BLOCKED: superfície canônica ausente: $f" >&2; exit 1; }
done

python3 -m json.tool "$JSON" >/dev/null
python3 -m json.tool "$LIVE_JSON" >/dev/null

if [ "${CENTRALDARK_FALLBACK_ACTIVE:-0}" = "1" ] || [ "${CENTRALDARK_LIVE_EDIT_ACTIVE:-0}" = "1" ]; then
  assert_disposable_scratch "$ROOT"
  [ "${CENTRALDARK_FALLBACK_LOCK_HELD:-${CENTRALDARK_LIVE_EDIT_LOCK_HELD:-0}}" = "1" ] || {
    echo "BLOCKED: modo vivo/fallback ativo sem LOCK declarado." >&2
    exit 1
  }
fi

grep -q 'MAIN-PINNED RUNTIME FAST-PATH' "$MD"
grep -q 'main-pinned-runtime-fast-path' "$SKILL"
grep -q 'MAIN_PINNED_RUNTIME_FAST_PATH' "$BOT"
grep -q 'CENTRALDARK LIVE EDITING FABRIC' "$LIVE_MD"
grep -q 'centraldark-live-editing-fabric' "$LIVE_SKILL"
grep -q 'CENTRALDARK_LIVE_EDITING_FABRIC' "$BOT"
grep -q 'live_editing_default' "$BINDING"

if git diff --cached --name-only | grep -E '^apps/modulos/|^scripts/|^\.github/' >/dev/null 2>&1; then
  if [ -z "${CENTRALDARK_RECEIPT_OK:-}" ] && [ ! -f .centraldark-receipt ]; then
    echo "BLOCKED: mudança material exige receipt/prova antes do push." >&2
    exit 1
  fi
fi

echo "MAIN_PINNED_FALLBACK_CONTRACT=PASS"
echo "CENTRALDARK_LIVE_EDITING_FABRIC_CONTRACT=PASS"
