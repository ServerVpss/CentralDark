#!/usr/bin/env bash
# ============================================================
# MultiZap — Backup rápido (gateway + banco) com destino plugável
# Uso: sudo multizap-backup-quick [github|b2|s3|local]
#
# Lê secrets de /etc/multizap-backup.env (chmod 600). Nunca loga valores.
# Destino padrão: github (hoje). b2/s3 já preparados pro futuro.
# ============================================================
set -euo pipefail

ENV_FILE="/etc/multizap-backup.env"
GATEWAY_DIR="/root/Multizap/gateway"
DEFAULT_BACKUP_DIR="/root/backups/multizap"
TS="$(date +%F_%H-%M-%S)"
WORKER_ID="$(hostname 2>/dev/null || echo vps)-$$"
RUN_ID=""
STEP="iniciando"
DEST=""
DEST_ARG="${1:-}"
PENDING_ONLY=false
if [ "$DEST_ARG" = "--process-pending" ]; then
  PENDING_ONLY=true
  DEST_ARG="${2:-}"
fi

log()  { echo "[$(date +%H:%M:%S)] $*" >&2; }
fail() { echo "ERRO: $*" >&2; exit 1; }

json_escape() { jq -Rn --arg v "$1" '$v'; }

panel_post() {
  [ -n "${RUN_ID:-}" ] || return 0
  local step="$1" percent="$2" message="$3" status="${4:-running}" extra="${5:-}"
  STEP="$step"
  local payload
  payload="$(jq -n \
    --arg id "$RUN_ID" \
    --arg step "$step" \
    --arg msg "$message" \
    --arg status "$status" \
    --arg dest "${DEST:-github}" \
    --argjson pct "$percent" \
    '{id:$id, step:$step, percent:$pct, message:$msg, status:$status, destination:$dest}')"
  if [ -n "$extra" ]; then
    payload="$(jq -c ". + ($extra)" <<<"$payload")"
  fi
  curl -fsS -X POST "$SUPABASE_URL/api/public/backup-progress" \
    -H "x-cron-secret: $CRON_SECRET" \
    -H "Content-Type: application/json" \
    -d "$payload" >/dev/null 2>&1 || true
}

on_error() {
  local line="$1" code="$2"
  local msg="A cópia parou na etapa '$STEP'. Código $code na linha $line. Veja /var/log/multizap-backup.log na VPS."
  log "$msg"
  panel_post "erro" 95 "$msg" "error" "$(jq -n --arg em "$msg" '{error_message:$em}')"
  exit "$code"
}
trap 'on_error $LINENO $?' ERR

# 1) Carrega env mínimo (sem expor)
[ -f "$ENV_FILE" ] || fail "Faltando $ENV_FILE (chmod 600). Defina SUPABASE_DB_URL, SUPABASE_URL e CRON_SECRET."
# shellcheck disable=SC1090
set +x; source "$ENV_FILE"; set +x
: "${SUPABASE_DB_URL:?SUPABASE_DB_URL não definido}"
: "${SUPABASE_URL:?SUPABASE_URL não definido}"
: "${CRON_SECRET:?CRON_SECRET não definido}"
command -v jq      >/dev/null || fail "jq não instalado (apt install jq)"
command -v curl    >/dev/null || fail "curl não instalado"

# 1a) Primeiro tenta assumir pedido pendente criado pelo painel.
log "Falando com o painel para ver se existe pedido de backup..."
CLAIM_JSON="$(curl -fsS -H "x-cron-secret: $CRON_SECRET" \
  "$SUPABASE_URL/api/public/backup-progress?mode=claim&worker_id=$WORKER_ID" || true)"
[ -n "$CLAIM_JSON" ] || fail "Não consegui falar com o painel. Verifique SUPABASE_URL, CRON_SECRET e internet da VPS."
if [ "$(echo "$CLAIM_JSON" | jq -r '.idle // false')" = "true" ]; then
  if [ "$PENDING_ONLY" = "true" ]; then
    log "Nenhum pedido novo no painel. Nada a fazer agora."
    exit 0
  fi
  log "Sem pedido pendente. Vou registrar uma cópia iniciada diretamente pela VPS."
  CLAIM_JSON="$(curl -fsS -H "x-cron-secret: $CRON_SECRET" \
    "$SUPABASE_URL/api/public/backup-progress?source=cron&worker_id=$WORKER_ID" || true)"
  [ -n "$CLAIM_JSON" ] || fail "Não consegui criar o registro do backup no painel."
