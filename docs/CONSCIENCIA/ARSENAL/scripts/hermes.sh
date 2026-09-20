#!/usr/bin/env bash
# ============================================================
# HERMES AUTÔNOMO — Fase 6 do Arsenal Council
# ============================================================
# Roda todo dia às 6h da manhã (ou sob demanda).
# 1. Lê PENDENCIAS.md, pega itens 🟡/🔴 em aberto
# 2. Escolhe 1 item rotativo (dia-do-ano % total)
# 3. Roda arsenal-council.sh debate
# 4. Salva proposta em EVOLUCAO/YYYY-MM-DD/
# 5. Chama hermes-notify.mjs (posta no Telegram)
# ============================================================
set -euo pipefail

ROOT="/root/CentralDark"
ARSENAL="$ROOT/docs/CONSCIENCIA/ARSENAL"
PENDENCIAS="$ROOT/docs/PENDENCIAS.md"
EVOLUCAO="$ARSENAL/EVOLUCAO/$(date +%Y-%m-%d)"
COUNCIL="$ARSENAL/scripts/arsenal-council.sh"
NOTIFY="$ARSENAL/scripts/hermes-notify.mjs"
LOG="$ARSENAL/hermes.log"

mkdir -p "$EVOLUCAO"
log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG"; }

# 1. EXTRAIR PENDÊNCIAS ABERTAS
mapfile -t ITENS < <(grep -E '^## (🟡|🔴)' "$PENDENCIAS" | sed 's/^## //')
TOTAL=${#ITENS[@]}
if [ "$TOTAL" -eq 0 ]; then log "Sem pendências. Hermes descansa."; exit 0; fi

IDX=$(( $(date +%j) % TOTAL ))
ITEM="${ITENS[$IDX]}"
log "Escolheu (dia $(date +%j) % $TOTAL = $IDX): $ITEM"

# 2. TEMA DO DEBATE
TEMA="Como resolver a pendência CentralDark: $ITEM

Contexto: CentralDark é a infra do @segredounlocker. Stack React+Vite+Supabase(Lovable Cloud) + VPS PM2 + bots Telegram (@srver1bot HUB, @SEGREDOPUXADASBOT TelePainel). Não mexer em Caddy sem OK, whatsapp-server fica stopped, roles em tabela separada com has_role().

Proponha 3-5 passos diretos em PT-BR. Se envolver deploy/migration, sinalize risco."

# 3. RODAR DEBATE
SLUG=$(echo "$ITEM" | tr '[:upper:]' '[:lower:]' | tr -cs 'a-z0-9' '-' | cut -c1-40 | sed 's/-$//')
OUT="$EVOLUCAO/hermes-${SLUG}.md"

log "Chamando council debate..."
if bash "$COUNCIL" debate "$TEMA" > "$OUT.tmp" 2>&1; then
  VEREDICTO=$(sed 's/📁 .*//' "$OUT.tmp" | sed '/^🔥 DEBATE:/d')
  {
    echo "# 🤖 HERMES — proposta autônoma"
    echo ""
    echo "**Data:** $(date '+%Y-%m-%d %H:%M')"
    echo "**Pendência:** $ITEM"
    echo ""
    echo "---"
    echo ""
    echo "## ⚖️ Veredicto do Conselho"
    echo ""
    echo "$VEREDICTO"
  } > "$OUT"
  rm -f "$OUT.tmp"
  log "Salvou $OUT"
else
  log "❌ Council falhou"; mv "$OUT.tmp" "$OUT.erro"; exit 1
fi

# 4. NOTIFICAR TELEGRAM
if [ -x "$NOTIFY" ] || command -v node >/dev/null; then
  node "$NOTIFY" "$ITEM" "$OUT" >> "$LOG" 2>&1 || log "⚠️ Notify falhou"
fi

log "✅ Ciclo concluído."
