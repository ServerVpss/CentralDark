#!/usr/bin/env bash
# multizap-autopull
# Auto-deploy seguro do MultiZap-Gateway na VPS.
# Instalar em: /usr/local/bin/multizap-autopull  (chmod +x)
#
# Uso:
#   multizap-autopull --dry-run    # só mostra o que faria, não muda nada
#   multizap-autopull              # modo normal (chamado pelo cron de 1 min)
#
# Regras INVIOLÁVEIS:
# - Só reinicia o processo PM2 "MultiZap-Gateway"
# - Só dispara deploy se mudou algo em multizap-gateway-deploy/
# - Healthcheck em http://127.0.0.1:3100/health
# - Rollback automático conservador para PREV_HASH se /health falhar
# - NUNCA tocar: /root/whatsapp-server, porta 3000, webhook 9001,
#   Recargas Brasil, PIX, Meta Cloud, RLS/service_role, WuzAPI separado
# - NUNCA logar tokens/secrets

set -u
set -o pipefail

# ---------- Config ----------
REPO_DIR="/root/Multizap-repo"
DEPLOY_SCRIPT="/usr/local/bin/multizap-gh-pull"
PM2_PROC="MultiZap-Gateway"
HEALTH_URL="http://127.0.0.1:3100/health"
WATCH_PATH="multizap-gateway-deploy/"
LOCK_FILE="/tmp/multizap-autopull.lock"
LOG_FILE="/var/log/multizap-autopull.log"
STATE_DIR="/var/lib/multizap-autopull"
STATE_FILE="$STATE_DIR/state.json"
LOG_MAX_BYTES=$((10 * 1024 * 1024))  # 10 MB
HEALTH_RETRIES=3
HEALTH_SLEEP=2
RESTART_WAIT=5

DRY_RUN=0
if [ "${1:-}" = "--dry-run" ]; then
  DRY_RUN=1
fi

# ---------- Helpers ----------
ts() { date -u +"%Y-%m-%dT%H:%M:%SZ"; }

log() {
  local msg="[$(ts)] $*"
  if [ "$DRY_RUN" -eq 1 ]; then
    echo "$msg"
  else
    echo "$msg" | tee -a "$LOG_FILE" >/dev/null
    echo "$msg"
  fi
}

rotate_log() {
  [ -f "$LOG_FILE" ] || return 0
  local size
  size=$(stat -c%s "$LOG_FILE" 2>/dev/null || echo 0)
  if [ "$size" -gt "$LOG_MAX_BYTES" ]; then
    mv "$LOG_FILE" "${LOG_FILE}.1"
    : > "$LOG_FILE"
  fi
}

write_state() {
  # args: last_hash prev_hash health_ok rolled_back summary
  local last_hash="$1" prev_hash="$2" health_ok="$3" rolled_back="$4" summary="$5"
  mkdir -p "$STATE_DIR"
  # JSON safe: summary não deve conter aspas duplas (sanitiza)
  summary=$(printf '%s' "$summary" | tr -d '"' | tr '\n' ' ')
  cat > "$STATE_FILE" <<EOF
{
  "last_hash": "$last_hash",
  "prev_hash": "$prev_hash",
  "deployed_at": "$(ts)",
  "health_ok": $health_ok,
  "rolled_back": $rolled_back,
  "deploy_summary": "$summary"
}
EOF
}

healthcheck() {
  local i=1
  while [ "$i" -le "$HEALTH_RETRIES" ]; do
    if curl -fsS --max-time 5 "$HEALTH_URL" >/dev/null 2>&1; then
      return 0
    fi
    sleep "$HEALTH_SLEEP"
    i=$((i + 1))
  done
  return 1
}

# ---------- Lock ----------
if [ "$DRY_RUN" -eq 0 ]; then
  exec 9>"$LOCK_FILE"
  if ! flock -n 9; then
    # Já tem outro rodando — sai silencioso
    exit 0
  fi
  rotate_log
fi

# ---------- Pré-checks ----------
if [ ! -d "$REPO_DIR/.git" ]; then
  log "ERRO: repo não encontrado em $REPO_DIR"
  exit 1
fi
if [ ! -x "$DEPLOY_SCRIPT" ]; then
  log "ERRO: $DEPLOY_SCRIPT não existe ou não é executável"
  exit 1
fi

cd "$REPO_DIR" || { log "ERRO: cd $REPO_DIR falhou"; exit 1; }

# ---------- Fetch ----------
if ! git fetch origin main --quiet 2>/dev/null; then
  log "ERRO: git fetch falhou"
  exit 1
fi

LOCAL_HASH=$(git rev-parse HEAD)
REMOTE_HASH=$(git rev-parse origin/main)

