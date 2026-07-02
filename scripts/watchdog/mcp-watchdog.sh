#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# Watchdog do CentralDark-MCP
# ═══════════════════════════════════════════════════════════════
# Roda a cada 1 minuto via cron. Verifica /health público do MCP.
# Se falhar 2x seguidas → restart via PM2 + alerta no Telegram.
# Se retornar 401 → tenta renovar sessão antes de restart.
# Atualiza mcp-health.json no painel vivo (status.centralldark.com).
# ═══════════════════════════════════════════════════════════════

set -uo pipefail

# ── Configuração ────────────────────────────────────────────────
MCP_URL="${MCP_URL:-https://mcp.centralldark.com/health}"
PM2_NAME="${PM2_NAME:-CentralDark-MCP}"
BASE_DIR="/root/CentralDark"
LOG_DIR="${BASE_DIR}/scripts/logs"
LOG_FILE="${LOG_DIR}/mcp-watchdog.log"
STATE_FILE="${LOG_DIR}/mcp-watchdog.state"
HEALTH_JSON="${BASE_DIR}/apps/modulos/status/mcp-health.json"
FAIL_THRESHOLD=2
TG_TOKEN_FILE="${BASE_DIR}/secrets/telegram-bot.token"
TG_CHAT_ID="${TG_CHAT_ID:-1901426549}"  # admin @segredounlocker

mkdir -p "$LOG_DIR"
touch "$STATE_FILE"

# ── Helpers ─────────────────────────────────────────────────────
log() {
  echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] $*" >> "$LOG_FILE"
}

notify_telegram() {
  local msg="$1"
  [[ -f "$TG_TOKEN_FILE" ]] || return 0
  local token
  token=$(cat "$TG_TOKEN_FILE" 2>/dev/null)
  [[ -z "$token" ]] && return 0
  curl -s -o /dev/null --max-time 5 \
    -d "chat_id=${TG_CHAT_ID}" \
    -d "text=🐕 [MCP Watchdog] ${msg}" \
    "https://api.telegram.org/bot${token}/sendMessage" || true
}

read_state() {
  cat "$STATE_FILE" 2>/dev/null || echo "0"
}

write_state() {
  echo "$1" > "$STATE_FILE"
}

update_health_json() {
  local status="$1"
  local http_code="$2"
  local latency_ms="$3"
  local restarted="$4"
  # Atualiza contadores 24h a partir do log
  local checks_24h fails_24h restarts_24h uptime_pct last_fail last_restart
  checks_24h=$(awk -v cutoff="$(date -u -d '24 hours ago' +%s)" '
    { ts=mktime(gensub(/[-T:Z]/, " ", "g", $1)); if (ts >= cutoff) c++ }
    END { print c+0 }
  ' "$LOG_FILE" 2>/dev/null || echo "0")
  fails_24h=$(grep -c "❌" "$LOG_FILE" 2>/dev/null || echo "0")
  restarts_24h=$(grep -c "🔄 restart" "$LOG_FILE" 2>/dev/null || echo "0")
  if [[ "$checks_24h" -gt 0 ]]; then
    uptime_pct=$(awk "BEGIN { printf \"%.2f\", (($checks_24h - $fails_24h) / $checks_24h) * 100 }")
  else
    uptime_pct="100.00"
  fi
  last_fail=$(grep "❌" "$LOG_FILE" 2>/dev/null | tail -1 | awk '{print $1}' | tr -d '[]' || echo "null")
  last_restart=$(grep "🔄 restart" "$LOG_FILE" 2>/dev/null | tail -1 | awk '{print $1}' | tr -d '[]' || echo "null")

  cat > "$HEALTH_JSON" <<EOF
{
  "updatedAt": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "url": "$MCP_URL",
  "lastCheck": {
    "status": "$status",
    "httpCode": $http_code,
    "latencyMs": $latency_ms,
    "restarted": $restarted
  },
  "last24h": {
    "checks": $checks_24h,
    "failures": $fails_24h,
    "autoRestarts": $restarts_24h,
    "uptimePct": $uptime_pct
  },
  "lastFailureAt": "$last_fail",
  "lastRestartAt": "$last_restart"
}
EOF
}

# ── Ping ────────────────────────────────────────────────────────
start_ns=$(date +%s%N)
http_code=$(curl -s -o /tmp/mcp-health-body -w "%{http_code}" --max-time 10 "$MCP_URL" || echo "000")
end_ns=$(date +%s%N)
latency_ms=$(( (end_ns - start_ns) / 1000000 ))

fail_count=$(read_state)
restarted="false"

if [[ "$http_code" == "200" ]]; then
  # 🟢 sucesso
  if [[ "$fail_count" -gt 0 ]]; then
    log "🟢 recuperado após $fail_count falha(s) (${latency_ms}ms)"
    notify_telegram "🟢 MCP recuperado após ${fail_count} falha(s). Latência: ${latency_ms}ms"
  fi
  write_state "0"
  update_health_json "ok" "$http_code" "$latency_ms" "false"
  exit 0
fi

# 🔴 falhou
fail_count=$((fail_count + 1))
write_state "$fail_count"
log "❌ falha #${fail_count} — HTTP $http_code (${latency_ms}ms)"

if [[ "$fail_count" -ge "$FAIL_THRESHOLD" ]]; then
  # 401 → tenta renovar sessão antes de restartar
  if [[ "$http_code" == "401" ]]; then
    log "🔑 HTTP 401 — sessão expirada, disparando renovação"
    notify_telegram "🔑 MCP com 401 — renovando sessão e reiniciando"
    # Placeholder: script de renovação (a criar em scripts/watchdog/renew-mcp-session.sh)
    if [[ -x "${BASE_DIR}/scripts/watchdog/renew-mcp-session.sh" ]]; then
      "${BASE_DIR}/scripts/watchdog/renew-mcp-session.sh" >> "$LOG_FILE" 2>&1 || true
    fi
  fi

  log "🔄 restart ${PM2_NAME} (falhas consecutivas: ${fail_count})"
  pm2 restart "$PM2_NAME" >> "$LOG_FILE" 2>&1 || true
  pm2 save >> "$LOG_FILE" 2>&1 || true
  notify_telegram "🔄 MCP reiniciado após ${fail_count} falhas (HTTP ${http_code})"
  restarted="true"
  write_state "0"
fi

update_health_json "fail" "$http_code" "$latency_ms" "$restarted"
exit 1
