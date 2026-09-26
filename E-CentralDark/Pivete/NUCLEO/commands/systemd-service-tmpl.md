# COMANDO - systemd-service-tmpl.conf
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\squads\autoclaw\templates\systemd-service-tmpl.conf
**SHA:** 3e8c087b68d474dd
**Timestamp:** 2026-08-28T02:19:31.971284
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- ExecStart=/usr/bin/node {INSTALL_DIR}/dist/index.js
- Restart=always

### Ouro Bruto (primeiros 5000 chars)
```
# OpenClaw Systemd Service Template
# Copy to /etc/systemd/system/openclaw.service and customize
#
# Variables to replace:
#   {INSTALL_DIR} - OpenClaw installation directory (e.g., /opt/openclaw)
#   {USER} - System user to run as (e.g., openclaw)
#
# After copying:
#   systemctl daemon-reload
#   systemctl enable --now openclaw

[Unit]
Description=OpenClaw AI Agent Gateway
Documentation=https://github.com/nicepkg/openclaw
After=network.target docker.service tailscaled.service
Wants=docker.service tailscaled.service

[Service]
Type=simple
User={USER}
Group={USER}
WorkingDirectory={INSTALL_DIR}
ExecStart=/usr/bin/node {INSTALL_DIR}/dist/index.js
Restart=always
RestartSec=5

# Environment
EnvironmentFile={INSTALL_DIR}/.env

# Security hardening
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths={INSTALL_DIR}/data {INSTALL_DIR}/logs

# Resource limits
MemoryMax=3G
CPUQuota=80%

# Logging
StandardOutput=journal
StandardError=journal
SyslogIdentifier=openclaw

[Install]
WantedBy=multi-user.target

```