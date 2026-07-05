#!/usr/bin/env bash
# Retorna JSON com status do MCP OAuth pro painel Status
set -uo pipefail

PM2_ID=17
ENV_FILE=/root/CentralDark/apps/modulos/mcp/.env

# 1) processo online?
PM2_STATUS=$(pm2 jlist 2>/dev/null | node -e "let d=JSON.parse(require('fs').readFileSync(0,'utf8'));let p=d.find(x=>x.pm_id==$PM2_ID);console.log(p?p.pm2_env.status:'missing')")

# 2) senha carregada na env do processo?
SENHA_LOADED=$(pm2 env $PM2_ID 2>/dev/null | grep -c '^MCP_ADMIN_PASSWORD:')

# 3) senha presente no .env do disco?
SENHA_DISK=$(grep -c "^MCP_ADMIN_PASSWORD=.." /root/CentralDark/apps/modulos/mcp/.env 2>/dev/null | head -1 | tr -d "\n" || echo 0)

# 4) /authorize respondendo (400 invalid_client = SAUDÁVEL)
HTTP=$(curl -s -o /tmp/mcp-auth.body -w "%{http_code}" "https://mcp.centralldark.com/authorize?client_id=probe&redirect_uri=https://x/y&response_type=code" || echo "000")
AUSENTE=$(grep -c "MCP_ADMIN_PASSWORD ausente" /tmp/mcp-auth.body 2>/dev/null | head -1 | tr -d "\n" || echo 0)

# Veredito
if [ "$PM2_STATUS" = "online" ] && [ "$SENHA_LOADED" -gt 0 ] && [ "$AUSENTE" -eq 0 ]; then
  STATUS="ok"
  EMOJI="🟢"
elif [ "$PM2_STATUS" = "online" ] && [ "$AUSENTE" -gt 0 ]; then
  STATUS="senha_nao_carregada"
  EMOJI="🟡"
else
  STATUS="falha"
  EMOJI="🔴"
fi

cat <<JSON
{
  "servico": "CentralDark-MCP",
  "pm2_id": $PM2_ID,
  "pm2_status": "$PM2_STATUS",
  "senha_no_disco": $([ "$SENHA_DISK" -gt 0 ] && echo true || echo false),
  "senha_carregada_no_processo": $([ "$SENHA_LOADED" -gt 0 ] && echo true || echo false),
  "authorize_http_code": $HTTP,
  "authorize_saudavel": $([ "$AUSENTE" -eq 0 ] && echo true || echo false),
  "status": "$STATUS",
  "emoji": "$EMOJI",
  "checado_em": "$(date -u +%FT%TZ)"
}
JSON
