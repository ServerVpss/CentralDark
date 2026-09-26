#!/usr/bin/env bash
# Destilador idempotente das 3 Temperaturas — GATE-0 (v5: robusto, sem awk inline quebrado)
set -euo pipefail
BASE="E:/CentralDark/Pivete/NUCLEO/motor/03-memoria/memoria"
HOJE="$BASE/HOJE.md"
SEMANA="$BASE/SEMANA.md"
REGRAS="$BASE/REGRAS.md"
TS=$(date '+%Y-%m-%d %H:%M')

# 1. HOJE -> SEMANA (move datados, dedupe contra SEMANA existente E contra o proprio lote)
if [ -s "$HOJE" ]; then
  # split: linhas datadas vao para sem_cand, nao-datadas permanecem em HOJE
  : > /tmp/sem_cand.tmp
  : > /tmp/hoje_keep.tmp
  while IFS= read -r line || [ -n "$line" ]; do
    line="${line%$'\r'}"   # tolera CRLF do Windows
    if [ -z "$line" ]; then continue; fi
    case "$line" in
      \[[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]*)
        echo "$line" >> /tmp/sem_cand.tmp ;;
      *)
        echo "$line" >> /tmp/hoje_keep.tmp ;;
    esac
  done < "$HOJE"
  # HOJE fica so com nao-datados
  if [ -s /tmp/hoje_keep.tmp ]; then
    mv /tmp/hoje_keep.tmp "$HOJE"
  else
    : > "$HOJE"
  fi
  # dedupe: contra SEMANA existente E contra lote (M02-fix: linha repetida DENTRO do mesmo HOJE nao duplica)
  : > /tmp/sem_uniq.tmp
  if [ -s /tmp/sem_cand.tmp ]; then
    while IFS= read -r line || [ -n "$line" ]; do
      line="${line%$'\r'}"
      [ -z "$line" ] && continue
      if ! grep -qF "$line" "$SEMANA" 2>/dev/null && ! grep -qF "$line" /tmp/sem_uniq.tmp 2>/dev/null; then
        echo "$line" >> /tmp/sem_uniq.tmp
      fi
    done < /tmp/sem_cand.tmp
  fi
  if [ -s /tmp/sem_uniq.tmp ]; then
    { echo ""; echo "## $TS (destilado de HOJE)"; cat /tmp/sem_uniq.tmp; } >> "$SEMANA"
  fi
fi

# 2. SEMANA -> REGRAS: SO linhas cujo setor eh [regra] (palavra exata, nao substring)
if [ -s "$SEMANA" ]; then
  grep -E "\[regra\]" "$SEMANA" | while read -r line; do
    line="${line%$'\r'}"
    if ! grep -qF "$line [PROMOVIDO" "$REGRAS" 2>/dev/null; then
      echo "$line [PROMOVIDO-$TS]" >> "$REGRAS"
    fi
  done
fi

echo "DESTILACAO OK (idempotente v5): $TS" >&2
