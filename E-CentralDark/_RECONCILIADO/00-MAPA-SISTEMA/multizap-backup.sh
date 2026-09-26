#!/usr/bin/env bash
# ============================================================================
# multizap-backup.sh — Backup completo do MultiZap (rodar na VPS)
# ============================================================================
# O que faz:
#   1. pg_dump do banco Lovable Cloud (Postgres)
#   2. Baixa mídias dos buckets Supabase (whatsapp-media, avatars)
#   3. Empacota código (/root/Multizap, sem node_modules)
#   4. Empacota sessões WuzAPI (banco interno + arquivos Whatsmeow)
#   5. Junta tudo num .tar.gz cifrado com AES-256
#   6. Sobe pra nuvem (Backblaze B2, se configurado)
#   7. Remove backups locais com mais de 7 dias
#   8. Registra resultado em backup_runs via API REST do Supabase
#
# Requer no /etc/multizap-backup.env:
#   SUPABASE_DB_URL              -> string de conexão Postgres
#   SUPABASE_URL                 -> https://<ref>.supabase.co
#   SUPABASE_SERVICE_ROLE_KEY    -> service_role key (NÃO logar!)
#   CRON_SECRET                  -> mesmo valor de master_settings.cron_secret
#   BACKUP_ENCRYPTION_PASSWORD   -> senha pra cifrar o .tar.gz final
#   B2_KEY_ID (opcional)         -> credencial Backblaze B2
#   B2_APPLICATION_KEY (opcional)
#   B2_BUCKET_NAME (opcional)    -> nome do bucket B2
#
# NÃO TOCA EM:
#   /root/whatsapp-server, PM2 whatsapp-server, porta 3000, webhook 9001 (Recargas)
#
# Uso:
#   /usr/local/bin/multizap-backup.sh          # backup normal
#   /usr/local/bin/multizap-backup.sh --check  # só checa pré-requisitos
# ============================================================================

set -uo pipefail

# ---- Carrega config ---------------------------------------------------------
ENV_FILE="/etc/multizap-backup.env"
if [ ! -f "$ENV_FILE" ]; then
  echo "[ERRO] $ENV_FILE não encontrado. Veja scripts/vps/INSTALL-backup.md"
  exit 1
fi
# shellcheck disable=SC1090
set -a; source "$ENV_FILE"; set +a

LOG_FILE="${LOG_FILE:-/var/log/multizap-backup.log}"
BACKUP_ROOT="${BACKUP_ROOT:-/root/backups/multizap}"
RETAIN_DAYS="${RETAIN_DAYS:-7}"

STAMP="$(date +%Y-%m-%d_%H%M%S)"
DATE_DIR="$BACKUP_ROOT/$STAMP"
mkdir -p "$DATE_DIR"

STARTED_AT="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

# ---- Helpers ----------------------------------------------------------------
log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"; }

# Mascara secrets em qualquer string que possa vir parar no log
mask() {
  local s="$1"
  echo "${s:0:4}***${s: -4}"
}

file_size() { stat -c%s "$1" 2>/dev/null || echo 0; }

cleanup_old() {
  log "Limpando backups com mais de $RETAIN_DAYS dias em $BACKUP_ROOT..."
  find "$BACKUP_ROOT" -maxdepth 1 -mindepth 1 -type d -mtime +"$RETAIN_DAYS" -exec rm -rf {} \; 2>>"$LOG_FILE" || true
}

record_run() {
  local status="$1" file_path="$2" size="$3" db_size="$4" media_size="$5" code_size="$6" sess_size="$7" cloud_up="$8" cloud_loc="$9" error_msg="${10}"
  local finished_at; finished_at="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

  # Chama RPC record_backup_run via PostgREST
  curl -sS -X POST "$SUPABASE_URL/rest/v1/rpc/record_backup_run" \
    -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
    -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
    -H "Content-Type: application/json" \
    -d "$(jq -n \
      --arg cs "$CRON_SECRET" \
      --arg st "$status" \
      --arg sa "$STARTED_AT" \
      --arg fa "$finished_at" \
      --argjson sz "$size" \
      --argjson dz "$db_size" \
      --argjson mz "$media_size" \
      --argjson cz "$code_size" \
      --argjson xz "$sess_size" \
      --arg fp "$file_path" \
      --argjson cu "$cloud_up" \
      --arg cl "$cloud_loc" \
      --arg em "$error_msg" \
      '{_cron_secret:$cs, _status:$st, _started_at:$sa, _finished_at:$fa,
        _size_bytes:$sz, _db_size_bytes:$dz, _media_size_bytes:$mz,
        _code_size_bytes:$cz, _sessions_size_bytes:$xz,
        _file_path:$fp, _cloud_uploaded:$cu, _cloud_location:$cl,
        _error_message:$em, _trigger_source:"cron"}')" \
    >> "$LOG_FILE" 2>&1 || log "[WARN] Falha ao registrar backup_runs (não fatal)"
}

