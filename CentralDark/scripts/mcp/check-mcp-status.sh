#!/usr/bin/env bash
# Retorna JSON com status do MCP OAuth pro painel Status
set -uo pipefail

PM2_NAME=${PM2_NAME:-CentralDark-MCP}
export PM2_NAME
ENV_FILE=/root/CentralDark/apps/modulos/mcp/.env
FORENSIC_SCRIPT=/root/CentralDark/scripts/diagnostics/centraldark-forensic-sweep.sh
FORENSIC_LATEST=/root/CentralDark/_DIAGNOSTICS/FORENSIC-LATEST.json
FORENSIC_MAX_AGE_SEC=${FORENSIC_MAX_AGE_SEC:-600}
FORENSIC_TRIGGERED=false
FORENSIC_AGE_SEC=-1

if [ -f "$FORENSIC_LATEST" ]; then
  NOW_EPOCH=$(date +%s)
  LATEST_EPOCH=$(stat -c %Y "$FORENSIC_LATEST" 2>/dev/null || echo 0)
  if [ "$LATEST_EPOCH" -gt 0 ]; then
    FORENSIC_AGE_SEC=$((NOW_EPOCH - LATEST_EPOCH))
  fi
fi

if [ -f "$FORENSIC_SCRIPT" ] && { [ "$FORENSIC_AGE_SEC" -lt 0 ] || [ "$FORENSIC_AGE_SEC" -gt "$FORENSIC_MAX_AGE_SEC" ]; }; then
  if ! pgrep -f '[c]entraldark-forensic-sweep.sh' >/dev/null 2>&1; then
    nohup bash "$FORENSIC_SCRIPT" >/dev/null 2>&1 &
    FORENSIC_TRIGGERED=true
  fi
fi

# 1) processo online?
PM2_JSON=$(mktemp)
pm2 jlist > "$PM2_JSON" 2>/dev/null || echo '[]' > "$PM2_JSON"
PM2_ID=$(node -e "let d=JSON.parse(require('fs').readFileSync(process.argv[1],'utf8'));let p=d.find(x=>x.name===process.env.PM2_NAME);console.log(p?p.pm_id:-1)" "$PM2_JSON")
PM2_STATUS=$(node -e "let d=JSON.parse(require('fs').readFileSync(process.argv[1],'utf8'));let p=d.find(x=>x.name===process.env.PM2_NAME);console.log(p?p.pm2_env.status:'missing')" "$PM2_JSON")
rm -f "$PM2_JSON"

# 2) senha carregada na env do processo?
if [ "$PM2_ID" -ge 0 ]; then
  SENHA_LOADED=$(pm2 env "$PM2_ID" 2>/dev/null | awk '/^MCP_ADMIN_PASSWORD:/ {c++} END {print c+0}')
else
  SENHA_LOADED=0
fi

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
  "pm2_name": "$PM2_NAME",
  "pm2_status": "$PM2_STATUS",
  "senha_no_disco": $([ "$SENHA_DISK" -gt 0 ] && echo true || echo false),
  "senha_carregada_no_processo": $([ "$SENHA_LOADED" -gt 0 ] && echo true || echo false),
  "authorize_http_code": $HTTP,
  "authorize_saudavel": $([ "$AUSENTE" -eq 0 ] && echo true || echo false),
  "forensic_receipt_present": $([ -f "$FORENSIC_LATEST" ] && echo true || echo false),
  "forensic_age_sec": $FORENSIC_AGE_SEC,
  "forensic_sweep_triggered": $FORENSIC_TRIGGERED,
  "status": "$STATUS",
  "emoji": "$EMOJI",
  "checado_em": "$(date -u +%FT%TZ)"
}
JSON
