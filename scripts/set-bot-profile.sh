#!/usr/bin/env bash
# set-bot-profile.sh — Fachada dos bots CentralDark via Bot API direta.
#
# OWNER   : scripts/set-bot-profile.sh (mesma rota de notify-telegram.sh)
# COFRE   : /root/CentralDark/secrets/telegram-alerts.env  (canonico, ja existe)
# CHAVES  : SRVER1_BOT_TOKEN           -> @srver1bot
#           GUARDA_PRINCIPAL_BOT_TOKEN -> @Guardiaodopivete_bot (GuardiaoCasa) — PORTA OFICIAL
#           GUARDA_TELEGRAM_BOT_TOKEN  -> @Guardiaonotify_bot (notify, legado)
#
# REGRAS  : nao cria token - nao imprime valor - nao cria owner paralelo
#           le o cofre existente e chama setMyDescription/setMyShortDescription
#
# USO     : bash scripts/set-bot-profile.sh          # aplica
#           bash scripts/set-bot-profile.sh --dry    # so mede os getMe
#           ONLY_GUARDIAO=1 bash scripts/set-bot-profile.sh   # so o bot da porta
set -euo pipefail

API="https://api.telegram.org"
DRY=0
[ "${1:-}" = "--dry" ] && DRY=1

COFRES=(
  "/root/CentralDark/secrets/telegram-alerts.env"
  "/root/CentralDark/secrets/.env"
  "/root/CentralDark/secrets/mcp.env"
)

read_key() {
  local key="$1"
  for c in "${COFRES[@]}"; do
    [ -f "$c" ] || continue
    local v
    v="$(grep -E "^${key}=" "$c" 2>/dev/null | head -1 | cut -d= -f2- | tr -d '"' | tr -d "'")"
    [ -n "$v" ] && { printf '%s' "$v"; return 0; }
  done
  return 1
}

SHORT_DESC='Casa CentralDark - a porta fala.
Guardiao do Hub. Autoridade: SEGREDO/CHEFE.'

read -r -d '' FULL_DESC <<'TXT' || true
CENTRALDARK

Guardiao da Casa. Esta e a porta falada do sistema.

AUTORIDADE
SEGREDO/CHEFE = dono, autoridade final
SOL = coordenacao
HERMES = execucao

O QUE ESTE BOT FAZ
- recebe a intencao do CHEFE
- roteia para o owner existente, sem criar paralelo
- devolve resultado, evidencia, pendencia e proximo cursor

LEI DA CASA
UNKNOWN != PASS
ACTION != PROOF
DOCUMENTED != EXECUTED
REALIDADE = JUIZ

MCP: https://mcp.centralldark.com
Painel: https://status.centralldark.com
TXT

apply_profile() {
  local label="$1" token="$2"
  [ -n "$token" ] || { echo "SKIP ${label}: token ausente no cofre"; return 0; }

  # MPRVA - Medir -> Provar -> Reconhecer -> Validar -> Aplicar
  local me
  me="$(curl -s --max-time 8 "$API/bot${token}/getMe")"
  if ! printf '%s' "$me" | grep -q '"ok":true'; then
    echo "MEASURE_FAIL ${label}: getMe nao-ok"
    return 1
  fi
  local uname
  uname="$(printf '%s' "$me" | sed -n 's/.*"username":"\([^"]*\)".*/\1/p')"
  echo "MEASURED ${label} = @${uname}"

  if [ "$DRY" = "1" ]; then
    echo "DRY_RUN ${label}: getMe OK, sem mutacao"
    return 0
  fi

  local a b
  a="$(curl -s --max-time 8 -X POST "$API/bot${token}/setMyShortDescription" \
        --data-urlencode "short_description=${SHORT_DESC}")"
  printf '%s' "$a" | grep -q '"ok":true' \
    && echo "APPLIED ${label} short_description=ok" \
    || { echo "FAIL ${label} setMyShortDescription"; return 1; }

  b="$(curl -s --max-time 8 -X POST "$API/bot${token}/setMyDescription" \
        --data-urlencode "description=${FULL_DESC}")"
  printf '%s' "$b" | grep -q '"ok":true' \
    && echo "APPLIED ${label} description=ok" \
    || { echo "FAIL ${label} setMyDescription"; return 1; }

  local after
  after="$(curl -s --max-time 8 -X POST "$API/bot${token}/getMyDescription")"
  printf '%s' "$after" | grep -q '"ok":true' \
    && echo "RECEIPT ${label} getMyDescription=ok" \
    || echo "RECEIPT ${label} getMyDescription=unreadable"
}

echo "=== set-bot-profile - dry=${DRY} ==="

ONLY_GUARDIAO="${ONLY_GUARDIAO:-0}"
TOK_SRVER1="$(read_key SRVER1_BOT_TOKEN || true)"
TOK_GUARDA_PRINCIPAL="$(read_key GUARDA_PRINCIPAL_BOT_TOKEN || true)"

if [ "$ONLY_GUARDIAO" != "1" ]; then
  apply_profile "srver1bot"    "$TOK_SRVER1"
fi
apply_profile "GuardiaoCasa" "$TOK_GUARDA_PRINCIPAL"

echo "=== DONE ==="
