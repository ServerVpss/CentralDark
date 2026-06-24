#!/bin/bash
set -uo pipefail
source /root/Multizap/secrets/wabot.env 2>/dev/null
SUPA_URL="${SUPABASE_URL:-}"
SUPA_KEY="${SUPABASE_SERVICE_ROLE_KEY:-}"

echo "=== 1. LIMPAR PM2 DUPLICADOS ==="

# Deletar processos errored/duplicados
for NAME in "CloneDeck-GitHub-Webhook" "CloneDeck-Receiver" "CloneDeck-Supabase-Sync" "MultiZap-TelegramBot"; do
  COUNT=$(pm2 jlist 2>/dev/null | python3 -c "import sys,json;d=json.load(sys.stdin);print(sum(1 for p in d if p['name']=='$NAME'))" 2>/dev/null || echo "0")
  if [ "$COUNT" -gt 0 ]; then
    pm2 stop "$NAME" > /dev/null 2>&1
    pm2 delete "$NAME" > /dev/null 2>&1
    echo "  Removido: $NAME ($COUNT instâncias)"
  fi
done

# Verificar webhook-bot duplicado
WB_COUNT=$(pm2 jlist 2>/dev/null | python3 -c "import sys,json;d=json.load(sys.stdin);print(sum(1 for p in d if p['name']=='webhook-bot'))" 2>/dev/null || echo "0")
if [ "$WB_COUNT" -gt 1 ]; then
  # Manter só o que está online na porta 9003
  pm2 stop "webhook-bot" > /dev/null 2>&1
  pm2 delete "webhook-bot" > /dev/null 2>&1
  cd /root/clone-deck-webhook
  pm2 start clone-deck-github-webhook-listener.js --name webhook-bot > /dev/null 2>&1
  echo "  webhook-bot: limpo e reiniciado (1 instância)"
fi

pm2 save > /dev/null 2>&1
echo "  PM2 salvo"

echo ""
echo "=== 2. LIMPAR CADDYFILE ==="

CADDYFILE="/etc/caddy/Caddyfile"
cp "$CADDYFILE" "${CADDYFILE}.backup.cleanup"

# Reescrever Caddyfile LIMPO
cat > "$CADDYFILE" << 'CADDY'
{
	email danieloliveiraghsds@gmail.com
}

multizap.dev {
	root * /var/www/multizap/dist
	file_server
	try_files {path} /index.html
	encode gzip
	header {
		Access-Control-Allow-Origin "*"
		Strict-Transport-Security "max-age=31536000; includeSubDomains"
	}
}

bot.multizap.dev {
	root * /root/Multizap/apps/clone-deck/apps/bot/dist
	try_files {path} /index.html
	file_server
	encode gzip
}

crm.multizap.dev {
	reverse_proxy 127.0.0.1:3000
	encode gzip
}

proxy.multizap.dev {
	encode gzip

	handle /github/multizap/webhook {
		rewrite * /webhook
		reverse_proxy 127.0.0.1:9002
	}

	handle /webhook {
		reverse_proxy 127.0.0.1:9002
	}

	handle {
		reverse_proxy 127.0.0.1:3100
	}
}

hook.multizap.dev {
	reverse_proxy 127.0.0.1:9003
}
CADDY

echo "  Caddyfile reescrito (limpo, sem duplicatas)"

# Formatar e validar
caddy fmt --overwrite "$CADDYFILE" 2>/dev/null
if caddy validate --config "$CADDYFILE" 2>/dev/null; then
  echo "  Caddyfile VÁLIDO"
  systemctl reload caddy 2>/dev/null || caddy reload --config "$CADDYFILE" 2>/dev/null
  echo "  Caddy recarregado"
else
  echo "  ERRO: Caddyfile inválido — restaurando backup"
  cp "${CADDYFILE}.backup.cleanup" "$CADDYFILE"
fi

echo ""
echo "=== 3. RESULTADO ==="

# PM2 final
PM2_JSON=$(pm2 jlist 2>/dev/null | python3 -c "import sys,json;d=json.load(sys.stdin);print(json.dumps([{'name':p['name'],'status':p['pm2_env']['status'],'restarts':p['pm2_env'].get('restart_time',0)} for p in d]))" 2>/dev/null || echo "[]")

# HTTPS test
HTTPS=""
for d in multizap.dev bot.multizap.dev crm.multizap.dev hook.multizap.dev proxy.multizap.dev; do
  CODE=$(curl -sk -o /dev/null -w "%{http_code}" --connect-timeout 5 "https://${d}" 2>/dev/null)
  HTTPS="${HTTPS}${d}:${CODE},"
done

# Salvar no Supabase
if [ -n "$SUPA_URL" ] && [ -n "$SUPA_KEY" ]; then
  curl -s -X POST "${SUPA_URL}/rest/v1/system_logs" \
    -H "apikey: ${SUPA_KEY}" -H "Authorization: Bearer ${SUPA_KEY}" \
    -H "Content-Type: application/json" \
    -d "{\"action\":\"run-once.003.cleanup\",\"level\":\"info\",\"details\":{\"https\":\"${HTTPS}\",\"pm2\":${PM2_JSON}}}" > /dev/null 2>&1
fi

echo "PM2:"
pm2 list 2>/dev/null | head -15
echo ""
echo "HTTPS:"
echo "$HTTPS" | tr ',' '\n' | grep -v '^$'
