#!/usr/bin/env bash
# ============================================================================
#  CentralDark — Sincronização Cloudflare DNS via API
# ----------------------------------------------------------------------------
#  Lê configuração de ${SECRETS_DIR}/cloudflare.env e garante que todos os
#  subdomínios necessários existam apontando pro IP da VPS.
#
#  Idempotente: roda quantas vezes quiser, só cria/atualiza o que precisa.
#  Nunca apaga registro existente sem flag explícita.
#
#  Uso:
#    ./cf-sync.sh                 # aplica de verdade
#    ./cf-sync.sh --dry-run       # só mostra o que faria
#    ./cf-sync.sh --check         # só valida token + lista registros atuais
#
#  Arquivo de config esperado: /root/CentralDark/secrets/cloudflare.env
#    CF_API_TOKEN=...             # token com Zone:Read + DNS:Edit
#    CF_ZONE_NAME=centralldark.com
#    CF_TARGET_IP=89.117.78.124
#    CF_SUBDOMAINS="@ www app api bot crm mcp gateway webhook status"
#    CF_PROXIED=true              # nuvem laranja (proxy CF) — true/false
# ============================================================================

set -euo pipefail

SECRETS_DIR="${SECRETS_DIR:-/root/CentralDark/secrets}"
CONFIG_FILE="${CF_CONFIG_FILE:-${SECRETS_DIR}/cloudflare.env}"
MODE="${1:-apply}"
API="https://api.cloudflare.com/client/v4"

if [ -t 1 ]; then
  C_OK='\033[0;32m'; C_WARN='\033[0;33m'; C_ERR='\033[0;31m'; C_INFO='\033[0;36m'; C_RST='\033[0m'
else
  C_OK=''; C_WARN=''; C_ERR=''; C_INFO=''; C_RST=''
fi
log()  { printf "${C_INFO}[cf]${C_RST}    %s\n" "$*"; }
ok()   { printf "${C_OK}[ ok ]${C_RST}  %s\n" "$*"; }
warn() { printf "${C_WARN}[warn]${C_RST}  %s\n" "$*"; }
err()  { printf "${C_ERR}[err ]${C_RST}  %s\n" "$*" >&2; }

require() { command -v "$1" >/dev/null 2>&1 || { err "Falta o comando: $1"; exit 2; }; }
require curl
require jq

# ---------- carregar config ----------
if [ ! -f "$CONFIG_FILE" ]; then
  err "Config não encontrada: $CONFIG_FILE"
  err "Copia o exemplo de docs/INSTALADOR/15-cloudflare-api.md e preenche."
  exit 2
fi
# shellcheck disable=SC1090
set -a; . "$CONFIG_FILE"; set +a

: "${CF_API_TOKEN:?CF_API_TOKEN ausente em $CONFIG_FILE}"
: "${CF_ZONE_NAME:?CF_ZONE_NAME ausente}"
: "${CF_TARGET_IP:?CF_TARGET_IP ausente}"
CF_SUBDOMAINS="${CF_SUBDOMAINS:-@ www app api bot crm mcp gateway webhook status}"
CF_PROXIED="${CF_PROXIED:-true}"

api() {
  local method="$1" path="$2" data="${3:-}"
  if [ -n "$data" ]; then
    curl -fsS -X "$method" "${API}${path}" \
      -H "Authorization: Bearer ${CF_API_TOKEN}" \
      -H "Content-Type: application/json" \
      --data "$data"
  else
    curl -fsS -X "$method" "${API}${path}" \
      -H "Authorization: Bearer ${CF_API_TOKEN}" \
      -H "Content-Type: application/json"
  fi
}

# ---------- valida token ----------
log "Validando token Cloudflare..."
tok_resp="$(api GET /user/tokens/verify || echo '{"success":false}')"
if [ "$(echo "$tok_resp" | jq -r '.success')" != "true" ]; then
  err "Token inválido ou sem permissão. Resposta:"
  echo "$tok_resp" | jq -r '.errors // .' | sed 's/^/    /'
  exit 3
