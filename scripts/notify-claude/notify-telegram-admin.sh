#!/bin/bash
# notify-telegram-admin.sh — card COMPLETO pro admin (privado), diferente do canal público.
# Disparado pelo hook Stop do Claude Code. Uso: notify-telegram-admin.sh
#
# Regra (docs/CONSCIENCIA/AGENTES-AUTONOMOS/HERMES/STATUS.md): privado do admin
# leva bloco <pre> completo; canal público leva só 1-3 linhas. Este script cuida
# SÓ do card do admin — o canal continua usando notify-telegram.sh como antes.

TOKEN=""
ADMIN_ID=""

for COFRE in "/root/CentralDark/secrets/.env" "/root/CentralDark/secrets/telegram-alerts.env" "/root/CentralDark/secrets/mcp.env"; do
  if [ -f "$COFRE" ]; then
    [ -z "$TOKEN" ] && TOKEN=$(grep -E '^(SRVER1_BOT_TOKEN|TELEGRAM_BOT_TOKEN)=' "$COFRE" 2>/dev/null | head -1 | cut -d= -f2- | tr -d '"' | tr -d "'" || true)
    [ -z "$ADMIN_ID" ] && ADMIN_ID=$(grep -E '^(ADMIN_CHAT_ID|ADMIN_TELEGRAM_ID)=' "$COFRE" 2>/dev/null | head -1 | cut -d= -f2- | tr -d '"' | tr -d "'" || true)
  fi
done

if [ -z "$TOKEN" ] || [ -z "$ADMIN_ID" ]; then
  exit 0
fi

DATA=$(date '+%d/%m/%Y %H:%M')

# --- Snapshot rápido do PM2 (só nomes chave, sem detalhe pesado) ---
PM2_RESUMO=""
if command -v pm2 >/dev/null 2>&1; then
  ONLINE=$(pm2 jlist 2>/dev/null | node -e "
    let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{
      try{const l=JSON.parse(d);const on=l.filter(p=>p.pm2_env.status==='online').length;
      const off=l.filter(p=>p.pm2_env.status!=='online').length;
      console.log(on+' online, '+off+' fora');}catch(e){console.log('n/d');}
    });" 2>/dev/null)
  PM2_RESUMO="${ONLINE:-n/d}"
fi

# --- Últimas 3 linhas de mudança de git (contexto do que foi feito) ---
GIT_RESUMO=$(cd /root/CentralDark && git status --short 2>/dev/null | wc -l | tr -d ' ')

# --- Dedupe: várias sessões Claude Code podem terminar quase juntas e disparar
# o mesmo card idêntico (PM2+git iguais no mesmo minuto). Se já mandamos ESSE
# conteúdo exato nos últimos 90s, pula — evita o card triplicado no Telegram.
DEDUPE_DIR="/tmp/.notify-telegram-admin-dedupe"
mkdir -p "$DEDUPE_DIR" 2>/dev/null
ASSINATURA=$(printf '%s|%s|%s' "$PM2_RESUMO" "$GIT_RESUMO" "$DATA" | md5sum | cut -d' ' -f1)
DEDUPE_FILE="$DEDUPE_DIR/$ASSINATURA"
find "$DEDUPE_DIR" -type f -mmin +5 -delete 2>/dev/null
if [ -f "$DEDUPE_FILE" ]; then
  exit 0
fi
touch "$DEDUPE_FILE"

esc() { printf '%s' "$1" | sed 's/&/\&amp;/g; s/</\&lt;/g; s/>/\&gt;/g'; }

TEXTO="<pre>
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🤖 Claude Code · CentralDark
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Resposta concluída
📦 PM2: $(esc "$PM2_RESUMO")
📝 Arquivos alterados (git): ${GIT_RESUMO}
🕐 ${DATA}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Aguardando próxima instrução do Pivete.
</pre>"

curl -s -X POST "https://api.telegram.org/bot${TOKEN}/sendMessage" \
  -H "Content-Type: application/json" \
  -d "{\"chat_id\":\"${ADMIN_ID}\",\"text\":\"${TEXTO}\",\"parse_mode\":\"HTML\",\"disable_web_page_preview\":true}" \
  >/dev/null 2>&1 || true
