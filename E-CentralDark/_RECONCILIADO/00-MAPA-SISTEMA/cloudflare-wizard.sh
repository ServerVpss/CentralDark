#!/usr/bin/env bash
# ============================================================================
#  cloudflare-wizard.sh — Wizard interativo de conexão Cloudflare via SSH.
#
#  Uso:
#    ./cloudflare-wizard.sh               # wizard completo
#    ./cloudflare-wizard.sh --check       # só valida token + lista DNS
#    ./cloudflare-wizard.sh --apply       # não-interativo (env já preenchido)
#    ./cloudflare-wizard.sh --dns-check   # checker DNS+Caddy+HTTPS (read-only)
#
#  Regras:
#    - Nunca pede login/senha da Cloudflare.
#    - Token só vive em memória + arquivo 0600 em /root/CentralDark/secrets/.
#    - Nenhuma mudança sensível sem confirmar com CONFIRMO.
#    - Caddy só é alterado depois de backup + confirmação.
#    - Idempotente: rodar duas vezes seguidas não quebra nada.
# ============================================================================

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LIB_DIR="${SCRIPT_DIR}/lib"

# shellcheck source=lib/ui.sh
. "${LIB_DIR}/ui.sh"
# shellcheck source=lib/cloudflare.sh
. "${LIB_DIR}/cloudflare.sh"
# shellcheck source=lib/dns-check.sh
. "${LIB_DIR}/dns-check.sh"
# shellcheck source=lib/report.sh
. "${LIB_DIR}/report.sh"

LOCK_FILE="/var/lock/centraldark-cloudflare.lock"
MODE="${1:---wizard}"

# Trap pra limpar token da memória em qualquer saída.
_cleanup() { CF_API_TOKEN=""; CLOUDFLARE_API_TOKEN=""; }
trap _cleanup EXIT INT TERM

# ---------------------------------------------------------------------------
# Etapa: explicação inicial
# ---------------------------------------------------------------------------
step_intro() {
  ui_banner "🌩️   CENTRALDARK CLOUDFLARE SETUP"
  cat <<EOF
Este assistente conecta sua conta Cloudflare ao instalador, valida o
domínio, ajusta os subdomínios e prepara as rotas no Caddy.

O que você vai precisar:
  • Conta no Cloudflare com o domínio adicionado
  • Um API Token (não é a senha — é seguro e revogável)

Nada do que você digitar aqui sai da VPS. O token fica salvo em
/root/CentralDark/secrets/cloudflare.env com permissão 0600.

EOF
}

# ---------------------------------------------------------------------------
# Etapa: token + zona + IP
# ---------------------------------------------------------------------------
step_token() {
  cf_ensure_env_file
  cf_load_env || true

  local detected
  detected="$(cf_detect_public_ip)"
  if [ -z "${CF_TARGET_IP:-}" ] || [ "${CF_TARGET_IP}" != "$detected" ]; then
    local ans
    printf "IP público da VPS detectado: %s\n" "${detected:-(falhou)}"
    printf "Usar este IP? [S/n]: "
    read -r ans || ans=""
    if [ "${ans,,}" = "n" ]; then
      printf "Digite o IP: "; read -r CF_TARGET_IP
    else
      CF_TARGET_IP="$detected"
    fi
    cf_env_set CF_TARGET_IP "$CF_TARGET_IP"
  fi

  local current_zone="${CF_ZONE_NAME:-centralldark.com}" ans
  printf "Domínio principal [%s]: " "$current_zone"
  read -r ans || ans=""
  [ -n "$ans" ] && current_zone="$ans"
  cf_env_set CF_ZONE_NAME "$current_zone"
  cf_env_set CLOUDFLARE_ZONE_NAME "$current_zone"
  CF_ZONE_NAME="$current_zone"

  # Reaproveita token salvo se ainda válido.
  if [ -n "${CF_API_TOKEN:-}" ]; then
    if cf_token_verify; then
      ui_ok "Token salvo já é válido ($(ui_mask_token "$CF_API_TOKEN"))."
      if ! ui_confirm "Trocar token mesmo assim?" N; then return 0; fi
    else
      ui_warn "Token salvo é inválido — preciso de um novo."
    fi
  fi

  # Escolha do método: navegador (QR/OAuth) ou token manual
  cat <<EOF

Como você quer conectar a Cloudflare?

  [1] 🌐  Pelo NAVEGADOR (mais fácil — abre link, faz login Cloudflare, pronto)
  [2] 🔑  Colando um TOKEN manualmente (avançado — você gera no painel CF)

EOF
  local method_choice=""
  while [ -z "$method_choice" ]; do
    printf "Escolha [1/2] (padrão 1): "
    read -r method_choice || method_choice=""
    method_choice="${method_choice:-1}"
    case "$method_choice" in
      1)
        local browser_script="${SCRIPT_DIR}/cloudflare-browser-connect.sh"
        if [ -x "$browser_script" ] || [ -f "$browser_script" ]; then
          chmod +x "$browser_script" 2>/dev/null || true
          if bash "$browser_script"; then
            # Recarrega env pra pegar o token que o browser-connect salvou
            cf_load_env || true
            if [ -n "${CF_API_TOKEN:-}" ] && cf_token_verify; then
              ui_ok "Conectado via navegador ($(ui_mask_token "$CF_API_TOKEN"))."
              return 0
            else
              ui_warn "Fluxo do navegador não retornou token válido — caindo pro modo manual."
              method_choice=2
            fi
          else
            ui_warn "Fluxo do navegador cancelado/falhou — caindo pro modo manual."
            method_choice=2
          fi
        else
          ui_warn "Script do navegador não encontrado em $browser_script — usando modo manual."
          method_choice=2
        fi
        ;;
      2) : ;;  # segue pro fluxo manual abaixo
      *) ui_warn "Opção inválida."; method_choice="" ;;
    esac
  done



  cat <<EOF

