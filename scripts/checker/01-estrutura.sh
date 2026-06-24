#!/usr/bin/env bash
# Bloco 01 — Estrutura de pastas obrigatórias
source "$(dirname "$0")/_lib.sh"
BLOCO="01-estrutura"

PASTAS_OBRIG=(
  "$CK_MULTIZAP_ROOT"
  "$CK_MULTIZAP_ROOT/apps/bot"
  "$CK_MULTIZAP_ROOT/apps/bot-telegram"
  "$CK_MULTIZAP_ROOT/api/whatsapp/qrcode"
  "$CK_MULTIZAP_ROOT/revisoes"
)

for p in "${PASTAS_OBRIG[@]}"; do
  if [ -d "$p" ]; then
    emit_ok "$BLOCO" "Pasta existe: $p"
  else
    emit_erro "$BLOCO" "Pasta faltando: $p"
  fi
done

# CentralDark (nova estrutura) — opcional, só alerta
for p in "$CK_CENTRALDARK_ROOT" "$CK_CENTRALDARK_ROOT/secrets" "$CK_CENTRALDARK_ROOT/revisoes"; do
  if [ -d "$p" ]; then
    emit_ok "$BLOCO" "CentralDark: $p"
  else
    emit_alerta "$BLOCO" "CentralDark ainda não migrado: $p (esperado, migração gradual)"
  fi
done
