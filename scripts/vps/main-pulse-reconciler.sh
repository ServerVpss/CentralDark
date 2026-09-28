#!/usr/bin/env bash
set -Eeuo pipefail

REPO="${CENTRALDARK_REPO:-/root/CentralDark}"
STATE_DIR="${CENTRALDARK_MAIN_PULSE_STATE_DIR:-/root/.centraldark/main-pulse}"
STATE_FILE="$STATE_DIR/last-seen-sha"
LOG_FILE="$STATE_DIR/pulse.log"
LOCK="${CENTRALDARK_MAIN_PULSE_LOCK:-/tmp/centraldark-main-pulse.lock}"
MICRODEPLOY="${CENTRALDARK_MAIN_PINNED_MICRODEPLOY:-/root/CentralDark/scripts/vps/main-pinned-microdeploy.sh}"
HERMES_INBOX="${CENTRALDARK_HERMES_INBOX:-/root/CentralDark/apps/modulos/HERMES-CORE/missions/pendente}"
HERMES_ANDAMENTO="${CENTRALDARK_HERMES_ANDAMENTO:-/root/CentralDark/apps/modulos/HERMES-CORE/missions/em-andamento}"
HERMES_CONCLUIDAS="${CENTRALDARK_HERMES_CONCLUIDAS:-/root/CentralDark/apps/modulos/HERMES-CORE/missions/concluidas}"
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

# PASS só existe se o checkout vivo realmente convergir para a main materializada.
# Untracked/runtime é preservado; apenas tracked dirty bloqueia fail-closed.
LIVE_HEAD_BEFORE="$(git -C "$REPO" rev-parse HEAD)"
if [[ "$LIVE_HEAD_BEFORE" != "$MAIN_SHA" ]]; then
  LIVE_BRANCH="$(git -C "$REPO" branch --show-current)"
  [[ "$LIVE_BRANCH" == "main" ]] || {
    log "PULSE_FAIL=LIVE_BRANCH_NOT_MAIN branch=$LIVE_BRANCH head=$LIVE_HEAD_BEFORE main=$MAIN_SHA"
    exit 17
  }
  if ! git -C "$REPO" diff --quiet || ! git -C "$REPO" diff --cached --quiet; then
    log "PULSE_FAIL=TRACKED_DIRTY head=$LIVE_HEAD_BEFORE main=$MAIN_SHA"
    exit 18
  fi
  git -C "$REPO" merge --ff-only "$MAIN_SHA" --quiet || {
    log "PULSE_FAIL=LIVE_FF_ONLY head=$LIVE_HEAD_BEFORE main=$MAIN_SHA"
    exit 19
  }
fi
LIVE_HEAD_AFTER="$(git -C "$REPO" rev-parse HEAD)"
[[ "$LIVE_HEAD_AFTER" == "$MAIN_SHA" ]] || {
  log "PULSE_FAIL=LIVE_HEAD_DID_NOT_CONVERGE head=$LIVE_HEAD_AFTER main=$MAIN_SHA"
  exit 20
}
log "PULSE_LIVE_HEAD=PASS before=$LIVE_HEAD_BEFORE after=$LIVE_HEAD_AFTER main=$MAIN_SHA"

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
  # HERMES-CORE exige o contrato de continuidade antes de retomar uma missão.
  # Para deltas sem owner conhecido, o pulso cria diretamente uma órfã JSON
  # validável em em-andamento; o Core absorve esse JSON no mesmo executor.
  mkdir -p "$HERMES_ANDAMENTO" "$HERMES_CONCLUIDAS"
  MISSION_ID="main-pulse-${MAIN_SHA:0:12}"
  MISSION="$HERMES_ANDAMENTO/$MISSION_ID.json"
  MISSION_DIR="$HERMES_ANDAMENTO/$MISSION_ID"
  DONE_DIR="$HERMES_CONCLUIDAS/$MISSION_ID"

  if [[ ! -e "$MISSION" && ! -d "$MISSION_DIR" && ! -d "$DONE_DIR" ]]; then
    python3 - "$MISSION" "$MISSION_ID" "$LAST_SHA" "$MAIN_SHA" "$TRIGGER" "${UNHANDLED[@]}" <<'PY'
import json
import sys
from pathlib import Path

mission_path, mission_id, from_sha, to_sha, trigger, *files = sys.argv[1:]
mission_text = (
    "Classificar o delta da main fora dos owners de microdeploy conhecidos. "
    "Identificar owner existente e a menor rota segura de continuidade/deploy. "
    "Não aprovar, promover, inventar owner ou transformar UNKNOWN em PASS sem prova. "
    f"TRIGGER={trigger}; FROM_SHA={from_sha}; TO_SHA={to_sha}; "
    "ARQUIVOS=" + ", ".join(files)
)

state = {
    "objetivo": "Classificar delta da main sem owner de microdeploy conhecido e identificar owner existente/menor rota segura.",
    "autoridade": "SEGREDO/CHEFE",
    "coordenador": "SOL",
    "escritor": "HERMES",
    "escopo": {
        "tipo": "DELTA_MAIN_UNHANDLED",
        "arquivos": files,
        "from_sha": from_sha,
        "to_sha": to_sha,
    },
    "ambiente": "VPS",
    "classe_de_acao": "READ_ONLY_CLASSIFICATION",
    "baseline": {
        "head_sha": to_sha,
        "from_sha": from_sha,
        "fonte": "origin/main",
    },
    "backup": {
        "head_sha": to_sha,
        "strategy": "NO_MUTATION_NO_BACKUP_REQUIRED",
    },
    "rollback": {
        "head_sha": to_sha,
        "strategy": "NO_MUTATION_CLASSIFICATION_ONLY",
    },
    "receipt": {
        "head_sha": to_sha,
        "expected": "HERMES_FINALIZATION_CRITIC",
        "mission_id": mission_id,
    },
    "head_sha": to_sha,
    "terminal_state": "RUNNING",
    "historico": [],
    "retomadas": 0,
    "missao": mission_text,
}

payload = {
    "titulo": mission_id,
    "missao": mission_text,
    "descricao": mission_text,
    "state": state,
}
Path(mission_path).write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
PY
    chmod 600 "$MISSION" 2>/dev/null || true
    log "HERMES_CLASSIFY_QUEUED=1 contract=continuity-v1 file=$MISSION count=${#UNHANDLED[@]}"
  else
    log "HERMES_CLASSIFY_ALREADY_QUEUED=1 mission=$MISSION_ID"
  fi
fi

TMP="$STATE_FILE.tmp.$$"
printf '%s\n' "$MAIN_SHA" > "$TMP"
chmod 600 "$TMP"
mv "$TMP" "$STATE_FILE"
log "PULSE_PASS from=$LAST_SHA to=$MAIN_SHA changed=${#CHANGED[@]} mcp=${#MCP_FILES[@]} hub=${#HUB_FILES[@]} hermes=${#HERMES_FILES[@]} oauth=${#OAUTH_FILES[@]} unhandled=${#UNHANDLED[@]} trigger=$TRIGGER"
