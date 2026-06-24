#!/bin/bash
# Quarentena segura de clones duplicados do repo clone-deck na VPS.
# - Nunca apaga definitivamente.
# - Nunca move /root/Multizap/apps/clone-deck (ativo).
# - Move apenas repos git com remote segredounlock/clone-deck e MENOS arquivos que o ativo.
# - Publica relatório sanitizado em branch diagnostics/* quando possível.
set -uo pipefail

ACTIVE="${CLONE_DECK:-/root/Multizap/apps/clone-deck}"
SEARCH_ROOT="${CLONE_DECK_DUP_SEARCH_ROOT:-/root}"
QUARANTINE_ROOT="${CLONE_DECK_QUARANTINE_ROOT:-/root/Multizap/quarantine}"
LOG="${CLONE_DECK_DUP_LOG:-/var/log/clone-deck-duplicate-cleanup.log}"
STAMP="$(date +%Y%m%d%H%M%S)"
Q="$QUARANTINE_ROOT/duplicate-clone-deck-$STAMP"
REPORT="/tmp/clone-deck-duplicate-cleanup-$STAMP.md"
DIAG_BRANCH="diagnostics/vps-duplicate-clones-$STAMP"
WT="/tmp/clone-deck-dupdiag-$STAMP"

log() { printf '[%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$1" >> "$LOG" 2>/dev/null || true; }

safe_path_name() {
  printf '%s' "$1" | sed 's#^/##; s#[^A-Za-z0-9._-]#_#g'
}

is_protected_path() {
  case "$1" in
    /root/Multizap/apps/clone-deck|/root/Multizap/apps/clone-deck/*) return 0 ;;
    /root/whatsapp-server|/root/whatsapp-server/*) return 0 ;;
    /root/Multizap/gateway|/root/Multizap/gateway/*) return 0 ;;
    /root/clone-deck-webhook|/root/clone-deck-webhook/*) return 0 ;;
    /root/Multizap/secrets|/root/Multizap/secrets/*) return 0 ;;
  esac
  return 1
}

file_count() {
  find "$1" -type f -not -path '*/.git/*' 2>/dev/null | wc -l | tr -d ' '
}

{
  echo "# Duplicate clone-deck cleanup report — $STAMP"
  echo
  echo "- active: $ACTIVE"
  echo "- search_root: $SEARCH_ROOT"
  echo "- quarantine: $Q"
  echo "- generated_at: $(date -Is)"
  echo
} > "$REPORT"

if [ ! -d "$ACTIVE/.git" ]; then
  echo "[ABORT] active repo not found: $ACTIVE" | tee -a "$REPORT" >> "$LOG"
  exit 0
fi

ACTIVE_REAL="$(cd "$ACTIVE" && pwd -P)"
ACTIVE_COUNT="$(file_count "$ACTIVE_REAL")"
mkdir -p "$Q" 2>/dev/null || true
chmod 700 "$Q" 2>/dev/null || true

log "[START] active=$ACTIVE_REAL active_count=$ACTIVE_COUNT search=$SEARCH_ROOT quarantine=$Q"
echo "## Active repo" >> "$REPORT"
echo >> "$REPORT"
echo '```txt' >> "$REPORT"
echo "path=$ACTIVE_REAL" >> "$REPORT"
echo "files=$ACTIVE_COUNT" >> "$REPORT"
git -C "$ACTIVE_REAL" log --oneline -1 >> "$REPORT" 2>&1 || true
echo '```' >> "$REPORT"
echo >> "$REPORT"
echo "## Candidates" >> "$REPORT"
echo >> "$REPORT"

MOVED=0
SKIPPED=0
FOUND=0

while IFS= read -r gitdir; do
  repo="$(dirname "$gitdir")"
  repo_real="$(cd "$repo" 2>/dev/null && pwd -P || true)"
  [ -n "$repo_real" ] || continue

  remote="$(git -C "$repo_real" remote -v 2>/dev/null | head -n 1 || true)"
  echo "$remote" | grep -q 'segredounlock/clone-deck' || continue
  FOUND=$((FOUND + 1))

  count="$(file_count "$repo_real")"
  head="$(git -C "$repo_real" log --oneline -1 2>/dev/null || echo unknown)"

  echo "### $repo_real" >> "$REPORT"
  echo >> "$REPORT"
  echo '```txt' >> "$REPORT"
  echo "files=$count" >> "$REPORT"
  echo "head=$head" >> "$REPORT"
  echo "remote=$remote" >> "$REPORT"

  if [ "$repo_real" = "$ACTIVE_REAL" ]; then
    echo "action=skip_active" >> "$REPORT"
    SKIPPED=$((SKIPPED + 1))
  elif is_protected_path "$repo_real"; then
    echo "action=skip_protected" >> "$REPORT"
    SKIPPED=$((SKIPPED + 1))
  elif [ "$count" -lt "$ACTIVE_COUNT" ]; then
    dest="$Q/$(safe_path_name "$repo_real")"
    if mv -- "$repo_real" "$dest" 2>/dev/null; then
      echo "action=moved_to_quarantine" >> "$REPORT"
      echo "dest=$dest" >> "$REPORT"
      log "[MOVED] $repo_real -> $dest files=$count"
      MOVED=$((MOVED + 1))
    else
      echo "action=move_failed" >> "$REPORT"
      log "[WARN] move failed $repo_real"
      SKIPPED=$((SKIPPED + 1))
    fi
  else
    echo "action=skip_not_smaller" >> "$REPORT"
    SKIPPED=$((SKIPPED + 1))
  fi
  echo '```' >> "$REPORT"
  echo >> "$REPORT"
done < <(find "$SEARCH_ROOT" -maxdepth 7 -type d -name .git 2>/dev/null)

{
  echo "## Summary"
  echo
  echo "- found: $FOUND"
  echo "- moved: $MOVED"
  echo "- skipped: $SKIPPED"
  echo "- quarantine: $Q"
} >> "$REPORT"

log "[DONE] found=$FOUND moved=$MOVED skipped=$SKIPPED quarantine=$Q"

# Publicar relatório sanitizado em branch diagnostics/* usando a write key da VPS, se disponível.
if [ -d "$ACTIVE_REAL/.git" ]; then
  git -C "$ACTIVE_REAL" fetch origin main >> "$LOG" 2>&1 || true
  git -C "$ACTIVE_REAL" worktree remove --force "$WT" >> "$LOG" 2>&1 || true
  if git -C "$ACTIVE_REAL" worktree add -B "$DIAG_BRANCH" "$WT" origin/main >> "$LOG" 2>&1; then
    mkdir -p "$WT/diagnostics/vps"
    cp "$REPORT" "$WT/diagnostics/vps/duplicate-clones-$STAMP.md"
    (
      cd "$WT" || exit 0
      git config user.name "MultiZap VPS"
      git config user.email "multizap-vps@users.noreply.github.com"
      git add "diagnostics/vps/duplicate-clones-$STAMP.md"
      git commit -m "diag: add duplicate clone cleanup report $STAMP" >> "$LOG" 2>&1 || exit 0
      git push git@github-clone-deck-write:segredounlock/clone-deck.git HEAD:"$DIAG_BRANCH" >> "$LOG" 2>&1 || exit 0
    )
    git -C "$ACTIVE_REAL" worktree remove --force "$WT" >> "$LOG" 2>&1 || true
    log "[DIAG] pushed $DIAG_BRANCH"
  fi
fi
