#!/usr/bin/env bash
# Bloco 05 — Bot Telegram CentralDark
source "$(dirname "$0")/_lib.sh"
BLOCO="05-telegram-bot"

PASTA="$CK_CENTRALDARK_ROOT/apps/bot-telegram"
require_canonical_path "$BLOCO" "$PASTA" || exit 0

if [ ! -d "$PASTA" ]; then
  emit_erro "$BLOCO" "apps/bot-telegram não existe na raiz canônica: $PASTA"
  exit 0
fi
emit_ok "$BLOCO" "Pasta presente: $PASTA"

if ! has_cmd pm2; then
  emit_alerta "$BLOCO" "pm2 ausente — não dá pra validar serviço"
  exit 0
fi
if ! has_cmd jq; then
  emit_alerta "$BLOCO" "jq ausente — não dá pra validar identidade do processo PM2"
  exit 0
fi

PM2_JSON=$(pm2 jlist 2>/dev/null) || {
  emit_erro "$BLOCO" "Falha ao consultar pm2 jlist"
  exit 0
}
if [ -z "$PM2_JSON" ]; then
  emit_alerta "$BLOCO" "pm2 jlist retornou vazio"
  exit 0
fi

PROC=$(printf '%s' "$PM2_JSON" | jq -r '.[] | select(.name == "MultiZap-TelegramBot") | [.pm_id, .pm2_env.status, .pm2_env.pm_cwd] | @tsv' | head -1)
if [ -z "$PROC" ]; then
  emit_alerta "$BLOCO" "Processo MultiZap-TelegramBot não encontrado no PM2"
  exit 0
fi
IFS=$'\t' read -r PM_ID STATUS PM_CWD <<< "$PROC"
if [ -z "${PM_CWD:-}" ] || ! require_canonical_path "$BLOCO" "$PM_CWD"; then
  emit_erro "$BLOCO" "Processo Telegram com CWD ausente ou fora da CentralDark"
  exit 0
fi
if [ "${STATUS:-}" != "online" ]; then
  emit_alerta "$BLOCO" "Processo Telegram não está online: ${STATUS:-UNKNOWN}"
  exit 0
fi

LOGS=$(pm2 logs "$PM_ID" --lines 200 --nostream 2>/dev/null | sanitize_log) || {
  emit_erro "$BLOCO" "Falha ao coletar logs do processo Telegram pm_id=$PM_ID"
  exit 0
}
if [ -z "$LOGS" ]; then
  emit_alerta "$BLOCO" "Logs do processo Telegram estão vazios"
  exit 0
fi

TEM_ERRO=0
if echo "$LOGS" | grep -q "Cannot find module '../../skills/core/consciousness.cjs'"; then
  emit_erro "$BLOCO" "Bot Telegram: módulo consciousness.cjs ausente"
  TEM_ERRO=1
fi
if echo "$LOGS" | grep -q "\[Poll\] fetch failed"; then
  emit_alerta "$BLOCO" "Bot Telegram com [Poll] fetch failed recente"
  TEM_ERRO=1
fi
if echo "$LOGS" | grep -qE "MODULE_NOT_FOUND|ERR_MODULE_NOT_FOUND"; then
  emit_erro "$BLOCO" "Bot Telegram com MODULE_NOT_FOUND nos logs"
  TEM_ERRO=1
fi
if [ "$TEM_ERRO" -eq 0 ]; then
  emit_ok "$BLOCO" "Processo Telegram online, CWD canônico e logs sem erros conhecidos"
fi
