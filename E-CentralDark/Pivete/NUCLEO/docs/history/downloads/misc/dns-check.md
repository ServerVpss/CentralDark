# OUTRO - dns-check.sh
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CentralDark\scripts\installer\lib\dns-check.sh
**SHA:** 4ea064749ed1e387
**Timestamp:** 2026-08-26T19:32:46.778881
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- #  Saída padrão: linhas TSV no formato

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env bash
# ============================================================================
#  lib/dns-check.sh — Checagem DNS + Caddy + HTTPS pra cada subdomínio.
#  Depende de: dig, curl, jq, lib/cloudflare.sh
#
#  Saída padrão: linhas TSV no formato
#     FQDN \t status \t dns_ip \t expected_ip \t proxied \t http_code \t caddy \t detalhe
#  status ∈ OK | ALERTA | ERRO
# ============================================================================

DC_CADDYFILE="${CADDYFILE:-/etc/caddy/Caddyfile}"
DC_CADDY_SNIPPETS_DIR="${CADDY_SNIPPETS_DIR:-/root/CentralDark/infra/caddy}"

dc_dig_a() { dig +short A "$1" @1.1.1.1 2>/dev/null | tail -1; }

dc_http_code() {
  local fqdn="$1"
  curl -sk -o /dev/null -w "%{http_code}" --connect-timeout 6 --max-time 12 "https://${fqdn}" 2>/dev/null || echo "000"
}

dc_caddy_has_route() {
  local fqdn="$1"
  if [ -f "$DC_CADDYFILE" ] && grep -qE "(^|[[:space:],{])${fqdn}([[:space:],{]|\$)" "$DC_CADDYFILE" 2>/dev/null; then
    echo "principal"; return 0
  fi
  if [ -d "$DC_CADDY_SNIPPETS_DIR" ] && grep -RslE "(^|[[:space:],{])${fqdn}([[:space:],{]|\$)" "$DC_CADDY_SNIPPETS_DIR" >/dev/null 2>&1; then
    echo "snippet"; return 0
  fi
  echo "ausente"; return 1
}

dc_check_one() {
  local fqdn="$1" expected_ip="$2" expected_proxied="$3"
  local dns_ip http caddy status detalhe
  dns_ip="$(dc_dig_a "$fqdn")"
  http="$(dc_http_code "$fqdn")"
  caddy="$(dc_caddy_has_route "$fqdn")"

  if [ -z "$dns_ip" ]; then
    status="ERRO"; detalhe="DNS ausente — criar registro A"
  elif [ "$expected_proxied" = "true" ]; then
    # Quando proxied, IP retornado é da Cloudflare, não da VPS. Aceitar qualquer A.
    if [ "$http" = "200" ] || [ "$http" = "301" ] || [ "$http" = "302" ] || [ "$http" = "401" ] || [ "$http" = "403" ]; then
      status="OK"; detalhe="DNS via CF + HTTPS respondendo (${http})"
    elif [ "$caddy" = "ausente" ]; then
      status="ALERTA"; detalhe="DNS ok mas Caddy sem rota (HTTP=${http})"
    else
      status="ALERTA"; detalhe="DNS ok, serviço ainda não responde (HTTP=${http})"
    fi
  else
    if [ "$dns_ip" != "$expected_ip" ]; then
      status="ERRO"; detalhe="DNS aponta ${dns_ip}, esperado ${expected_ip}"
    elif [ "$http" = "200" ] || [ "$http" = "301" ] || [ "$http" = "302" ]; then
      status="OK"; detalhe="DNS direto + HTTPS ok (${http})"
    else
      status="ALERTA"; detalhe="DNS ok, HTTPS=${http}"
    fi
  fi

  printf "%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\n" \
    "$fqdn" "$status" "${dns_ip:-(none)}" "$expected_ip" "$expected_proxied" "$http" "$caddy" "$detalhe"
}

dc_check_all() {
  local zone="$1" ip="$2" proxied="$3"; shift 3
  local subs=("$@")
  for sub in "${subs[@]}"; do
    local fqdn
    if [ "$sub" = "@" ] || [ "$sub" = "$zone" ]; then fqdn="$zone"; else fqdn="${sub}.${zone}"; fi
    dc_check_one "$fqdn" "$ip" "$proxied"
  done
}

dc_render_table() {
  local input="$1"
  printf "%-35s %-7s %-8s %-7s %s\n" "DOMÍNIO" "STATUS" "HTTPS" "CADDY" "DETALHE"
  printf "%-35s %-7s %-8s %-7s %s\n" "-------" "------" "-----" "-----" "-------"
  while IFS=$'\t' read -r fqdn status dns_ip exp prox http caddy detalhe; do
    printf "%-35s %-7s %-8s %-7s %s\n" "$fqdn" "$status" "$http" "$caddy" "$detalhe"
  done < "$input"
}

```