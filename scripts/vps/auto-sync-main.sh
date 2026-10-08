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

STATUS="$REPO/logs/auto-sync-status.json"

log() { printf '%s [%s] %s\n' "$(date -u +%FT%TZ)" "$1" "$2" >> "$LOG"; }
# Alimenta o coração (operational-telemetry F1_GIT): um arquivo, sobrescrito a cada ciclo.
status() {
  mkdir -p "$REPO/logs" 2>/dev/null || return 0
  python3 - "$STATUS" "$1" "$2" "$(git rev-parse --verify HEAD 2>/dev/null || true)" \
    "$(git rev-parse --verify refs/remotes/origin/main 2>/dev/null || true)" \
    "$(git symbolic-ref --quiet --short HEAD 2>/dev/null || echo DETACHED)" <<'PY' 2>/dev/null || true
import json, os, sys, datetime
path, result, reason, head, origin, branch = sys.argv[1:7]
tmp = path + ".tmp"
with open(tmp, "w") as f:
    json.dump({"schema": "centraldark.auto-sync-status.v1", "t": datetime.datetime.now(datetime.timezone.utc).isoformat(),
               "result": result, "reason": reason, "head": head, "origin_main": origin, "branch": branch,
               "owner": "scripts/vps/auto-sync-main.sh", "runtime_deploy": "UNKNOWN"}, f)
os.replace(tmp, path)
PY
}
blocked() { log "BLOCKED" "$1"; status "BLOCKED" "$1"; exit 2; }

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
  status "PASS" "already at origin/main"
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
status "PASS" "fast-forward from=$before"
