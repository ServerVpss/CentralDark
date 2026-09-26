#!/usr/bin/env bash
# =============================================================================
# CentralDark — Watchdog do MCP público
# =============================================================================
# Roda via cron a cada minuto. Verifica:
#   1) MCP local        : http://127.0.0.1:9100/health
#   2) MCP público      : https://mcp.centralldark.com/health
#   3) Caddy ativo      : systemctl is-active caddy
#   4) Install público  : https://install.centralldark.com/health
#
# Quando detecta falha, manda alerta no Telegram (curl direto na Bot API,
# não depende do MultiZap-TelegramBot). Usa estado em /var/lib/mcp-watchdog/
# pra: (a) evitar spam (1 alerta por incidente), (b) alimentar a página
# pública de status em https://install.centralldark.com/status.
#
# Recovery também é notificado ("voltou ao ar").
#
# Logs detalhados: /var/log/mcp-watchdog.log (rotacionado pelo logrotate).
# =============================================================================
set -uo pipefail

ENV_FILE="/root/CentralDark/secrets/telegram-alerts.env"
STATE_DIR="/var/lib/mcp-watchdog"
STATUS_FILE="$STATE_DIR/status.json"
LOG_FILE="/var/log/mcp-watchdog.log"
HISTORY_FILE="$STATE_DIR/history.jsonl"
INCIDENT_FILE="$STATE_DIR/current-incident"

mkdir -p "$STATE_DIR"
touch "$LOG_FILE" "$HISTORY_FILE"

# carrega credenciais (se faltar, segue mas sem mandar alerta)
[ -f "$ENV_FILE" ] && set -a && . "$ENV_FILE" && set +a
TELEGRAM_BOT_TOKEN="${TELEGRAM_BOT_TOKEN:-}"
TELEGRAM_CHAT_ID="${TELEGRAM_CHAT_ID:-}"

ts() { date '+%Y-%m-%d %H:%M:%S'; }
log() { echo "[$(ts)] $*" >> "$LOG_FILE"; }

http_code() {
  curl -sS -o /dev/null --max-time 8 -w '%{http_code}' "$1" 2>/dev/null || echo "000"
}

send_telegram() {
  local text="$1"
  if [ -z "$TELEGRAM_BOT_TOKEN" ] || [ -z "$TELEGRAM_CHAT_ID" ]; then
    log "Telegram não configurado, pulando alerta"
    return 0
  fi
  curl -sS --max-time 10 \
    "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
    -d "chat_id=${TELEGRAM_CHAT_ID}" \
    -d "parse_mode=HTML" \
    --data-urlencode "text=${text}" >/dev/null 2>&1 \
    && log "alerta enviado" \
    || log "FALHA enviando alerta"
}

# ── medições ─────────────────────────────────────────────────────────────────
mcp_local=$(http_code "http://127.0.0.1:9100/health")
mcp_public=$(http_code "https://mcp.centralldark.com/health")
install_public=$(http_code "https://install.centralldark.com/health")
caddy_state=$(systemctl is-active caddy 2>/dev/null || echo "inactive")

# conta tools publicadas pelo MCP (parse rápido do JSON sem jq)
tools_count="?"
if [ "$mcp_local" = "200" ]; then
  health_body=$(curl -sS --max-time 5 http://127.0.0.1:9100/health 2>/dev/null || echo "{}")
  tools_count=$(echo "$health_body" | grep -oE '"tools"[[:space:]]*:[[:space:]]*[0-9]+' | grep -oE '[0-9]+$' | head -1)
  [ -z "$tools_count" ] && tools_count=$(echo "$health_body" | grep -oE '"toolCount"[[:space:]]*:[[:space:]]*[0-9]+' | grep -oE '[0-9]+$' | head -1)
  [ -z "$tools_count" ] && tools_count="?"
fi

# uptime PM2 do MCP-CentralDark (em segundos)
mcp_pm2_uptime=$(pm2 jlist 2>/dev/null | grep -oE '"name":"MCP-CentralDark"[^}]*"pm_uptime":[0-9]+' | grep -oE '[0-9]+$' | head -1)
mcp_pm2_status=$(pm2 jlist 2>/dev/null | grep -oE '"name":"MCP-CentralDark"[^}]*"status":"[a-z]+"' | grep -oE '"[a-z]+"$' | tr -d '"' | head -1)

# ── decide saúde geral ───────────────────────────────────────────────────────
problems=()
[ "$mcp_local" = "200" ]      || problems+=("MCP local: HTTP $mcp_local")
[ "$mcp_public" = "200" ]     || problems+=("MCP público: HTTP $mcp_public")
[ "$install_public" = "200" ] || problems+=("install público: HTTP $install_public")
[ "$caddy_state" = "active" ] || problems+=("Caddy: $caddy_state")

# detecta Cloudflare 521 (origin down) e 502/504 (proxy down)
case "$mcp_public" in
  521) problems+=("⚠️ Cloudflare 521 — origem (VPS) inacessível pra CF");;
  502|504) problems+=("⚠️ Caddy retornou $mcp_public — backend MCP fora");;