Como pegar o token (1 minuto):
  1) Abra no seu navegador (não na VPS):
     https://dash.cloudflare.com/profile/api-tokens
  2) Create Token → template "Edit zone DNS"
  3) Em Zone Resources, escolha: ${current_zone}
  4) Continue → Create Token → COPIE o token (CF só mostra 1x)

Permissões mínimas do token:
  • Zone   → Zone → Read
  • Zone   → DNS  → Edit

EOF

  local new_token=""
  while [ -z "$new_token" ]; do
    ui_read_secret "Cole o token aqui (não fica em log): " new_token
    [ -z "$new_token" ] && ui_warn "Token vazio. Tenta de novo." && continue
    CF_API_TOKEN="$new_token"
    if cf_token_verify; then
      cf_env_set CF_API_TOKEN "$new_token"
      cf_env_set CLOUDFLARE_API_TOKEN "$new_token"
      ui_ok "Token validado com sucesso ($(ui_mask_token "$new_token"))."
    else
      ui_err "Token inválido ou sem permissão."
      cat <<EOF
   O que fazer:
     1. Vá no painel Cloudflare
     2. Crie novo API Token
     3. Permissões: Zone:Read + DNS:Edit
     4. Cole aqui de novo
EOF
      new_token=""
    fi
  done
}

# ---------------------------------------------------------------------------
# Etapa: descobre zone_id + account_id + probe DNS:Edit
# ---------------------------------------------------------------------------
step_zone_lookup() {
  ui_info "Procurando zona ${CF_ZONE_NAME}..."
  local zid aid
  zid="$(cf_zone_lookup "$CF_ZONE_NAME")" || {
    ui_err "Zona '${CF_ZONE_NAME}' não está nessa conta Cloudflare."
    ui_warn "Adicione o domínio em https://dash.cloudflare.com primeiro."
    return 4
  }
  aid="$(cf_zone_account "$zid")"
  cf_env_set CLOUDFLARE_ZONE_ID "$zid"
  cf_env_set CLOUDFLARE_ACCOUNT_ID "$aid"
  CLOUDFLARE_ZONE_ID="$zid"
  CLOUDFLARE_ACCOUNT_ID="$aid"
  ui_ok "Zona OK — id=${zid:0:8}...  account=${aid:0:8}..."

  ui_info "Testando permissão DNS:Edit (cria/remove um TXT temporário)..."
  if cf_probe_dns_edit "$zid" "$CF_ZONE_NAME"; then
    ui_ok "Permissão DNS:Edit confirmada."
  else
    ui_err "Token não tem DNS:Edit. Recrie o token com a permissão certa."
    return 5
  fi
}

# ---------------------------------------------------------------------------
# Etapa: subdomínios — edita lista + roda checker
# ---------------------------------------------------------------------------
step_subdomains() {
  local current="${CF_SUBDOMAINS:-@ www app api bot crm mcp gateway webhook status}"
  cat <<EOF

Subdomínios que serão checados/criados:
  ${current}

Pode editar essa lista (Enter mantém):
EOF
  printf "> "
  local ans; read -r ans || ans=""
  [ -n "$ans" ] && current="$ans"
  cf_env_set CF_SUBDOMAINS "$current"
  CF_SUBDOMAINS="$current"
}

