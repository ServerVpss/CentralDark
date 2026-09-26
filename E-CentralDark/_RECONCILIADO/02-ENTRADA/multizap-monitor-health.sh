#!/usr/bin/env bash
# Monitor de saúde geral (VPS).
# A cada X segundos checa: PM2, Gateway local, WuzAPI local, site público
# (multizap.dev) e webhook do CRM. Mostra OK/FALHA colorido.
#
# Uso:
#   bash multizap-monitor-health.sh           # intervalo padrão 10s
#   INTERVAL=5 bash multizap-monitor-health.sh
#
# Não toca em nada — só lê.
set -uo pipefail

INTERVAL="${INTERVAL:-10}"
GW_URL="http://127.0.0.1:3100/health"
WUZ_URL="http://127.0.0.1:8081/"
SITE_URL="https://multizap.dev"
WEBHOOK_URL="https://multizap.dev/api/public/wuzapi/webhook"

green()  { printf "\033[32m%s\033[0m" "$1"; }
red()    { printf "\033[31m%s\033[0m" "$1"; }
yellow() { printf "\033[33m%s\033[0m" "$1"; }
gray()   { printf "\033[90m%s\033[0m" "$1"; }

check_http() {
  local label="$1" url="$2" expect="${3:-2}"
  local code
  code=$(curl -k -s -o /dev/null -w "%{http_code}" --max-time 6 "$url" || echo "000")
  if [[ "$code" =~ ^${expect}[0-9]{2}$ ]]; then
    printf "  %-22s %s (%s)\n" "$label" "$(green OK)" "$code"
  elif [[ "$code" == "000" ]]; then
    printf "  %-22s %s (sem resposta)\n" "$label" "$(red FALHA)"
  else
    printf "  %-22s %s (%s)\n" "$label" "$(yellow ATENÇÃO)" "$code"
  fi
}

check_pm2() {
  local name="$1"
  local status
  status=$(pm2 jlist 2>/dev/null \
    | grep -oE "\"name\":\"$name\"[^}]*\"status\":\"[a-z]+\"" \
    | grep -oE '"status":"[a-z]+"' \
    | head -n1 | cut -d'"' -f4)
  if [[ "$status" == "online" ]]; then
    printf "  %-22s %s\n" "PM2 $name" "$(green online)"
  elif [[ -z "$status" ]]; then
    printf "  %-22s %s\n" "PM2 $name" "$(red não encontrado)"
  else
    printf "  %-22s %s\n" "PM2 $name" "$(red $status)"
  fi
}

check_docker() {
  local name="$1"
  if docker ps --format '{{.Names}}' 2>/dev/null | grep -q "^$name$"; then
    printf "  %-22s %s\n" "Docker $name" "$(green rodando)"
  else
    printf "  %-22s %s\n" "Docker $name" "$(red parado)"
  fi
}

while true; do
  clear
  echo "=== MultiZap — Saúde Geral ==="
  echo "$(gray "$(date '+%Y-%m-%d %H:%M:%S')  •  atualiza a cada ${INTERVAL}s  •  Ctrl+C sai")"
  echo
  echo "Processos:"
  check_pm2    "MultiZap-Gateway"
  check_docker "wuzapi-atendimento"
  echo
  echo "Endpoints:"
  check_http "Gateway /health"     "$GW_URL"      2
  check_http "WuzAPI local"        "$WUZ_URL"     2
  check_http "Site multizap.dev"   "$SITE_URL"    2
  # Webhook responde 401/405 em GET — basta ele estar de pé.
  code=$(curl -k -s -o /dev/null -w "%{http_code}" --max-time 6 "$WEBHOOK_URL" || echo "000")
  if [[ "$code" =~ ^[2345][0-9]{2}$ ]]; then
    printf "  %-22s %s (%s)\n" "Webhook CRM" "$(green respondendo)" "$code"
  else
    printf "  %-22s %s\n" "Webhook CRM" "$(red sem resposta)"
  fi
  echo
  sleep "$INTERVAL"
done
