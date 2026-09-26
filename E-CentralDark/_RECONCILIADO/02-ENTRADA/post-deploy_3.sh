#!/bin/bash
# ══════════════════════════════════════════════════════════════
# POST-DEPLOY v2: Auto-tudo
# - Atualiza webhook listener (se versão nova disponível)
# - Instala pull script com post-deploy
# - Inicia/reinicia Bridge + Telegram bot
# ══════════════════════════════════════════════════════════════
set -uo pipefail

CLONE_DECK="/root/Multizap/apps/clone-deck"
# Após a reorganização, o código vivo do bot ficou em apps/bot/. Se existir, usar esse caminho.
BOT_ROOT="$CLONE_DECK/apps/bot"
[ -d "$BOT_ROOT/server/src/bridge" ] || BOT_ROOT="$CLONE_DECK"
WABOT_ENV="/root/Multizap/secrets/wabot.env"
LOG="/var/log/clone-deck-post-deploy.log"

ts() { date '+%Y-%m-%d %H:%M:%S'; }
log() { echo "[$(ts)] $1" >> "$LOG" 2>/dev/null; }

log "=== POST-DEPLOY v2 START ==="

# 0. ATUALIZAR WEBHOOK LISTENER (se versão nova com post-deploy)
WEBHOOK_DIR="/root/clone-deck-webhook"
NEW_LISTENER="$CLONE_DECK/clone-deck-webhook-deploy/clone-deck-github-webhook-listener.js"
OLD_LISTENER="$WEBHOOK_DIR/clone-deck-github-webhook-listener.js"
if [ -f "$NEW_LISTENER" ] && [ -f "$OLD_LISTENER" ]; then
  if ! grep -q "POST_DEPLOY" "$OLD_LISTENER" 2>/dev/null; then
    cp "$OLD_LISTENER" "${OLD_LISTENER}.backup" 2>/dev/null
    cp "$NEW_LISTENER" "$OLD_LISTENER"
    # Reiniciar APENAS o webhook do clone-deck
    pm2 restart CloneDeck-GitHub-Webhook > /dev/null 2>&1 || true
    log "[OK] Webhook listener atualizado com post-deploy"
  fi
fi

# 1. ATUALIZAR PULL SCRIPT
PULL_SCRIPT="/usr/local/bin/clone-deck-gh-pull"
NEW_PULL="$CLONE_DECK/scripts/clone-deck-gh-pull-with-deploy.sh"
if [ -f "$NEW_PULL" ] && [ -f "$PULL_SCRIPT" ]; then
  if ! grep -q "post-deploy" "$PULL_SCRIPT" 2>/dev/null; then
    cp "$PULL_SCRIPT" "${PULL_SCRIPT}.backup" 2>/dev/null
    cp "$NEW_PULL" "$PULL_SCRIPT"
    chmod +x "$PULL_SCRIPT"
    log "[OK] Pull script atualizado"
  fi
fi

cd "$CLONE_DECK" || exit 1

# 2. BRIDGE (WuzAPI → Supabase)
BRIDGE_DIR="$BOT_ROOT/server/src/bridge"
if [ -d "$BRIDGE_DIR" ]; then
  cd "$BRIDGE_DIR"
  [ ! -d "node_modules" ] && { npm init -y > /dev/null 2>&1; npm install dotenv > /dev/null 2>&1; }
  
  SYNC_FILE=""
  [ -f "supabase-sync.cjs" ] && SYNC_FILE="supabase-sync.cjs"
  [ -f "supabase-sync.js" ] && SYNC_FILE="supabase-sync.js"
  
  if [ -n "$SYNC_FILE" ]; then
    if pm2 list 2>/dev/null | grep -q 'CloneDeck-Supabase-Sync'; then
      pm2 restart CloneDeck-Supabase-Sync > /dev/null 2>&1
      log "[OK] Bridge reiniciado"
    else
      pm2 start "$SYNC_FILE" --name CloneDeck-Supabase-Sync > /dev/null 2>&1
      log "[OK] Bridge iniciado"
    fi
  fi
fi

# 3. TELEGRAM BOT
TELEGRAM_DIR="$BOT_ROOT/integracoes/telegram"
if [ -f "$TELEGRAM_DIR/bot.cjs" ]; then
  cd "$TELEGRAM_DIR"
  [ ! -d "node_modules" ] && { npm init -y > /dev/null 2>&1; npm install dotenv > /dev/null 2>&1; }

  HAS_TOKEN=0
  [ -f "$WABOT_ENV" ] && HAS_TOKEN=$(grep -c 'TELEGRAM_BOT_TOKEN' "$WABOT_ENV" 2>/dev/null || echo "0")

  if [ "$HAS_TOKEN" -gt 0 ]; then
    if pm2 list 2>/dev/null | grep -q 'MultiZap-TelegramBot'; then
      pm2 restart MultiZap-TelegramBot > /dev/null 2>&1
      log "[OK] Telegram bot reiniciado"
    else
      pm2 start bot.cjs --name MultiZap-TelegramBot > /dev/null 2>&1
      log "[OK] Telegram bot iniciado"
    fi
  fi
