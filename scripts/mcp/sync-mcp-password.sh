#!/usr/bin/env bash
# Sincroniza MCP_ADMIN_PASSWORD do vault local pro .env do MCP e reinicia PM2
# Fonte da verdade: /root/CentralDark/secrets/mcp-admin.password (chmod 600)
set -euo pipefail
VAULT=/root/CentralDark/secrets/mcp-admin.password
ENV_FILE=/root/CentralDark/apps/modulos/mcp/.env
PM2_ID=17

[ -f "$VAULT" ] || { echo "❌ vault ausente: $VAULT"; exit 1; }
SENHA=$(cat "$VAULT")
[ -n "$SENHA" ] || { echo "❌ vault vazio"; exit 1; }

# backup + substituição atômica
cp "$ENV_FILE" "$ENV_FILE.bak.$(date +%Y%m%d-%H%M%S)"
if grep -q '^MCP_ADMIN_PASSWORD=' "$ENV_FILE"; then
  sed -i "s|^MCP_ADMIN_PASSWORD=.*|MCP_ADMIN_PASSWORD=${SENHA}|" "$ENV_FILE"
else
  echo "MCP_ADMIN_PASSWORD=${SENHA}" >> "$ENV_FILE"
fi

# restart carregando env
cd /root/CentralDark/apps/modulos/mcp
set -a; . ./.env; set +a
pm2 restart $PM2_ID --update-env >/dev/null
pm2 save >/dev/null
echo "✅ MCP_ADMIN_PASSWORD sincronizada e PM2 reiniciado"
