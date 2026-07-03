#!/usr/bin/env bash
# ============================================================
# ARSENAL COUNCIL — Orquestrador universal de IAs (Fase 3)
# ============================================================
# Uso:
#   arsenal-council.sh router   "tema"   → 1 IA rápida (Gemini Flash)
#   arsenal-council.sh parallel "tema"   → 3 IAs em paralelo + juiz
#   arsenal-council.sh debate   "tema"   → 2 rodadas + juiz final
#
# Saída em: docs/CONSCIENCIA/ARSENAL/DEBATES/YYYY-MM-DD-HHMM-<slug>.md
# ============================================================
set -euo pipefail

export DARKAI_URL="${DARKAI_URL:-https://kagejpghnwdfymddwxuf.supabase.co/functions/v1/ai-proxy}"
export DARKAI_ANON_KEY="${DARKAI_ANON_KEY:-eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImthZ2VqcGdobndkZnltZGR3eHVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0OTIwNzgsImV4cCI6MjA4NTA2ODA3OH0.47hoT1t4Vr1n-MaD3Vd9JWyjPMjMSJmz5Dat3zoAYdE}"

MODO="${1:-parallel}"
TEMA="${2:-}"
[ -z "$TEMA" ] && { echo "❌ Uso: $0 <router|parallel|debate> \"<tema>\""; exit 1; }

ROOT="/root/CentralDark/docs/CONSCIENCIA/ARSENAL"
DEBATES="$ROOT/DEBATES"
mkdir -p "$DEBATES"

TS="$(date +%Y-%m-%d-%H%M%S)"
SLUG="$(echo "$TEMA" | tr '[:upper:]' '[:lower:]' | tr -cs 'a-z0-9' '-' | cut -c1-50 | sed 's/-$//')"
OUT="$DEBATES/${TS}-${MODO}-${SLUG}.md"
TMP="$(mktemp -d)"
trap "rm -rf $TMP" EXIT

# ------------------------------------------------------------
# HANDLERS — cada backend em uma função (fácil expandir)
# ------------------------------------------------------------
call_darkai_flash()   { darkai -m gemini-3-flash-preview "$1"     2>&1 || echo "[darkai-flash falhou]"; }
call_darkai_pro()     { darkai -m gemini-3.1-pro-preview "$1"     2>&1 || echo "[darkai-pro falhou]"; }
call_darkai_gpt5()    { darkai -m gpt-5 "$1"                      2>&1 || echo "[gpt5 falhou]"; }
call_darkai_gpt5mini(){ darkai -m gpt-5-mini "$1"                 2>&1 || echo "[gpt5-mini falhou]"; }

# ------------------------------------------------------------
# MODO: ROUTER — 1 IA só, resposta rápida
# ------------------------------------------------------------
if [ "$MODO" = "router" ]; then
  echo "🎯 ROUTER: $TEMA"
  RESP="$(call_darkai_flash "$TEMA")"
  {
    echo "# 🎯 ROUTER — $TS"
    echo ""
    echo "**Tema:** $TEMA"
    echo "**Modelo:** gemini-3-flash-preview (rápido)"
    echo ""
    echo "---"
    echo "$RESP"
  } > "$OUT"
  echo "$RESP"
  echo ""
  echo "📁 $OUT"
  exit 0
fi

# ------------------------------------------------------------
# MODO: PARALLEL — 3 IAs em paralelo + juiz
# ------------------------------------------------------------
if [ "$MODO" = "parallel" ]; then
  echo "⚡ PARALLEL: $TEMA"
  (call_darkai_pro     "$TEMA" > "$TMP/pro.txt") &
  (call_darkai_gpt5    "$TEMA" > "$TMP/gpt.txt") &
  (call_darkai_flash   "$TEMA" > "$TMP/flash.txt") &
  wait

  JUIZ="Você é o JUIZ. Tema: $TEMA

=== VOZ 1 (Gemini Pro) ===
$(cat $TMP/pro.txt)

=== VOZ 2 (GPT-5) ===
$(cat $TMP/gpt.txt)

=== VOZ 3 (Gemini Flash) ===
$(cat $TMP/flash.txt)

