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
# Tracked edits belong to another writer and remain fail-closed.
[[ "$branch" == "main" ]] || blocked "branch=$branch is not main; reconcile with owner; HEAD=$before"
[[ -z "$(git status --porcelain --untracked-files=no)" ]] || blocked "tracked changes owned elsewhere; HEAD=$before"

# Untracked runtime scopes are preserved automatically so they cannot stall the
# canonical main->VPS sync. They are restored after every path, including
# fetch/merge failures; tracked edits still block above.
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
PRESERVE_DIR="/root/CentralDark-preserve/auto-sync-untracked-$STAMP"
PRESERVE_MANIFEST="$PRESERVE_DIR/MANIFEST.tsv"
RESTORED=0
mkdir -p "$PRESERVE_DIR/untracked"
: > "$PRESERVE_MANIFEST"
restore_untracked() {
  [[ "$RESTORED" -eq 0 ]] || return 0
  if [[ -s "$PRESERVE_MANIFEST" ]]; then
    tac "$PRESERVE_MANIFEST" | while IFS=$'\t' read -r rel saved; do
      [[ -n "$rel" && -e "$saved" ]] || continue
      if git ls-files --error-unmatch -- "$rel" >/dev/null 2>&1; then
        log "PRESERVED" "untracked path became tracked; left backup=$saved path=$rel"
        continue
      fi
      mkdir -p "$(dirname "$REPO/$rel")"
      if [[ -e "$REPO/$rel" ]]; then
        log "PRESERVED" "restore collision; left backup=$saved path=$rel"
      else
        mv -- "$saved" "$REPO/$rel"
      fi
    done
  fi
  RESTORED=1
}
trap 'restore_untracked' EXIT

while IFS= read -r line; do
  [[ "$line" == \?\?\ * ]] || continue
  rel="${line#?? }"
  rel="${rel%/}"
  [[ -n "$rel" && -e "$REPO/$rel" ]] || continue
  saved="$PRESERVE_DIR/untracked/$rel"
  mkdir -p "$(dirname "$saved")"
  mv -- "$REPO/$rel" "$saved"
  printf '%s\t%s\n' "$rel" "$saved" >> "$PRESERVE_MANIFEST"
done < <(git status --porcelain --untracked-files=normal)
if [[ -s "$PRESERVE_MANIFEST" ]]; then
  log "PRESERVE" "untracked runtime scopes moved to $PRESERVE_DIR"
fi

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