fi
ok "Token válido"

# ---------- pega zone id ----------
log "Buscando zona '${CF_ZONE_NAME}'..."
zone_resp="$(api GET "/zones?name=${CF_ZONE_NAME}")"
zone_id="$(echo "$zone_resp" | jq -r '.result[0].id // empty')"
if [ -z "$zone_id" ]; then
  err "Zona '${CF_ZONE_NAME}' não encontrada nessa conta. Adiciona o domínio no Cloudflare antes."
  exit 4
fi
ok "Zona OK (${zone_id})"

# ---------- lista registros atuais ----------
log "Lendo registros A existentes..."
records_json="$(api GET "/zones/${zone_id}/dns_records?per_page=200&type=A")"
existing_count="$(echo "$records_json" | jq -r '.result | length')"
ok "Registros A atuais: ${existing_count}"

if [ "$MODE" = "--check" ]; then
  echo "$records_json" | jq -r '.result[] | "  \(.name)  ->  \(.content)  (proxied=\(.proxied))"'
  exit 0
fi

# ---------- normaliza nome ----------
fqdn_of() {
  local sub="$1"
  if [ "$sub" = "@" ] || [ "$sub" = "$CF_ZONE_NAME" ]; then
    echo "$CF_ZONE_NAME"
  else
    echo "${sub}.${CF_ZONE_NAME}"
  fi
}

# ---------- garantir cada registro ----------
changed=0; kept=0; created=0; updated=0
for sub in $CF_SUBDOMAINS; do
  fqdn="$(fqdn_of "$sub")"
  current="$(echo "$records_json" | jq -r --arg n "$fqdn" '.result[] | select(.name==$n) | {id,content,proxied}')"
  rec_id="$(echo "$current" | jq -r '.id // empty')"
  rec_ip="$(echo "$current" | jq -r '.content // empty')"
  rec_proxied="$(echo "$current" | jq -r '.proxied // empty')"

  payload="$(jq -nc \
    --arg type "A" --arg name "$fqdn" --arg content "$CF_TARGET_IP" \
    --argjson proxied "$CF_PROXIED" --argjson ttl 1 \
    '{type:$type,name:$name,content:$content,proxied:$proxied,ttl:$ttl}')"

  if [ -z "$rec_id" ]; then
    if [ "$MODE" = "--dry-run" ]; then
      warn "CRIARIA  ${fqdn} -> ${CF_TARGET_IP} (proxied=${CF_PROXIED})"
    else
      api POST "/zones/${zone_id}/dns_records" "$payload" >/dev/null
      ok "CRIADO   ${fqdn} -> ${CF_TARGET_IP}"
      created=$((created+1))
    fi
    changed=$((changed+1))
  elif [ "$rec_ip" != "$CF_TARGET_IP" ] || [ "$rec_proxied" != "$CF_PROXIED" ]; then
    if [ "$MODE" = "--dry-run" ]; then
      warn "ATUALIZARIA ${fqdn} (${rec_ip}/${rec_proxied}) -> (${CF_TARGET_IP}/${CF_PROXIED})"
    else
      api PUT "/zones/${zone_id}/dns_records/${rec_id}" "$payload" >/dev/null
      ok "ATUALIZADO ${fqdn} -> ${CF_TARGET_IP}"
      updated=$((updated+1))
    fi
    changed=$((changed+1))
  else
    log "OK       ${fqdn} já aponta certo"
    kept=$((kept+1))
  fi
done

echo
ok "Resumo: mantidos=${kept} criados=${created} atualizados=${updated} (modo=${MODE})"
if [ "$MODE" = "--dry-run" ] && [ "$changed" -gt 0 ]; then
  warn "Roda sem --dry-run pra aplicar de verdade."
fi
