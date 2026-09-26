#!/usr/bin/env bash
# ============================================================================
#  lib/report.sh — Geração de relatórios do wizard Cloudflare.
#  Cria a pasta /root/CentralDark/revisoes/<ts>/cloudflare-connect/ com:
#    resumo.md, checks.json, dns-report.md, acoes-executadas.md,
#    logs-sanitizados.txt, pendencias.md
# ============================================================================

REPORT_BASE="${REPORT_BASE:-/root/CentralDark/revisoes}"

rep_init() {
  local ts dir
  ts="$(date +%Y%m%d-%H%M%S)"
  dir="${REPORT_BASE}/${ts}/cloudflare-connect"
  mkdir -p "$dir"
  echo "$dir"
}

rep_write_summary() {
  local dir="$1" zone="$2" ip="$3" totals="$4"
  cat > "${dir}/resumo.md" <<EOF
# Resumo — Cloudflare Connect Wizard

- Data: $(date -Iseconds)
- Zona: ${zone}
- IP VPS: ${ip}
- Resultado: ${totals}

Detalhes em \`dns-report.md\`, \`acoes-executadas.md\` e \`checks.json\`.

Token e demais segredos NÃO são gravados aqui — vivem apenas em
\`/root/CentralDark/secrets/cloudflare.env\` (perm 0600).
EOF
}

rep_write_dns_report() {
  local dir="$1" table_file="$2"
  {
    echo "# Relatório DNS"
    echo
    echo "| Domínio | Status | HTTPS | Caddy | Detalhe |"
    echo "|---|---|---|---|---|"
    while IFS=$'\t' read -r fqdn status dns_ip exp prox http caddy detalhe; do
      printf "| %s | %s | %s | %s | %s |\n" "$fqdn" "$status" "$http" "$caddy" "$detalhe"
    done < "$table_file"
  } > "${dir}/dns-report.md"
}

rep_write_checks_json() {
  local dir="$1" table_file="$2"
  {
    echo "["
    local first=1
    while IFS=$'\t' read -r fqdn status dns_ip exp prox http caddy detalhe; do
      [ $first -eq 0 ] && echo ","
      first=0
      jq -nc \
        --arg fqdn "$fqdn" --arg status "$status" --arg dns_ip "$dns_ip" \
        --arg expected "$exp" --arg proxied "$prox" --arg http "$http" \
        --arg caddy "$caddy" --arg detalhe "$detalhe" \
        '{fqdn:$fqdn,status:$status,dns_ip:$dns_ip,expected_ip:$expected,proxied:$proxied,http:$http,caddy:$caddy,detalhe:$detalhe}'
    done < "$table_file"
    echo "]"
  } > "${dir}/checks.json"
}

rep_append_action() {
  local dir="$1" line="$2"
  echo "- $(date +%H:%M:%S) — ${line}" >> "${dir}/acoes-executadas.md"
}

rep_write_pendencias() {
  local dir="$1" table_file="$2"
  {
    echo "# Pendências"
    echo
    local n=0
    while IFS=$'\t' read -r fqdn status dns_ip exp prox http caddy detalhe; do
      if [ "$status" != "OK" ]; then
        echo "- **${fqdn}** — ${status}: ${detalhe}"
        n=$((n+1))
      fi
    done < "$table_file"
    [ $n -eq 0 ] && echo "Nada pendente — tudo OK."
  } > "${dir}/pendencias.md"
}

rep_append_log() {
  local dir="$1"
  # Stdin é sanitizado e gravado.
  cat | sed -E 's/(token|secret|password|authorization|apikey|api_key|bearer|client_secret|CLOUDFLARE_API_TOKEN|CF_API_TOKEN)[^ ,"]*[=: ]+[A-Za-z0-9._\/+-]+/\1=***OCULTO***/Ig' \
    >> "${dir}/logs-sanitizados.txt"
}
