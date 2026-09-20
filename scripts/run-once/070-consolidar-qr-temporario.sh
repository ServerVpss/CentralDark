#!/usr/bin/env bash
set -uo pipefail

BASE="/root/Multizap"
REPO="$BASE/apps/clone-deck"
QR_DIR="$BASE/api/whatsapp/qrcode"
TS="$(date +%Y%m%d-%H%M%S)"
REV="$BASE/revisoes/$TS/070-consolidar-qr-temporario"
REPORT="$REV/resumo.md"

mkdir -p "$REV/dados" "$QR_DIR"
exec > >(tee -a "$REV/execucao.log") 2>&1

echo "=== 070 - Consolidar QR temporario ==="
cd "$REPO" || exit 1

find "$QR_DIR" -maxdepth 3 -type f 2>/dev/null | sort > "$REV/dados/qrcode-dir-arquivos.txt"

grep -RInE "qrcode|qr-code|qrCode|QRCode|getqr|get-qr|connect|connections|whatsapp|wuzapi" apps/bot 2>/dev/null \
  | sed -E 's/(token|password|authorization|apikey|api_key|secret)[=: ]+[^ ,"]+/\1=***OCULTO***/Ig' \
  | sed -n '1,800p' > "$REV/dados/referencias-qr-bot.txt" || true

BUILD_STATUS="nao_rodou"
if [ -f "$REPO/apps/bot/package.json" ]; then
  (cd "$REPO/apps/bot" && npm run build) > "$REV/dados/build-bot.log" 2>&1
  if [ "$?" -eq 0 ]; then BUILD_STATUS="ok"; else BUILD_STATUS="falhou"; fi
fi

cat > "$REPORT" <<MD
# Run-once 070 - Consolidar QR temporario

Data: $(date)
Revisao: $REV

## Resultado

- QR_DIR: $QR_DIR
- Arquivos em QR_DIR: $(wc -l < "$REV/dados/qrcode-dir-arquivos.txt" | tr -d ' ')
- Referencias QR/WhatsApp em apps/bot: $(wc -l < "$REV/dados/referencias-qr-bot.txt" | tr -d ' ')
- Build apps/bot: $BUILD_STATUS

## Seguranca

- CRM mexido: nao
- Banco alterado: nao
- Caddy alterado: nao
- PM2 reiniciado: nao
- Docker/WuzAPI reiniciado: nao
- WhatsApp reset/logout: nao
- Arquivos apagados: nao

## Evidencias

- Log: $REV/execucao.log
- QR dir: $REV/dados/qrcode-dir-arquivos.txt
- Referencias QR/Bot: $REV/dados/referencias-qr-bot.txt
- Build bot: $REV/dados/build-bot.log
MD

cat "$REPORT"
exit 0
