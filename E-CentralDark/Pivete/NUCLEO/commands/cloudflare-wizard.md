# COMANDO - cloudflare-wizard.sh
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CentralDark\scripts\installer\cloudflare-wizard.sh
**SHA:** 1e1b167dab094eb2
**Timestamp:** 2026-08-26T19:32:46.702829
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- # Escolha do método: navegador (QR/OAuth) ou token manual

### Ouro Bruto (primeiros 5000 chars)
```
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
      *) ui_warn "Opção inválida."; method_choice=""
```