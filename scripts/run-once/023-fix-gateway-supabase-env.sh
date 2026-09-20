#!/bin/bash
set -euo pipefail

TIMESTAMP=$(date +%Y%m%d-%H%M%S)
REV="/root/Multizap/revisoes/${TIMESTAMP}/023-fix-gateway-supabase-env"
mkdir -p "$REV"/{logs,diagnostico}
exec > >(tee -a "$REV/logs/execucao.log") 2>&1

GW_ENV="/root/Multizap/gateway/.env"
WABOT_ENV="/root/Multizap/secrets/wabot.env"

echo "=== FIX GATEWAY SUPABASE ENV ==="

if [ ! -f "$GW_ENV" ]; then
  touch "$GW_ENV"
fi

cp "$GW_ENV" "$REV/diagnostico/gateway.env.backup"

if [ -f "$WABOT_ENV" ]; then
  SUPA_URL=$(grep "SUPABASE_URL=" "$WABOT_ENV" || true)
  SUPA_SR_KEY=$(grep "SUPABASE_SERVICE_ROLE_KEY=" "$WABOT_ENV" || true)
  SUPA_ANON_KEY=$(grep "SUPABASE_ANON_KEY=" "$WABOT_ENV" || true)
  
  if [ -n "$SUPA_URL" ] && ! grep -q "SUPABASE_URL=" "$GW_ENV"; then
    echo "$SUPA_URL" >> "$GW_ENV"
    echo "Added SUPABASE_URL"
  fi
  
  if [ -n "$SUPA_SR_KEY" ] && ! grep -q "SUPABASE_SERVICE_ROLE_KEY=" "$GW_ENV"; then
    echo "$SUPA_SR_KEY" >> "$GW_ENV"
    echo "Added SUPABASE_SERVICE_ROLE_KEY"
  fi

  if [ -n "$SUPA_ANON_KEY" ] && ! grep -q "SUPABASE_ANON_KEY=" "$GW_ENV"; then
    echo "$SUPA_ANON_KEY" >> "$GW_ENV"
    echo "Added SUPABASE_ANON_KEY"
  fi
else
  echo "wabot.env nao encontrado!"
fi

echo "Environment restored securely."
