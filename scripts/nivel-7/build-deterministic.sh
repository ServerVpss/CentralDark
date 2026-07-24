#!/usr/bin/env bash
# Build determinístico do pacote Nível 7 (Lupa Bayesiana).
# Uso: build-deterministic.sh <output_zip>
# Reprodutibilidade:
#   - SOURCE_DATE_EPOCH fixo (padrão 1700000000)
#   - exclui __pycache__, .pytest_cache, *.pyc, .DS_Store
#   - ordena entradas, força umask, timestamps normalizados
set -euo pipefail

OUT="${1:-public/downloads/lupa-bayesiana-nivel-7.zip}"
SDE="${SOURCE_DATE_EPOCH:-1700000000}"

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
SRC="$ROOT/.agents/skills/lupa-bayesiana/agents/nivel-7"

if [ ! -d "$SRC" ]; then
  echo "fonte nao encontrada: $SRC" >&2
  exit 2
fi

STAGE="$(mktemp -d)"
trap 'rm -rf "$STAGE"' EXIT

# Copia limpa, sem caches
rsync -a \
  --exclude '__pycache__' \
  --exclude '.pytest_cache' \
  --exclude '*.pyc' \
  --exclude '.DS_Store' \
  --exclude '*.tmp' \
  "$SRC/" "$STAGE/nivel-7/"

# Normaliza timestamps para SOURCE_DATE_EPOCH
find "$STAGE/nivel-7" -exec touch -h -d "@$SDE" {} +

mkdir -p "$(dirname "$ROOT/$OUT")"
ABS_OUT="$ROOT/$OUT"
rm -f "$ABS_OUT"

# Zip determinístico: -X remove uid/gid/extra, ordem estável via find|sort
cd "$STAGE"
find nivel-7 -print0 | LC_ALL=C sort -z | \
  xargs -0 zip -q -X -D -9 "$ABS_OUT"

echo "OK: $ABS_OUT"
sha256sum "$ABS_OUT"
