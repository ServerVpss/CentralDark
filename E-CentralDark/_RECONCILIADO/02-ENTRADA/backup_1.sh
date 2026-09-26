#!/usr/bin/env bash
# Faz backup APENAS de /root/atendimento-whatsapp-gateway. Não inclui Recargas Brasil.
set -euo pipefail
SRC="/root/atendimento-whatsapp-gateway"
DEST_DIR="/root/backups"
STAMP="$(date +%Y%m%d-%H%M%S)"
DEST="$DEST_DIR/atendimento-whatsapp-gateway-$STAMP.tar.gz"

mkdir -p "$DEST_DIR"
if [ ! -d "$SRC" ]; then
  echo "[backup] Pasta $SRC não existe. Nada a fazer."
  exit 0
fi

tar --exclude="$SRC/gateway/node_modules" -czf "$DEST" -C / "${SRC#/}"
echo "[backup] OK -> $DEST"
