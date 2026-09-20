#!/usr/bin/env bash
set -uo pipefail

REPO_DIR="/root/Multizap/apps/clone-deck"
LOG_DIR="/root/Multizap/revisoes"
mkdir -p "$LOG_DIR" /root/Multizap/guarda 2>/dev/null || true

chmod +x "$REPO_DIR/scripts/guarda/guarda-env-normalizar.sh" 2>/dev/null || true
chmod +x "$REPO_DIR/scripts/guarda/guarda-limpar-logs.sh" 2>/dev/null || true
chmod +x "$REPO_DIR/scripts/guarda/guarda-status.sh" 2>/dev/null || true

# Normaliza env e gera status inicial sem quebrar deploy.
[ -x "$REPO_DIR/scripts/guarda/guarda-env-normalizar.sh" ] && bash "$REPO_DIR/scripts/guarda/guarda-env-normalizar.sh" || true
[ -x "$REPO_DIR/scripts/guarda/guarda-status.sh" ] && bash "$REPO_DIR/scripts/guarda/guarda-status.sh" || true

CRON_LINE="*/5 * * * * $REPO_DIR/scripts/guarda/guarda-status.sh >> $LOG_DIR/guarda-cron.log 2>&1"
CLEAN_LINE="17 */2 * * * $REPO_DIR/scripts/guarda/guarda-limpar-logs.sh >> $LOG_DIR/guarda-limpeza-cron.log 2>&1"

TMP="$(mktemp)"
crontab -l 2>/dev/null | grep -v "scripts/guarda/guarda-status.sh" | grep -v "scripts/guarda/guarda-limpar-logs.sh" > "$TMP" || true
echo "$CRON_LINE" >> "$TMP"
echo "$CLEAN_LINE" >> "$TMP"
crontab "$TMP"
rm -f "$TMP"

echo "✅ Guarda cron instalado"
crontab -l | grep "scripts/guarda" || true
exit 0
