#!/usr/bin/env bash
# Bloco 07 — WhatsApp / WuzAPI / QR (somente leitura — NUNCA reseta)
source "$(dirname "$0")/_lib.sh"
BLOCO="07-whatsapp-wuzapi"

QR="$CK_MULTIZAP_ROOT/api/whatsapp/qrcode"
if [ -d "$QR" ]; then
  emit_ok "$BLOCO" "Pasta do QR presente: $QR"
  COUNT=$(find "$QR" -type f 2>/dev/null | wc -l)
  emit_ok "$BLOCO" "Arquivos no diretório QR: $COUNT"
else
  emit_alerta "$BLOCO" "Pasta do QR ausente: $QR"
fi

# WuzAPI via Docker (só lista, não toca)
if has_cmd docker; then
  WUZ=$(docker ps --format '{{.Names}}\t{{.Status}}' 2>/dev/null | grep -i wuzapi || true)
  if [ -n "$WUZ" ]; then
    emit_ok "$BLOCO" "Containers WuzAPI ativos: $(echo "$WUZ" | wc -l)"
  else
    emit_alerta "$BLOCO" "Nenhum container WuzAPI detectado (pode não estar usando Docker aqui)"
  fi
fi

# whatsapp-server PM2 (status conhecido — pode estar parado de propósito)
if has_cmd pm2; then
  ST=$(pm2 jlist 2>/dev/null | grep -oE '"name":"whatsapp-server"[^}]*"status":"[a-z]+"' | grep -oE '"status":"[a-z]+"' | cut -d'"' -f4)
  case "${ST:-ausente}" in
    online)  emit_ok      "$BLOCO" "whatsapp-server online" ;;
    stopped) emit_alerta  "$BLOCO" "whatsapp-server parado (esperado — falta pino-roll, pendência #6)" ;;
    *)       emit_alerta  "$BLOCO" "whatsapp-server estado=$ST" ;;
  esac
fi
