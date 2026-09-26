#!/usr/bin/env bash
# ============================================================================
#  lib/caddy-auto.sh — Gera snippets Caddy para subdomínios oficiais.
#  Usa o template em CentralDark/infra/caddy/templates/proxy.Caddyfile.tmpl.
#  Nunca recarrega Caddy sem CONFIRMO.
#  Depende de: lib/ui.sh
# ============================================================================

CA_SNIPPETS_DIR="${CA_SNIPPETS_DIR:-/root/CentralDark/infra/caddy}"
CA_TEMPLATE="${CA_TEMPLATE:-}"  # resolvido em runtime
CA_CADDYFILE="${CA_CADDYFILE:-/etc/caddy/Caddyfile}"

# Mapa subdomínio → porta interna do serviço.
# Edite aqui pra adicionar novos serviços.
ca_port_for() {
  case "$1" in
    install) echo 9200 ;;
    mcp)     echo 9100 ;;
    gateway) echo 3100 ;;
    api)     echo 3100 ;;
    webhook) echo 9003 ;;
    bot)     echo 8080 ;;
    status)  echo 9200 ;;  # mesma página do install por enquanto
    *)       return 1 ;;
  esac
}

# Lista oficial de subdomínios que o instalador gerencia.
CA_OFFICIAL_SUBS=(install mcp gateway webhook api bot status)

ca_resolve_template() {
  if [ -n "$CA_TEMPLATE" ] && [ -f "$CA_TEMPLATE" ]; then return 0; fi
  local candidates=(
    "/root/CentralDark/infra/caddy/templates/proxy.Caddyfile.tmpl"
    "${SCRIPT_DIR:-.}/CentralDark/infra/caddy/templates/proxy.Caddyfile.tmpl"
    "$(dirname "${BASH_SOURCE[0]}")/../../../infra/caddy/templates/proxy.Caddyfile.tmpl"
  )
  local c
  for c in "${candidates[@]}"; do
    [ -f "$c" ] && { CA_TEMPLATE="$c"; return 0; }
  done
  ui_err "Template Caddy não encontrado"
  return 1
}

# Gera um snippet pra <sub>.<zone> se ainda não existir.
ca_ensure_snippet() {
  local sub="$1" zone="$2"
  local port fqdn out
  if ! port="$(ca_port_for "$sub")"; then
    ui_warn "Sem porta mapeada pra '${sub}' — pulando"
    return 0
  fi
  fqdn="${sub}.${zone}"
  out="${CA_SNIPPETS_DIR}/${sub}.Caddyfile"

  mkdir -p "$CA_SNIPPETS_DIR"

  if [ -f "$out" ] && grep -q "$fqdn" "$out" 2>/dev/null; then
    ui_ok "Snippet já existe: ${sub}.Caddyfile (${fqdn} → :${port})"
    return 0
  fi

  ca_resolve_template || return 1
  sed -e "s|{{DOMAIN}}|${fqdn}|g" -e "s|{{PORT}}|${port}|g" "$CA_TEMPLATE" > "$out"
  ui_ok "Snippet gerado: ${sub}.Caddyfile (${fqdn} → :${port})"
}

# Garante import dos snippets no Caddyfile principal.
ca_ensure_import_line() {
  [ -f "$CA_CADDYFILE" ] || { ui_warn "Caddyfile principal não existe em ${CA_CADDYFILE}"; return 0; }
  local marker="import ${CA_SNIPPETS_DIR}/*.Caddyfile"
  if grep -qF "$marker" "$CA_CADDYFILE" 2>/dev/null; then
    ui_ok "Import dos snippets já está no Caddyfile"
    return 0
  fi
  ui_warn "Caddyfile principal não importa ${CA_SNIPPETS_DIR}/*.Caddyfile"
  ui_info "Adiciona esta linha no topo do ${CA_CADDYFILE}:"
  printf "    %s\n" "$marker"
}

ca_validate() {
  if ! command -v caddy >/dev/null 2>&1; then
    ui_warn "caddy não instalado — pulando validate"; return 0
  fi
  if caddy validate --config "$CA_CADDYFILE" 2>&1 | tail -3; then
    ui_ok "Caddyfile válido"
  else
    ui_err "Caddyfile inválido — corrigir antes de reload"
    return 1
  fi
}

ca_reload_with_confirm() {
  ui_warn "Reload do Caddy é ação sensível."
  if ui_confirm_strong "Digite CONFIRMO pra recarregar o Caddy"; then
    systemctl reload caddy && ui_ok "Caddy recarregado" || ui_err "Falha no reload"
  else
    ui_warn "Reload pulado — rode manualmente: systemctl reload caddy"
  fi
}

ca_generate_all() {
  local zone="$1"
  local sub
  for sub in "${CA_OFFICIAL_SUBS[@]}"; do
    ca_ensure_snippet "$sub" "$zone"
  done
  ca_ensure_import_line
  ca_validate || return 1
}
