# COMANDO - cloudflare.sh
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CentralDark\scripts\installer\lib\cloudflare.sh
**SHA:** 5d877d5af324c0bb
**Timestamp:** 2026-08-26T19:32:46.770824
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- command -v "$c" >/dev/null 2>&1 || { ui_err "Falta o comando: $c"; missing=1; }

### Gaps
- local missing=0
- command -v "$c" >/dev/null 2>&1 || { ui_err "Falta o comando: $c"; missing=1; }

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env bash
# ============================================================================
#  lib/cloudflare.sh — Camada de acesso à API Cloudflare + storage seguro.
#  Depende de: curl, jq, lib/ui.sh
# ============================================================================

CF_API="https://api.cloudflare.com/client/v4"
CF_ENV_FILE="${CF_ENV_FILE:-/root/CentralDark/secrets/cloudflare.env}"
CF_SECRETS_DIR="$(dirname "$CF_ENV_FILE")"

cf_require() {
  local missing=0
  for c in curl jq dig; do
    command -v "$c" >/dev/null 2>&1 || { ui_err "Falta o comando: $c"; missing=1; }
  done
  return "$missing"
}

cf_ensure_env_file() {
  mkdir -p "$CF_SECRETS_DIR"
  chmod 700 "$CF_SECRETS_DIR" 2>/dev/null || true
  if [ ! -f "$CF_ENV_FILE" ]; then
    cat > "$CF_ENV_FILE" <<'EOF'
# Cloudflare — gerenciado pelo cloudflare-wizard.sh
CLOUDFLARE_API_TOKEN=
[REDIGIDO-PRESERVACAO]
CLOUDFLARE_ZONE_ID=
CLOUDFLARE_ZONE_NAME=centralldark.com
CF_API_TOKEN=
[REDIGIDO-PRESERVACAO]
CF_TARGET_IP=
CF_SUBDOMAINS="@ www app api bot crm mcp gateway webhook status"
CF_PROXIED=true
EOF
  fi
  chmod 600 "$CF_ENV_FILE" 2>/dev/null || true
}

cf_env_get() {
  local key="$1"
  grep -E "^${key}=" "$CF_ENV_FILE" 2>/dev/null | tail -1 | cut -d= -f2- | sed 's/^"//; s/"$//'
}

cf_env_set() {
  local key="$1" val="$2" tmp="${CF_ENV_FILE}.tmp"
  touch "$CF_ENV_FILE"
  if grep -qE "^${key}=" "$CF_ENV_FILE"; then
    awk -v k="$key" -v v="$val" -F= 'BEGIN{OFS="="} $1==k{print k"="v; next} {print}' "$CF_ENV_FILE" > "$tmp"
  else
    cp "$CF_ENV_FILE" "$tmp" && echo "${key}=${val}" >> "$tmp"
  fi
  mv "$tmp" "$CF_ENV_FILE"
  chmod 600 "$CF_ENV_FILE"
}

cf_load_env() {
  [ -f "$CF_ENV_FILE" ] || return 1
  # shellcheck disable=SC1090
  set -a; . "$CF_ENV_FILE"; set +a
  # Compatibilidade: aceita tanto CF_API_TOKEN quanto CLOUDFLARE_API_TOKEN
  CF_API_TOKEN="${CF_API_TOKEN:-${CLOUDFLARE_API_TOKEN:-}}"
  CF_ZONE_NAME="${CF_ZONE_NAME:-${CLOUDFLARE_ZONE_NAME:-}}"
  return 0
}

# Chamada genérica autenticada — retorna JSON, não imprime token.
cf_api() {
  local method="$1" path="$2" data="${3:-}"
  if [ -n "$data" ]; then
    curl -fsS -X "$method" "${CF_API}${path}" \
      -H "Authorization: Bearer ${CF_API_TOKEN}" \
      -H "Content-Type: application/json" \
      --data "$data"
  else
    curl -fsS -X "$method" "${CF_API}${path}" \
      -H "Authorization: Bearer ${CF_API_TOKEN}" \
      -H "Content-Type: application/json"
  fi
}

cf_token_verify() {
  local resp
  resp="$(cf_api GET /user/tokens/verify 2>/dev/null || echo '{"success":false}')"
  [ "$(echo "$resp" | jq -r '.success' 2>/dev/null)" = "true" ]
}

cf_zone_lookup() {
  local zone="$1" resp id
  resp="$(cf_api GET "/zones?name=${zone}" 2>/dev/null || echo '{}')"
  id="$(echo "$resp" | jq -r '.result[0].id // empty')"
  [ -n "$id" ] || return 1
  echo "$id"
}

cf_zone_account() {
  local zone_id="$1" resp
  resp="$(cf_api GET "/zones/${zone_id}" 2>/dev/null || echo '{}')"
  echo "$resp" | jq -r '.result.account.id // empty'
}

cf_list_a_records() {
  local zone_id="$1"
  cf_api GET "/zones/${zone_id}/dns_records?per_page=200&type=A" 2>/dev/null
}

# Verifica DNS:Edit criando e removendo um TXT temporário de teste.
cf_probe_dns_edit() {
  local zone_id="$1" zone_name="$2"
  local probe="_centraldark-probe-$(date +%s)"
  local payload
  payload="$(jq -nc --arg n "${probe}.${zone_name}" \
    '{type:"TXT",name:$n,content:"centraldark-test",ttl:60,proxied:false}')"
  local created
  created="$(cf_api POST "/zones/${zone_id}/dns_records" "$payload" 2>/dev/null || true)"
  local rec_id
  rec_id="$(echo "$created" | jq -r '.result.id // empty')"
  if [ -z "$rec_id" ]; then return 1; fi
  cf_api DELETE "/zones/${zone_id}/dns_records/${rec_id}" >/dev/null 2>&1 || true
  return 0
}

cf_detect_public_ip() {
  curl -fsS --max-time 5 https://api.ipify.org 2>/dev/null \
    || curl -fsS --max-time 5 https://ifconfig.me 2>/dev/null \
    || ip -4 route get 1.1.1.1 2>/dev/null | awk '{for(i=1;i<=NF;i++) if($i=="src"){print $(i+1); exit}}'
}

cf_fqdn_of() {
  local sub="$1" zone="$2"
  if [ "$sub" = "@" ] || [ "$sub" = "$zone" ]; then echo "$zone"; else echo "${sub}.${zone}"; fi
}

# Cria/atualiza um registro A. Retorna ação: created|updated|kept.
cf_upsert_a_record() {
  local zone_id="$1" fqdn="$2" ip="$3" proxied="$4"
  local records_json current rec_id rec_ip rec_proxied payload
  records_json="$(cf_list_a_records "$zone_id")"
  current="$(echo "$records_json" | jq -r --arg n "$fqdn" '.result[] | select(.name==$n) | {id,content,proxied}')"
  rec_id="$(echo "$current" | jq -r '.id // empty')"
  rec_ip="$(echo "$current" | jq -r '.content // empty')"
  rec_proxied="$(echo "$current" | jq -r '.proxied // empty')"

  payload="$(jq -nc \
    --arg name "$fqdn" --arg content "$ip" \
    --argjson proxied "$proxied" --argjson ttl 1 \
    '{type:"A",name:$name,content:$content,proxied:$proxied,ttl:$ttl}')"

  if [ -z "$rec_id" ]; then
    cf_api POST "/zones/${zone_id}/dns_records" "$payload" >
```