esac

healthy="true"
[ ${#problems[@]} -gt 0 ] && healthy="false"

# ── status.json (consumido pela página pública) ──────────────────────────────
last_errors=$(tail -200 "$LOG_FILE" 2>/dev/null | grep -E 'FALHA|DOWN|incidente' | tail -10 | sed 's/"/\\"/g' | awk '{printf "\"%s\",", $0}' | sed 's/,$//')
[ -z "$last_errors" ] && last_errors=""

cat > "$STATUS_FILE.tmp" <<JSON
{
  "checked_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "healthy": $healthy,
  "checks": {
    "mcp_local":      { "url": "http://127.0.0.1:9100/health",          "status": $mcp_local },
    "mcp_public":     { "url": "https://mcp.centralldark.com/health",   "status": $mcp_public },
    "install_public": { "url": "https://install.centralldark.com/health","status": $install_public },
    "caddy":          { "state": "$caddy_state" }
  },
  "mcp": {
    "tools": "$tools_count",
    "pm2_status": "${mcp_pm2_status:-unknown}",
    "pm2_uptime_ms": ${mcp_pm2_uptime:-0}
  },
  "problems": [$(printf '"%s",' "${problems[@]}" | sed 's/,$//')],
  "last_errors": [$last_errors]
}
JSON
mv "$STATUS_FILE.tmp" "$STATUS_FILE"
chmod 644 "$STATUS_FILE"

# ── alertas com debounce (1 por incidente, + recovery) ───────────────────────
if [ "$healthy" = "false" ]; then
  if [ ! -f "$INCIDENT_FILE" ]; then
    echo "$(ts)" > "$INCIDENT_FILE"
    msg="🚨 <b>CentralDark — MCP DOWN</b>
$(printf '• %s\n' "${problems[@]}")
<i>Detectado: $(ts)</i>
Status: https://install.centralldark.com/status"
    send_telegram "$msg"
    log "INCIDENTE: ${problems[*]}"
    echo "{\"ts\":\"$(ts)\",\"event\":\"down\",\"problems\":\"${problems[*]}\"}" >> "$HISTORY_FILE"
  else
    log "DOWN (já notificado): ${problems[*]}"
  fi
else
  if [ -f "$INCIDENT_FILE" ]; then
    started=$(cat "$INCIDENT_FILE")
    msg="✅ <b>CentralDark — MCP voltou</b>
Incidente iniciado: $started
Recuperado: $(ts)
Tools: $tools_count
Status: https://install.centralldark.com/status"
    send_telegram "$msg"
    log "RECUPERADO (incidente desde $started)"
    echo "{\"ts\":\"$(ts)\",\"event\":\"recovered\",\"started\":\"$started\"}" >> "$HISTORY_FILE"
    rm -f "$INCIDENT_FILE"
  fi
fi

# rotaciona history (mantém últimas 500 linhas)
if [ "$(wc -l < "$HISTORY_FILE")" -gt 500 ]; then
  tail -500 "$HISTORY_FILE" > "$HISTORY_FILE.tmp" && mv "$HISTORY_FILE.tmp" "$HISTORY_FILE"
fi

exit 0
