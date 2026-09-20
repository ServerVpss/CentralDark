#!/bin/bash
set -uo pipefail

LOG="/var/log/clone-deck-post-deploy.log"
log() { echo "[$(date '+%H:%M:%S')] $*" >> "$LOG" 2>/dev/null; echo "$*"; }

log "=== 015: DIAGNOSTICO COMPLETO ==="

log ""
log "--- PM2 STATUS ---"
pm2 list 2>&1

log ""
log "--- PORTAS ABERTAS ---"
ss -tulpn | grep -E "3100|8081|9010|9003|3000|5000" 2>&1

log ""
log "--- CADDY STATUS ---"
systemctl status caddy --no-pager 2>&1 | head -10

log ""
log "--- CONTAINERS DOCKER ---"
docker ps 2>&1 || echo "Docker nao rodando"

log ""
log "--- WUZAPI TEST ---"
curl -s --connect-timeout 5 http://127.0.0.1:8081/status 2>&1 | head -5 || echo "WuzAPI offline"

log ""
log "--- GATEWAY TEST ---"
curl -s --connect-timeout 5 http://127.0.0.1:3100/health 2>&1 || echo "Gateway offline"

log "=== 015: FIM ==="
