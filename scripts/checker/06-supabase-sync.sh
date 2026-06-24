#!/usr/bin/env bash
# Bloco 06 — Supabase Sync (CloneDeck-Supabase-Sync)
source "$(dirname "$0")/_lib.sh"
BLOCO="06-supabase-sync"

if ! has_cmd pm2; then
  emit_alerta "$BLOCO" "pm2 ausente"
  exit 0
fi

LOGS=$(pm2 logs CloneDeck-Supabase-Sync --lines 200 --nostream 2>/dev/null | sanitize_log || true)

if [ -z "$LOGS" ]; then
  emit_alerta "$BLOCO" "Sem logs recentes — serviço pode estar parado"
  exit 0
fi
emit_ok "$BLOCO" "Logs recentes coletados"

if echo "$LOGS" | grep -qE "401|Unauthorized"; then
  emit_alerta "$BLOCO" "401 do WuzAPI nos logs (token vencido — pendência conhecida)"
fi
if echo "$LOGS" | grep -qE "ECONNREFUSED|ENOTFOUND"; then
  emit_erro "$BLOCO" "Erro de conexão nos logs (ECONNREFUSED/ENOTFOUND)"
fi
if echo "$LOGS" | grep -qi "Recargas Brasil.*pausad"; then
  emit_ok "$BLOCO" "Instância Recargas Brasil pausada (esperado — token a renovar)"
fi
