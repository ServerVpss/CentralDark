#!/bin/bash
# ══════════════════════════════════════════════════════════════
# POST-DEPLOY v4: Auto-tudo seguro
#
# Regras:
#   - Ignora done/, failed/, quarentena-local/
#   - Usa lock para evitar execução simultânea
#   - Se PM2 ficar vazio, tenta pm2 resurrect
#   - Nunca usa pm2 restart all
#   - Nunca para WuzAPI
#   - Nunca reseta sessão WhatsApp
#   - Salva logs em /root/Multizap/revisoes/
# ══════════════════════════════════════════════════════════════
set -uo pipefail

CLONE_DECK="/root/Multizap/apps/clone-deck"
WABOT_ENV="/root/Multizap/secrets/wabot.env"
LOG="/var/log/clone-deck-post-deploy.log"
LOCKFILE="/tmp/clone-deck-post-deploy.lock"
REV="/root/Multizap/revisoes/$(date +%Y%m%d-%H%M%S)/post-deploy-v4"
RUN_ONCE_STATE="/root/Multizap/revisoes/run-once-state"
RUN065_STATUS="pulou"

ts()  { date '+%Y-%m-%d %H:%M:%S'; }
log() { echo "[$(ts)] $*" >> "$LOG" 2>/dev/null; echo "[$(ts)] $*"; }

# Lock
if ! mkdir "$LOCKFILE" 2>/dev/null; then
  log "❌ LOCK: post-deploy já em execução. Abortando."
  exit 1
fi
trap 'rm -rf "$LOCKFILE"' EXIT

mkdir -p "$REV"/{logs,diagnostico} "$RUN_ONCE_STATE"
exec > >(tee -a "$REV/logs/execucao.log") 2>&1

log "=== POST-DEPLOY v4 START ==="
log "Revisão: $REV"

# ──────────────────────────────────────────────
# 0. DIAGNÓSTICO INICIAL
# ──────────────────────────────────────────────
log "[0/8] Diagnóstico inicial..."
pm2 list --no-color > "$REV/diagnostico/pm2-antes.txt" 2>&1 || true
ss -ltnp > "$REV/diagnostico/portas-antes.txt" 2>&1

ONLINE=$(grep -c "online" "$REV/diagnostico/pm2-antes.txt" 2>/dev/null || echo "0")
log "PM2 antes: $ONLINE processos online"

if [ "$ONLINE" -eq 0 ]; then
  log "⚠️ PM2 vazio. Tentando pm2 resurrect..."
  pm2 resurrect 2>&1 | head -5 || true
  sleep 3
  pm2 list --no-color > "$REV/diagnostico/pm2-apos-resurrect.txt" 2>&1
  ONLINE=$(grep -c "online" "$REV/diagnostico/pm2-apos-resurrect.txt" 2>/dev/null || echo "0")
  log "PM2 após resurrect: $ONLINE processos online"
fi

# ──────────────────────────────────────────────
# 1. Webhook listener
# ──────────────────────────────────────────────
log "[1/8] Webhook listener..."
WEBHOOK_DIR="/root/clone-deck-webhook"
NEW_LISTENER="$CLONE_DECK/infra/clone-deck-webhook-deploy/clone-deck-github-webhook-listener.js"
OLD_LISTENER="$WEBHOOK_DIR/clone-deck-github-webhook-listener.js"
if [ -f "$NEW_LISTENER" ] && [ -f "$OLD_LISTENER" ]; then
  if ! grep -q "POST_DEPLOY" "$OLD_LISTENER" 2>/dev/null; then
    cp "$OLD_LISTENER" "${OLD_LISTENER}.backup" 2>/dev/null
    cp "$NEW_LISTENER" "$OLD_LISTENER"
    if pm2 list 2>/dev/null | grep -q "CloneDeck-GitHub-Webhook"; then
      pm2 restart CloneDeck-GitHub-Webhook > /dev/null 2>&1 || true
    fi
    log "✅ Webhook listener atualizado"
  fi
fi

# ──────────────────────────────────────────────
# 2. Pull script
# ──────────────────────────────────────────────
log "[2/8] Pull script..."
PULL_SCRIPT="/usr/local/bin/clone-deck-gh-pull"
NEW_PULL="$CLONE_DECK/scripts/clone-deck-gh-pull-with-deploy.sh"
if [ -f "$NEW_PULL" ] && [ -f "$PULL_SCRIPT" ]; then
  if ! cmp -s "$NEW_PULL" "$PULL_SCRIPT"; then
    cp "$PULL_SCRIPT" "${PULL_SCRIPT}.backup" 2>/dev/null
    cp "$NEW_PULL" "$PULL_SCRIPT"
    chmod +x "$PULL_SCRIPT"
    log "✅ Pull script atualizado e sincronizado"
  fi
