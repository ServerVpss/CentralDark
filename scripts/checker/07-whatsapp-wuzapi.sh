#!/usr/bin/env bash
# Bloco 07 — WhatsApp / WuzAPI / QR (somente leitura — NUNCA reseta)
source "$(dirname "$0")/_lib.sh"
BLOCO="07-whatsapp-wuzapi"

QR="$CK_CENTRALDARK_ROOT/api/whatsapp/qrcode"
require_canonical_path "$BLOCO" "$QR" || exit 0

if [ -d "$QR" ]; then
  emit_ok "$BLOCO" "Pasta do QR presente na CentralDark: $QR"
  COUNT=$(find "$QR" -type f 2>/dev/null | wc -l)
  emit_ok "$BLOCO" "Arquivos no diretório QR: $COUNT"
else
  emit_alerta "$BLOCO" "Pasta do QR ainda não está consolidada na raiz canônica: $QR"
fi

# WuzAPI via Docker é observado pelo runtime; o checker não usa caminhos de
# /root/Multizap como dependência. Se o processo existir fora da CentralDark,
# a migração do componente vira finding separado.
if has_cmd docker; then
  WUZ=$(docker ps --format '{{.Names}}\t{{.Status}}' 2>/dev/null | grep -i wuzapi || true)
  if [ -n "$WUZ" ]; then
    emit_ok "$BLOCO" "Containers WuzAPI ativos: $(echo "$WUZ" | wc -l)"
  else
    emit_alerta "$BLOCO" "Nenhum container WuzAPI detectado"
  fi
fi

if has_cmd pm2; then
  ST=$(pm2 jlist 2>/dev/null | grep -oE '"name":"whatsapp-server"[^}]*"status":"[a-z]+"' | grep -oE '"status":"[a-z]+"' | cut -d'"' -f4)
  case "${ST:-ausente}" in
    online)  emit_ok      "$BLOCO" "whatsapp-server online" ;;
    stopped) emit_alerta  "$BLOCO" "whatsapp-server parado" ;;
    *)       emit_alerta  "$BLOCO" "whatsapp-server estado=${ST:-ausente}" ;;
  esac
fi
