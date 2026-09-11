#!/usr/bin/env bash
set -euo pipefail

ROOT="${CENTRALDARK_ROOT:-/root/CentralDark}"
EXPECTED_ORIGIN="${CENTRALDARK_EXPECTED_ORIGIN:-ServerVpss/CentralDark}"
RUN_AFTER_PULL="${RUN_CODEQL_AFTER_PULL:-false}"

log() { printf '%s\n' "$*"; }
block() { log "VPS_SYNC_STATUS=BLOCKED"; log "VPS_SYNC_CAUSE=$1"; exit "${2:-3}"; }

[ -d "$ROOT/.git" ] || block REPO_NOT_FOUND
cd "$ROOT"

ORIGIN="$(git remote get-url origin 2>/dev/null || true)"
case "$ORIGIN" in
  *"$EXPECTED_ORIGIN"*) ;;
  *) block "UNEXPECTED_ORIGIN:$ORIGIN" ;;
esac

if [ -n "$(git status --porcelain)" ]; then
  block WORKTREE_NOT_CLEAN
fi

log "VPS_SYNC_ROOT=$ROOT"
log "VPS_SYNC_ORIGIN=$ORIGIN"
log "VPS_SYNC_FETCH=origin/main"
git fetch origin main

LOCAL="$(git rev-parse HEAD)"
REMOTE="$(git rev-parse origin/main)"
BASE="$(git merge-base HEAD origin/main)"

log "VPS_LOCAL_HEAD=$LOCAL"
log "VPS_REMOTE_MAIN=$REMOTE"
log "VPS_MERGE_BASE=$BASE"

if [ "$LOCAL" = "$REMOTE" ]; then
  log "VPS_SYNC_DELTA=NO_CHANGE"
elif [ "$BASE" = "$LOCAL" ]; then
  git merge --ff-only origin/main
  log "VPS_SYNC_DELTA=FAST_FORWARD"
else
  block DIVERGED_NO_BLIND_RESET
fi

for required in \
  .github/workflows/codeql.yml \
  .github/codeql/codeql-config.yml \
  scripts/codeql/centraldark-codeql-private.sh \
  scripts/codeql/pull-codeql-to-vps.sh; do
  [ -s "$required" ] || block "MISSING_REQUIRED_FILE:$required" 4
done

chmod +x scripts/codeql/centraldark-codeql-private.sh scripts/codeql/pull-codeql-to-vps.sh

log "VPS_SYNC_REQUIRED_FILES=PASS"
log "VPS_SYNC_HEAD=$(git rev-parse HEAD)"

if [ "$RUN_AFTER_PULL" = "true" ]; then
  log "VPS_CODEQL_RUN=REQUESTED"
  exec scripts/codeql/centraldark-codeql-private.sh
fi

log "VPS_CODEQL_RUN=NOT_REQUESTED"
log "VPS_SYNC_STATUS=PASS"
