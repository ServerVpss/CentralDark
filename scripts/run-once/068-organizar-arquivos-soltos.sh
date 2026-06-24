#!/usr/bin/env bash
set -uo pipefail

BASE="/root/Multizap"
REPO="$BASE/apps/clone-deck"
TS="$(date +%Y%m%d-%H%M%S)"
REV="$BASE/revisoes/$TS/068-organizar-arquivos-soltos"
REPORT="$REV/resumo.md"
TARGET_DIR="$REPO/tools/legacy-fixes"
BACKUP_DIR="$REV/backups"

mkdir -p "$REV/dados" "$BACKUP_DIR" "$TARGET_DIR"
exec > >(tee -a "$REV/execucao.log") 2>&1

sanitize() {
  sed -E \
    -e 's/(token|password|authorization|apikey|api_key)[=: ]+[^ ,"]+/\1=***OCULTO***/Ig' \
    -e 's/(Bearer )[A-Za-z0-9._-]+/\1***OCULTO***/Ig'
}

echo "=== RUN-ONCE 068: ORGANIZAR ARQUIVOS SOLTOS ==="
echo "Revisao: $REV"

cd "$REPO" || {
  echo "FALHA: repo nao encontrado: $REPO"
  exit 0
}

find . -maxdepth 1 -type f \( -name 'fix-*.cjs' -o -name 'test-*.cjs' -o -name 'test-*.sh' \) | sort > "$REV/dados/candidatos-antes.txt"
COUNT_BEFORE=$(wc -l < "$REV/dados/candidatos-antes.txt" | tr -d ' ')

: > "$REV/dados/movidos.txt"
: > "$REV/dados/referencias-antes.txt"
: > "$REV/dados/referencias-depois.txt"

while IFS= read -r file; do
  [ -n "$file" ] || continue
  base_name="$(basename "$file")"

  grep -RIn --exclude-dir=.git --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=build "$base_name" . 2>/dev/null \
    | sanitize >> "$REV/dados/referencias-antes.txt" || true

  cp -a "$file" "$BACKUP_DIR/$base_name"
  mv "$file" "$TARGET_DIR/$base_name"
  echo "$file -> tools/legacy-fixes/$base_name" | tee -a "$REV/dados/movidos.txt"

done < "$REV/dados/candidatos-antes.txt"

find . -maxdepth 1 -type f \( -name 'fix-*.cjs' -o -name 'test-*.cjs' -o -name 'test-*.sh' \) | sort > "$REV/dados/candidatos-depois.txt"
COUNT_AFTER=$(wc -l < "$REV/dados/candidatos-depois.txt" | tr -d ' ')
MOVED_COUNT=$(wc -l < "$REV/dados/movidos.txt" | tr -d ' ')

while IFS= read -r moved; do
  [ -n "$moved" ] || continue
  base_name="$(echo "$moved" | awk -F' -> ' '{print $2}' | xargs basename 2>/dev/null || true)"
  [ -n "$base_name" ] || continue
  grep -RIn --exclude-dir=.git --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=build "$base_name" . 2>/dev/null \
    | sanitize >> "$REV/dados/referencias-depois.txt" || true
done < "$REV/dados/movidos.txt"

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
# Run-once 068 - Organizar arquivos soltos

Data: $(date)
Revisao: $REV

## Resultado

- Arquivos candidatos antes: $COUNT_BEFORE
- Arquivos movidos: $MOVED_COUNT
- Arquivos candidatos depois: $COUNT_AFTER
- Destino: $TARGET_DIR
- Backup: $BACKUP_DIR
- Build apps/bot: $BUILD_STATUS

## Seguranca

- CRM mexido: nao
- Banco alterado: nao
- Caddy alterado: nao
- PM2 reiniciado: nao
- Docker/WuzAPI reiniciado: nao
- Arquivos apagados: nao

## Evidencias

- Candidatos antes: $REV/dados/candidatos-antes.txt
- Movidos: $REV/dados/movidos.txt
- Referencias antes: $REV/dados/referencias-antes.txt
- Referencias depois: $REV/dados/referencias-depois.txt
- Build bot: $REV/dados/build-bot.log

## Proxima acao

Se build estiver ok e candidatos depois for 0, marcar arquivos soltos como organizados e seguir para apps/bot.
MD

cat "$REPORT"

echo "=== RUN-ONCE 068 DONE ==="
exit 0
