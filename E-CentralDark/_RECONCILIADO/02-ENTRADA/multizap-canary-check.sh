#!/usr/bin/env bash
# MultiZap — Canary check (opcional). Roda DEPOIS do healthcheck básico,
# valida que o gateway responde rápido em rotas reais antes de marcar deploy OK.
#
# Configurar:
#   export MULTIZAP_GATEWAY_TOKEN=...
#   export MULTIZAP_CANARY_CONNECTION_ID=...   (opcional — se vazio, só valida /__diag/wuzapi geral)
#   export MULTIZAP_CANARY_MAX_MS=2000          (opcional, default 2000ms)
#
# Sai 0 = OK, 1 = falha (dispara rollback no script de pull).

set -uo pipefail

GATEWAY="${MULTIZAP_GATEWAY_URL:-http://127.0.0.1:3100}"
TOKEN="${MULTIZAP_GATEWAY_TOKEN:-}"
CONN="${MULTIZAP_CANARY_CONNECTION_ID:-}"
MAX_MS="${MULTIZAP_CANARY_MAX_MS:-2000}"

log() { echo "[canary] $*"; }

if [ -z "$TOKEN" ]; then
  log "AVISO: MULTIZAP_GATEWAY_TOKEN não setado — pulando canary (OK)"
  exit 0
fi

# 1) /__diag/wuzapi geral — precisa responder rápido
URL="$GATEWAY/__diag/wuzapi"
[ -n "$CONN" ] && URL="$URL?connection=$CONN"

START=$(date +%s%3N)
HTTP=$(curl -fsS -o /tmp/canary-resp.json -w "%{http_code}" \
  --max-time 10 \
  -H "Authorization: Bearer $TOKEN" \
  "$URL" 2>/dev/null || echo "000")
END=$(date +%s%3N)
ELAPSED=$((END - START))

log "GET $URL → HTTP $HTTP em ${ELAPSED}ms"

if [ "$HTTP" != "200" ]; then
  log "FALHA: HTTP $HTTP (esperado 200)"
  exit 1
fi

if [ "$ELAPSED" -gt "$MAX_MS" ]; then
  log "FALHA: ${ELAPSED}ms > ${MAX_MS}ms (lento demais)"
  exit 1
fi

# 2) Valida payload tem ok:true
if ! grep -q '"ok"[[:space:]]*:[[:space:]]*true' /tmp/canary-resp.json 2>/dev/null; then
  log "FALHA: resposta sem ok:true"
  exit 1
fi

log "OK"
exit 0
