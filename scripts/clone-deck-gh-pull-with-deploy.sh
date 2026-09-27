#!/usr/bin/env bash
# Nome legado preservado por compatibilidade de chamadores. O comportamento
# canônico é exclusivamente ServerVpss/CentralDark em /root/CentralDark.
set -Eeuo pipefail

REPO_DIR="${CENTRALDARK_ROOT:-/root/CentralDark}"
BRANCH="main"

case "$REPO_DIR" in
  /root/CentralDark) ;;
  *) printf '[ERRO] ROOT_FORA_DA_CENTRALDARK=%s\n' "$REPO_DIR" >&2; exit 20 ;;
esac

DISPATCHER="$REPO_DIR/scripts/vps/deploy-guards-dispatcher.sh"
[ -x "$DISPATCHER" ] || { printf '[ERRO] CANONICAL_DEPLOY_GATE_MISSING\n' >&2; exit 28; }
if ! REPO_DIR="$REPO_DIR" BRANCH="$BRANCH" bash "$DISPATCHER" --gate-only; then
  printf '[ERRO] CANONICAL_TLC23_DEPLOY_GATE_BLOCK\n' >&2
  exit 29
fi
GATED_SHA="$(git -C "$REPO_DIR" rev-parse "origin/$BRANCH")"

LOG_DIR="${REPO_DIR}/logs"
LOG="${LOG_DIR}/github-sync.log"
LOCK="/tmp/centraldark-gh-pull.lock"
EXPECTED_ORIGIN_RE='^(git@github\.com:|https://github\.com/|ssh://git@github\.com/)ServerVpss/CentralDark(\.git)?$'

ts() { date '+%Y-%m-%d %H:%M:%S'; }
mkdir -p "$LOG_DIR"

exec 200>"$LOCK"
if ! flock -n 200; then
  echo "[$(ts)] [LOCK] Outra sincronização CentralDark em andamento" >> "$LOG"
  echo "LOCKED_SYNC_IN_PROGRESS"
  exit 0
fi

echo "===== $(ts) =====" >> "$LOG"

if [ ! -d "$REPO_DIR/.git" ]; then
  echo "[ERRO] REPO_CANONICO_AUSENTE=$REPO_DIR" | tee -a "$LOG"
  exit 21
fi

ORIGIN="$(git -C "$REPO_DIR" remote get-url origin 2>/dev/null || true)"
if ! printf '%s' "$ORIGIN" | grep -Eq "$EXPECTED_ORIGIN_RE"; then
  echo "[ERRO] ORIGIN_REPOSITORY_MISMATCH" | tee -a "$LOG"
  exit 22
fi

CURRENT="$(git -C "$REPO_DIR" symbolic-ref --quiet --short HEAD || true)"
if [ "$CURRENT" != "$BRANCH" ]; then
  echo "[ERRO] BRANCH_NAO_CANONICA=${CURRENT:-DETACHED}" | tee -a "$LOG"
  exit 23
fi

# Não esconde trabalho local com stash/rebase automático. Dirty tracked bloqueia
# a sincronização; nenhum dado local é sobrescrito ou mascarado.
DIRTY_TRACKED="$(git -C "$REPO_DIR" status --porcelain=v1 --untracked-files=no)"
if [ -n "$DIRTY_TRACKED" ]; then
  echo "[ERRO] BLOCKED_LOCAL_DIRTY" | tee -a "$LOG"
  exit 24
fi

BEFORE="$(git -C "$REPO_DIR" rev-parse HEAD)"
REMOTE="$GATED_SHA"

if [ "$BEFORE" = "$REMOTE" ]; then
  echo "[OK] ALREADY_SYNCED=$BEFORE" >> "$LOG"
  echo "SYNC_OK HEAD=$BEFORE CHANGED=0"
  exit 0
fi

if ! git -C "$REPO_DIR" merge-base --is-ancestor "$BEFORE" "$REMOTE"; then
  echo "[ERRO] NON_FAST_FORWARD_LOCAL_OR_REMOTE_DIVERGENCE" | tee -a "$LOG"
  exit 25
fi

git -C "$REPO_DIR" merge --ff-only "$REMOTE" >> "$LOG" 2>&1
AFTER="$(git -C "$REPO_DIR" rev-parse HEAD)"
[ "$AFTER" = "$REMOTE" ] || { echo "[ERRO] HEAD_POST_SYNC_MISMATCH" | tee -a "$LOG"; exit 26; }

echo "[OK] $BEFORE -> $AFTER" >> "$LOG"

# Deploy não é duplicado aqui. O mecanismo canônico de produção permanece o
# workflow existente vps-exec-selfhosted.yml. Este script apenas sincroniza.
# Um chamador legado pode solicitar explicitamente o deploy-job já existente,
# nunca um workflow paralelo.
if [ "${CENTRALDARK_RUN_DEPLOY_JOB:-0}" = "1" ]; then
  DEPLOY_JOB="$REPO_DIR/scripts/webhook/deploy-job.sh"
  [ -x "$DEPLOY_JOB" ] || { echo "[ERRO] DEPLOY_JOB_CANONICO_AUSENTE" | tee -a "$LOG"; exit 27; }
  "$DEPLOY_JOB" >> "$LOG" 2>&1
fi

echo "SYNC_OK HEAD=$AFTER CHANGED=1"
