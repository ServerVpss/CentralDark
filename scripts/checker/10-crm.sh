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
  ST=$(pm2 jlist 2>/dev/null | grep -oE '"name":"CentralDark-CloneDeck"[^}]*"status":"[a-z]+"' | grep -oE '"status":"[a-z]+"' | cut -d'"' -f4)
  if [ "$ST" = "online" ]; then
    emit_ok "$BLOCO" "CentralDark-CloneDeck online"
  else
    emit_alerta "$BLOCO" "CentralDark-CloneDeck estado=${ST:-ausente}"
  fi
fi
