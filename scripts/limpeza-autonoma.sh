#!/bin/bash
# ============================================================
# limpeza-autonoma.sh — Limpeza de logs + relatório Telegram
# Cron: */30 * * * *
# ============================================================
set -uo pipefail   # sem -e: evita abort em checks condicionais

INICIO=$(date +%s)
DATA_BR=$(date '+%d/%m/%Y %H:%M')
LOG_PROPRIO="/var/log/limpeza-autonoma.log"
MINUTO=$(date +%M)

# --- Telegram ---
_COFRE="/root/CentralDark/secrets/mcp.env"
TOKEN=""
CHAT_ID="-1003669176367"

if [ -f "$_COFRE" ]; then
  _T=$(grep -E '^(TELEGRAM_BOT_TOKEN|SRVER1_BOT_TOKEN)=' "$_COFRE" 2>/dev/null | head -1 | cut -d= -f2- | tr -d '"' | tr -d "'" || true)
  _C=$(grep -E '^(TELEGRAM_ALERTS_CHAT_ID|TELEGRAM_CHANNEL_ID)=' "$_COFRE" 2>/dev/null | head -1 | cut -d= -f2- | tr -d '"' | tr -d "'" || true)
  if [ -n "${_T:-}" ]; then TOKEN="$_T"; fi
  if [ -n "${_C:-}" ]; then CHAT_ID="$_C"; fi
fi

send_telegram() {
  if [ -z "$TOKEN" ]; then return 0; fi
  curl -s -X POST "https://api.telegram.org/bot${TOKEN}/sendMessage" \
    -H "Content-Type: application/json" \
    -d "{\"chat_id\":\"${CHAT_ID}\",\"text\":\"$1\",\"parse_mode\":\"HTML\",\"disable_web_page_preview\":true}" \
    >/dev/null 2>&1 || true
}

# --- Estado inicial ---
DISCO_ANTES=$(df -h / | awk 'NR==2{print $3"/"$4" ("$5")"}')
VAR_LOG_ANTES=$(du -sh /var/log 2>/dev/null | cut -f1 || echo "?")
PM2_ANTES=$(du -sh /root/.pm2/logs 2>/dev/null | cut -f1 || echo "N/A")

ACOES=""

# --- 1. Vacuum journald (limite 400MB / 14 dias) ---
JOURNAL_ANTES=$(journalctl --disk-usage 2>/dev/null | awk '{print $5, $6}' | head -1 || echo "?")
journalctl --vacuum-size=400M --vacuum-time=14d >/dev/null 2>&1 || true
JOURNAL_DEPOIS=$(journalctl --disk-usage 2>/dev/null | awk '{print $5, $6}' | head -1 || echo "?")
if [ "$JOURNAL_ANTES" != "$JOURNAL_DEPOIS" ]; then
  ACOES="${ACOES}• Journal: ${JOURNAL_ANTES} → ${JOURNAL_DEPOIS}\n"
fi

# --- 2. Remover .gz com mais de 7 dias ---
REMOVIDOS=$(find /var/log -name "*.gz" -mtime +7 -type f 2>/dev/null | wc -l || echo 0)
if [ "$REMOVIDOS" -gt 0 ]; then
  find /var/log -name "*.gz" -mtime +7 -type f -delete 2>/dev/null || true
  ACOES="${ACOES}• Removidos ${REMOVIDOS} arquivos .gz antigos\n"
fi

# --- 3. Logs custom > 50MB → mantém últimas 1000 linhas ---
for LOG_FILE in /var/log/gh-pull.log /var/log/multizap-gh-pull.log /var/log/deploy.log /var/log/centraldark-sync.log; do
  if [ -f "$LOG_FILE" ]; then
    TAMANHO=$(stat -c%s "$LOG_FILE" 2>/dev/null || echo 0)
    if [ "$TAMANHO" -gt 52428800 ]; then
      NOME=$(basename "$LOG_FILE")
      tail -1000 "$LOG_FILE" > "${LOG_FILE}.tmp" && mv "${LOG_FILE}.tmp" "$LOG_FILE" || true
      ACOES="${ACOES}• Truncado ${NOME} (últimas 1000 linhas)\n"
    fi
  fi
done

# --- 4. Caddy access logs > 20MB → mantém últimas 500 linhas ---
for LOG_FILE in /var/log/caddy/*.log; do
  if [ -f "$LOG_FILE" ]; then
    TAMANHO=$(stat -c%s "$LOG_FILE" 2>/dev/null || echo 0)
    if [ "$TAMANHO" -gt 20971520 ]; then
      NOME=$(basename "$LOG_FILE")
      tail -500 "$LOG_FILE" > "${LOG_FILE}.tmp" && mv "${LOG_FILE}.tmp" "$LOG_FILE" || true
      ACOES="${ACOES}• Caddy truncado: ${NOME}\n"
    fi
  fi
done

# --- 5. PM2 logs individuais > 50MB → zera ---
PM2_FLUSH=0
for LOG_FILE in /root/.pm2/logs/*.log; do
  if [ -f "$LOG_FILE" ]; then
    TAMANHO=$(stat -c%s "$LOG_FILE" 2>/dev/null || echo 0)
    if [ "$TAMANHO" -gt 52428800 ]; then
      > "$LOG_FILE" || true
      PM2_FLUSH=1
    fi
  fi
done
if [ "$PM2_FLUSH" -eq 1 ]; then
  ACOES="${ACOES}• PM2: logs >50MB zerados\n"
fi

# --- 6. apt cache ---
apt-get clean -q 2>/dev/null || true

# --- Estado final ---
FIM=$(date +%s)
DURACAO=$((FIM - INICIO))
DISCO_DEPOIS=$(df -h / | awk 'NR==2{print $3"/"$4" ("$5")"}')
VAR_LOG_DEPOIS=$(du -sh /var/log 2>/dev/null | cut -f1 || echo "?")
PM2_DEPOIS=$(du -sh /root/.pm2/logs 2>/dev/null | cut -f1 || echo "N/A")

# --- Telegram ---
if [ -n "$ACOES" ]; then
  MSG="🧹 <b>Limpeza Autônoma — CentralDark</b>
📅 ${DATA_BR} · ${DURACAO}s

💾 <b>Disco /</b>
  Antes: ${DISCO_ANTES}
  Depois: ${DISCO_DEPOIS}

📂 <b>/var/log</b>: ${VAR_LOG_ANTES} → ${VAR_LOG_DEPOIS}
🔁 <b>PM2 logs</b>: ${PM2_ANTES} → ${PM2_DEPOIS}

<b>O que foi limpo:</b>
$(printf '%b' "$ACOES")"
  send_telegram "$MSG"

elif [ "$MINUTO" = "00" ]; then
  DISCO_USO=$(df -h / | awk 'NR==2{print $5}')
  DISCO_LIVRE=$(df -h / | awk 'NR==2{print $4}')
  MSG="✅ <b>Saúde VPS</b> · ${DATA_BR}
💾 Disco: ${DISCO_USO} usado · ${DISCO_LIVRE} livre
📂 /var/log: ${VAR_LOG_DEPOIS}
🔁 PM2 logs: ${PM2_DEPOIS}
📓 Journal: ${JOURNAL_DEPOIS}
<i>Tudo limpo — nada a fazer</i>"
  send_telegram "$MSG"
fi

# Log local sempre
echo "[$(date '+%Y-%m-%d %H:%M:%S')] ${DURACAO}s | disco:${DISCO_DEPOIS} | var-log:${VAR_LOG_ANTES}→${VAR_LOG_DEPOIS}" >> "$LOG_PROPRIO" || true
