#!/usr/bin/env bash
# CONSELHO DE IAs — Multi-Model Orchestration (Fase 2)
# Uso: ./council.sh "<tema>"
set -euo pipefail

# Env do darkai (ai-proxy Supabase)
export DARKAI_URL="${DARKAI_URL:-https://kagejpghnwdfymddwxuf.supabase.co/functions/v1/ai-proxy}"
export DARKAI_ANON_KEY="${DARKAI_ANON_KEY:-eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImthZ2VqcGdobndkZnltZGR3eHVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0OTIwNzgsImV4cCI6MjA4NTA2ODA3OH0.47hoT1t4Vr1n-MaD3Vd9JWyjPMjMSJmz5Dat3zoAYdE}"

TEMA="${1:-}"
[ -z "$TEMA" ] && { echo "❌ Uso: $0 \"<tema>\""; exit 1; }

ROOT="/root/CentralDark/docs/CONSCIENCIA/ARSENAL"
DEBATES="$ROOT/DEBATES"
mkdir -p "$DEBATES"

TS="$(date +%Y-%m-%d-%H%M)"
SLUG="$(echo "$TEMA" | tr '[:upper:]' '[:lower:]' | tr -cs 'a-z0-9' '-' | cut -c1-50 | sed 's/-$//')"
OUT="$DEBATES/${TS}-${SLUG}.md"
TMP="$(mktemp -d)"
trap "rm -rf $TMP" EXIT

echo "🧠 CONSELHO: $TEMA"
echo "⚡ Disparando 3 IAs em paralelo..."

(darkai -m gemini-3.1-pro-preview "$TEMA" > "$TMP/gemini.txt" 2>&1) &
(darkai -m gpt-5 "$TEMA" > "$TMP/gpt.txt" 2>&1) &
(darkai -m gemini-3-flash-preview "$TEMA" > "$TMP/flash.txt" 2>&1) &
wait
echo "✅ Respostas coletadas"

JUIZ="$TMP/juiz.txt"
{
  echo "Você é o JUIZ de um conselho de IAs. Tema:"
  echo "$TEMA"
  echo ""
  echo "=== RESPOSTA 1 (Gemini Pro) ==="; cat "$TMP/gemini.txt"
  echo ""
  echo "=== RESPOSTA 2 (GPT-5) ==="; cat "$TMP/gpt.txt"
  echo ""
  echo "=== RESPOSTA 3 (Gemini Flash) ==="; cat "$TMP/flash.txt"
  echo ""
  echo "=== TAREFA ==="
  echo "Sintetize o melhor de cada. Aponte convergências, divergências e VEREDICTO. PT-BR, direto."
} > "$JUIZ"

echo "⚖️  Juiz sintetizando..."
VEREDICTO="$(darkai -m gemini-3-flash-preview "$(cat $JUIZ)" 2>&1)"

{
  echo "# 🧠 CONSELHO DE IAs — $TS"
  echo ""
  echo "**Tema:** $TEMA"
  echo ""
  echo "---"
  echo "## ⚖️ VEREDICTO (Juiz: Gemini Flash)"
  echo ""
  echo "$VEREDICTO"
  echo ""
  echo "---"
  echo "## 🤖 Gemini Pro"
  echo ""; cat "$TMP/gemini.txt"
  echo ""
  echo "---"
  echo "## 🤖 GPT-5"
  echo ""; cat "$TMP/gpt.txt"
  echo ""
  echo "---"
  echo "## 🤖 Gemini Flash"
  echo ""; cat "$TMP/flash.txt"
} > "$OUT"

echo "✅ DEBATE SALVO: $OUT"
echo ""
echo "═══ VEREDICTO ═══"
echo "$VEREDICTO"