fi

cd "$CLONE_DECK" || exit 1

# ──────────────────────────────────────────────
# 3. Limpeza segura
# ──────────────────────────────────────────────
log "[3/8] Limpeza..."
CLEAN_SCRIPT="$CLONE_DECK/scripts/vps-clean-clone-deck-untracked.sh"
[ -f "$CLEAN_SCRIPT" ] && bash "$CLEAN_SCRIPT" >> "$REV/logs/cleanup.log" 2>&1 || log "  cleanup pulado"

# ──────────────────────────────────────────────
# 4. Bridge (WuzAPI → Supabase)
# ──────────────────────────────────────────────
log "[4/8] Bridge..."
BRIDGE_DIR="$CLONE_DECK/apps/bot/server/src/bridge"
if [ -d "$BRIDGE_DIR" ]; then
  cd "$BRIDGE_DIR"
  [ ! -d "node_modules" ] && { npm init -y > /dev/null 2>&1; npm install dotenv > /dev/null 2>&1; }
  for sf in supabase-sync.cjs supabase-sync.js; do
    [ -f "$sf" ] && SYNC_FILE="$sf" && break
  done
  if [ -n "${SYNC_FILE:-}" ]; then
    if pm2 list 2>/dev/null | grep -q 'CloneDeck-Supabase-Sync'; then
      pm2 restart CloneDeck-Supabase-Sync > /dev/null 2>&1
    else
      pm2 start "$SYNC_FILE" --name CloneDeck-Supabase-Sync > /dev/null 2>&1
    fi
    log "✅ Bridge ok"
  fi
fi

# ──────────────────────────────────────────────
# 5. Telegram Bot
# ──────────────────────────────────────────────
log "[5/8] Telegram..."
TELEGRAM_DIR="$CLONE_DECK/apps/bot/integracoes/telegram"
if [ -f "$TELEGRAM_DIR/bot.cjs" ]; then
  cd "$TELEGRAM_DIR"
  [ ! -d "node_modules" ] && { npm init -y > /dev/null 2>&1; npm install dotenv > /dev/null 2>&1; }
  if [ -f "$WABOT_ENV" ] && grep -q 'TELEGRAM_BOT_TOKEN' "$WABOT_ENV" 2>/dev/null; then
    if pm2 list 2>/dev/null | grep -q 'MultiZap-TelegramBot'; then
      pm2 restart MultiZap-TelegramBot > /dev/null 2>&1
    else
      pm2 start bot.cjs --name MultiZap-TelegramBot > /dev/null 2>&1
    fi
    log "✅ Telegram ok"
  fi
fi

# ──────────────────────────────────────────────
# 6. Webhook WuzAPI → Gateway (:3100)
# ──────────────────────────────────────────────
log "[6/8] Webhook WuzAPI..."
[ -f "$WABOT_ENV" ] && set -a && source "$WABOT_ENV" 2>/dev/null && set +a
GW_DIR="$CLONE_DECK/apps/crm/atendimento-whatsapp-gateway-deploy/gateway"
[ -f "${GW_DIR}/.env" ] && set -a && source "${GW_DIR}/.env" 2>/dev/null && set +a

WUZAPI_BASE="${WUZAPI_URL:-${WUZAPI_BASE_URL:-http://127.0.0.1:8081}}"
WUZAPI_TK="${WUZAPI_ADMIN_TOKEN:-admin}"
WH_SECRET="${WUZAPI_WEBHOOK_SECRET:-}"

USERS=$(curl -s --connect-timeout 5 "${WUZAPI_BASE}/admin/users" -H "Authorization: ${WUZAPI_TK}" 2>/dev/null || echo "")
if [ -n "$USERS" ] && [ "$USERS" != "[]" ]; then
  echo "$USERS" | python3 -c "