fi

pm2 save > /dev/null 2>&1
log "=== POST-DEPLOY v2 DONE ==="

# 4. SYNC CONEXÕES DO GATEWAY → SUPABASE
SYNC_SCRIPT="$CLONE_DECK/scripts/sync-connections.sh"
if [ -f "$SYNC_SCRIPT" ]; then
  log "[SYNC] Sincronizando conexões Gateway → Supabase..."
  bash "$SYNC_SCRIPT" >> "$LOG" 2>&1 || log "[WARN] sync-connections falhou"
fi

# 5. DIAGNÓSTICO
DIAG_SCRIPT="$CLONE_DECK/scripts/diag-vps.sh"
if [ -f "$DIAG_SCRIPT" ]; then
  bash "$DIAG_SCRIPT" >> "$LOG" 2>&1 || true
fi

# 6. CONFIGURAR WUZAPI WEBHOOK (apontar para nosso receiver)
[ -f "$WABOT_ENV" ] && set -a && source "$WABOT_ENV" 2>/dev/null && set +a
GW_DIR="${GATEWAY_DIR:-/root/Multizap/gateway}"
[ -f "${GW_DIR}/.env" ] && set -a && source "${GW_DIR}/.env" 2>/dev/null && set +a
WUZAPI_BASE="${WUZAPI_URL:-${WUZAPI_BASE_URL:-http://127.0.0.1:8081}}"
WUZAPI_TK="${WUZAPI_ADMIN_TOKEN:-admin}"

# Listar sessões e configurar webhook em cada uma
USERS=$(curl -s --connect-timeout 5 "${WUZAPI_BASE}/admin/users" -H "Authorization: ${WUZAPI_TK}" 2>/dev/null)
if [ -n "$USERS" ]; then
  echo "$USERS" | python3 -c "
import sys, json, urllib.request
WUZAPI='${WUZAPI_BASE}'
TK='${WUZAPI_TK}'
WEBHOOK_URL='http://127.0.0.1:5000/api/webhooks/wuzapi'
try:
    data = json.load(sys.stdin)
    users = data.get('data',[]) if isinstance(data,dict) else data
    for u in users:
        name = u.get('name',u.get('Name',''))
        token = u.get('token',u.get('Token',''))
        if not name: continue
        # Configurar webhook via WuzAPI
        try:
            body = json.dumps({'url':WEBHOOK_URL}).encode()
            req = urllib.request.Request(f'{WUZAPI}/session/webhook',
                data=body, headers={'Token':token or TK,'Content-Type':'application/json'}, method='POST')
            urllib.request.urlopen(req, timeout=5)
            print(f'  Webhook configurado: {name} → {WEBHOOK_URL}')
        except Exception as e:
            print(f'  Webhook falhou: {name} ({e})')
except: pass
" >> "$LOG" 2>&1 || true
fi

# 9. PATCH GATEWAY: dual-forward (CRM + Supabase)
PATCH_SCRIPT="$CLONE_DECK/scripts/patch-gateway-dual-forward.sh"
if [ -f "$PATCH_SCRIPT" ]; then
  bash "$PATCH_SCRIPT" >> "$LOG" 2>&1 || log "[WARN] Gateway patch falhou"
fi

# 10. FORÇAR RESTART DO GATEWAY (garantir patch ativo)
pm2 restart MultiZap-Gateway > /dev/null 2>&1 && log "[OK] Gateway reiniciado" || log "[WARN] Gateway restart falhou"


# 11. WEBHOOK RECEIVER (porta 5000 — processo separado, sem crashar o sync)
RECEIVER="$CLONE_DECK/server/src/bridge/webhook-receiver.cjs"
if [ -f "$RECEIVER" ]; then
  if pm2 list 2>/dev/null | grep -q 'CloneDeck-Receiver'; then
    pm2 restart CloneDeck-Receiver > /dev/null 2>&1
    log "[OK] Receiver reiniciado"
  else
    pm2 start "$RECEIVER" --name CloneDeck-Receiver > /dev/null 2>&1
    log "[OK] Receiver iniciado na porta 5000"
  fi
fi
