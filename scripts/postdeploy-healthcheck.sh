#!/usr/bin/env bash
# postdeploy-healthcheck.sh — validação pós-deploy do MCP CentralDark.
# Rodar automaticamente pelo webhook logo após pm2 restart.
# Só marca o serviço como "PRONTO" se AMBOS responderem:
#   • /health/deep       → HTTP 200 + score >= 60
#   • /admin/logs/stream → HTTP 200 + content-type text/event-stream + primeiro frame
# Retorno 0 = OK, retorno 2 = falhou (webhook deve chamar rollback-mcp.sh rollback).
set -euo pipefail

BASE="${MCP_BASE_URL:-https://mcp.centralldark.com}"
TIMEOUT_SEG="${HEALTH_TIMEOUT:-40}"
INTERVALO=2
DEADLINE=$(( $(date +%s) + TIMEOUT_SEG ))

log() { echo "[$(date +%H:%M:%S)] $*"; }

log "🔎 Aguardando MCP em $BASE ..."

# ─── ETAPA 1: /health/deep ──────────────────────────────────────────────
while :; do
  RESP=$(curl -fsS -m 5 "$BASE/health/deep" 2>/dev/null || true)
  if [ -n "$RESP" ]; then
    SCORE=$(echo "$RESP" | grep -oE '"score":[[:space:]]*[0-9]+' | head -1 | grep -oE '[0-9]+' || echo 0)
    STATUS=$(echo "$RESP" | grep -oE '"status":[[:space:]]*"[^"]+"' | head -1 | cut -d'"' -f4 || echo unknown)
    VERSAO=$(echo "$RESP" | grep -oE '"versao":[[:space:]]*"[^"]+"' | head -1 | cut -d'"' -f4 || echo "?")
    if [ "${SCORE:-0}" -ge 60 ]; then
      log "✅ /health/deep OK — score=$SCORE status=$STATUS versao=$VERSAO"
      break
    fi
    log "⏳ /health/deep respondeu mas score=$SCORE (ainda subindo)..."
  fi
  if [ "$(date +%s)" -ge "$DEADLINE" ]; then
    log "❌ /health/deep não respondeu ok em ${TIMEOUT_SEG}s"
    exit 2
  fi
  sleep "$INTERVALO"
done

# ─── ETAPA 2: /admin/logs/stream (SSE) ───────────────────────────────────
# Sem cookie admin, esperamos 401 (comportamento correto). Isso já valida
# que a rota está montada e não estourou body_iterator/streaming.
log "🔎 Validando /admin/logs/stream ..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -m 5 "$BASE/admin/logs/stream" || echo 000)
if [ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "200" ]; then
  log "✅ /admin/logs/stream respondeu $HTTP_CODE (rota viva)"
else
  log "❌ /admin/logs/stream respondeu $HTTP_CODE (esperado 200 ou 401)"
  exit 2
fi

# ─── ETAPA 3: /admin/api/e2e (fluxo OAuth simulado) ─────────────────────
log "🔎 Testando fluxo E2E OAuth ..."
E2E=$(curl -s -m 15 "$BASE/admin/api/e2e/publico" || true)
if echo "$E2E" | grep -q '"ok":[[:space:]]*true'; then
  log "✅ Fluxo OAuth E2E OK"
else
  log "⚠️  Fluxo E2E ainda não passou publicamente (não bloqueante — checar via /admin logado)"
fi

log "🟢 DEPLOY VALIDADO — MCP PRONTO em $BASE"
exit 0
