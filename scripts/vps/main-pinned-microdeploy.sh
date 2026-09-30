#!/usr/bin/env bash
set -Eeuo pipefail

REPO="${CENTRALDARK_REPO:-/root/CentralDark}"
SCRATCH="${CENTRALDARK_SCRATCH:-$REPO/_worktrees/main-pinned-runtime-fastpath}"
LOCK="${CENTRALDARK_FASTPATH_LOCK:-/tmp/centraldark-main-pinned-fastpath.lock}"
OWNER=""
SOURCE=""
FILES=()

while [[ $# -gt 0 ]]; do
  case "$1" in
    --owner) OWNER="$2"; shift 2 ;;
    --source) SOURCE="$2"; shift 2 ;;
    --file) FILES+=("$2"); shift 2 ;;
    *) echo "ARG_UNKNOWN=$1"; exit 2 ;;
  esac
done

[[ "${#FILES[@]}" -gt 0 ]] || { echo "FILESET_EMPTY"; exit 3; }
case "$OWNER" in
  mcp) PREFIXES=("apps/modulos/mcp/"); APPS=("CentralDark-MCP"); HEALTH="http://127.0.0.1:9100/health" ;;
  hub_bot) PREFIXES=("apps/bot-telegram/"); APPS=("CentralDark-HubBot-Srver1" "CentralDark-HubBot-Guardiao"); HEALTH="" ;;
  hermes) PREFIXES=("apps/modulos/HERMES-CORE/" "docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/" ".agents/skills/centraldark-operational-method/"); APPS=("CentralDark-Hermes"); HEALTH="" ;;
  oauth_broker) PREFIXES=("apps/modulos/oauth-broker/"); APPS=("CentralDark-OAuthBroker"); HEALTH="http://127.0.0.1:8098/health" ;;
  *) echo "OWNER_UNKNOWN"; exit 4 ;;
esac