fi
RUN_ID="$(echo "$CLAIM_JSON" | jq -r '.id // empty')"
DEST="$(echo "$CLAIM_JSON" | jq -r '.destination // "github"')"
[ -n "$RUN_ID" ] || fail "Painel respondeu sem ID do backup."
panel_post "vps_conectada" 8 "A VPS respondeu ao painel e assumiu o pedido." "running"

# 1b) Puxa segredos do cofre (banco) — nunca ficam em arquivo na VPS
log "Buscando cofre de credenciais no painel master..."
VAULT_JSON="$(curl -fsS -H "x-cron-secret: $CRON_SECRET" \
  "$SUPABASE_URL/api/public/backup-config" || true)"
[ -n "$VAULT_JSON" ] || fail "Falha ao buscar cofre. Verifique CRON_SECRET e se há credenciais salvas em /admin/backups."

# jq -r devolve "null" se o campo for ausente; converte pra string vazia
get() { echo "$VAULT_JSON" | jq -r ".${1} // empty"; }
GITHUB_TOKEN="$(get github_token)"
GITHUB_REPO="$(get github_repo)"
BACKUP_ENCRYPTION_PASSWORD="$(get encryption_password)"
B2_KEY_ID="$(get b2_key_id)"
B2_APPLICATION_KEY="$(get b2_application_key)"
B2_BUCKET_NAME="$(get b2_bucket_name)"
AWS_S3_BUCKET="$(get aws_s3_bucket)"
AWS_ACCESS_KEY_ID="$(get aws_access_key_id)"
AWS_SECRET_ACCESS_KEY="$(get aws_secret_access_key)"
unset VAULT_JSON

# Destino: arg > env > painel > github
DEST="${DEST_ARG:-${BACKUP_DESTINATION:-${DEST:-github}}}"
case "$DEST" in
  github|b2|s3|local) ;;
  *) fail "Destino inválido: $DEST (use github|b2|s3|local)";;
esac
log "Destino selecionado: $DEST"
panel_post "destino_escolhido" 12 "Destino escolhido: $DEST. Agora vou separar as pastas da cópia." "running"


# 2) Diretório local de trabalho — TUDO em um lugar só, dividido em 3 pastas
#    /root/backups/multizap/<data>/
#       ├── banco/      (dump do banco de dados)
#       ├── site/       (painel — hospedado na nuvem)
#       └── servidor/   (código do servidor WhatsApp da VPS)
BACKUP_DIR="$DEFAULT_BACKUP_DIR"
OUT_DIR="$BACKUP_DIR/$TS"
BANCO_DIR="$OUT_DIR/banco"
SITE_DIR="$OUT_DIR/site"
SERVIDOR_DIR="$OUT_DIR/servidor"
mkdir -p "$BANCO_DIR" "$SITE_DIR" "$SERVIDOR_DIR"
chmod 700 "$BACKUP_DIR" "$OUT_DIR"
panel_post "pastas_criadas" 18 "Criei a pasta principal e as 3 divisões: banco, site e servidor." "running"

# 3) Pré-checagens
command -v pg_dump >/dev/null || fail "pg_dump não instalado (apt install postgresql-client)"
command -v tar     >/dev/null || fail "tar não instalado"
[ -d "$GATEWAY_DIR" ] || fail "Gateway não encontrado em $GATEWAY_DIR"
panel_post "checagens_ok" 24 "VPS conferida: ferramentas básicas e pasta do servidor encontradas." "running"

# 4) BANCO — dump completo
log "[1/3] Salvando o banco de dados..."
panel_post "salvando_banco" 32 "Estou salvando o banco de dados: conversas, contatos e configurações." "running"
DB_FILE="$BANCO_DIR/db-$TS.sql.gz"
pg_dump "$SUPABASE_DB_URL" --no-owner --no-privileges --clean --if-exists \
  | gzip -9 > "$DB_FILE"
