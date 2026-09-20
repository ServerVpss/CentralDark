#!/usr/bin/env bash
set -uo pipefail

BASE="/root/Multizap"
REPO="$BASE/apps/clone-deck"
TS="$(date +%Y%m%d-%H%M%S)"
REV="$BASE/revisoes/$TS/065-analisar-qr-bot"
LOG="$REV/execucao.log"
SUMMARY="$REV/resumo.md"
QR_DIR="$BASE/api/whatsapp/qrcode"

mkdir -p "$REV/logs" "$REV/relatorios" "$QR_DIR"
exec > >(tee -a "$LOG") 2>&1

ok(){ echo "OK: $*"; }
warn(){ echo "ATENCAO: $*"; }
fail(){ echo "FALHA: $*"; }

STATUS="ok"

cd "$REPO" || { echo "FALHA: repo nao encontrado: $REPO"; exit 0; }

sanitize() {
  sed -E \
    -e 's/(token|secret|password|authorization|apikey|api_key)[=: ]+[^ ,"]+/\1=***OCULTO***/Ig' \
    -e 's/(Bearer )[A-Za-z0-9._-]+/\1***OCULTO***/Ig'
}

echo "=== RUN-ONCE 065 START ==="
echo "Revisao: $REV"
echo "QR oficial: $QR_DIR"

echo

echo "=== 1) Conferindo QR oficial ==="
[ -d "$QR_DIR" ] && ok "Pasta QR existe" || { fail "Pasta QR nao existe"; STATUS="atencao"; }
ls -la "$QR_DIR" 2>/dev/null | sanitize | tee "$REV/relatorios/qrcode-dir.txt" || true

echo

echo "=== 2) Localizando referencias de QR no bot e gateway ==="
{
  echo "# Referencias QR encontradas"
  echo
  grep -RInE 'qr|qrcode|QRCode|qr_code|getqr|connect.*qr' \
    "$REPO/apps/bot/src" \
    "$REPO/apps/bot/server" \
    "$REPO/apps/crm/atendimento-whatsapp-gateway-deploy/gateway/src" \
    2>/dev/null | sanitize | sed -n '1,240p' || true
} | tee "$REV/relatorios/referencias-qr.txt"

echo

echo "=== 3) Localizando endpoints de conexao/status/QR ==="
{
  echo "# Endpoints relacionados a conexao e QR"
  echo
  grep -RInE 'connections|/qr|/status|getQR|connect|wuzapi' \
    "$REPO/apps/bot/src/services" \
    "$REPO/apps/bot/src/pages" \
    "$REPO/apps/crm/atendimento-whatsapp-gateway-deploy/gateway/src/routes" \
    "$REPO/apps/crm/atendimento-whatsapp-gateway-deploy/gateway/src/services" \
    2>/dev/null | sanitize | sed -n '1,260p' || true
} | tee "$REV/relatorios/endpoints-conexao-qr.txt"

echo

echo "=== 4) Verificando estado local do gateway sem expor segredo ==="
GW_ENV="/root/Multizap/gateway/.env"
if [ -f "$GW_ENV" ]; then
  ok "Env gateway existe"
  grep -E '^(MULTIZAP_GATEWAY_TOKEN|GATEWAY_SERVER_TOKEN|WUZAPI_WEBHOOK_SECRET|CONNECTION_STORE_PATH)=' "$GW_ENV" \
    | sed -E 's/=.*$/=***EXISTE***/' \
    | tee "$REV/relatorios/gateway-env-keys.txt" || true
else
  warn "Env gateway nao encontrado em $GW_ENV"
  STATUS="atencao"
fi

CONNECTIONS="/root/Multizap/gateway/data/connections.json"
if [ -f "$CONNECTIONS" ]; then
  ok "connections.json encontrado"
  jq '[.connections[]? | {name,connection_id,status,has_phone: ((.phone_number // "") != ""), created_at, updated_at, last_qr_at, last_connected_at, last_disconnected_at, last_error}]' "$CONNECTIONS" \
    | tee "$REV/relatorios/connections-resumo.json" || true
else
  warn "connections.json nao encontrado"
  STATUS="atencao"
fi

echo

echo "=== 5) Health local rapido ==="
for ep in \
  "http://127.0.0.1:3100/health" \
  "http://127.0.0.1:9003/health" \
  "http://127.0.0.1:8081/health"
do
  code="$(curl -sk -o /dev/null -w '%{http_code}' --max-time 6 "$ep" 2>/dev/null || echo 000)"
  echo "$ep -> $code" | tee -a "$REV/relatorios/health-local.txt"
  case "$ep:$code" in
    *3100*:200|*9003*:200) ok "$ep OK" ;;
    *8081*:200) ok "$ep OK" ;;
    *) warn "$ep retornou $code" ;;
  esac
done

cat > "$SUMMARY" <<MD
# Run-once 065 - Analise QR Bot

Data: $(date)
Revisao: $REV

## Resultado

- Status: $STATUS
- Pasta QR oficial: $QR_DIR
- Relatorio QR refs: $REV/relatorios/referencias-qr.txt
- Relatorio endpoints: $REV/relatorios/endpoints-conexao-qr.txt
- Resumo conexoes: $REV/relatorios/connections-resumo.json

## Proximo passo recomendado

Consolidar o endpoint unico de QR no Gateway/Bot e parar de depender de caminhos soltos. Nao mover CRM nesta fase.
MD

cat "$SUMMARY"

echo

echo "=== RUN-ONCE 065 DONE status=$STATUS ==="
exit 0