allowed_file() {
  local rel="$1" p
  [[ "$rel" != /* && "$rel" != *".."* ]] || return 1
  [[ ! "$rel" =~ (^|/)(\.env|secrets?|credentials?|tokens?|sessions?)(/|$) ]] || return 1
  for p in "${PREFIXES[@]}"; do [[ "$rel" == "$p"* ]] && return 0; done
  return 1
}
for rel in "${FILES[@]}"; do allowed_file "$rel" || { echo "FILE_OUTSIDE_OWNER_SCOPE=$rel"; exit 5; }; done

exec 9>"$LOCK"
flock -w 90 9 || { echo "LOCK_TIMEOUT"; exit 21; }
cd "$REPO"
export HOME="${HOME:-/root}"
git fetch --prune origin main >/dev/null
MAIN_SHA="$(git rev-parse origin/main)"
SOURCE="${SOURCE:-$MAIN_SHA}"
[[ "$SOURCE" =~ ^[0-9a-f]{40}$ ]] || { echo "SOURCE_SHA_INVALID"; exit 22; }
git merge-base --is-ancestor "$SOURCE" "$MAIN_SHA" || { echo "SOURCE_NOT_IN_MAIN"; exit 23; }

mkdir -p "$(dirname "$SCRATCH")"
if ! git worktree list --porcelain | grep -F "worktree $SCRATCH" >/dev/null 2>&1; then
  rm -rf "$SCRATCH"
  git worktree add --detach "$SCRATCH" "$SOURCE" >/dev/null
fi
[[ "$(readlink -f "$SCRATCH")" == "$SCRATCH" ]] || { echo "SCRATCH_PATH_MISMATCH"; exit 24; }
[[ "$(readlink -f "$SCRATCH")" != "$(readlink -f "$REPO")" ]] || { echo "RUNTIME_IS_SCRATCH"; exit 25; }
git -C "$SCRATCH" reset --hard "$SOURCE" >/dev/null
git -C "$SCRATCH" clean -fdx >/dev/null

STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
BACKUP="/root/CentralDark-Recovery/main-pinned/$OWNER/$STAMP"
RECEIPT="$REPO/logs/receipts/main-pinned-$OWNER-$STAMP.json"
mkdir -p "$BACKUP" "$(dirname "$RECEIPT")"
promoted=0
rollback() {
  local rc=$?
  trap - EXIT ERR
  set +e
  if [[ "$rc" -ne 0 && "$promoted" == "1" ]]; then
    echo "ROLLBACK_BEGIN"
    rollback_ok=1
    for rel in "${FILES[@]}"; do
      if [[ -e "$BACKUP/$rel" ]]; then
        mkdir -p "$REPO/$(dirname "$rel")"
        cp -a "$BACKUP/$rel" "$REPO/$rel"
      elif [[ -e "$BACKUP/.absent/$rel" ]]; then
        rm -f -- "$REPO/$rel"
      else
        echo "ROLLBACK_STATE_UNKNOWN=$rel"
        rollback_ok=0
      fi
    done
    for app in "${APPS[@]}"; do
      PM2_HOME=/root/.pm2 pm2 restart "$app" --update-env >/dev/null 2>&1 || rollback_ok=0
    done
    for _ in $(seq 1 20); do
      all_online=1
      for app in "${APPS[@]}"; do
        status="$(PM2_HOME=/root/.pm2 pm2 jlist | jq -r --arg app "$app" '.[] | select(.name==$app) | .pm2_env.status' | head -n1)"
        [[ "$status" == "online" ]] || all_online=0
      done
      [[ "$all_online" == "1" ]] && break
      sleep 1
    done
    if [[ -n "$HEALTH" ]]; then
      health_ok=0
      for _ in $(seq 1 20); do
        if curl -fsS --max-time 3 "$HEALTH" >/dev/null 2>&1; then health_ok=1; break; fi
        sleep 1
      done
      [[ "$health_ok" == "1" ]] || rollback_ok=0
    fi
    jq -n       --arg source "$SOURCE" --arg main "$MAIN_SHA" --arg owner "$OWNER" --arg backup "$BACKUP"       --arg at "$(date -u +%Y-%m-%dT%H:%M:%SZ)" --argjson count "${#FILES[@]}"       --argjson restored "$([[ "$rollback_ok" == "1" ]] && echo true || echo false)"       '{schema:"centraldark.main-pinned-runtime-fast-path.receipt.v1",source_sha:$source,main_sha:$main,owner:$owner,fileset_count:$count,backup:$backup,observed_at:$at,state_before_captured:true,compensation_executed:true,original_state_restored:$restored,result:(if $restored then "ROLLED_BACK" else "ROLLBACK_FAILED" end),secrets_exposed:false}'       > "$RECEIPT" 2>/dev/null || true
    if [[ "$rollback_ok" == "1" ]]; then echo "ROLLBACK_STATE=PASS"; else echo "ROLLBACK_STATE=FAIL"; fi
    echo "ROLLBACK_END"
  fi
  git -C "$SCRATCH" reset --hard origin/main >/dev/null 2>&1 || true
  git -C "$SCRATCH" clean -fdx >/dev/null 2>&1 || true
  exit "$rc"
}
trap rollback EXIT ERR

for rel in "${FILES[@]}"; do
  if [[ -e "$REPO/$rel" ]]; then
    mkdir -p "$BACKUP/$(dirname "$rel")"
    cp -a "$REPO/$rel" "$BACKUP/$rel"
  else
    mkdir -p "$BACKUP/.absent/$(dirname "$rel")"
    : > "$BACKUP/.absent/$rel"
  fi

  if git -C "$SCRATCH" cat-file -e "$SOURCE:$rel" 2>/dev/null; then
    mkdir -p "$REPO/$(dirname "$rel")"
    cp -a "$SCRATCH/$rel" "$REPO/$rel"
    cmp -s "$SCRATCH/$rel" "$REPO/$rel" || { echo "PROMOTION_HASH_MISMATCH=$rel"; exit 27; }
  else
    echo "PROMOTION_DELETE=$rel"
    if [[ -e "$REPO/$rel" ]]; then
      mkdir -p "$BACKUP/.deleted/$(dirname "$rel")"
      mv "$REPO/$rel" "$BACKUP/.deleted/$rel"
    fi
  fi
done
promoted=1

for app in "${APPS[@]}"; do
  PM2_HOME=/root/.pm2 pm2 restart "$app" --update-env >/dev/null
done
for _ in $(seq 1 20); do
  all_online=1
  for app in "${APPS[@]}"; do
    status="$(PM2_HOME=/root/.pm2 pm2 jlist | jq -r --arg app "$app" '.[] | select(.name==$app) | .pm2_env.status' | head -n1)"
    [[ "$status" == "online" ]] || all_online=0
  done
  [[ "$all_online" == "1" ]] && break
  sleep 1
done
for app in "${APPS[@]}"; do
  status="$(PM2_HOME=/root/.pm2 pm2 jlist | jq -r --arg app "$app" '.[] | select(.name==$app) | .pm2_env.status' | head -n1)"
  [[ "$status" == "online" ]] || { echo "APP_NOT_ONLINE=$app:$status"; exit 28; }
done
if [[ -n "$HEALTH" ]]; then
  health_ok=0
  for _ in $(seq 1 20); do
    if curl -fsS --max-time 3 "$HEALTH" >/dev/null 2>&1; then health_ok=1; break; fi
    sleep 1
  done
  [[ "$health_ok" == "1" ]] || { echo "HEALTH_FAIL=$HEALTH"; exit 29; }
fi

jq -n   --arg source "$SOURCE" --arg main "$MAIN_SHA" --arg owner "$OWNER" --arg backup "$BACKUP"   --arg at "$(date -u +%Y-%m-%dT%H:%M:%SZ)" --argjson count "${#FILES[@]}"   '{schema:"centraldark.main-pinned-runtime-fast-path.receipt.v1",source_sha:$source,main_sha:$main,owner:$owner,fileset_count:$count,backup:$backup,observed_at:$at,same_sha:true,state_before_captured:true,action_proved:true,receipt_persisted:true,result:"PASS",secrets_exposed:false}'   > "$RECEIPT"
echo "RECEIPT=$RECEIPT"
echo "MAIN_PINNED_MICRODEPLOY=PASS"
echo "SOURCE_SHA=$SOURCE"
echo "OWNER=$OWNER"
echo "FILESET_COUNT=${#FILES[@]}"

promoted=0
git -C "$SCRATCH" reset --hard origin/main >/dev/null
git -C "$SCRATCH" clean -fdx >/dev/null
[[ -z "$(git -C "$SCRATCH" status --porcelain)" ]] || { echo "SCRATCH_DIRTY_AFTER"; exit 30; }
trap - EXIT ERR
