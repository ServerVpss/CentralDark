#!/usr/bin/env bash
# Bloco 02 — Logs e diretório de relatórios
source "$(dirname "$0")/_lib.sh"
BLOCO="02-logs"

REVISOES="$CK_MULTIZAP_ROOT/revisoes"
if [ -d "$REVISOES" ] && [ -w "$REVISOES" ]; then
  emit_ok "$BLOCO" "Diretório de revisões gravável: $REVISOES"
else
  emit_erro "$BLOCO" "Sem permissão de escrita em $REVISOES"
fi

# Garante que existe ao menos um subdir no formato YYYYMMDD-HHMMSS
ULTIMA=$(ls -1t "$REVISOES" 2>/dev/null | grep -E '^[0-9]{8}-[0-9]{6}' | head -1 || true)
if [ -n "$ULTIMA" ]; then
  emit_ok "$BLOCO" "Última revisão registrada: $ULTIMA"
else
  emit_alerta "$BLOCO" "Nenhuma revisão anterior encontrada (primeira execução?)"
fi

# Verifica sanitização: nenhum arquivo de relatório com 'BOT_TOKEN=' literal
VAZAMENTOS=$(grep -rliE 'BOT_TOKEN=[A-Za-z0-9]|SUPABASE_SERVICE_ROLE_KEY=[A-Za-z0-9]' "$REVISOES" 2>/dev/null | head -5 || true)
if [ -z "$VAZAMENTOS" ]; then
  emit_ok "$BLOCO" "Nenhum vazamento de secret encontrado em revisões"
else
  emit_erro "$BLOCO" "Possível vazamento em revisões: $(echo $VAZAMENTOS | tr '\n' ' ')"
fi
