#!/usr/bin/env bash
set -euo pipefail
ROOT="${CENTRALDARK_BRIDGE_ROOT:-/opt/centraldark-bridge}"
SERVICE="/etc/systemd/system/centraldark-bridge.service"

sudo mkdir -p "$ROOT"
sudo install -m 0755 centraldark_bridge_server.py "$ROOT/centraldark_bridge_server.py"

sudo tee "$SERVICE" >/dev/null <<EOF
[Unit]
Description=CentralDark Bridge health/probe service
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
WorkingDirectory=$ROOT
Environment=CENTRALDARK_BRIDGE_HOST=127.0.0.1
Environment=CENTRALDARK_BRIDGE_PORT=9180
Environment=CENTRALDARK_MCP_LOCAL=http://127.0.0.1:9100/mcp
ExecStart=/usr/bin/python3 $ROOT/centraldark_bridge_server.py
Restart=on-failure
RestartSec=3
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=$ROOT

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable --now centraldark-bridge.service
sleep 1
curl -fsS http://127.0.0.1:9180/health && echo
curl -fsS http://127.0.0.1:9180/mcp-probe && echo
printf 'INSTALL_VPS=PASS\nSERVICE=centraldark-bridge\nBIND=127.0.0.1:9180\n'
