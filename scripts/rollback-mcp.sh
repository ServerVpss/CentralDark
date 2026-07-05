#!/usr/bin/env bash
# rollback-mcp.sh — snapshot antes / rollback rápido em <30s.
# Uso na VPS:
#   scripts/rollback-mcp.sh snapshot   # tira snapshot dos .js do MCP
#   scripts/rollback-mcp.sh rollback   # restaura o último snapshot + restart PM2
#
# Guarda snapshots em /root/CentralDark/backups/mcp-YYYYMMDD-HHMMSS/
set -euo pipefail

MCP_DIR="/root/CentralDark/apps/modulos/mcp/dist"
BACKUP_ROOT="/root/CentralDark/backups"
mkdir -p "$BACKUP_ROOT"

case "${1:-help}" in
  snapshot)
    STAMP=$(date +%Y%m%d-%H%M%S)
    DEST="$BACKUP_ROOT/mcp-$STAMP"
    mkdir -p "$DEST"
    cp -a "$MCP_DIR"/*.js "$DEST"/
    ls -1t "$BACKUP_ROOT" | tail -n +11 | xargs -I{} rm -rf "$BACKUP_ROOT/{}" 2>/dev/null || true
    echo "✅ Snapshot: $DEST"
    ;;
  rollback)
    LAST=$(ls -1t "$BACKUP_ROOT" | grep '^mcp-' | head -n1 || true)
    if [ -z "$LAST" ]; then echo "❌ Nenhum snapshot encontrado"; exit 1; fi
    echo "🔄 Restaurando: $BACKUP_ROOT/$LAST"
    cp -a "$BACKUP_ROOT/$LAST"/*.js "$MCP_DIR"/
    pm2 restart MCP-CentralDark --update-env
    sleep 2
    curl -fsS https://mcp.centralldark.com/health >/dev/null && echo "✅ Rollback OK" || (echo "❌ Health falhou após rollback"; exit 2)
    ;;
  list)
    ls -1t "$BACKUP_ROOT" | grep '^mcp-' || echo "(vazio)"
    ;;
  *)
    echo "uso: $0 {snapshot|rollback|list}"; exit 1;;
esac
