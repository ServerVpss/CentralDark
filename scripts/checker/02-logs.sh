#!/usr/bin/env bash
# Bloco 02 — Logs e diretório de relatórios da CentralDark
source "$(dirname "$0")/_lib.sh"
BLOCO="02-logs"

REVISOES="$CK_CENTRALDARK_ROOT/revisoes"
require_canonical_path "$BLOCO" "$REVISOES" || exit 0

if [ -d "$REVISOES" ] && [ -w "$REVISOES" ]; then
  emit_ok "$BLOCO" "Diretório de revisões gravável: $REVISOES"
else
  emit_erro "$BLOCO" "Sem permissão de escrita em $REVISOES"
fi

ULTIMA=$(ls -1t "$REVISOES" 2>/dev/null | grep -E '^[0-9]{8}-[0-9]{6}' | head -1 || true)
if [ -n "$ULTIMA" ]; then
  emit_ok "$BLOCO" "Última revisão registrada: $ULTIMA"
else
  emit_alerta "$BLOCO" "Nenhuma revisão anterior encontrada na raiz canônica"
fi

# Nunca lê conteúdo de revisão para procurar credenciais. Detecta apenas nomes
# que indicam material sensível bruto; valores permanecem fora do checker.
VAZAMENTOS=$(find "$REVISOES" -xdev -type f \
  \( -name '.env' -o -name '.env.*' -o -iname '*credential*' -o -iname '*private*key*' -o -iname '*service*role*' -o -iname '*bot*token*' \) \
  -print 2>/dev/null | head -5 || true)
if [ -z "$VAZAMENTOS" ]; then
  emit_ok "$BLOCO" "Nenhum artefato sensível bruto detectado por nome em revisões"
else
  emit_erro "$BLOCO" "Artefato sensível bruto detectado por nome em revisões: $(echo "$VAZAMENTOS" | tr '\n' ' ')"
fi
