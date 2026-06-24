#!/usr/bin/env bash
# Bloco 04 — PM2 (10 serviços esperados)
source "$(dirname "$0")/_lib.sh"
BLOCO="04-pm2"

ESPERADOS=(
  CloneDeck-CRM
  CloneDeck-Supabase-Sync
  MCP-CentralDark
  MultiZap-Gateway
  MultiZap-GitHub-Webhook
  MultiZap-TelegramBot
  github-webhook
  wabot-bridge
  webhook-bot
  whatsapp-server
)

if ! has_cmd pm2; then
  emit_erro "$BLOCO" "pm2 não está instalado"
  exit 0
fi

LISTA=$(pm2 jlist 2>/dev/null || echo "[]")

for nome in "${ESPERADOS[@]}"; do
  STATUS=$(echo "$LISTA" | grep -oE "\"name\":\"$nome\"[^}]*\"status\":\"[a-z]+\"" | grep -oE '"status":"[a-z]+"' | tail -1 | cut -d'"' -f4)
  RESTARTS=$(echo "$LISTA" | grep -oE "\"name\":\"$nome\"[^}]*\"restart_time\":[0-9]+" | grep -oE '"restart_time":[0-9]+' | tail -1 | cut -d: -f2)
  RESTARTS="${RESTARTS:-0}"

  if [ -z "$STATUS" ]; then
    emit_alerta "$BLOCO" "$nome ausente do PM2"
  elif [ "$STATUS" = "online" ] && [ "$RESTARTS" -lt 5 ]; then
    emit_ok "$BLOCO" "$nome online (restarts=$RESTARTS)"
  elif [ "$STATUS" = "online" ]; then
    emit_alerta "$BLOCO" "$nome online MAS restarts altos ($RESTARTS) — possível loop"
  else
    emit_erro "$BLOCO" "$nome estado=$STATUS (esperado: online)"
  fi
done
