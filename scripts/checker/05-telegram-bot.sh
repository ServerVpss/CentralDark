#!/usr/bin/env bash
# Bloco 05 — Bot Telegram (MultiZap-TelegramBot)
source "$(dirname "$0")/_lib.sh"
BLOCO="05-telegram-bot"

PASTA="$CK_MULTIZAP_ROOT/apps/bot-telegram"
if [ ! -d "$PASTA" ]; then
  emit_erro "$BLOCO" "apps/bot-telegram não existe em $PASTA"
  exit 0
fi
emit_ok "$BLOCO" "Pasta presente: $PASTA"

if ! has_cmd pm2; then
  emit_alerta "$BLOCO" "pm2 ausente — não dá pra validar serviço"
  exit 0
fi

# Logs recentes (últimas 200 linhas, sanitizadas)
LOGS=$(pm2 logs MultiZap-TelegramBot --lines 200 --nostream 2>/dev/null | sanitize_log || true)

# Padrões críticos conhecidos (pendência #9)
if echo "$LOGS" | grep -q "Cannot find module '../../skills/core/consciousness.cjs'"; then
  emit_erro "$BLOCO" "Bot Telegram: módulo consciousness.cjs ausente (já catalogado)"
fi
if echo "$LOGS" | grep -q "\[Poll\] fetch failed"; then
  emit_alerta "$BLOCO" "Bot Telegram com [Poll] fetch failed recente"
fi
if echo "$LOGS" | grep -qE "MODULE_NOT_FOUND|ERR_MODULE_NOT_FOUND"; then
  emit_erro "$BLOCO" "Bot Telegram com MODULE_NOT_FOUND nos logs"
fi
if ! echo "$LOGS" | grep -qE "MODULE_NOT_FOUND|\[Poll\] fetch failed|consciousness.cjs"; then
  emit_ok "$BLOCO" "Logs do bot Telegram sem erros conhecidos"
fi
