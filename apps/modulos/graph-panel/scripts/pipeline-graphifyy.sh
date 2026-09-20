#!/usr/bin/env bash
# pipeline-graphifyy.sh — pipeline blindado do Graphify
# =====================================================
#
# O que faz:
#   1. Detecta binário disponível (`graphify` OU `graphifyy`)
#   2. Roda com timeout, log timestamped e fallback pro parser Python
#   3. Roda auditoria depois
#   4. Se falhar, notifica no grupo de evolução das IAs via Telegram
#
# Segurança: set -Eeuo pipefail + trap ERR
#
# Requer: bash 4+, python3. Opcional: graphify/graphifyy no PATH, curl pra notificar.

set -Eeuo pipefail

# -----------------------------------------------------------------------------
# Caminhos e log
# -----------------------------------------------------------------------------
BASE="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$BASE"

mkdir -p graphify-out
LOG_FILE="graphify-out/pipeline.log"

log() {
  local ts
  ts="$(date '+%Y-%m-%d %H:%M:%S')"
  echo "[$ts] $*" | tee -a "$LOG_FILE"
}

# -----------------------------------------------------------------------------
# Notificação de falha no grupo de evolução (Telegram)
# -----------------------------------------------------------------------------
notificar_falha() {
  local motivo="$1"
  local etapa="${2:-desconhecida}"

  # Só notifica se tiver token e chat_id (do agent.env ou env)
  local token="${BOT_TOKEN_GEMINI:-}"
  local chat_id="${EVOLUCAO_CHAT_ID:--5365750004}"

  # Tenta carregar do agent.env se rodando na VPS
  if [ -z "$token" ] && [ -f "/root/CentralDark/secrets/agent.env" ]; then
    token="$(grep -E '^BOT_TOKEN_GEMINI=' /root/CentralDark/secrets/agent.env | head -1 | cut -d= -f2- || true)"
  fi

  if [ -z "$token" ]; then
    log "⚠️ Sem BOT_TOKEN_GEMINI — pulando notificação Telegram"
    return 0
  fi

  local mensagem="🔴 <b>Pipeline Graphify FALHOU</b>%0A%0A<b>Etapa:</b> ${etapa}%0A<b>Motivo:</b> ${motivo}%0A%0A<i>Discussão liberada no grupo — o que a gente faz?</i>"

  curl -sS --max-time 10 -X POST \
    "https://api.telegram.org/bot${token}/sendMessage" \
    -d "chat_id=${chat_id}" \
    -d "parse_mode=HTML" \
    -d "text=${mensagem}" >/dev/null 2>&1 || log "⚠️ Falha ao notificar Telegram"
}

# -----------------------------------------------------------------------------
# Trap de erro — captura falha antes do exit
# -----------------------------------------------------------------------------
on_error() {
  local exit_code=$?
  local linha=$1
  local comando=$2
  log "❌ ERRO linha ${linha} (exit=${exit_code}): ${comando}"
  notificar_falha "exit=${exit_code} linha=${linha}: ${comando}" "trap-err"
  exit "$exit_code"
}
trap 'on_error ${LINENO} "$BASH_COMMAND"' ERR

# -----------------------------------------------------------------------------
# Ignore file — preferência: raiz do repo, fallback: scripts/
# -----------------------------------------------------------------------------
IGNORE_FILE=""
if [ -f "$BASE/../../../.graphifyignore" ]; then
  IGNORE_FILE="$BASE/../../../.graphifyignore"
elif [ -f "$BASE/scripts/.graphifyignore" ]; then
  IGNORE_FILE="$BASE/scripts/.graphifyignore"
fi

if [ -n "$IGNORE_FILE" ]; then
  log "✅ Usando ignore: $IGNORE_FILE"
else
  log "⚠️ Nenhum .graphifyignore encontrado — grafo pode ficar poluído"
fi

# -----------------------------------------------------------------------------
# Etapa 1: parse / extração do grafo
# -----------------------------------------------------------------------------
log "🚀 Iniciando pipeline Graphify"

BIN=""
if command -v graphify >/dev/null 2>&1; then
  BIN="graphify"
elif command -v graphifyy >/dev/null 2>&1; then
  BIN="graphifyy"
fi

parse_ok=0
if [ -n "$BIN" ]; then
  log "🕸️ Binário detectado: $BIN"
  ARGS=()
  [ -n "$IGNORE_FILE" ] && ARGS+=(--ignore "$IGNORE_FILE")
  ARGS+=(--output data/graph.json)

  if timeout 300 "$BIN" "${ARGS[@]}" >>"$LOG_FILE" 2>&1; then
    log "✅ $BIN concluído"
    parse_ok=1
  else
    log "⚠️ $BIN falhou — indo pro fallback Python"
  fi
else
  log "⚠️ Nenhum graphify/graphifyy no PATH — usando fallback Python direto"
fi

if [ "$parse_ok" -eq 0 ]; then
  if timeout 300 python3 scripts/fallback-parser.py >>"$LOG_FILE" 2>&1; then
    log "✅ fallback-parser.py concluído"
  else
    log "❌ fallback-parser.py também falhou"
    notificar_falha "fallback-parser.py exit != 0" "parse"
    exit 1
  fi
fi

# -----------------------------------------------------------------------------
# Etapa 2: auditoria
# -----------------------------------------------------------------------------
log "🔍 Rodando auditoria"
if timeout 120 python3 scripts/audit.py >>"$LOG_FILE" 2>&1; then
  log "✅ audit.py concluído"
else
  log "❌ audit.py falhou"
  notificar_falha "audit.py exit != 0" "audit"
  exit 1
fi

log "🟢 Pipeline concluído com sucesso"
exit 0