if [ "$DRY_RUN" -eq 1 ]; then
  echo "=== multizap-autopull DRY-RUN ==="
  echo "Repo:        $REPO_DIR"
  echo "Hash local:  $LOCAL_HASH"
  echo "Hash remoto: $REMOTE_HASH"
  if [ "$LOCAL_HASH" = "$REMOTE_HASH" ]; then
    echo "Resultado:   SEM mudança. Nada a fazer."
    exit 0
  fi
  echo "Resultado:   teria pull (hashes diferentes)."
  echo ""
  echo "--- Arquivos alterados (origin/main vs local) ---"
  CHANGED=$(git diff --name-only "$LOCAL_HASH" "$REMOTE_HASH")
  echo "$CHANGED"
  echo ""
  GATEWAY_CHANGED=$(echo "$CHANGED" | grep -c "^${WATCH_PATH}" || true)
  if [ "$GATEWAY_CHANGED" -gt 0 ]; then
    echo "==> AFETA multizap-gateway-deploy/ ($GATEWAY_CHANGED arquivo(s))"
    echo "    Teria: multizap-gh-pull + pm2 restart $PM2_PROC + healthcheck"
  else
    echo "==> NÃO afeta multizap-gateway-deploy/"
    echo "    Teria: multizap-gh-pull (sem reinício PM2)"
  fi
  exit 0
fi

# ---------- Modo normal ----------
if [ "$LOCAL_HASH" = "$REMOTE_HASH" ]; then
  # Sem mudança — sai silencioso, sem poluir log
  exit 0
fi

CHANGED=$(git diff --name-only "$LOCAL_HASH" "$REMOTE_HASH")
GATEWAY_CHANGED_COUNT=$(echo "$CHANGED" | grep -c "^${WATCH_PATH}" || true)
TOTAL_CHANGED=$(echo "$CHANGED" | wc -l | tr -d ' ')

log "Detectado novo commit: $LOCAL_HASH -> $REMOTE_HASH ($TOTAL_CHANGED arquivo(s), gateway=$GATEWAY_CHANGED_COUNT)"

PREV_HASH="$LOCAL_HASH"
SUMMARY="$TOTAL_CHANGED arquivo(s), $GATEWAY_CHANGED_COUNT no gateway"

if [ "$GATEWAY_CHANGED_COUNT" -eq 0 ]; then
  # Nada no gateway — só sincroniza, não reinicia
  log "Nada em $WATCH_PATH — só sincronizando, sem restart PM2"
  if "$DEPLOY_SCRIPT" >>"$LOG_FILE" 2>&1; then
    log "Pull OK (sem restart)"
    write_state "$REMOTE_HASH" "$PREV_HASH" "true" "false" "$SUMMARY (sem restart)"
    exit 0
  else
    log "ERRO: multizap-gh-pull falhou (sem restart)"
    write_state "$PREV_HASH" "$PREV_HASH" "true" "false" "FALHA no pull sem restart"
    exit 1
  fi
fi

# ---------- Deploy do gateway ----------
log "Deploy do gateway: rodando $DEPLOY_SCRIPT"
if ! "$DEPLOY_SCRIPT" >>"$LOG_FILE" 2>&1; then
  log "ERRO: multizap-gh-pull falhou — abortando sem restart"
  write_state "$PREV_HASH" "$PREV_HASH" "false" "false" "FALHA no multizap-gh-pull"
  exit 1
fi

log "Reiniciando PM2: $PM2_PROC"
if ! pm2 restart "$PM2_PROC" >>"$LOG_FILE" 2>&1; then
  log "ERRO: pm2 restart $PM2_PROC falhou"
  write_state "$REMOTE_HASH" "$PREV_HASH" "false" "false" "FALHA no pm2 restart"
  exit 1
fi

sleep "$RESTART_WAIT"

if healthcheck; then
  log "Healthcheck OK ($HEALTH_URL) — deploy concluído $REMOTE_HASH"
  write_state "$REMOTE_HASH" "$PREV_HASH" "true" "false" "$SUMMARY (OK)"
  exit 0
fi

# ---------- Rollback ----------
log "FALHA no healthcheck — iniciando ROLLBACK para $PREV_HASH"

if ! git reset --hard "$PREV_HASH" >>"$LOG_FILE" 2>&1; then
  log "ERRO CRÍTICO: git reset --hard $PREV_HASH falhou"
  write_state "$REMOTE_HASH" "$PREV_HASH" "false" "false" "ROLLBACK FALHOU no git reset"
  exit 1
fi

if ! "$DEPLOY_SCRIPT" >>"$LOG_FILE" 2>&1; then
  log "ERRO CRÍTICO: multizap-gh-pull falhou no rollback"
  write_state "$PREV_HASH" "$PREV_HASH" "false" "true" "ROLLBACK FALHOU no deploy script"
  exit 1
fi

if ! pm2 restart "$PM2_PROC" >>"$LOG_FILE" 2>&1; then
  log "ERRO CRÍTICO: pm2 restart $PM2_PROC falhou no rollback"
  write_state "$PREV_HASH" "$PREV_HASH" "false" "true" "ROLLBACK FALHOU no pm2"
  exit 1
fi

sleep "$RESTART_WAIT"

if healthcheck; then
  log "ROLLBACK OK — voltou para $PREV_HASH (commit ruim: $REMOTE_HASH)"
  write_state "$PREV_HASH" "$PREV_HASH" "true" "true" "Rollback do commit $REMOTE_HASH OK"
  exit 0
else
  log "ERRO CRÍTICO: /health ainda falha APÓS rollback — intervenção manual"
  write_state "$PREV_HASH" "$PREV_HASH" "false" "true" "Rollback feito mas /health continua falhando"
  exit 1
fi
