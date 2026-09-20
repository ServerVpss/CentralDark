#!/usr/bin/env bash
set -uo pipefail

BASE="/root/Multizap"
REPO="$BASE/apps/clone-deck"
QR_DIR="$BASE/api/whatsapp/qrcode"
TS="$(date +%Y%m%d-%H%M%S)"
REV="$BASE/revisoes/$TS/069-plano-apps-bot-qr"
REPORT="$REV/resumo.md"

mkdir -p "$REV/dados" "$QR_DIR"
exec > >(tee -a "$REV/execucao.log") 2>&1

sanitize() {
  sed -E \
    -e 's/(token|password|authorization|apikey|api_key|secret)[=: ]+[^ ,"]+/\1=***OCULTO***/Ig' \
    -e 's/(Bearer )[A-Za-z0-9._-]+/\1***OCULTO***/Ig'
}

echo "=== RUN-ONCE 069: PLANO APPS BOT E QR ==="
echo "Revisao: $REV"

cd "$REPO" || {
  echo "FALHA: repo nao encontrado: $REPO"
  exit 0
}

find apps/bot -maxdepth 5 -type d 2>/dev/null | sort > "$REV/dados/apps-bot-diretorios.txt"
find apps/bot -maxdepth 5 -type f 2>/dev/null | sort > "$REV/dados/apps-bot-arquivos.txt"

grep -RInE "qrcode|qr-code|qrCode|QRCode|getqr|get-qr|connect|connections|whatsapp|wuzapi" apps/bot 2>/dev/null \
  | sanitize \
  | sed -n '1,500p' > "$REV/dados/referencias-qr-bot.txt" || true

find "$QR_DIR" -maxdepth 3 -type f 2>/dev/null | sort > "$REV/dados/qrcode-dir-arquivos.txt"

BOT_FILES=$(wc -l < "$REV/dados/apps-bot-arquivos.txt" | tr -d ' ')
QR_REFS=$(wc -l < "$REV/dados/referencias-qr-bot.txt" | tr -d ' ')
QR_FILES=$(wc -l < "$REV/dados/qrcode-dir-arquivos.txt" | tr -d ' ')

BUILD_STATUS="nao_rodou"
if [ -f "$REPO/apps/bot/package.json" ]; then
  echo "=== VALIDANDO BUILD DO BOT ==="
  (cd "$REPO/apps/bot" && npm run build) > "$REV/dados/build-bot.log" 2>&1
  if [ "$?" -eq 0 ]; then
    BUILD_STATUS="ok"
  else
    BUILD_STATUS="falhou"
  fi
fi

cat > "$REPORT" <<MD
# Run-once 069 - Plano apps/bot e QR temporario

Data: $(date)
Revisao: $REV

## Resultado

- Arquivos em apps/bot mapeados: $BOT_FILES
- Referencias QR/WhatsApp encontradas: $QR_REFS
- Arquivos atuais em $QR_DIR: $QR_FILES
- Build apps/bot: $BUILD_STATUS

## Seguranca

- CRM movido: nao
- Banco alterado: nao
- Caddy alterado: nao
- PM2 reiniciado: nao
- Docker/WuzAPI reiniciado: nao
- WhatsApp reset/logout: nao
- Arquivos apagados: nao

## Evidencias

- Apps bot diretorios: $REV/dados/apps-bot-diretorios.txt
- Apps bot arquivos: $REV/dados/apps-bot-arquivos.txt
- Referencias QR/Bot: $REV/dados/referencias-qr-bot.txt
- QR dir arquivos: $REV/dados/qrcode-dir-arquivos.txt
- Build bot: $REV/dados/build-bot.log

## Proxima acao recomendada

Criar etapa 070 para consolidar o QR temporario em $QR_DIR apenas depois de identificar exatamente quais endpoints e arquivos do apps/bot exibem o QR para o usuario final.
MD

cat "$REPORT"

echo "=== RUN-ONCE 069 DONE ==="
exit 0
