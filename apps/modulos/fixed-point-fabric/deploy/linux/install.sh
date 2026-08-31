#!/usr/bin/env bash
set -euo pipefail

SOURCE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
INSTALL_DIR="/opt/centraldark-fixed-point"

install -d "$INSTALL_DIR"
cp -a "$SOURCE_DIR"/. "$INSTALL_DIR"/
python3 -m venv "$INSTALL_DIR/.venv"
"$INSTALL_DIR/.venv/bin/python" -m pip install --upgrade pip
"$INSTALL_DIR/.venv/bin/python" -m pip install -e "$INSTALL_DIR"
install -m 0644 "$SOURCE_DIR/deploy/linux/centraldark-vps-heartbeat.service" /etc/systemd/system/centraldark-vps-heartbeat.service
systemctl daemon-reload
echo "Defina CENTRALDARK_HEARTBEAT_SECRET em /etc/centraldark-fixed-point.env e habilite o serviço."
