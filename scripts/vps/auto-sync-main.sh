#!/usr/bin/env bash
# CENTRALDARK Auto-Sync: existing owner; cron every 5 minutes.
# Fail closed on dirty/divergent/non-main checkouts. No stash, rebase, reset, force or restart.
set -euo pipefail

REPO="/root/CentralDark"
LOG="$REPO/scripts/vps/auto-sync.log"
LOCKFILE="/tmp/centraldark-auto-sync.lock"

exec 200>"$LOCKFILE"
flock -n 200 || { printf '%s [SKIP] owner lock busy\n' "$(date -u +%FT%TZ)" >> "$LOG"; exit 0; }
cd "$REPO"

log() { printf '%s [%s] %s\n' "$(date -u +%FT%TZ)" "$1" "$2" >> "$LOG"; }
blocked() { log "BLOCKED" "$1"; exit 2; }

branch=$(git symbolic-ref --quiet --short HEAD) || blocked "detached HEAD; no checkout mutation"
before=$(git rev-parse --verify HEAD) || blocked "HEAD unavailable"
# Never move a checkout owned by another branch or containing unique local work.
[[ "$branch" == "main" ]] || blocked "branch=$branch is not main; reconcile with owner; HEAD=$before"
[[ -z "$(git status --porcelain --untracked-files=normal)" ]] || blocked "dirty checkout; preserve local changes; HEAD=$before"

if ! git fetch --quiet origin main; then
  blocked "fetch failed; HEAD=$before"
fi
remote=$(git rev-parse --verify refs/remotes/origin/main) || blocked "origin/main unavailable"
if [[ "$before" == "$remote" ]]; then
  log "OK" "CHECKOUT_SYNC_PASS sha=$before; RUNTIME_DEPLOY_UNKNOWN"
  exit 0
fi
if ! git merge-base --is-ancestor "$before" "$remote"; then
  blocked "diverged: HEAD=$before origin/main=$remote; no automatic rebase/reset"
fi
if ! git merge --ff-only --quiet "$remote"; then
  blocked "fast-forward failed; HEAD=$before origin/main=$remote"
fi
after=$(git rev-parse --verify HEAD)
[[ "$after" == "$remote" ]] || blocked "readback mismatch: HEAD=$after origin/main=$remote"
log "SYNC" "CHECKOUT_SYNC_PASS from=$before to=$after; RUNTIME_DEPLOY_UNKNOWN"
