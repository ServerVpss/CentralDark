#!/usr/bin/env bash
# multizap-config-check.sh — valida configuração de produção do Gateway.
# Usado pelo painel VPS e pode rodar standalone.
# Checa:
#  1. URL crítica não aponta pra Lovable/preview em produção
#  2. .env em disco bate com ENV real do processo PM2
# Não altera nada. Exit 0 = ok, exit 2 = violação.

set -uo pipefail

ENV_FILE="${MULTIZAP_ENV_FILE:-/root/Multizap/gateway/.env}"
PROC_NAME="${MULTIZAP_PM2_NAME:-MultiZap-Gateway}"
HEALTH_URL="${MULTIZAP_HEALTH_URL:-http://127.0.0.1:3100/health}"

FORBIDDEN_RX='lovable\.app|lovable\.dev|lovableproject\.com|-preview|^preview\.|^staging\.'
ALLOWED_HOSTS_DEFAULT="multizap.dev proxy.multizap.dev"
ALLOWED_HOSTS="${ALLOWED_PROD_HOSTS:-$ALLOWED_HOSTS_DEFAULT}"

CHECK_VARS=("MULTIZAP_WEBHOOK_URL" "GATEWAY_PUBLIC_URL")

violations=0

mask_secret() {
  # exibe só os 4 primeiros chars + len
  local v="$1"
  local len=${#v}
  if [ "$len" -eq 0 ]; then echo "(vazio)"; return; fi
  echo "${v:0:4}***(len=$len)"
}

extract_host() {
  echo "$1" | sed -E 's#^https?://([^/]+).*#\1#'
}

host_allowed() {
  local h="$1"
  for a in $ALLOWED_HOSTS; do
    [ "$h" = "$a" ] && return 0
    case "$h" in *.$a) return 0;; esac
  done
  return 1
}

echo "🔎 Checando configuração do MultiZap-Gateway"
echo "   .env: $ENV_FILE"
echo "   processo PM2: $PROC_NAME"
echo ""

# --- 1) URLs em .env ---
if [ ! -f "$ENV_FILE" ]; then
  echo "⚠️  .env não encontrado em $ENV_FILE"
  exit 1
fi

for var in "${CHECK_VARS[@]}"; do
  disk_val=$(grep -E "^${var}=" "$ENV_FILE" 2>/dev/null | head -n1 | cut -d= -f2- | tr -d '"' | tr -d "'" | tr -d ' ')
  if [ -z "$disk_val" ]; then continue; fi
  host=$(extract_host "$disk_val")
  if echo "$host" | grep -Eiq "$FORBIDDEN_RX"; then
    echo "🚨 CONFIGURAÇÃO INVÁLIDA · URL PROIBIDA"
    echo "   Variável: $var"
    echo "   Valor (.env): $disk_val"
    echo "   Host: $host"
    echo "   Hosts permitidos: $ALLOWED_HOSTS"
    echo "   Ação: editar $ENV_FILE e rodar: pm2 restart $PROC_NAME --update-env && pm2 save"
    echo ""
    violations=$((violations+1))
  elif ! host_allowed "$host"; then
    echo "⚠️  Host fora da lista permitida"
    echo "   Variável: $var"
    echo "   Host: $host"
    echo "   Permitidos: $ALLOWED_HOSTS"
    echo ""
    violations=$((violations+1))
  else
    echo "✅ $var → $host (OK)"
  fi
done

echo ""

# --- 2) Paridade .env vs ENV real do PM2 ---
pid=$(pm2 pid "$PROC_NAME" 2>/dev/null | head -n1 | tr -d '[:space:]')
if [ -z "$pid" ] || [ ! -r "/proc/$pid/environ" ]; then
  echo "⚠️  Não consegui ler /proc/<pid>/environ do $PROC_NAME (pid=${pid:-vazio}) — pulando paridade"
else
  for var in "${CHECK_VARS[@]}"; do
    disk_val=$(grep -E "^${var}=" "$ENV_FILE" 2>/dev/null | head -n1 | cut -d= -f2- | tr -d '"' | tr -d "'" | tr -d ' ')
    proc_val=$(tr '\0' '\n' < "/proc/$pid/environ" | grep -E "^${var}=" | head -n1 | cut -d= -f2-)
    if [ "$disk_val" != "$proc_val" ]; then
      echo "⚠️  ENV_DIVERGENTE"
      echo "   Variável: $var"
      echo "   .env em disco: ${disk_val:-(ausente)}"
      echo "   ENV do PM2:    ${proc_val:-(ausente)}"
      echo "   Ação: pm2 restart $PROC_NAME --update-env && pm2 save"
      echo ""
      violations=$((violations+1))
    else
      echo "✅ paridade $var (OK)"
    fi
  done

  # Secrets: comparar só hash truncado (sem expor valor)
  for var in MULTIZAP_WEBHOOK_SECRET MULTIZAP_GATEWAY_TOKEN; do
    disk_val=$(grep -E "^${var}=" "$ENV_FILE" 2>/dev/null | head -n1 | cut -d= -f2- | tr -d '"' | tr -d "'" | tr -d ' ')
    proc_val=$(tr '\0' '\n' < "/proc/$pid/environ" | grep -E "^${var}=" | head -n1 | cut -d= -f2-)
    if [ -z "$disk_val" ] && [ -z "$proc_val" ]; then continue; fi
    disk_h=$(printf '%s' "$disk_val" | sha256sum | cut -c1-12)
    proc_h=$(printf '%s' "$proc_val" | sha256sum | cut -c1-12)
    if [ "$disk_h" != "$proc_h" ]; then
      echo "⚠️  ENV_DIVERGENTE (secret)"
      echo "   Variável: $var"
      echo "   .env (hash):  $disk_h"
      echo "   PM2  (hash):  $proc_h"
      echo "   Ação: pm2 restart $PROC_NAME --update-env && pm2 save"
      echo ""
      violations=$((violations+1))
    else
      echo "✅ paridade $var (hash bate)"
    fi
  done
fi

echo ""

# --- 3) Healthcheck do Gateway ---
if command -v curl >/dev/null 2>&1; then
  body=$(curl -fsS --max-time 5 "$HEALTH_URL" 2>/dev/null || echo "")
  if [ -n "$body" ]; then
    if echo "$body" | grep -q '"status":"degraded"'; then
      echo "🚨 /health respondeu DEGRADED — config inválida ativa no processo"
      violations=$((violations+1))
    else
      echo "✅ /health OK"
    fi
  else
    echo "⚠️  /health não respondeu em $HEALTH_URL"
  fi
fi

echo ""
if [ "$violations" -gt 0 ]; then
  echo "❌ $violations problema(s) de configuração encontrado(s)"
  exit 2
fi
echo "✅ Configuração de produção OK"
exit 0
