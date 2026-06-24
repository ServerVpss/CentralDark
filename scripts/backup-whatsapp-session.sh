#!/bin/bash
# ══════════════════════════════════════════════════════════════
# BACKUP DA SESSÃO WHATSAPP — MultiZap
# Este script cria backup completo da sessão ativa antes de
# qualquer reestruturação. NÃO reinicia, NÃO para, NÃO altera
# nenhum serviço.
# ══════════════════════════════════════════════════════════════
set -uo pipefail

TS=$(date +%Y%m%d-%H%M%S)
BACKUP_DIR="/root/Multizap/backups/whatsapp-session-$TS"
LOG="$BACKUP_DIR/backup.log"
CLONE_DECK="/root/Multizap/apps/clone-deck"

mkdir -p "$BACKUP_DIR"

ts() { date '+%Y-%m-%d %H:%M:%S'; }
log() { echo "[$(ts)] $1" | tee -a "$LOG"; }

log "=== BACKUP SESSÃO WHATSAPP START ==="
log "Diretório: $BACKUP_DIR"

# ── 1. DESCOBRIR CONTAINERS DOCKER ──
log ""
log "=== 1. CONTAINERS DOCKER ==="
docker ps --format "table {{.ID}}\t{{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}" > "$BACKUP_DIR/docker-containers.txt" 2>&1
cat "$BACKUP_DIR/docker-containers.txt" >> "$LOG"

# ── 2. DESCOBRIR VOLUMES DOCKER ──
log ""
log "=== 2. VOLUMES DOCKER ==="
docker volume ls > "$BACKUP_DIR/docker-volumes.txt" 2>&1
cat "$BACKUP_DIR/docker-volumes.txt" >> "$LOG"

# ── 3. IDENTIFICAR CONTAINER WUZAPI ──
log ""
log "=== 3. IDENTIFICAR WUZAPI ==="
WUZAPI_CONTAINER=$(docker ps --format "{{.Names}}" | grep -i "wuzapi" | head -1)
if [ -z "$WUZAPI_CONTAINER" ]; then
  log "AVISO: Nenhum container wuzapi encontrado. Tentando 'postgres' dentro de compose..."
  WUZAPI_CONTAINER=$(docker ps --format "{{.Names}}" | grep -i "postgres.*wuzapi\|wuzapi.*postgres\|postgres-wuzapi" | head -1)
fi

if [ -n "$WUZAPI_CONTAINER" ]; then
  log "Container WuzAPI: $WUZAPI_CONTAINER"
  docker inspect "$WUZAPI_CONTAINER" > "$BACKUP_DIR/wuzapi-container-inspect.json" 2>&1
else
  log "ERRO: Nenhum container WuzAPI/Postgres encontrado!"
  log "Listando todos os containers:"
  docker ps -a --format "{{.Names}} | {{.Image}} | {{.Status}}" >> "$LOG" 2>&1
fi

# ── 4. IDENTIFICAR CONTAINER POSTGRES DO WUZAPI ──
log ""
log "=== 4. IDENTIFICAR POSTGRES ==="
PG_CONTAINER=$(docker ps --format "{{.Names}}" | grep -i "postgres.*wuzapi\|postgres.*atendimento" | head -1)
if [ -z "$PG_CONTAINER" ]; then
  # Tentar encontrar o Postgres genérico
  PG_CONTAINER=$(docker ps --format "{{.Names}}" | grep -i "postgres" | head -1)
fi

if [ -n "$PG_CONTAINER" ]; then
  log "Container Postgres: $PG_CONTAINER"
  
  # Descobrir banco e usuário
  PG_USER=$(docker exec "$PG_CONTAINER" env 2>/dev/null | grep "POSTGRES_USER" | cut -d= -f2 | head -1)
  PG_DB=$(docker exec "$PG_CONTAINER" env 2>/dev/null | grep "POSTGRES_DB" | cut -d= -f2 | head -1)
  [ -z "$PG_USER" ] && PG_USER="postgres"
  [ -z "$PG_DB" ] && PG_DB="wuzapi_atendimento"
  
  log "Postgres user: $PG_USER"
  log "Postgres db: $PG_DB"
  
  # ── 5. DUMP DO BANCO ──
  log ""
  log "=== 5. DUMP DO BANCO ==="
  DUMP_FILE="$BACKUP_DIR/wuzapi-db-$TS.sql"
  docker exec "$PG_CONTAINER" pg_dump -U "$PG_USER" "$PG_DB" > "$DUMP_FILE" 2>> "$LOG"
  DUMP_CODE=$?
  
  if [ "$DUMP_CODE" -eq 0 ] && [ -s "$DUMP_FILE" ]; then
    DUMP_SIZE=$(du -h "$DUMP_FILE" | cut -f1)
    DUMP_LINES=$(wc -l < "$DUMP_FILE")
    log "OK: Dump criado: $DUMP_FILE ($DUMP_SIZE, $DUMP_LINES linhas)"
    # Mostrar primeiras linhas sem secrets
    head -5 "$DUMP_FILE" | grep -v "password\|secret\|token\|key" >> "$LOG"
  else
    log "ERRO: pg_dump falhou (code=$DUMP_CODE) ou arquivo vazio"
    # Tentar listar bancos disponíveis
    docker exec "$PG_CONTAINER" psql -U "$PG_USER" -l 2>/dev/null | head -10 >> "$LOG"
  fi
