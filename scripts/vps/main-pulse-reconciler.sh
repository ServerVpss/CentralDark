#!/usr/bin/env bash
set -Eeuo pipefail

REPO="${CENTRALDARK_REPO:-/root/CentralDark}"
STATE_DIR="${CENTRALDARK_MAIN_PULSE_STATE_DIR:-/root/.centraldark/main-pulse}"
STATE_FILE="$STATE_DIR/last-seen-sha"
LOG_FILE="$STATE_DIR/pulse.log"
LOCK="${CENTRALDARK_MAIN_PULSE_LOCK:-/tmp/centraldark-main-pulse.lock}"
MICRODEPLOY="${CENTRALDARK_MAIN_PINNED_MICRODEPLOY:-/root/CentralDark/scripts/vps/main-pinned-microdeploy.sh}"
HERMES_INBOX="${CENTRALDARK_HERMES_INBOX:-/root/CentralDark/apps/modulos/HERMES-CORE/missions/pendente}"
SOURCE=""
TRIGGER="timer"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --source) SOURCE="${2:-}"; shift 2 ;;
    --trigger) TRIGGER="${2:-timer}"; shift 2 ;;
    *) echo "ARG_UNKNOWN=$1"; exit 2 ;;
  esac
done

mkdir -p "$STATE_DIR"
touch "$LOG_FILE"
chmod 700 "$STATE_DIR"
chmod 600 "$LOG_FILE" 2>/dev/null || true

log() {
  printf '%s %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$*" | tee -a "$LOG_FILE"
}

exec 9>"$LOCK"
flock -n 9 || { log "PULSE_SKIP=LOCK_HELD trigger=$TRIGGER"; exit 0; }

[[ -d "$REPO/.git" ]] || { log "PULSE_FAIL=REPO_MISSING repo=$REPO"; exit 10; }
[[ -x "$MICRODEPLOY" ]] || { log "PULSE_FAIL=MICRODEPLOY_MISSING path=$MICRODEPLOY"; exit 11; }

export GIT_TERMINAL_PROMPT=0
if [[ -x "$REPO/secrets/github-read-askpass.sh" ]]; then
  export GIT_ASKPASS="$REPO/secrets/github-read-askpass.sh"
fi
export CENTRALDARK_GITHUB_TOKEN_FILE="${CENTRALDARK_GITHUB_TOKEN_FILE:-/root/secrets/GITHUB_TOKEN}"

git -C "$REPO" fetch --prune origin main --quiet || { log "PULSE_FAIL=FETCH"; exit 12; }
MAIN_SHA="$(git -C "$REPO" rev-parse origin/main)"
[[ "$MAIN_SHA" =~ ^[0-9a-f]{40}$ ]] || { log "PULSE_FAIL=MAIN_SHA_INVALID"; exit 13; }

if [[ -n "$SOURCE" && "$SOURCE" =~ ^[0-9a-f]{40}$ && "$SOURCE" != "$MAIN_SHA" ]]; then
  if git -C "$REPO" merge-base --is-ancestor "$SOURCE" "$MAIN_SHA" 2>/dev/null; then
    log "PULSE_SOURCE_ADVANCED requested=$SOURCE current=$MAIN_SHA"
  else
    log "PULSE_FAIL=SOURCE_NOT_IN_CURRENT_MAIN source=$SOURCE main=$MAIN_SHA"
    exit 14
  fi
fi

if [[ ! -s "$STATE_FILE" ]]; then
  printf '%s\n' "$MAIN_SHA" > "$STATE_FILE"
  chmod 600 "$STATE_FILE"
  log "PULSE_INIT=PASS baseline=$MAIN_SHA trigger=$TRIGGER"
  exit 0
fi

LAST_SHA="$(tr -d '[:space:]' < "$STATE_FILE")"
if [[ "$LAST_SHA" == "$MAIN_SHA" ]]; then
  log "PULSE_NO_CHANGE=1 main=$MAIN_SHA trigger=$TRIGGER"
  exit 0
