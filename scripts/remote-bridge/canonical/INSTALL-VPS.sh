#!/usr/bin/env bash
set -euo pipefail

SRC="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEST="/root/CentralDark/runtime/remote-tray"

mkdir -p "$DEST"/{config,receipts,logs,runtime,state}

cp -f "$SRC/REMOTE-TRAY-STATUS-CANONICO.md" "$DEST/"
cp -f "$SRC/remote-tray-status.json" "$DEST/receipts/latest.json"

echo "CENTRALDARK_REMOTE_TRAY_CANONICAL=INSTALLED"
echo "DEST=$DEST"
echo "NOTE=Este instalador nao copia secrets, tokens, node_modules ou cache Windows."
echo "NEXT=instalar/ligar o runtime Linux existente e remedir systemd + auth + online."