else
  log "ERRO: Container Postgres não encontrado!"
fi

# ── 6. DOCKER COMPOSE DO WUZAPI ──
log ""
log "=== 6. DOCKER COMPOSE ==="
COMPOSE_DIR="$CLONE_DECK/apps/crm/multizap-gateway-deploy/wuzapi"
if [ -d "$COMPOSE_DIR" ]; then
  cp -r "$COMPOSE_DIR" "$BACKUP_DIR/wuzapi-compose/" 2>/dev/null
  # Remover secrets dos .env copiados
  find "$BACKUP_DIR/wuzapi-compose/" -name ".env" -exec sed -i 's/=.*/=***BACKUP_REDACTED***/' {} \;
  log "OK: Docker compose copiado (secrets removidos)"
else
  log "AVISO: $COMPOSE_DIR não encontrado"
fi

# ── 7. PM2 DUMP ──
log ""
log "=== 7. PM2 DUMP ==="
pm2 save > /dev/null 2>&1
cp /root/.pm2/dump.pm2 "$BACKUP_DIR/pm2-dump-$TS.json" 2>/dev/null
if [ -f "$BACKUP_DIR/pm2-dump-$TS.json" ]; then
  log "OK: PM2 dump salvo ($(du -h "$BACKUP_DIR/pm2-dump-$TS.json" | cut -f1))"
else
  log "AVISO: PM2 dump não encontrado"
fi
pm2 list > "$BACKUP_DIR/pm2-list.txt" 2>&1

# ── 8. ENV VARS (NOMES APENAS) ──
log ""
log "=== 8. ENV VARS ==="
WABOT_ENV="/root/Multizap/secrets/wabot.env"
if [ -f "$WABOT_ENV" ]; then
  # Backup completo (mas mantido seguro na pasta de backup)
  cp "$WABOT_ENV" "$BACKUP_DIR/wabot.env.bak" 2>/dev/null
  chmod 600 "$BACKUP_DIR/wabot.env.bak"
  # Log apenas dos nomes
  grep -oP '^[A-Z_]+=' "$WABOT_ENV" > "$BACKUP_DIR/env-var-names.txt"
  log "OK: wabot.env backup criado (chmod 600)"
  log "Variáveis: $(wc -l < "$BACKUP_DIR/env-var-names.txt")"
else
  log "AVISO: $WABOT_ENV não encontrado"
fi

# ── 9. CADDYFILE ──
log ""
log "=== 9. CADDYFILE ==="
if [ -f /etc/caddy/Caddyfile ]; then
  cp /etc/caddy/Caddyfile "$BACKUP_DIR/Caddyfile-$TS"
  log "OK: Caddyfile salvo ($(du -h "$BACKUP_DIR/Caddyfile-$TS" | cut -f1))"
else
  log "AVISO: Caddyfile não encontrado"
fi

# ── 10. LOGS RECENTES ──
log ""
log "=== 10. LOGS RECENTES ==="
for logfile in \
  /var/log/clone-deck-post-deploy.log \
  /var/log/clone-deck-webhook.log \
  /var/log/clone-deck-crm-fix.log \
  /var/log/clone-deck-sync-connections.log; do
  if [ -f "$logfile" ]; then
    tail -30 "$logfile" > "$BACKUP_DIR/$(basename "$logfile")-last30.txt" 2>/dev/null
    log "OK: $(basename "$logfile") (últimas 30 linhas)"
  fi
done

