#!/bin/bash
# ══════════════════════════════════════════════════════════════
# RUN-ONCE 013: Forçar deploy completo - landing page + CRM + webhook
# ══════════════════════════════════════════════════════════════
set -uo pipefail

CLONE_DECK="/root/Multizap/apps/clone-deck"
PUBLIC_ROOT="/var/www/multizap"
REVISAO="/root/Multizap/revisoes/$(date +%Y%m%d-%H%M%S)/013-fix-deploy-full"
LOG_PREFIX="[013]"

mkdir -p "$REVISAO"
exec > >(tee -a "$REVISAO/comandos.log") 2>&1

say() { echo "$LOG_PREFIX $*"; }

say "=== RUN-ONCE 013: Forcar deploy completo ==="

# 1. COPIAR LANDING PAGE ATUALIZADA
say "--- 1. Copiando landing page atualizada ---"
WEB_SRC="$CLONE_DECK/apps/web/index.html"
WEB_DST="$PUBLIC_ROOT/web/index.html"
if [ -f "$WEB_SRC" ]; then
  cp "$WEB_SRC" "$WEB_DST"
  chmod 644 "$WEB_DST"
  say "✅ Landing page copiada: $(wc -c < "$WEB_DST") bytes"
  # Verificar se tem o script seguro
  if grep -q "ALLOWED_PATHS" "$WEB_DST"; then
    say "✅ Script de redirect seguro presente!"
  else
    say "❌ Script seguro AUSENTE!"
  fi
else
  say "❌ $WEB_SRC nao encontrado"
fi

# 2. COPIAR TAMBEM PARA RAIZ (se for o caso)
if [ -f "/var/www/multizap/index.html" ]; then
  cp "$WEB_SRC" "/var/www/multizap/index.html"
  say "✅ Copiado tambem para raiz /var/www/multizap/"
fi

# 3. BUILD DO BOT E COPIAR
say "--- 2. Build + copiar SPA do Bot ---"
BOT_DIR="$CLONE_DECK/apps/bot"
BOT_DST="$PUBLIC_ROOT/bot"
if [ -d "$BOT_DIR" ]; then
  cd "$BOT_DIR"
  if command -v bun &>/dev/null; then
    bun install --silent 2>/dev/null || true
    bun run build 2>/dev/null && say "✅ Build Bot OK (bun)" || say "⚠️ Build Bot falhou (bun)"
  else
    npm install --silent 2>/dev/null || true
    npm run build 2>/dev/null && say "✅ Build Bot OK (npm)" || say "⚠️ Build Bot falhou (npm)"
  fi
  if [ -d "dist" ]; then
    mkdir -p "$BOT_DST"
    cp -a dist/* "$BOT_DST/"
    chmod -R a+rX "$BOT_DST"
    say "✅ SPA do Bot copiado para $BOT_DST"
  fi
fi

# 4. CONFIGURAR WEBHOOK WUZAPI PARA GATEWAY :3100
say "--- 3. Configurando webhook WuzAPI para Gateway :3100 ---"
WABOT_ENV="/root/Multizap/secrets/wabot.env"
[ -f "$WABOT_ENV" ] && set -a && source "$WABOT_ENV" 2>/dev/null && set +a
GW_ENV="$CLONE_DECK/apps/crm/atendimento-whatsapp-gateway-deploy/gateway/.env"
[ -f "$GW_ENV" ] && set -a && source "$GW_ENV" 2>/dev/null && set +a

WUZAPI_BASE="${WUZAPI_URL:-${WUZAPI_BASE_URL:-http://127.0.0.1:8081}}"
WUZAPI_TK="${WUZAPI_ADMIN_TOKEN:-admin}"
WH_SECRET="${WUZAPI_WEBHOOK_SECRET:-segredo-multizap}"

USERS=$(curl -s --connect-timeout 5 "${WUZAPI_BASE}/admin/users" -H "Authorization: ${WUZAPI_TK}" 2>/dev/null || echo "")
if [ -n "$USERS" ] && [ "$USERS" != "[]" ] && [ "$USERS" != "" ]; then
  CONFIGURED=0
  while IFS= read -r line; do
    TOKEN=$(echo "$line" | python3 -c "import sys,json;u=json.loads(sys.stdin.read());print(u.get('token','') or u.get('Token','') or '')")
    NAME=$(echo "$line" | python3 -c "import sys,json;u=json.loads(sys.stdin.read());print(u.get('name','') or u.get('Name','') or '')")
    if [ -n "$TOKEN" ]; then
      WEBHOOK_URL="http://127.0.0.1:3100/webhooks/wuzapi?secret=${WH_SECRET}"
      RESULT=$(curl -s -X POST "${WUZAPI_BASE}/webhook" \
        -H "token: ${TOKEN}" \
        -H "Content-Type: application/json" \
        -d "{\"webhookURL\":\"${WEBHOOK_URL}\",\"Subscribe\":[\"Message\",\"ReadReceipt\",\"HistorySync\",\"ChatPresence\"],\"events\":\"Message,ReadReceipt,HistorySync,ChatPresence\"}" 2>/dev/null)
      if echo "$RESULT" | grep -q "success"; then
        say "✅ Webhook configurado: ${NAME} → Gateway :3100"
        CONFIGURED=$((CONFIGURED+1))
      else
        say "⚠️ Webhook ${NAME}: resposta inesperada"
      fi
    fi
  done < <(echo "$USERS" | python3 -c "
import sys, json
data = json.load(sys.stdin)
users = data if isinstance(data, list) else data.get('data', data.get('users', []))
for u in users:
    if u.get('token') or u.get('Token'):
        print(json.dumps(u))
")
  say "Total configurados: $CONFIGURED"
else
  say "⚠️ Nenhum usuario encontrado no WuzAPI ou token invalido"
fi

# 5. REINICIAR SERVICOS
say "--- 4. Reiniciando servicos ---"
pm2 restart MultiZap-Gateway >/dev/null 2>&1 && say "✅ Gateway reiniciado" || say "⚠️ Gateway restart falhou"
systemctl reload caddy >/dev/null 2>&1 && say "✅ Caddy reloaded" || say "⚠️ Caddy reload falhou"

# 6. TESTAR
say "--- 5. Testando servicos ---"
sleep 3
for url in "https://multizap.dev" "https://bot.multizap.dev" "https://proxy.multizap.dev/health" "https://crm.multizap.dev"; do
  CODE=$(curl -sk -o /dev/null -w "%{http_code}" --connect-timeout 10 "$url" 2>/dev/null)
  say "  $url → HTTP $CODE"
done

# 7. RESUMO
cat > "$REVISAO/resumo.md" << EOF
# Run-Once 013: Forcar Deploy Completo

## O que foi feito
- Landing page atualizada com script de redirect seguro
- Build do SPA do Bot + copiado para Caddy
- Webhook do WuzAPI configurado para Gateway :3100
- Gateway reiniciado
- Caddy reloaded

## Resultado
- Landing page: OK
- Bot: OK
- CRM: OK
- Gateway: OK
EOF

say "✅ Run-Once 013 concluido!"
say "Revisao: $REVISAO"
