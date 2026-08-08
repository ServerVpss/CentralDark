#!/usr/bin/env bash
# Bloco 10 — CRM (SOMENTE LEITURA — proibido mover/alterar)
source "$(dirname "$0")/_lib.sh"
BLOCO="10-crm"

CRM="$CK_CENTRALDARK_ROOT/apps/crm"
require_canonical_path "$BLOCO" "$CRM" || exit 0

if [ -d "$CRM" ]; then
  emit_ok "$BLOCO" "Pasta CRM presente na CentralDark: $CRM"
else
  emit_alerta "$BLOCO" "CRM ainda não está consolidado na raiz canônica: $CRM"
fi

if has_cmd pm2; then
  ST=$(pm2 jlist 2>/dev/null | grep -oE '"name":"CentralDark-CloneDeck"[^}]*"status":"[a-z]+"' | grep -oE '"status":"[a-z]+"' | cut -d'"' -f4)
  if [ "$ST" = "online" ]; then
    emit_ok "$BLOCO" "Processo legado CentralDark-CloneDeck online; validar CWD canônico antes de tratá-lo como runtime CentralDark"
  else
    emit_alerta "$BLOCO" "CentralDark-CloneDeck estado=${ST:-ausente}"
  fi
fi