fi
git -C "$REPO" cat-file -e "$LAST_SHA^{commit}" 2>/dev/null || {
  log "PULSE_FAIL=LAST_SHA_NOT_MATERIALIZED last=$LAST_SHA"
  exit 15
}
git -C "$REPO" merge-base --is-ancestor "$LAST_SHA" "$MAIN_SHA" 2>/dev/null || {
  log "PULSE_FAIL=NON_FAST_FORWARD last=$LAST_SHA main=$MAIN_SHA"
  exit 16
}

mapfile -t CHANGED < <(git -C "$REPO" diff --name-only "$LAST_SHA..$MAIN_SHA")
if [[ "${#CHANGED[@]}" -eq 0 ]]; then
  printf '%s\n' "$MAIN_SHA" > "$STATE_FILE"
  log "PULSE_EMPTY_DELTA=PASS last=$LAST_SHA main=$MAIN_SHA"
  exit 0
fi

declare -a MCP_FILES=() HUB_FILES=() HERMES_FILES=() OAUTH_FILES=() UNHANDLED=()
for rel in "${CHANGED[@]}"; do
  case "$rel" in
    apps/modulos/mcp/*) MCP_FILES+=("$rel") ;;
    apps/bot-telegram/*) HUB_FILES+=("$rel") ;;
    apps/modulos/HERMES-CORE/*|docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/*|.agents/skills/centraldark-operational-method/*) HERMES_FILES+=("$rel") ;;
    apps/modulos/oauth-broker/*) OAUTH_FILES+=("$rel") ;;
    *) UNHANDLED+=("$rel") ;;
  esac
done

deploy_owner() {
  local owner="$1"; shift
  local -a files=("$@")
  [[ "${#files[@]}" -gt 0 ]] || return 0
  local -a args=(--owner "$owner" --source "$MAIN_SHA")
  local f
  for f in "${files[@]}"; do args+=(--file "$f"); done
  log "MICRODEPLOY_BEGIN owner=$owner files=${#files[@]} main=$MAIN_SHA trigger=$TRIGGER"
  "$MICRODEPLOY" "${args[@]}" >>"$LOG_FILE" 2>&1
  log "MICRODEPLOY_PASS owner=$owner files=${#files[@]} main=$MAIN_SHA"
}

deploy_owner mcp "${MCP_FILES[@]}"
deploy_owner hub_bot "${HUB_FILES[@]}"
deploy_owner hermes "${HERMES_FILES[@]}"
deploy_owner oauth_broker "${OAUTH_FILES[@]}"

if [[ "${#UNHANDLED[@]}" -gt 0 ]]; then
  mkdir -p "$HERMES_INBOX"
  MISSION="$HERMES_INBOX/main-pulse-${MAIN_SHA:0:12}.md"
  if [[ ! -e "$MISSION" ]]; then
    {
      echo "# MAIN PULSE — classificar delta fora do microdeploy conhecido"
      echo
      echo "STATUS=READ_ONLY_CLASSIFICATION"
      echo "TRIGGER=$TRIGGER"
      echo "FROM_SHA=$LAST_SHA"
      echo "TO_SHA=$MAIN_SHA"
      echo "INTENCAO=identificar owner existente e menor rota de deploy; não escrever nem aprovar"
      echo "UNKNOWN_IS_NOT_PASS=true"
      echo "REUSE_BEFORE_CREATE=true"
      echo
      echo "## Arquivos fora dos owners de microdeploy"
      printf -- '- %s\n' "${UNHANDLED[@]}"
    } > "$MISSION"
    chmod 600 "$MISSION" 2>/dev/null || true
    log "HERMES_CLASSIFY_QUEUED=1 file=$MISSION count=${#UNHANDLED[@]}"
  else
    log "HERMES_CLASSIFY_ALREADY_QUEUED=1 file=$MISSION"
  fi
fi

TMP="$STATE_FILE.tmp.$$"
printf '%s\n' "$MAIN_SHA" > "$TMP"
chmod 600 "$TMP"
mv "$TMP" "$STATE_FILE"
log "PULSE_PASS from=$LAST_SHA to=$MAIN_SHA changed=${#CHANGED[@]} mcp=${#MCP_FILES[@]} hub=${#HUB_FILES[@]} hermes=${#HERMES_FILES[@]} oauth=${#OAUTH_FILES[@]} unhandled=${#UNHANDLED[@]} trigger=$TRIGGER"
