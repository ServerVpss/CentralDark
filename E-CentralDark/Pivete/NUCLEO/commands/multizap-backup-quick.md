# COMANDO - multizap-backup-quick.sh
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CentralDark\apps\clone-deck\apps\crm\scripts\vps\multizap-backup-quick.sh
**SHA:** 12d4800fea6ecc07
**Timestamp:** 2026-08-26T19:31:34.105365
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- # Destino padrão: github (hoje). b2/s3 já preparados pro futuro.

### Ouro Bruto (primeiros 5000 chars)
```
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
#       ├── banco/      (dump do banco de dad
```