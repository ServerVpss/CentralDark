#!/usr/bin/env bash
# Instala Docker Engine + plugin compose em Ubuntu.
# NÃO mexe no /root/whatsapp-server nem no PM2 whatsapp-server.
set -euo pipefail

if command -v docker >/dev/null 2>&1; then
  echo "[install-docker] Docker já instalado: $(docker --version)"
else
  echo "[install-docker] Instalando Docker Engine..."
  apt-get update -y
  apt-get install -y ca-certificates curl gnupg lsb-release
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  chmod a+r /etc/apt/keyrings/docker.gpg
  echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
    $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
    > /etc/apt/sources.list.d/docker.list
  apt-get update -y
  apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
  systemctl enable --now docker
fi

echo "[install-docker] OK. $(docker --version) | $(docker compose version)"
echo "[install-docker] IMPORTANTE: não reiniciamos nem paramos nenhum processo de Recargas Brasil."
