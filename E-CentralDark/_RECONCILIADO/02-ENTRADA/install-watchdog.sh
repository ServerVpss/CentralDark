#!/usr/bin/env bash
# Instala o mcp-watchdog.sh em /usr/local/bin e registra o cron de 1 minuto.
# Idempotente — pode rodar quantas vezes quiser.
set -euo pipefail

SRC="$(cd "$(dirname "$0")" && pwd)/mcp-watchdog.sh"
DST="/usr/local/bin/mcp-watchdog.sh"
CRON_LINE="* * * * * /usr/local/bin/mcp-watchdog.sh >/dev/null 2>&1"
LOGROTATE="/etc/logrotate.d/mcp-watchdog"

install -m 0755 "$SRC" "$DST"
mkdir -p /var/lib/mcp-watchdog
touch /var/log/mcp-watchdog.log
chmod 644 /var/log/mcp-watchdog.log

# adiciona ao crontab se ainda não estiver lá
( crontab -l 2>/dev/null | grep -v 'mcp-watchdog.sh' ; echo "$CRON_LINE" ) | crontab -

# logrotate
cat > "$LOGROTATE" <<'EOF'
/var/log/mcp-watchdog.log {
  weekly
  rotate 4
  compress
  missingok
  notifempty
  copytruncate
}
EOF

echo "[install-watchdog] OK — instalado em $DST, cron registrado, logrotate configurado."
echo "[install-watchdog] Rode 1x manualmente pra inicializar o status.json:"
echo "    $DST"