step_dns_check() {
  local report_dir="$1"
  local table="${report_dir}/_check.tsv"
  ui_info "Checando DNS + HTTPS + Caddy de cada subdomínio..."
  # shellcheck disable=SC2086
  dc_check_all "$CF_ZONE_NAME" "$CF_TARGET_IP" "${CF_PROXIED:-true}" $CF_SUBDOMAINS > "$table"
  echo
  dc_render_table "$table"
  echo
  rep_write_dns_report "$report_dir" "$table"
  rep_write_checks_json "$report_dir" "$table"
  rep_write_pendencias  "$report_dir" "$table"
  echo "$table"
}

# ---------------------------------------------------------------------------
# Etapa: cria/atualiza DNS faltante (com confirmação)
# ---------------------------------------------------------------------------
step_fix_dns() {
  local table="$1" report_dir="$2"
  local pendentes=()
  while IFS=$'\t' read -r fqdn status dns_ip exp prox http caddy detalhe; do
    [ "$status" = "ERRO" ] && pendentes+=("$fqdn")
  done < "$table"

  if [ "${#pendentes[@]}" -eq 0 ]; then
    ui_ok "Sem DNS faltando."
    return 0
  fi

  echo
  ui_warn "Subdomínios sem DNS correto: ${#pendentes[@]}"
  for f in "${pendentes[@]}"; do echo "  - $f"; done
  echo

  for fqdn in "${pendentes[@]}"; do
    cat <<EOF

Pra ${fqdn}, o que fazer?
  1) Criar/corrigir automaticamente no Cloudflare
  2) Mostrar instrução manual
  3) Pular por enquanto
  0) Cancelar tudo
EOF
    printf "Escolha: "; local op; read -r op || op="3"
    case "$op" in
      1)
        echo
        echo "Tipo: A"
        echo "Nome: ${fqdn}"
        echo "Valor: ${CF_TARGET_IP}"
        echo "Proxy: ${CF_PROXIED:-true}"
        if ui_confirm_strong "Digite CONFIRMO pra aplicar"; then
          local zid="${CLOUDFLARE_ZONE_ID}"
          local action
          action="$(cf_upsert_a_record "$zid" "$fqdn" "$CF_TARGET_IP" "${CF_PROXIED:-true}")"
          ui_ok "${fqdn} → ${action}"
          rep_append_action "$report_dir" "DNS ${action} para ${fqdn} → ${CF_TARGET_IP}"
        else
          ui_warn "Cancelado para ${fqdn}."
        fi
        ;;
      2)
        cat <<EOF
   No painel Cloudflare (DNS → Records → Add record):
     Type: A    Name: ${fqdn%.${CF_ZONE_NAME}}    IPv4: ${CF_TARGET_IP}    Proxy: ${CF_PROXIED:-true}
EOF
        rep_append_action "$report_dir" "Instrução manual mostrada para ${fqdn}"
        ;;
      0) ui_warn "Cancelando."; return 0 ;;
      *) ui_info "Pulando ${fqdn}." ;;
    esac
  done
}

# ---------------------------------------------------------------------------
# Etapa: Caddy — gera snippets, não toca no Caddyfile real sem CONFIRMO
# ---------------------------------------------------------------------------
step_caddy() {
  local report_dir="$1"
  local snip_dir="/root/CentralDark/infra/caddy"
  local tmpl_dir="${SCRIPT_DIR%/scripts/installer}/infra/caddy/templates"
  mkdir -p "$snip_dir"

  # MCP já existente — não toca.
  if curl -fsS --max-time 5 "https://mcp.${CF_ZONE_NAME}/health" 2>/dev/null | grep -q '"ok":true'; then
    ui_ok "mcp.${CF_ZONE_NAME} já responde — Caddy do MCP preservado."
  fi

  ui_info "Snippets Caddy disponíveis em: ${snip_dir}"
  ui_warn "Alterar o Caddyfile principal é ação sensível e não será feita automaticamente."
  ui_info "Pra importar manualmente: adicionar 'import ${snip_dir}/*.Caddyfile' no Caddyfile principal."
  rep_append_action "$report_dir" "Snippets Caddy preservados em ${snip_dir} (não aplicado sem confirmação humana)"
}

# ---------------------------------------------------------------------------
# Pontos de entrada
# ---------------------------------------------------------------------------