DB_SIZE_BYTES=$(stat -c%s "$DB_FILE")
log "      Banco: $(du -h "$DB_FILE" | cut -f1)"
panel_post "banco_salvo" 48 "Banco salvo com sucesso." "running" "$(jq -n --argjson s "$DB_SIZE_BYTES" '{db_size_bytes:$s}')"

# 5) SITE — o painel mora na nuvem (Lovable); registra só um manifesto.
log "[2/3] Registrando informações do site (painel hospedado na nuvem)..."
panel_post "salvando_site" 58 "Estou guardando as informações do site/painel para restauração." "running"
cat > "$SITE_DIR/LEIA-ME.txt" <<EOF
Painel MultiZap — hospedado em $SUPABASE_URL
O código-fonte do site fica no GitHub (sincronizado com a Lovable),
por isso não há arquivos do site nesta pasta. Para restaurar o painel,
acesse o repositório no GitHub e republique pela Lovable.
EOF
panel_post "site_salvo" 64 "Informações do site salvas na pasta site/." "running"

# 6) SERVIDOR — código do gateway WhatsApp da VPS
log "[3/3] Compactando o servidor WhatsApp da VPS..."
panel_post "salvando_servidor" 70 "Estou compactando o servidor do WhatsApp da VPS." "running"
CODE_FILE="$SERVIDOR_DIR/gateway-$TS.tar.gz"
tar --exclude='node_modules' --exclude='.git' --exclude='*.log' --exclude='data/sessions' \
    -czf "$CODE_FILE" -C "$(dirname "$GATEWAY_DIR")" "$(basename "$GATEWAY_DIR")"
CODE_SIZE_BYTES=$(stat -c%s "$CODE_FILE")
log "      Servidor: $(du -h "$CODE_FILE" | cut -f1)"
panel_post "servidor_salvo" 78 "Servidor do WhatsApp salvo na pasta servidor/." "running" "$(jq -n --argjson s "$CODE_SIZE_BYTES" '{code_size_bytes:$s,sessions_size_bytes:0,media_size_bytes:0}')"

# 7) Pacote final — junta as 3 pastas em um único arquivo
FINAL="$OUT_DIR/multizap-backup-$TS.tar.gz"
panel_post "montando_pacote" 84 "Estou juntando banco, site e servidor em um pacote único." "running"
tar -czf "$FINAL" -C "$OUT_DIR" banco site servidor

# 7) Cifragem opcional
if [ -n "${BACKUP_ENCRYPTION_PASSWORD:-}" ]; then
  log "Cifrando AES-256..."
  panel_post "criptografando" 88 "Estou protegendo o pacote com senha AES-256." "running"
  openssl enc -aes-256-cbc -salt -pbkdf2 -iter 200000 \
    -in "$FINAL" -out "$FINAL.enc" \
    -pass env:BACKUP_ENCRYPTION_PASSWORD
  rm -f "$FINAL"
  FINAL="$FINAL.enc"
fi
chmod 600 "$FINAL"
FINAL_SIZE=$(du -h "$FINAL" | cut -f1)
FINAL_SIZE_BYTES=$(stat -c%s "$FINAL")
FINAL_NAME="$(basename "$FINAL")"