abort() {
  local msg="$1"
  log "[ERRO FATAL] $msg"
  record_run "error" "" 0 0 0 0 0 false "" "$msg"
  exit 1
}

# ---- Pré-checagens ----------------------------------------------------------
log "===================================================================="
log "MultiZap Backup iniciando — stamp=$STAMP"
log "===================================================================="

for cmd in pg_dump tar gzip openssl curl jq; do
  command -v "$cmd" >/dev/null 2>&1 || abort "Comando '$cmd' não encontrado. Instale: apt install -y $cmd"
done

[ -n "${SUPABASE_DB_URL:-}" ] || abort "SUPABASE_DB_URL não configurada"
[ -n "${SUPABASE_URL:-}" ] || abort "SUPABASE_URL não configurada"
[ -n "${SUPABASE_SERVICE_ROLE_KEY:-}" ] || abort "SUPABASE_SERVICE_ROLE_KEY não configurada"
[ -n "${CRON_SECRET:-}" ] || abort "CRON_SECRET não configurada"
[ -n "${BACKUP_ENCRYPTION_PASSWORD:-}" ] || abort "BACKUP_ENCRYPTION_PASSWORD não configurada"

if [ "${1:-}" = "--check" ]; then
  log "Pré-checagens OK. Saindo (--check)."
  exit 0
fi

# ============================================================================
# 1. DUMP DO BANCO
# ============================================================================
log "[1/5] Dump do banco Lovable Cloud..."
DB_FILE="$DATE_DIR/db.sql.gz"
if ! pg_dump --no-owner --no-privileges --clean --if-exists "$SUPABASE_DB_URL" 2>>"$LOG_FILE" | gzip -9 > "$DB_FILE"; then
  abort "pg_dump falhou. Veja $LOG_FILE"
fi
DB_SIZE=$(file_size "$DB_FILE")
log "  ✓ Banco: $DB_FILE ($DB_SIZE bytes)"

# ============================================================================
# 2. MÍDIAS DOS BUCKETS SUPABASE
# ============================================================================
log "[2/5] Baixando mídias dos buckets Supabase..."
MEDIA_DIR="$DATE_DIR/media"
mkdir -p "$MEDIA_DIR"
MEDIA_FILE="$DATE_DIR/media.tar.gz"

for BUCKET in whatsapp-media avatars; do
  log "  -> bucket '$BUCKET'..."
  BUCKET_DIR="$MEDIA_DIR/$BUCKET"
  mkdir -p "$BUCKET_DIR"

  # Lista TODOS os objetos paginando (1000 por página)
  OFFSET=0
  while :; do
    PAGE=$(curl -sS -X POST "$SUPABASE_URL/storage/v1/object/list/$BUCKET" \
      -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
      -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
      -H "Content-Type: application/json" \
      -d "{\"limit\":1000,\"offset\":$OFFSET}" 2>>"$LOG_FILE" || echo "[]")

    COUNT=$(echo "$PAGE" | jq 'length' 2>/dev/null || echo 0)
    [ "$COUNT" -eq 0 ] && break

    # Baixa cada arquivo desta página
    echo "$PAGE" | jq -r '.[] | select(.id != null) | .name' | while read -r NAME; do
      [ -z "$NAME" ] && continue
      LOCAL_PATH="$BUCKET_DIR/$NAME"
      mkdir -p "$(dirname "$LOCAL_PATH")"
      curl -sS -o "$LOCAL_PATH" \
        -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
        -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
        "$SUPABASE_URL/storage/v1/object/$BUCKET/$NAME" 2>>"$LOG_FILE" || true
    done

    OFFSET=$((OFFSET + COUNT))
    [ "$COUNT" -lt 1000 ] && break
  done
done

tar -czf "$MEDIA_FILE" -C "$DATE_DIR" media 2>>"$LOG_FILE" || log "[WARN] tar de mídias falhou"
rm -rf "$MEDIA_DIR"
MEDIA_SIZE=$(file_size "$MEDIA_FILE")
log "  ✓ Mídias: $MEDIA_FILE ($MEDIA_SIZE bytes)"

# ============================================================================
# 3. CÓDIGO
# ============================================================================
log "[3/5] Empacotando código..."
CODE_FILE="$DATE_DIR/code.tar.gz"
if [ -d /root/Multizap ]; then
  tar --exclude='*/node_modules' --exclude='*/.git' --exclude='*/data/*.json' \
      -czf "$CODE_FILE" -C / root/Multizap 2>>"$LOG_FILE" || log "[WARN] tar de código teve avisos"
else
  log "  [SKIP] /root/Multizap não existe"
  : > "$CODE_FILE"
fi
CODE_SIZE=$(file_size "$CODE_FILE")
log "  ✓ Código: $CODE_FILE ($CODE_SIZE bytes)"

# ============================================================================
# 4. SESSÕES WHATSAPP (WuzAPI + Whatsmeow)
# ============================================================================
log "[4/5] Empacotando sessões WhatsApp..."
SESS_FILE="$DATE_DIR/whatsapp-sessions.tar.gz"
SESS_TMP="$DATE_DIR/_sessions_tmp"
mkdir -p "$SESS_TMP"