# PM2 logs dos serviços WhatsApp
for svc in MultiZap-Gateway wabot-bridge webhook-bot CloneDeck-Receiver; do
  pm2 logs "$svc" --nostream --lines 20 > "$BACKUP_DIR/pm2-logs-$svc.txt" 2>&1 || true
done
log "OK: PM2 logs dos serviços WhatsApp"

# ── 11. RELATÓRIO ──
log ""
log "=== 11. COPIAR RELATÓRIO ==="
cp "$CLONE_DECK/docs/WHATSAPP_CONNECTION_MAP.md" "$BACKUP_DIR/" 2>/dev/null
log "OK: WHATSAPP_CONNECTION_MAP.md copiado"

# ── 12. WuzAPI STATUS ──
log ""
log "=== 12. WUZAPI STATUS ==="
source "$WABOT_ENV" 2>/dev/null || true
WUZAPI_BASE="${WUZAPI_URL:-http://127.0.0.1:8081}"
WUZAPI_TK="${WUZAPI_ADMIN_TOKEN:-admin}"
WUZAPI_STATUS=$(curl -s --connect-timeout 5 "${WUZAPI_BASE}/admin/users" -H "Authorization: ${WUZAPI_TK}" 2>/dev/null)
if [ -n "$WUZAPI_STATUS" ]; then
  # Salvar mas mascarar tokens
  echo "$WUZAPI_STATUS" | sed 's/"token":"[^"]*"/"token":"***"/g' > "$BACKUP_DIR/wuzapi-sessions.json"
  log "OK: WuzAPI sessions salvas (tokens mascarados)"
  # Contar sessões
  SESSIONS=$(echo "$WUZAPI_STATUS" | python3 -c "import sys,json; d=json.load(sys.stdin); users=d.get('data',d) if isinstance(d,dict) else d; print(len(users))" 2>/dev/null || echo "?")
  log "Sessões encontradas: $SESSIONS"
else
  log "AVISO: WuzAPI não respondeu"
fi

# ── VALIDAÇÃO FINAL ──
log ""
log "=== VALIDAÇÃO DO BACKUP ==="
VALID=true

# Dump SQL
if [ -f "$DUMP_FILE" ] && [ -s "$DUMP_FILE" ]; then
  log "✅ Dump SQL: $(du -h "$DUMP_FILE" | cut -f1), $(wc -l < "$DUMP_FILE") linhas"
else
  log "❌ Dump SQL: AUSENTE ou VAZIO"
  VALID=false
fi

# PM2
if [ -f "$BACKUP_DIR/pm2-dump-$TS.json" ]; then
  log "✅ PM2 dump: $(du -h "$BACKUP_DIR/pm2-dump-$TS.json" | cut -f1)"
else
  log "❌ PM2 dump: AUSENTE"
  VALID=false
fi

# Caddy
if [ -f "$BACKUP_DIR/Caddyfile-$TS" ]; then
  log "✅ Caddyfile: $(du -h "$BACKUP_DIR/Caddyfile-$TS" | cut -f1)"
else
  log "❌ Caddyfile: AUSENTE"
  VALID=false
fi

# Env
if [ -f "$BACKUP_DIR/wabot.env.bak" ]; then
  log "✅ wabot.env: backup criado (chmod 600)"
else
  log "❌ wabot.env: AUSENTE"
  VALID=false
fi

# WuzAPI sessions
if [ -f "$BACKUP_DIR/wuzapi-sessions.json" ]; then
  log "✅ WuzAPI sessions: salvas"
else
  log "⚠️ WuzAPI sessions: não capturadas"
fi

log ""
if [ "$VALID" = true ]; then
  log "✅ BACKUP VALIDADO — todos os arquivos críticos presentes"
else
  log "⚠️ BACKUP INCOMPLETO — verificar itens marcados com ❌"
fi

log ""
log "=== CONFIRMAÇÃO ==="
log "Nenhum serviço WhatsApp foi reiniciado ou derrubado"
log "Nenhuma sessão foi alterada"
log "Nenhum container Docker foi parado"
log "Backup salvo em: $BACKUP_DIR"
log ""
log "=== BACKUP SESSÃO WHATSAPP END ==="

# Listar conteúdo final
log ""
log "=== CONTEÚDO DO BACKUP ==="
ls -la "$BACKUP_DIR/" >> "$LOG"

echo ""
echo "Backup completo em: $BACKUP_DIR"
echo "Log: $LOG"
