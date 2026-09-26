# COMANDO - ui.sh
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CentralDark\scripts\installer\lib\ui.sh
**SHA:** 3b6cce9115e097e6
**Timestamp:** 2026-08-26T19:32:46.842719
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- local prompt="$1" default="${2:-N}" ans
- local prompt="${1:-Digite CONFIRMO para aplicar}"
- local prompt="$1" __var="$2" val

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env bash
# ============================================================================
#  lib/ui.sh — Utilitários de interface do instalador (banners, prompts, cor)
#  Usado pelo cloudflare-wizard.sh e demais módulos.
# ============================================================================

if [ -t 1 ]; then
  UI_OK=$'\033[0;32m'; UI_WARN=$'\033[0;33m'; UI_ERR=$'\033[0;31m'
  UI_INFO=$'\033[0;36m'; UI_TITLE=$'\033[1;35m'; UI_DIM=$'\033[2m'; UI_RST=$'\033[0m'
else
  UI_OK=''; UI_WARN=''; UI_ERR=''; UI_INFO=''; UI_TITLE=''; UI_DIM=''; UI_RST=''
fi

ui_info()  { printf "%s[info]%s  %s\n" "$UI_INFO"  "$UI_RST" "$*"; }
ui_ok()    { printf "%s[ ok ]%s  %s\n" "$UI_OK"    "$UI_RST" "$*"; }
ui_warn()  { printf "%s[warn]%s  %s\n" "$UI_WARN"  "$UI_RST" "$*"; }
ui_err()   { printf "%s[err ]%s  %s\n" "$UI_ERR"   "$UI_RST" "$*" >&2; }
ui_title() { printf "\n%s%s%s\n" "$UI_TITLE" "$*" "$UI_RST"; }

ui_banner() {
  local title="$1"
  printf "\n%s" "$UI_TITLE"
  cat <<BANNER
╔══════════════════════════════════════════════════════════╗
║  ${title}
╚══════════════════════════════════════════════════════════╝
BANNER
  printf "%s\n" "$UI_RST"
}

# Sanitização universal — aplicar em TODA saída salva ou exibida.
ui_sanitize() {
  sed -E 's/(token|secret|password|authorization|apikey|api_key|bearer|client_secret|CLOUDFLARE_API_TOKEN|CF_API_TOKEN)[^ ,"]*[=: ]+[A-Za-z0-9._\/+-]+/\1=***OCULTO***/Ig'
}

# Mascara token mostrando só os 4 últimos chars.
ui_mask_token() {
  local t="$1"
  if [ -z "$t" ]; then echo "(vazio)"; return; fi
  if [ "${#t}" -le 8 ]; then echo "****"; return; fi
  printf "****%s\n" "${t: -4}"
}

# Pergunta sim/não com default (S/n ou s/N).
ui_confirm() {
  local prompt="$1" default="${2:-N}" ans
  local hint="[s/N]"
  [ "$default" = "S" ] && hint="[S/n]"
  printf "%s %s: " "$prompt" "$hint"
  read -r ans || ans=""
  ans="${ans,,}"
  [ -z "$ans" ] && ans="${default,,}"
  [ "$ans" = "s" ] || [ "$ans" = "sim" ] || [ "$ans" = "y" ] || [ "$ans" = "yes" ]
}

# Confirmação reforçada — só passa se digitar exatamente "CONFIRMO".
ui_confirm_strong() {
  local prompt="${1:-Digite CONFIRMO para aplicar}"
  printf "%s: " "$prompt"
  local ans
  read -r ans || ans=""
  [ "$ans" = "CONFIRMO" ]
}

# Leitura silenciosa (sem eco) — pra token/senha.
ui_read_secret() {
  local prompt="$1" __var="$2" val
  printf "%s" "$prompt"
  stty -echo 2>/dev/null || true
  read -r val || val=""
  stty echo 2>/dev/null || true
  echo
  printf -v "$__var" '%s' "$val"
}

```