import sys, json, urllib.request
wuza='${WUZAPI_BASE}'; tk='${WUZAPI_TK}'; sec='${WH_SECRET}'
url='http://127.0.0.1:3100/webhooks/wuzapi?secret=' + sec
evts=['Message','ReadReceipt','HistorySync','ChatPresence']
try:
    data = json.load(sys.stdin)
    users = data if isinstance(data, list) else data.get('data', data.get('users', []))
    for u in users:
        token = u.get('token', u.get('Token', ''))
        if not token: continue
        try:
            body = json.dumps({'webhookURL': url, 'Subscribe': evts, 'events': ','.join(evts)}).encode()
            req = urllib.request.Request(f'{wuza}/webhook', data=body, headers={'token': token, 'Content-Type': 'application/json'}, method='POST')
            urllib.request.urlopen(req, timeout=5)
        except Exception:
            pass
except Exception:
    pass
" >> "$REV/logs/wuzapi-webhook.log" 2>&1 || true
  log "✅ Webhook WuzAPI → Gateway :3100"
fi

# ──────────────────────────────────────────────
# 7. Validação final + PM2 save
# ──────────────────────────────────────────────
log "[7/8] Validação final..."

pm2 list --no-color > "$REV/diagnostico/pm2-depois.txt" 2>&1
ONLINE_DEPOIS=$(grep -c "online" "$REV/diagnostico/pm2-depois.txt" 2>/dev/null || echo "0")

if [ "$ONLINE_DEPOIS" -eq 0 ]; then
  log "⚠️ PM2 ficou vazio. Tentando resurrect..."
  pm2 resurrect 2>/dev/null || true
  sleep 3
  pm2 list --no-color > "$REV/diagnostico/pm2-resurrect-final.txt" 2>&1
  ONLINE_DEPOIS=$(grep -c "online" "$REV/diagnostico/pm2-resurrect-final.txt" 2>/dev/null || echo "0")
fi

pm2 save > /dev/null 2>&1
log "✅ PM2 salvo ($ONLINE_DEPOIS processos online)"

HEALTH_OK=0
HEALTH_FAIL=0
for ep in "http://127.0.0.1:3100/health" "http://127.0.0.1:9003/health"; do
  CODE=$(curl -sk -o /dev/null -w "%{http_code}" --connect-timeout 5 "$ep" 2>/dev/null || echo "000")
  if [ "$CODE" = "200" ]; then
    log "  ✅ $ep → $CODE"
    HEALTH_OK=$((HEALTH_OK+1))
  else
    log "  ⚠️ $ep → $CODE"
    HEALTH_FAIL=$((HEALTH_FAIL+1))
  fi
done

# ──────────────────────────────────────────────
# 7.1 Run-once seguro: analise QR/Bot
# ──────────────────────────────────────────────
RUN065_DONE="$RUN_ONCE_STATE/065-analisar-qr-bot.done"
RUN065_SCRIPT="$CLONE_DECK/scripts/run-once/065-analisar-qr-bot.sh"
if [ -f "$RUN065_SCRIPT" ] && [ ! -f "$RUN065_DONE" ]; then
  log "[7.1/8] Run-once 065 analise QR/Bot..."
  chmod +x "$RUN065_SCRIPT" || true
  if bash "$RUN065_SCRIPT" >> "$REV/logs/run-once-065.log" 2>&1; then
    date '+%Y-%m-%d %H:%M:%S' > "$RUN065_DONE"
    RUN065_STATUS="ok"
    log "✅ Run-once 065 executado"
  else
    RUN065_STATUS="atencao"
    log "⚠️ Run-once 065 retornou alerta; consultar $REV/logs/run-once-065.log"
  fi
else
  RUN065_STATUS="pulou"
  log "Run-once 065 pulado"
fi

# ──────────────────────────────────────────────
# 8. Relatório
# ──────────────────────────────────────────────
log "[8/8] Relatório..."
cat > "$REV/resumo.md" << RESUMO
# Post-Deploy v4

**Data:** $(date)
**Revisão:** $REV

## Resultado

- PM2 online: $ONLINE_DEPOIS processos
- Health checks locais: $HEALTH_OK OK / $HEALTH_FAIL falhas
- Run-once 065 analise QR/Bot: $RUN065_STATUS

## Observações

- Post-deploy v4 usa lock para evitar execução simultânea
- Se PM2 ficou vazio, pm2 resurrect foi tentado automaticamente
- Run-once 065 é diagnóstico não destrutivo e não mexe no CRM
RESUMO

log "=== POST-DEPLOY v4 DONE ($HEALTH_OK health OK, $HEALTH_FAIL health fail, run065=$RUN065_STATUS) ==="
