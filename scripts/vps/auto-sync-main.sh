#!/usr/bin/env bash
# CENTRALDARK Auto-Sync: existing owner; cron every 5 minutes.
# Fail closed on dirty/divergent/non-main checkouts. No stash, rebase, reset or force.
# MVP manual: --manual prints readback; --restart-service NAME is strictly optional and owner-scoped.
set -euo pipefail

MANUAL=0
RESTART_SERVICE=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    --manual) MANUAL=1; shift ;;
    --restart-service)
      [[ $# -ge 2 && -n "${2:-}" ]] || { echo "USAGE: --restart-service NAME" >&2; exit 64; }
      RESTART_SERVICE="$2"; MANUAL=1; shift 2 ;;
    *) echo "UNKNOWN_OPTION=$1 (use --manual [--restart-service NAME])" >&2; exit 64 ;;
  esac
done

REPO="/root/CentralDark"
LOG="$REPO/scripts/vps/auto-sync.log"
LOCKFILE="/tmp/centraldark-auto-sync.lock"

exec 200>"$LOCKFILE"
flock -n 200 || { printf '%s [SKIP] owner lock busy\n' "$(date -u +%FT%TZ)" >> "$LOG"; exit 0; }
cd "$REPO"

STATUS="$REPO/logs/auto-sync-status.json"

log() {
  if [[ "$MANUAL" -eq 1 ]]; then
    printf '%s [%s] %s\n' "$(date -u +%FT%TZ)" "$1" "$2" | tee -a "$LOG"
  else
    printf '%s [%s] %s\n' "$(date -u +%FT%TZ)" "$1" "$2" >> "$LOG"
  fi
}
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

# Only a named service whose ACTIVE unit consumes this exact checkout can be
# restarted. Separate MCP runtime (/root/CentralDark_MCP_RUNTIME) is NOT touched
# by git fast-forward and must never be marked as synchronized by a restart.
restart_if_needed() {
  local from="$1" to="$2"
  [[ -n "$RESTART_SERVICE" ]] || return 0
  local prefix="" unit="" active=""
  case "$RESTART_SERVICE" in
    centraldark-native-mcp-http.service) prefix="apps/modulos/mcp/" ;;
    hermes-gateway.service) prefix="apps/modulos/HERMES-CORE/" ;;
    *) log "BLOCKED" "RESTART_SERVICE_NOT_ALLOWLISTED name=$RESTART_SERVICE"; return 3 ;;
  esac
  if [[ "$from" == "$to" ]]; then
    log "SKIP" "RESTART_NOT_NEEDED main unchanged; service=$RESTART_SERVICE"
    return 0
  fi
  if ! git diff --name-only "$from" "$to" | grep -q "^$prefix"; then
    log "SKIP" "RESTART_NOT_NEEDED no service-owned source delta; service=$RESTART_SERVICE"
    return 0
  fi
  if ! command -v systemctl >/dev/null 2>&1; then
    log "BLOCKED" "SYSTEMCTL_UNAVAILABLE service=$RESTART_SERVICE"
    return 3
  fi
  unit="$(systemctl show "$RESTART_SERVICE" --property=ExecStart --property=WorkingDirectory --no-pager 2>/dev/null)" || {
    log "BLOCKED" "SERVICE_UNIT_READ_FAILED service=$RESTART_SERVICE"
    return 3
  }
  if [[ "$unit" != *"/root/CentralDark/"* && "$unit" != *"WorkingDirectory=/root/CentralDark"* ]]; then
    log "BLOCKED" "SERVICE_SOURCE_OUTSIDE_CHECKOUT service=$RESTART_SERVICE; CHECKOUT_SYNC_ONLY; RUNTIME_UNKNOWN"
    return 3
  fi
  if ! systemctl restart "$RESTART_SERVICE"; then
    log "BLOCKED" "SERVICE_RESTART_FAILED service=$RESTART_SERVICE"
    return 3
  fi
  if ! systemctl is-active --quiet "$RESTART_SERVICE"; then
    log "BLOCKED" "SERVICE_NOT_ACTIVE_AFTER_RESTART service=$RESTART_SERVICE"
    return 3
  fi
  log "OK" "SERVICE_RESTART_SCOPED_PASS service=$RESTART_SERVICE; HEALTH_E2E_UNKNOWN"
}

run_pulse() {
  local pulse="${CENTRALDARK_MAIN_PULSE_RECONCILER:-$REPO/scripts/vps/main-pulse-reconciler.sh}"
  [[ -x "$pulse" ]] || { log "PULSE_UNKNOWN" "owner_missing path=$pulse"; return 0; }
  if "$pulse" --source "${1:-}" --trigger auto-sync >>"$LOG" 2>&1; then
    log "PULSE_PASS" "owner=$pulse"
  else
    local rc=$?
    log "PULSE_UNKNOWN" "owner=$pulse exit=$rc; CHECKOUT_SYNC_REMAINS_PASS"
  fi
}

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
  restart_if_needed "$before" "$before"
  run_pulse || true
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
restart_if_needed "$before" "$after"
run_pulse "$after" || true
