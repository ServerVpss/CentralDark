#!/bin/bash
# ══════════════════════════════════════════════════════════════
# RUN-ONCE 016: EMERGENCIA - Subir Gateway + Landing + CRM
# ══════════════════════════════════════════════════════════════
set -uo pipefail

CLONE_DECK="/root/Multizap/apps/clone-deck"
LOG="/var/log/clone-deck-post-deploy.log"

log() { echo "[$(date '+%H:%M:%S')] $*" | tee -a "$LOG"; }

log "=== 016: EMERGENCIA - Subir tudo ==="

# 1. GATEWAY - forcar inicio
log "[1/6] Gateway..."
GW_DIR="$CLONE_DECK/apps/crm/atendimento-whatsapp-gateway-deploy/gateway"
if [ -d "$GW_DIR" ]; then
  cd "$GW_DIR"
  if [ ! -d "node_modules" ]; then
    npm install --silent 2>/dev/null || true
  fi
  pm2 delete MultiZap-Gateway 2>/dev/null || true
  pm2 start server.js --name MultiZap-Gateway 2>&1 || true
  sleep 2
  curl -s http://127.0.0.1:3100/health | head -1 && log "  ✅ Gateway online" || log "  ❌ Gateway offline"
fi

# 2. WEBHOOK - reiniciar
log "[2/6] Webhook..."
pm2 restart CloneDeck-GitHub-Webhook 2>/dev/null || log "  ⚠️ Webhook nao encontrado"

# 3. LANDING PAGE - copiar direto
log "[3/6] Landing page..."
for dest in /var/www/multizap/web/index.html /var/www/multizap/index.html; do
  mkdir -p "$(dirname "$dest")"
  cp "$CLONE_DECK/apps/web/index.html" "$dest"
  chmod 644 "$dest"
done
log "  ✅ Landing copiada"
grep -q "ALLOWED_PATHS" /var/www/multizap/web/index.html && log "  ✅ Script seguro OK"

# 4. BUILD BOT + COPIAR
log "[4/6] Bot SPA..."
cd "$CLONE_DECK/apps/bot"
npm install --silent 2>/dev/null || true
npm run build 2>/dev/null && log "  ✅ Build OK" || log "  ⚠️ Build falhou"
mkdir -p /var/www/multizap/bot
cp -a dist/* /var/www/multizap/bot/ 2>/dev/null && log "  ✅ Bot copiado" || log "  ⚠️ Copia falhou"

# 5. CADDY RELOAD
log "[5/6] Caddy..."
systemctl reload caddy 2>/dev/null && log "  ✅ Caddy reloaded" || systemctl restart caddy 2>/dev/null && log "  ✅ Caddy restarted" || log "  ❌ Caddy falhou"

# 6. TESTAR
log "[6/6] Testando..."
sleep 3
for u in "https://multizap.dev" "https://bot.multizap.dev" "https://crm.multizap.dev" "https://proxy.multizap.dev/health" "https://hook.multizap.dev/health"; do
  code=$(curl -sk -o /dev/null -w "%{http_code}" --connect-timeout 10 "$u" 2>/dev/null || echo "000")
  status="✅"
  [ "$code" = "000" ] || [ "$code" = "502" ] || [ "$code" = "503" ] && status="❌"
  log "  $status $u → HTTP $code"
done

log "=== 016: FIM ==="
