# COMANDO - post-deploy.sh
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\apps\bot\scripts\post-deploy.sh
**SHA:** 29426e9e7d4c4484
**Timestamp:** 2026-08-26T19:30:53.558390
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- log "=== POST-DEPLOY v2 START ==="

### Ouro Bruto (primeiros 5000 chars)
```
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
    
```

---

# COMANDO - post-deploy.sh
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\infra\scripts\post-deploy.sh
**SHA:** ed81cdd268b61222
**Timestamp:** 2026-08-26T19:32:50.055782
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- log "=== POST-DEPLOY v4 START ==="

### Ouro Bruto (primeiros 5000 chars)
```
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

ts()  { date '+%Y-%m-%d %H:%M:%S'; }
log() { echo "[$(ts)] $*" >> "$LOG" 2>/dev/null; echo "[$(ts)] $*"; }

# Lock
if ! mkdir "$LOCKFILE" 2>/dev/null; then
  log "❌ LOCK: post-deploy já em execução. Abortando."
  exit 1
fi
trap 'rm -rf "$LOCKFILE"' EXIT

mkdir -p "$REV"/{logs,diagnostico}
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
  if ! grep -q "post-deploy" "$PULL_SCRIPT" 2>/dev/null; then
    cp "$PULL_SCRIPT" "${PULL_SCRIPT}.backup" 2>/dev/null
    cp "$NEW_PULL" "$PULL_SCRIPT"
    chmod +x "$PULL_SCRIPT"
    log "✅ Pull script atualizado"
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

# ────────────────────────────────────────────
```

---

# COMANDO - post-deploy.sh
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\scripts\post-deploy.sh
**SHA:** d3aa54bc3ba7bcd6
**Timestamp:** 2026-08-26T19:32:50.563502
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- log "=== POST-DEPLOY v4 START ==="

### Ouro Bruto (primeiros 5000 chars)
```
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
      pm2 start bot.cjs --name MultiZap-TelegramBot > /dev/
```