# 8) Upload por destino
upload_github() {
  : "${GITHUB_TOKEN:?GITHUB_TOKEN não definido (PAT com permissão Contents: read & write)}"
  : "${GITHUB_REPO:?GITHUB_REPO não definido (ex: segredounlock/multizap-backups)}"
  command -v curl >/dev/null || fail "curl não instalado"

  # Backups > 100MB não cabem em release asset; aborta com aviso claro.
  SIZE_BYTES=$(stat -c%s "$FINAL")
  if [ "$SIZE_BYTES" -gt $((95 * 1024 * 1024)) ]; then
    log "AVISO: arquivo $FINAL_SIZE > 95MB. GitHub Releases tem limite de 2GB por asset, mas recomendamos migrar pra B2/S3."
  fi

  TAG="backup-$TS"
  log "Criando release $TAG em $GITHUB_REPO..."
  panel_post "enviando_github" 92 "Estou criando o local do backup no GitHub." "running"
  REL_JSON=$(curl -fsS -X POST \
    -H "Authorization: Bearer $GITHUB_TOKEN" \
    -H "Accept: application/vnd.github+json" \
    "https://api.github.com/repos/$GITHUB_REPO/releases" \
    -d "{\"tag_name\":\"$TAG\",\"name\":\"MultiZap backup $TS\",\"body\":\"Backup automático\",\"draft\":false,\"prerelease\":true}")
  REL_ID=$(echo "$REL_JSON" | grep -oP '"id":\s*\K[0-9]+' | head -1)
  [ -n "$REL_ID" ] || fail "Falha ao criar release no GitHub"

  log "Upload do asset ($FINAL_SIZE)..."
  panel_post "upload_arquivo" 96 "Estou enviando o arquivo final ($FINAL_SIZE)." "running"
  curl -fsS -X POST \
    -H "Authorization: Bearer $GITHUB_TOKEN" \
    -H "Content-Type: application/octet-stream" \
    --data-binary "@$FINAL" \
    "https://uploads.github.com/repos/$GITHUB_REPO/releases/$REL_ID/assets?name=$FINAL_NAME" \
    > /dev/null
  echo "https://github.com/$GITHUB_REPO/releases/tag/$TAG"
}

upload_b2() {
  : "${B2_KEY_ID:?B2_KEY_ID não definido}"
  : "${B2_APPLICATION_KEY:?B2_APPLICATION_KEY não definido}"
  : "${B2_BUCKET_NAME:?B2_BUCKET_NAME não definido}"
  command -v b2 >/dev/null || fail "CLI b2 não instalada (pip install b2)"
  panel_post "upload_arquivo" 96 "Estou enviando o arquivo final para o Backblaze B2." "running"
  b2 authorize-account "$B2_KEY_ID" "$B2_APPLICATION_KEY" >/dev/null
  b2 upload-file "$B2_BUCKET_NAME" "$FINAL" "$FINAL_NAME" >/dev/null
  echo "b2://$B2_BUCKET_NAME/$FINAL_NAME"
}

upload_s3() {
  : "${AWS_S3_BUCKET:?AWS_S3_BUCKET não definido}"
  command -v aws >/dev/null || fail "AWS CLI não instalada"
  panel_post "upload_arquivo" 96 "Estou enviando o arquivo final para o AWS S3." "running"
  aws s3 cp "$FINAL" "s3://$AWS_S3_BUCKET/$FINAL_NAME" --only-show-errors
  echo "s3://$AWS_S3_BUCKET/$FINAL_NAME"
}

REMOTE_URL=""
case "$DEST" in
  github) REMOTE_URL=$(upload_github);;
  b2)     REMOTE_URL=$(upload_b2);;
  s3)     REMOTE_URL=$(upload_s3);;
  local)  REMOTE_URL="(apenas local)";;
esac
CLOUD_UPLOADED=false
[ "$DEST" != "local" ] && CLOUD_UPLOADED=true

# 9) Retenção local: mantém últimos 7 dias
find "$BACKUP_DIR" -mindepth 1 -maxdepth 1 -type d -mtime +7 -exec rm -rf {} + 2>/dev/null || true

# 10) Resumo
echo ""
echo "========================================"
echo "  Backup concluído"
echo "========================================"
echo "  Arquivo : $FINAL"
echo "  Tamanho : $FINAL_SIZE"
echo "  Destino : $DEST"
echo "  Remoto  : $REMOTE_URL"
echo "  Data    : $TS"
echo "========================================"
panel_post "concluido" 100 "Backup concluído. Arquivo salvo em $FINAL e destino: $DEST." "success" "$(jq -n --arg fp "$FINAL" --arg cl "$REMOTE_URL" --argjson sz "$FINAL_SIZE_BYTES" --argjson db "$DB_SIZE_BYTES" --argjson code "$CODE_SIZE_BYTES" --argjson cu "$CLOUD_UPLOADED" '{file_path:$fp,cloud_location:$cl,size_bytes:$sz,db_size_bytes:$db,code_size_bytes:$code,sessions_size_bytes:0,media_size_bytes:0,cloud_uploaded:$cu}')"
