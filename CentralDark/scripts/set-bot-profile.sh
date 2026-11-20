#!/usr/bin/env bash
# set-bot-profile.sh — Fachada dos bots CentralDark via Bot API direta.
#
# OWNER   : scripts/set-bot-profile.sh
# COFRE   : /root/CentralDark/secrets/telegram-alerts.env  (canônico, já existe)
# CHAVES  : SRVER1_BOT_TOKEN           → @srver1bot
#           GUARDA_PRINCIPAL_BOT_TOKEN → @Guardiaodopivete_bot (GuardiaoCasa) — PORTA OFICIAL
#           GUARDA_TELEGRAM_BOT_TOKEN  → @Guardiaonotify_bot (notify, legado)
#
# #OBSERVACOES#
# @owner: scripts/set-bot-profile.sh
# @doc_ref: docs/CONSCIENCIA/PROGRAMAS/HUD-VOZ-CONSULTA-VISUALIZACAO-20260924.md
# @last_updated: 2026-11-04T03:45:00.000Z
# @implementado: fix P1 — json_field le .result antes da raiz e mantem ok na raiz; HERMES como unico papel de execucao.
# @pendente: checks GitHub no HEAD e aplicacao real autorizada (nao executada aqui).
# @estado: SOURCE_ONLY; SAFE_MOCK_TESTS
# @next_cursor: confirmar node --test e bash -n no SHA exato.
# REGRAS  : não cria token · não imprime valor · não cria owner paralelo
#           lê o cofre existente e chama setMyDescription/setMyShortDescription
#           NUNCA falha a sessão (LOCAL_TOOL_DENIAL != GLOBAL_BLOCKER)
#
# DELTA 2026-09-30 (menor delta material, owner existente — sem v2):
#   1. contracheque passa a provar os DOIS campos (short_description + description)
#   2. set -euo pipefail com falhas da Bot API tratadas por bot, sem abortar a sessão
#   3. read_key varre TODOS os cofres e devolve só valor não-vazio
#
# DELTA 2026-11-04 (fix das 2 P1 abertas no PR #1978):
#   1. json_field passa a ler .result[$field] e cai para .[$field]; `ok` fica na raiz.
#      A Bot API devolve username/short_description/description DENTRO de `result`.
#      Sem isso, toda execucao caia em MEASURE_FAIL: username ausente.
#   2. FULL_DESC volta a `HERMES = execução` (AGENTS.md L2294-L2300).
#      `PIVETE/HERMES` reabria papel tecnico aposentado no texto de setMyDescription.
#
# USO     : bash scripts/set-bot-profile.sh          # aplica
#           bash scripts/set-bot-profile.sh --dry    # só mede os getMe
#           ONLY_GUARDIAO=1 bash scripts/set-bot-profile.sh   # porta oficial isolada
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
  local key="$1" c raw v
  for c in "${COFRES[@]}"; do
    [ -f "$c" ] || continue
    # O teste em if evita que uma chave AUSENTE encerre o script sob -e/pipefail.
    if ! raw="$(grep -m1 -E "^${key}=" "$c" 2>/dev/null)"; then
      continue
    fi
    v="${raw#*=}"
    v="${v%$'\r'}"
    if [[ "$v" == \"*\" && "$v" == *\" ]]; then v="${v:1:${#v}-2}"; fi
    if [[ "$v" == \'*\' && "$v" == *\' ]]; then v="${v:1:${#v}-2}"; fi
    [ -n "$v" ] && { printf '%s' "$v"; return 0; }
  done
  return 1
}

# Parser JSON com decodificação real de \n/Unicode; nunca prova valor por regex parcial.
# A Bot API entrega `ok` na RAIZ e os demais campos DENTRO de `result`.
# Portanto: campo `ok` lê a raiz; qualquer outro campo tenta .result e cai para a raiz.
json_field() {
  local json="$1" field="$2"
  if command -v jq >/dev/null 2>&1; then
    if [ "$field" = "ok" ]; then
      printf '%s' "$json" | jq -er --arg field "$field" '.[$field] | if type == "boolean" then tostring elif type == "string" then . else empty end' 2>/dev/null
    else
      printf '%s' "$json" | jq -er --arg field "$field" '(.result[$field] // .[$field]) | if type == "boolean" then tostring elif type == "string" then . else empty end' 2>/dev/null
    fi
    return $?
  fi
  command -v python3 >/dev/null 2>&1 || return 1
  printf '%s' "$json" | python3 -c '
import json, sys
field = sys.argv[1]
try:
    obj = json.load(sys.stdin)
except (ValueError, TypeError):
    sys.exit(1)
if not isinstance(obj, dict):
    sys.exit(1)
if field == "ok":
    val = obj.get(field)
else:
    result = obj.get("result")
    val = None
    if isinstance(result, dict):
        val = result.get(field)
    if val is None:
        val = obj.get(field)
if isinstance(val, str):
    print(val, end="")
elif isinstance(val, bool):
    print(str(val).lower(), end="")
else:
    sys.exit(1)
' "$field"
}

SHORT_DESC='Casa CentralDark — a porta fala.
Guardião do Hub. Autoridade: SEGREDO/CHEFE.'

FULL_DESC="$(cat <<'TXT'
👑🪬 CENTRALDARK

Guardião da Casa. Esta é a porta falada do sistema.

AUTORIDADE
SEGREDO/CHEFE = dono, autoridade final
SOL = coordenação
HERMES = execução

O QUE ESTE BOT FAZ
• recebe a intenção do CHEFE
• roteia para o owner existente — sem criar paralelo
• devolve resultado, evidência, pendência e próximo cursor

LEI DA CASA
UNKNOWN != PASS
ACTION != PROOF
DOCUMENTED != EXECUTED
REALIDADE = JUIZ

MCP: https://mcp.centralldark.com
Painel: https://status.centralldark.com
TXT
)"

# As falhas de transporte são convertidas em "fail" somente neste contorno,
# sem ocultar o estado final de cada bot ou o receipt de leitura.
post_ok() {
  local url="$1" data="$2" resp ok
  if ! resp="$(curl --fail --silent --show-error --max-time 8 -X POST "$url" --data-urlencode "$data" 2>/dev/null)"; then
    printf 'fail'; return 0
  fi
  ok="$(json_field "$resp" ok || :)"
  if [ "$ok" = "true" ]; then printf 'ok'; else printf 'fail'; fi
}

apply_profile() {
  local label="$1" token="$2" me uname a b after_s after_d got_s got_d
  [ -n "$token" ] || { echo "SKIP ${label}: token ausente no cofre"; return 0; }

  # MPRVA — Medir → Provar → Reconhecer → Validar → Aplicar
  if ! me="$(curl --fail --silent --show-error --max-time 8 "$API/bot${token}/getMe" 2>/dev/null)"; then
    echo "MEASURE_FAIL ${label}: transporte indisponível"; return 1
  fi
  if [ "$(json_field "$me" ok || :)" != "true" ]; then
    echo "MEASURE_FAIL ${label}: getMe não-ok"; return 1
  fi
  if ! uname="$(json_field "$me" username)"; then
    echo "MEASURE_FAIL ${label}: username ausente"; return 1
  fi
  echo "MEASURED ${label} = @${uname}"

  if [ "$DRY" = "1" ]; then
    echo "DRY_RUN ${label}: getMe OK, sem mutacao"
    return 0
  fi

  a="$(post_ok "$API/bot${token}/setMyShortDescription" "short_description=${SHORT_DESC}")"
  [ "$a" = "ok" ] || { echo "FAIL ${label} setMyShortDescription"; return 1; }
  echo "APPLIED ${label} short_description=ok"

  b="$(post_ok "$API/bot${token}/setMyDescription" "description=${FULL_DESC}")"
  [ "$b" = "ok" ] || { echo "FAIL ${label} setMyDescription"; return 1; }
  echo "APPLIED ${label} description=ok"

  # Contracheque: comprovar OS DOIS valores exatos, não apenas HTTP/ok=true.
  if ! after_s="$(curl --fail --silent --show-error --max-time 8 -X POST "$API/bot${token}/getMyShortDescription" 2>/dev/null)"; then
    echo "RECEIPT_FAIL ${label} getMyShortDescription transporte"; return 1
  fi
  if ! after_d="$(curl --fail --silent --show-error --max-time 8 -X POST "$API/bot${token}/getMyDescription" 2>/dev/null)"; then
    echo "RECEIPT_FAIL ${label} getMyDescription transporte"; return 1
  fi
  if [ "$(json_field "$after_s" ok || :)" != "true" ] || ! got_s="$(json_field "$after_s" short_description)"; then
    echo "RECEIPT_FAIL ${label} getMyShortDescription não-ok"; return 1
  fi
  if [ "$(json_field "$after_d" ok || :)" != "true" ] || ! got_d="$(json_field "$after_d" description)"; then
    echo "RECEIPT_FAIL ${label} getMyDescription não-ok"; return 1
  fi
  if [ "$got_s" != "$SHORT_DESC" ]; then
    echo "RECEIPT_FAIL ${label} short_description valor divergente"; return 1
  fi
  if [ "$got_d" != "$FULL_DESC" ]; then
    echo "RECEIPT_FAIL ${label} description valor divergente"; return 1
  fi
  printf 'RECEIPT %s getMyShortDescription=ok match=EXACT %q\n' "$label" "$got_s"
  printf 'RECEIPT %s getMyDescription=ok match=EXACT chars=%s\n' "$label" "${#got_d}"
}

echo "=== set-bot-profile · dry=${DRY} ==="

ONLY_GUARDIAO="${ONLY_GUARDIAO:-0}"
TOK_SRVER1="$(read_key SRVER1_BOT_TOKEN || :)"
TOK_GUARDA_PRINCIPAL="$(read_key GUARDA_PRINCIPAL_BOT_TOKEN || :)"

PROFILE_FAILED=0
if [ "$ONLY_GUARDIAO" != "1" ]; then
  if ! apply_profile "srver1bot"    "$TOK_SRVER1"; then PROFILE_FAILED=1; fi
fi
if ! apply_profile "GuardiaoCasa" "$TOK_GUARDA_PRINCIPAL"; then PROFILE_FAILED=1; fi
if [ "$PROFILE_FAILED" -eq 1 ]; then echo "PROFILE_STATUS=PARTIAL_OR_FAILED (LOCAL_TOOL_DENIAL != GLOBAL_BLOCKER)"; fi

echo "=== DONE ==="