cmd_wizard() {
  cf_require || exit 2
  exec 9>"$LOCK_FILE"
  flock -n 9 || { ui_err "Outro wizard Cloudflare já está rodando."; exit 1; }

  local report_dir; report_dir="$(rep_init)"
  ui_info "Relatório desta execução: ${report_dir}"

  step_intro
  step_token        || exit $?
  step_zone_lookup  || exit $?
  step_subdomains
  local table; table="$(step_dns_check "$report_dir")"
  step_fix_dns "$table" "$report_dir"
  # Roda checker de novo pra capturar estado pós-mudança
  table="$(step_dns_check "$report_dir")"
  step_caddy "$report_dir"

  # Resumo final
  local ok_n alert_n err_n
  ok_n="$(awk -F'\t' '$2=="OK"{n++}END{print n+0}' "$table")"
  alert_n="$(awk -F'\t' '$2=="ALERTA"{n++}END{print n+0}' "$table")"
  err_n="$(awk -F'\t' '$2=="ERRO"{n++}END{print n+0}' "$table")"
  rep_write_summary "$report_dir" "$CF_ZONE_NAME" "$CF_TARGET_IP" \
    "OK=${ok_n}  ALERTA=${alert_n}  ERRO=${err_n}"

  echo
  ui_banner "✅ Cloudflare conectado"
  echo "  Zona: ${CF_ZONE_NAME}"
  echo "  IP:   ${CF_TARGET_IP}"
  echo "  OK=${ok_n}  ALERTA=${alert_n}  ERRO=${err_n}"
  echo "  Relatório: ${report_dir}"
  echo
}

cmd_check() {
  cf_require || exit 2
  cf_ensure_env_file
  cf_load_env || { ui_err "Env não encontrado."; exit 2; }
  [ -n "${CF_API_TOKEN:-}" ] || { ui_err "Token vazio. Rode --wizard primeiro."; exit 2; }
  cf_token_verify || { ui_err "Token inválido."; exit 3; }
  ui_ok "Token válido."
  local zid; zid="$(cf_zone_lookup "$CF_ZONE_NAME")" || { ui_err "Zona não encontrada"; exit 4; }
  ui_ok "Zona ${CF_ZONE_NAME} (${zid:0:8}...)"
  cf_list_a_records "$zid" | jq -r '.result[] | "  \(.name)  ->  \(.content)  (proxied=\(.proxied))"'
}

cmd_apply() {
  cf_require || exit 2
  cf_load_env || { ui_err "Env não encontrado."; exit 2; }
  [ -n "${CF_API_TOKEN:-}" ] || { ui_err "Token vazio."; exit 2; }
  : "${CF_SUBDOMAINS:=@ www app api bot crm mcp gateway webhook status install}"
  : "${CF_PROXIED:=true}"
  [ -n "${CF_TARGET_IP:-}" ] || CF_TARGET_IP="$(curl -fsS https://api.ipify.org 2>/dev/null || echo '')"
  [ -n "${CF_TARGET_IP:-}" ] || { ui_err "CF_TARGET_IP não definido."; exit 2; }
  [ -n "${CF_ZONE_NAME:-}" ] || { ui_err "CF_ZONE_NAME não definido."; exit 2; }
  local zid; zid="$(cf_zone_lookup "$CF_ZONE_NAME")" || { ui_err "Zona não encontrada"; exit 4; }
  CLOUDFLARE_ZONE_ID="$zid"
  for sub in $CF_SUBDOMAINS; do
    local fqdn; fqdn="$(cf_fqdn_of "$sub" "$CF_ZONE_NAME")"
    local action; action="$(cf_upsert_a_record "$zid" "$fqdn" "$CF_TARGET_IP" "$CF_PROXIED")"
    printf "  %-8s %s\n" "$action" "$fqdn"
  done
}

cmd_dns_check() {
  cf_require || exit 2
  cf_load_env || { ui_err "Env não encontrado."; exit 2; }
  local report_dir; report_dir="$(rep_init)"
  local table; table="$(step_dns_check "$report_dir")"
  rep_write_summary "$report_dir" "$CF_ZONE_NAME" "$CF_TARGET_IP" "read-only check"
  ui_info "Relatório: ${report_dir}"
}

case "$MODE" in
  --wizard|"")  cmd_wizard ;;
  --check)      cmd_check ;;
  --apply)      cmd_apply ;;
  --dns-check)  cmd_dns_check ;;
  --help|-h)
    sed -n '2,15p' "$0"
    ;;
  *) ui_err "Modo desconhecido: $MODE"; exit 1 ;;
esac
