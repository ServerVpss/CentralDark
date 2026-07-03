#!/usr/bin/env bash
# 🐝 Enxame 3-IAs — dispara GPT-5, Gemini e Claude em paralelo e consolida
# Uso: ./scripts/enxame-3ias.sh <prompt-file> [nome]
set -euo pipefail
PROMPT_FILE="${1:?informe o arquivo de prompt}"
NOME="${2:-enxame-$(date +%Y%m%d-%H%M%S)}"
DEST="/root/CentralDark/revisoes"; mkdir -p "$DEST"
[ ! -f "$PROMPT_FILE" ] && { echo "❌ Prompt não encontrado: $PROMPT_FILE"; exit 1; }
[ -z "${DARKAI_URL:-}" ] && source ~/.bashrc || true
PROMPT_TXT="$(cat "$PROMPT_FILE")"
SYS="Você é o Arquiteto Chefe do Arsenal Council. Seja direto, técnico, sem firula."
echo "🚀 Disparando enxame 3-IAs: $PROMPT_FILE"
darkai --model gpt-5                  --system "$SYS" --prompt "$PROMPT_TXT" --save "$DEST/${NOME}-gpt5.md"   --verbose > "$DEST/${NOME}-gpt5.log"   2>&1 & PID_GPT=$!
darkai --model gemini-3-flash-preview --system "$SYS" --prompt "$PROMPT_TXT" --save "$DEST/${NOME}-gemini.md" --verbose > "$DEST/${NOME}-gemini.log" 2>&1 & PID_GEM=$!
darkai --model claude-sonnet-4        --system "$SYS" --prompt "$PROMPT_TXT" --save "$DEST/${NOME}-claude.md" --verbose > "$DEST/${NOME}-claude.log" 2>&1 & PID_CLA=$!
echo "⏳ PIDs: GPT=$PID_GPT · Gemini=$PID_GEM · Claude=$PID_CLA"
wait $PID_GPT && echo "✅ GPT-5"  || echo "⚠️  GPT-5 falhou"
wait $PID_GEM && echo "✅ Gemini" || echo "⚠️  Gemini falhou"
wait $PID_CLA && echo "✅ Claude" || echo "⚠️  Claude falhou"
REL="$DEST/${NOME}-CONSOLIDADO.md"
{
  echo "# 🐝 Enxame 3-IAs — $NOME"
  echo "_Gerado em $(date '+%Y-%m-%d %H:%M:%S')_"; echo
  echo "## 📊 Placar"
  for m in gpt5 gemini claude; do
    F="$DEST/${NOME}-${m}.md"
    if [ -s "$F" ]; then echo "- ✅ **${m}** — $(wc -l < "$F") linhas — \`${NOME}-${m}.md\`"
    else echo "- ❌ **${m}** — falhou (ver log)"; fi
  done
  echo
  for m in gpt5 gemini claude; do
    F="$DEST/${NOME}-${m}.md"
    echo "---"; echo "## 🤖 ${m}"; echo
    [ -s "$F" ] && cat "$F" || echo "_sem saída_"; echo
  done
} > "$REL"
echo "📄 Consolidado: $REL"
