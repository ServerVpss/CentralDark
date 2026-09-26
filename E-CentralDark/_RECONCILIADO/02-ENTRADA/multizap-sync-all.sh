#!/usr/bin/env bash
# multizap-sync-all: puxa repo do GitHub e sincroniza pastas usadas na VPS
# Uso: multizap-sync-all
set -e

REPO_DIR="/root/Multizap-repo"
GATEWAY_DIR="/root/Multizap"
BIN_DIR="/usr/local/bin"

echo "==> 1/4 Atualizando repo ($REPO_DIR)"
cd "$REPO_DIR"
git fetch origin main --quiet
git reset --hard origin/main --quiet
echo "    HEAD: $(git rev-parse --short HEAD) - $(git log -1 --pretty=%s)"

echo "==> 2/4 Sincronizando gateway -> $GATEWAY_DIR"
if [ -d "$REPO_DIR/multizap-gateway-deploy" ]; then
  rsync -a --delete \
    --exclude='node_modules' --exclude='.env' --exclude='sessions' --exclude='logs' \
    "$REPO_DIR/multizap-gateway-deploy/" "$GATEWAY_DIR/"
  echo "    gateway OK"
else
  echo "    (sem pasta gateway no repo, pulando)"
fi

echo "==> 3/4 Instalando scripts VPS -> $BIN_DIR"
for f in multizap-backup-quick.sh multizap-backup.sh multizap-restore.sh multizap-autopull.sh multizap-sync-all.sh; do
  src="$REPO_DIR/scripts/vps/$f"
  if [ -f "$src" ]; then
    name="${f%.sh}"
    cp "$src" "$BIN_DIR/$name"
    chmod +x "$BIN_DIR/$name"
    echo "    $name OK"
  fi
done

echo "==> 4/4 Reload PM2 gateway (se existir)"
if pm2 describe MultiZap-Gateway >/dev/null 2>&1; then
  pm2 reload MultiZap-Gateway --update-env >/dev/null && echo "    reload OK"
else
  echo "    (PM2 MultiZap-Gateway não encontrado, pulando)"
fi

echo
echo "Sincronização concluída."
