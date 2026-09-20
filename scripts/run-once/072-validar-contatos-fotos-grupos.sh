#!/usr/bin/env bash
set -uo pipefail

BASE="/root/Multizap"
REPO="$BASE/apps/clone-deck"
TS="$(date +%Y%m%d-%H%M%S)"
REV="$BASE/revisoes/$TS/072-validar-contatos-fotos-grupos"
REPORT="$REV/resumo.md"

mkdir -p "$REV/dados"
exec > >(tee -a "$REV/execucao.log") 2>&1

echo "=== 072 - Validar contatos, fotos e grupos ==="
cd "$REPO" || exit 1

grep -RInE "contact|contacts|avatar|photo|profile|group|groups|participant|participants" apps/bot 2>/dev/null \
  | sed -E 's/(token|password|authorization|apikey|api_key|secret)[=: ]+[^ ,"]+/\1=***OCULTO***/Ig' \
  | sed -n '1,800p' > "$REV/dados/referencias-contatos-fotos-grupos.txt" || true

BUILD_STATUS="nao_rodou"
if [ -f "$REPO/apps/bot/package.json" ]; then
  (cd "$REPO/apps/bot" && npm run build) > "$REV/dados/build-bot.log" 2>&1
  if [ "$?" -eq 0 ]; then BUILD_STATUS="ok"; else BUILD_STATUS="falhou"; fi
fi

cat > "$REPORT" <<MD
# Run-once 072 - Validar contatos, fotos e grupos

Data: $(date)
Revisao: $REV

## Resultado

- Referencias contatos/fotos/grupos detectadas: $(wc -l < "$REV/dados/referencias-contatos-fotos-grupos.txt" | tr -d ' ')
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
- Referencias: $REV/dados/referencias-contatos-fotos-grupos.txt
- Build bot: $REV/dados/build-bot.log
MD

cat "$REPORT"
exit 0
