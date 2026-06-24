#!/usr/bin/env bash
# Bloco 10 — CRM (SOMENTE LEITURA — proibido mover/alterar)
source "$(dirname "$0")/_lib.sh"
BLOCO="10-crm"

CRM="$CK_MULTIZAP_ROOT/apps/crm"
if [ -d "$CRM" ]; then
  emit_ok "$BLOCO" "Pasta CRM presente: $CRM"
else
  emit_alerta "$BLOCO" "Pasta CRM ausente em $CRM"
fi

if has_cmd pm2; then
  ST=$(pm2 jlist 2>/dev/null | grep -oE '"name":"CloneDeck-CRM"[^}]*"status":"[a-z]+"' | grep -oE '"status":"[a-z]+"' | cut -d'"' -f4)
  if [ "$ST" = "online" ]; then
    emit_ok "$BLOCO" "CloneDeck-CRM online"
  else
    emit_alerta "$BLOCO" "CloneDeck-CRM estado=${ST:-ausente}"
  fi
fi