# 4a) Arquivos da WuzAPI/Whatsmeow (dbdata volume + .env)
if [ -d /root/Multizap/wuzapi ]; then
  tar -czf "$SESS_TMP/wuzapi-files.tar.gz" -C / root/Multizap/wuzapi 2>>"$LOG_FILE" || log "[WARN] wuzapi-files: avisos"
fi

# 4b) Connections store do Gateway (mapeia connection_id -> session_token)
if [ -f /root/Multizap/gateway/data/connections.json ]; then
  cp /root/Multizap/gateway/data/connections.json "$SESS_TMP/connections.json" 2>>"$LOG_FILE" || true
fi

# 4c) Dump do Postgres interno do container WuzAPI (sessões Whatsmeow)
if docker ps --format '{{.Names}}' 2>/dev/null | grep -q wuzapi-db; then
  log "  -> dump do Postgres do container wuzapi-db..."
  docker exec wuzapi-db pg_dumpall -U postgres 2>>"$LOG_FILE" | gzip -9 > "$SESS_TMP/wuzapi-postgres.sql.gz" || log "[WARN] dump wuzapi-db falhou"
else
  log "  [INFO] container wuzapi-db não encontrado, pulando dump interno"
fi

tar -czf "$SESS_FILE" -C "$DATE_DIR" "$(basename "$SESS_TMP")" 2>>"$LOG_FILE" || true
rm -rf "$SESS_TMP"
SESS_SIZE=$(file_size "$SESS_FILE")
log "  ✓ Sessões: $SESS_FILE ($SESS_SIZE bytes)"

# ============================================================================
# 5. EMPACOTA TUDO E CIFRA
# ============================================================================
log "[5/5] Empacotando e cifrando..."
FINAL_PLAIN="$DATE_DIR/multizap-backup-$STAMP.tar"
FINAL_FILE="$DATE_DIR/multizap-backup-$STAMP.tar.gz.enc"

tar -cf "$FINAL_PLAIN" -C "$DATE_DIR" \
  "$(basename "$DB_FILE")" \
  "$(basename "$MEDIA_FILE")" \
  "$(basename "$CODE_FILE")" \
  "$(basename "$SESS_FILE")" 2>>"$LOG_FILE"

gzip -9 < "$FINAL_PLAIN" | \
  openssl enc -aes-256-cbc -pbkdf2 -iter 200000 -salt \
    -pass env:BACKUP_ENCRYPTION_PASSWORD -out "$FINAL_FILE" 2>>"$LOG_FILE"
rm -f "$FINAL_PLAIN"

# Remove arquivos intermediários, mantém só o .enc
rm -f "$DB_FILE" "$MEDIA_FILE" "$CODE_FILE" "$SESS_FILE"

TOTAL_SIZE=$(file_size "$FINAL_FILE")
log "  ✓ Final cifrado: $FINAL_FILE ($TOTAL_SIZE bytes)"

# ============================================================================
# 6. UPLOAD NUVEM (B2) — opcional
# ============================================================================
CLOUD_UP=false
CLOUD_LOC=""
if [ -n "${B2_KEY_ID:-}" ] && [ -n "${B2_APPLICATION_KEY:-}" ] && [ -n "${B2_BUCKET_NAME:-}" ]; then
  if command -v b2 >/dev/null 2>&1; then
    log "Subindo pra Backblaze B2 (key=$(mask "$B2_KEY_ID"), bucket=$B2_BUCKET_NAME)..."
    if b2 authorize-account "$B2_KEY_ID" "$B2_APPLICATION_KEY" >/dev/null 2>>"$LOG_FILE"; then
      REMOTE_NAME="multizap-backup-$STAMP.tar.gz.enc"
      if b2 upload-file "$B2_BUCKET_NAME" "$FINAL_FILE" "$REMOTE_NAME" >>"$LOG_FILE" 2>&1; then
        CLOUD_UP=true
        CLOUD_LOC="b2://$B2_BUCKET_NAME/$REMOTE_NAME"
        log "  ✓ Upload B2: $CLOUD_LOC"
      else
        log "  [WARN] Upload B2 falhou"
      fi
    else
      log "  [WARN] Autenticação B2 falhou"
    fi
  else
    log "[INFO] CLI 'b2' não instalada (pip install b2). Upload pra nuvem pulado."
  fi
else
  log "[INFO] B2 não configurado, backup salvo só localmente."
fi

# ============================================================================
# Finaliza
# ============================================================================
cleanup_old

record_run "success" "$FINAL_FILE" "$TOTAL_SIZE" "$DB_SIZE" "$MEDIA_SIZE" "$CODE_SIZE" "$SESS_SIZE" "$CLOUD_UP" "$CLOUD_LOC" ""

log "===================================================================="
log "Backup concluído: $FINAL_FILE ($TOTAL_SIZE bytes)"
log "===================================================================="