=== TAREFA ===
Sintetize o melhor. Aponte convergências, divergências e dê VEREDICTO final. PT-BR, direto."

  VEREDICTO="$(call_darkai_flash "$JUIZ")"

  {
    echo "# ⚡ PARALLEL — $TS"
    echo ""
    echo "**Tema:** $TEMA"
    echo ""
    echo "---"
    echo "## ⚖️ VEREDICTO (Juiz: Gemini Flash)"
    echo ""; echo "$VEREDICTO"
    echo ""; echo "---"; echo "## 🤖 Gemini Pro"
    echo ""; cat "$TMP/pro.txt"
    echo ""; echo "---"; echo "## 🤖 GPT-5"
    echo ""; cat "$TMP/gpt.txt"
    echo ""; echo "---"; echo "## 🤖 Gemini Flash"
    echo ""; cat "$TMP/flash.txt"
  } > "$OUT"

  echo "$VEREDICTO"
  echo ""
  echo "📁 $OUT"
  exit 0
fi

# ------------------------------------------------------------
# MODO: DEBATE — 2 rodadas (IAs veem umas às outras) + juiz
# ------------------------------------------------------------
if [ "$MODO" = "debate" ]; then
  echo "🔥 DEBATE: $TEMA"

  # Rodada 1
  (call_darkai_pro   "$TEMA" > "$TMP/r1-pro.txt") &
  (call_darkai_gpt5  "$TEMA" > "$TMP/r1-gpt.txt") &
  wait

  # Rodada 2 — cada uma vê a resposta da outra
  PROMPT_PRO_R2="Tema: $TEMA

Sua 1ª resposta:
$(cat $TMP/r1-pro.txt)

Resposta da OUTRA IA (GPT-5):
$(cat $TMP/r1-gpt.txt)

Refine sua resposta considerando o que a outra disse. Concorde onde faz sentido, discorde onde precisa, e melhore. PT-BR."

  PROMPT_GPT_R2="Tema: $TEMA

Sua 1ª resposta:
$(cat $TMP/r1-gpt.txt)

Resposta da OUTRA IA (Gemini Pro):
$(cat $TMP/r1-pro.txt)

Refine sua resposta considerando o que a outra disse. Concorde onde faz sentido, discorde onde precisa, e melhore. PT-BR."

  (call_darkai_pro  "$PROMPT_PRO_R2" > "$TMP/r2-pro.txt") &
  (call_darkai_gpt5 "$PROMPT_GPT_R2" > "$TMP/r2-gpt.txt") &
  wait

  # Juiz decide
  JUIZ="Você é o JUIZ de um debate entre 2 IAs. Tema: $TEMA

=== GEMINI PRO — rodada 1 ===
$(cat $TMP/r1-pro.txt)

=== GPT-5 — rodada 1 ===
$(cat $TMP/r1-gpt.txt)

=== GEMINI PRO — rodada 2 (após ver GPT-5) ===
$(cat $TMP/r2-pro.txt)

=== GPT-5 — rodada 2 (após ver Gemini Pro) ===
$(cat $TMP/r2-gpt.txt)

=== TAREFA ===
Analise a evolução do debate. Aponte quem mudou de opinião, quem manteve, e dê o VEREDICTO final unificado. PT-BR, direto."

  VEREDICTO="$(call_darkai_flash "$JUIZ")"

  {
    echo "# 🔥 DEBATE — $TS"
    echo ""
    echo "**Tema:** $TEMA"
    echo ""
    echo "---"
    echo "## ⚖️ VEREDICTO FINAL (Juiz: Gemini Flash)"
    echo ""; echo "$VEREDICTO"
    echo ""; echo "---"; echo "## 🥊 RODADA 1"
    echo ""; echo "### 🤖 Gemini Pro"; echo ""; cat "$TMP/r1-pro.txt"
    echo ""; echo "### 🤖 GPT-5";     echo ""; cat "$TMP/r1-gpt.txt"
    echo ""; echo "---"; echo "## 🥊 RODADA 2 (após ver o outro)"
    echo ""; echo "### 🤖 Gemini Pro"; echo ""; cat "$TMP/r2-pro.txt"
    echo ""; echo "### 🤖 GPT-5";     echo ""; cat "$TMP/r2-gpt.txt"
  } > "$OUT"

  echo "$VEREDICTO"
  echo ""
  echo "📁 $OUT"
  exit 0
fi

echo "❌ Modo inválido: $MODO (use: router, parallel, debate)"
exit 1
