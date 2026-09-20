#!/bin/bash
# ══════════════════════════════════════════════════════════════
# RUN-ONCE 014: Forcar atualizacao da Landing Page + Caddy
# ══════════════════════════════════════════════════════════════
set -uo pipefail

CLONE_DECK="/root/Multizap/apps/clone-deck"
PUBLIC_ROOT="/var/www/multizap"
LOG="/var/log/clone-deck-post-deploy.log"

log() { echo "[$(date '+%H:%M:%S')] $*" >> "$LOG" 2>/dev/null; echo "$*"; }

log "=== 014: Forcar landing page ==="

# 1. Build da landing page (gera dist/)
log "[1/5] Build da landing page..."
cd "$CLONE_DECK/apps/web" || { log "ERRO: apps/web nao encontrado"; exit 1; }
if command -v bun &>/dev/null; then
  bun install --silent 2>/dev/null || true
  bun run build 2>/dev/null && log "  ✅ Build OK (bun)" || log "  ⚠️ Build fallback"
else
  npm install --silent 2>/dev/null || true
  npm run build 2>/dev/null && log "  ✅ Build OK (npm)" || log "  ⚠️ Build fallback"
fi

# 2. Copiar direto (tanto dist/ quanto o index.html original)
log "[2/5] Copiando landing page..."
for src in "$CLONE_DECK/apps/web/dist/index.html" "$CLONE_DECK/apps/web/index.html"; do
  if [ -f "$src" ]; then
    for dest in "$PUBLIC_ROOT/web/index.html" "$PUBLIC_ROOT/index.html" "/var/www/html/index.html"; do
      mkdir -p "$(dirname "$dest")"
      cp "$src" "$dest"
      chmod 644 "$dest"
      log "  Copiado $src → $dest"
    done
    break
  fi
done

# 3. Verificar script seguro
log "[3/5] Verificando script seguro..."
FINAL_HTML=$(find "$PUBLIC_ROOT" /var/www/html -name "index.html" 2>/dev/null | head -1)
if [ -n "$FINAL_HTML" ] && grep -q "ALLOWED_PATHS" "$FINAL_HTML" 2>/dev/null; then
  log "  ✅ SCRIPT SEGURO PRESENTE!"
else
  log "  ❌ Script seguro AUSENTE - copiando direto do repo"
  cp "$CLONE_DECK/apps/web/index.html" "$PUBLIC_ROOT/web/index.html"
  chmod 644 "$PUBLIC_ROOT/web/index.html"
  if grep -q "ALLOWED_PATHS" "$PUBLIC_ROOT/web/index.html"; then
    log "  ✅ Agora sim! Script seguro presente"
  fi
fi

# 4. Recarregar Caddy
log "[4/5] Recarregando Caddy..."
systemctl reload caddy 2>/dev/null && log "  ✅ Caddy reloaded" || log "  ⚠️ Caddy reload falhou"

# 5. Testar
log "[5/5] Testando servicos..."
sleep 3
for url in "https://multizap.dev" "https://bot.multizap.dev" "https://crm.multizap.dev" "https://proxy.multizap.dev/health"; do
  code=$(curl -sk -o /dev/null -w "%{http_code}" --connect-timeout 10 "$url" 2>/dev/null)
  log "  $url → HTTP $code"
done

log "=== 014: Concluido ==="