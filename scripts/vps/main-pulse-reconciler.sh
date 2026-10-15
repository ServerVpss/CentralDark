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
AUDIT_COVERAGE=0
AUDIT_FROM=""
AUDIT_TO=""

# A única régua de roteamento serve tanto ao pulso vivo quanto à auditoria
# offline. Nenhum arquivo desaparece por não pertencer aos quatro owners
# conhecidos: nesses casos o owner é classificação read-only do Hermes.
route_owner() {
  case "$1" in
    apps/modulos/mcp/*) printf 'mcp' ;;
    apps/bot-telegram/*) printf 'hub_bot' ;;
    apps/modulos/HERMES-CORE/*|docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/*|.agents/skills/centraldark-operational-method/*) printf 'hermes' ;;
    apps/modulos/oauth-broker/*) printf 'oauth_broker' ;;
    *) printf 'unhandled' ;;
  esac
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --source) [[ $# -ge 2 ]] || { echo 'ARG_MISSING=--source'; exit 2; }; SOURCE="$2"; shift 2 ;;
    --trigger) [[ $# -ge 2 ]] || { echo 'ARG_MISSING=--trigger'; exit 2; }; TRIGGER="$2"; shift 2 ;;
    --audit-coverage) AUDIT_COVERAGE=1; shift ;;
    --from) [[ $# -ge 2 ]] || { echo 'ARG_MISSING=--from'; exit 2; }; AUDIT_FROM="$2"; shift 2 ;;
    --to) [[ $# -ge 2 ]] || { echo 'ARG_MISSING=--to'; exit 2; }; AUDIT_TO="$2"; shift 2 ;;
    *) echo "ARG_UNKNOWN=$1"; exit 2 ;;
  esac
done

# Modo de prova ANTES do lock, do git fetch e de qualquer escrita em disco.
# Útil na VPS e na Casa, inclusive quando o checkout vivo está dirty/branch.
# --from/--to aceitam APENAS commits concretos, não referências ambíguas.
if [[ "$AUDIT_COVERAGE" == 1 ]]; then
  [[ -d "$REPO" ]] && git -C "$REPO" rev-parse --is-inside-work-tree >/dev/null 2>&1 || {
    echo 'COVERAGE_GATE=BLOCKED_REPO_NOT_FOUND'; exit 20;
  }
  [[ -n "$AUDIT_FROM" ]] || {
    [[ -s "$STATE_FILE" ]] && AUDIT_FROM="$(tr -d '[:space:]' < "$STATE_FILE")";
  }
  [[ -n "$AUDIT_TO" ]] || AUDIT_TO="$(git -C "$REPO" rev-parse refs/remotes/origin/main 2>/dev/null || true)"
  for sha in "$AUDIT_FROM" "$AUDIT_TO"; do
    [[ "$sha" =~ ^[0-9a-f]{40}$ ]] && git -C "$REPO" cat-file -e "$sha^{commit}" 2>/dev/null || {
      echo 'COVERAGE_GATE=BLOCKED_SHA_NOT_MATERIALIZED'; exit 21;
    }
  done
  git -C "$REPO" merge-base --is-ancestor "$AUDIT_FROM" "$AUDIT_TO" || {
    echo 'COVERAGE_GATE=BLOCKED_NON_FAST_FORWARD'; exit 22;
  }
  declare -A counted=([mcp]=0 [hub_bot]=0 [hermes]=0 [oauth_broker]=0 [unhandled]=0)
  total=0
  echo "COVERAGE_FROM=$AUDIT_FROM"
  echo "COVERAGE_TO=$AUDIT_TO"
  while IFS= read -r -d '' rel; do
    owner="$(route_owner "$rel")"
    counted[$owner]=$(( counted[$owner] + 1 ))
    total=$(( total + 1 ))
    if [[ "$owner" == unhandled ]]; then
      echo "COVERAGE_FILE owner=HERMES_CLASSIFY_ONLY status=UNPROVEN path=$rel"
    else
      echo "COVERAGE_FILE owner=$owner status=ROUTED_NOT_RUNTIME_PROVEN path=$rel"
    fi
  done < <(git -C "$REPO" diff --name-only -z "$AUDIT_FROM" "$AUDIT_TO")
  routed=0
  for owner in hermes mcp hub_bot oauth_broker unhandled; do
    echo "COVERAGE_OWNER=$owner count=${counted[$owner]}"
    routed=$(( routed + counted[$owner] ))
  done
  echo "COVERAGE_EXPECTED=$total"
  echo "COVERAGE_ACCOUNTED=$routed"
  echo "COVERAGE_UNHANDLED=${counted[unhandled]}"
  echo 'RUNTIME_E2E=UNPROVEN'
  if (( routed != total )); then
    echo 'COVERAGE_GATE=BLOCKED_ACCOUNTING_MISMATCH'
    exit 23
  fi
  if (( counted[unhandled] > 0 )); then
    echo 'COVERAGE_GATE=PARTIAL_CLASSIFICATION_PENDING'
    echo 'NEXT_CURSOR=Classificar no Hermes os arquivos UNPROVEN e confirmar seus consumidores; depois comprovar cada owner no runtime.'
  else
    echo 'COVERAGE_GATE=ROUTING_COMPLETE_RUNTIME_UNPROVEN'
    echo 'NEXT_CURSOR=Conferir recibos por owner, runtime e consumidor no mesmo SHA. Roteamento nao equivale a deploy.'
  fi
  exit 0
fi
[[ -z "$AUDIT_FROM" && -z "$AUDIT_TO" ]] || {
  echo 'ARG_INVALID=--from/--to requerem --audit-coverage'; exit 2;
}

mkdir -p "$STATE_DIR"
touch "$LOG_FILE"
chmod 700 "$STATE_DIR"
chmod 600 "$LOG_FILE" 2>/dev/null || true

log() {
  printf '%s %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$*" | tee -a "$LOG_FILE"
}

exec 9>"$LOCK"
flock -n 9 || { log "PULSE_SKIP=LOCK_HELD trigger=$TRIGGER"; exit 75; }

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

# O checkout vivo pode conter trabalho local legítimo. O reconciliador não
# move HEAD nem apaga tracked dirty; a convergência material é feita por owner,
# com backup/rollback no microdeploy isolado. CURRENT continua explicitamente medido.
LIVE_HEAD="$(git -C "$REPO" rev-parse HEAD)"
if [[ "$LIVE_HEAD" == "$MAIN_SHA" ]]; then
  log "PULSE_LIVE_HEAD=CONVERGED head=$LIVE_HEAD main=$MAIN_SHA"
else
  tracked_dirty=0
  if ! git -C "$REPO" diff --quiet || ! git -C "$REPO" diff --cached --quiet; then
    tracked_dirty=1
  fi
  log "PULSE_LIVE_HEAD=DRIFT head=$LIVE_HEAD main=$MAIN_SHA tracked_dirty=$tracked_dirty note=owner_scoped_microdeploy_handles_convergence"
fi

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
  case "$(route_owner "$rel")" in
    mcp) MCP_FILES+=("$rel") ;;
    hub_bot) HUB_FILES+=("$rel") ;;
    hermes) HERMES_FILES+=("$rel") ;;
    oauth_broker) OAUTH_FILES+=("$rel") ;;
    unhandled) UNHANDLED+=("$rel") ;;
    *) log "PULSE_FAIL=ROUTE_UNKNOWN file=$rel"; exit 17 ;;
  esac
done
ROUTED_COUNT=$(( ${#MCP_FILES[@]} + ${#HUB_FILES[@]} + ${#HERMES_FILES[@]} + ${#OAUTH_FILES[@]} + ${#UNHANDLED[@]} ))
log "PULSE_COVERAGE expected=${#CHANGED[@]} accounted=$ROUTED_COUNT known=$(( ROUTED_COUNT - ${#UNHANDLED[@]} )) pending_classification=${#UNHANDLED[@]} runtime_e2e=UNPROVEN"
[[ "$ROUTED_COUNT" -eq "${#CHANGED[@]}" ]] || {
  log 'PULSE_FAIL=COVERAGE_MISMATCH'
  exit 18
}

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

# HERMES-CORE pode ser dependência importada pelo MCP. Promove o provider
# antes do consumidor para evitar janela de incompatibilidade entre owners.
deploy_owner hermes "${HERMES_FILES[@]}"
deploy_owner mcp "${MCP_FILES[@]}"
deploy_owner hub_bot "${HUB_FILES[@]}"
OAUTH_SKIPPED=0
if [[ "${#OAUTH_FILES[@]}" -gt 0 ]]; then
  if systemctl is-active --quiet centraldark-oauth-broker.service; then
    deploy_owner oauth_broker "${OAUTH_FILES[@]}"
  else
    OAUTH_SKIPPED=1
    log "OAUTH_BROKER_DEPLOY_SKIPPED=1 reason=RUNTIME_NOT_ACTIVE human_frontier=VAULT_KEY_OR_CONFIG_PENDING changed_files=${#OAUTH_FILES[@]} main=$MAIN_SHA"
  fi
fi

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
if [[ "${#UNHANDLED[@]}" -gt 0 || "$OAUTH_SKIPPED" -eq 1 ]]; then
  # O cursor é de ROTEAMENTO para impedir replay de deploy, não um selo de
  # execução. Classificação enfileirada != consumida; owner pulado != PASS.
  log "PULSE_PARTIAL from=$LAST_SHA to=$MAIN_SHA changed=${#CHANGED[@]} accounted=$ROUTED_COUNT mcp=${#MCP_FILES[@]} hub=${#HUB_FILES[@]} hermes=${#HERMES_FILES[@]} oauth=${#OAUTH_FILES[@]} oauth_skipped=$OAUTH_SKIPPED unhandled=${#UNHANDLED[@]} runtime_e2e=UNPROVEN checkpoint=ROUTING_ONLY trigger=$TRIGGER"
else
  log "PULSE_ROUTING_COMPLETE from=$LAST_SHA to=$MAIN_SHA changed=${#CHANGED[@]} accounted=$ROUTED_COUNT runtime_e2e=UNPROVEN checkpoint=ROUTING_ONLY trigger=$TRIGGER"
fi
