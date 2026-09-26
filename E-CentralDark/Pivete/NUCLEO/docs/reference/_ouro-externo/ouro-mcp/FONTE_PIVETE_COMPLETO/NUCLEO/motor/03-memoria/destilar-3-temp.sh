#!/usr/bin/env bash
# Destilador idempotente das 3 Temperaturas — GATE-0 (v7: a prova de set -e/pipefail, temp em C:/tmp)
set -uo pipefail
BASE="E:/CentralDark/Pivete/NUCLEO/motor/03-memoria/memoria"
HOJE="$BASE/HOJE.md"
SEMANA="$BASE/SEMANA.md"
REGRAS="$BASE/REGRAS.md"
TS=$(date '+%Y-%m-%d %H:%M')

TMP="C:/tmp/gate0_dst_tmp"; mkdir -p "$TMP"
T_HOJE="$TMP/hoje.tmp"; T_SEM="$TMP/sem.tmp"; T_REG="$TMP/reg.tmp"
cp "$HOJE" "$T_HOJE" 2>/dev/null || : > "$T_HOJE"
cp "$SEMANA" "$T_SEM" 2>/dev/null || : > "$T_SEM"
cp "$REGRAS" "$T_REG" 2>/dev/null || : > "$T_REG"

# 1. HOJE -> SEMANA
if [ -s "$T_HOJE" ]; then
  : > "$TMP/sem_cand.tmp"
  : > "$TMP/hoje_keep.tmp"
  while IFS= read -r line || [ -n "$line" ]; do
    line="${line%$'\r'}"
    [ -z "$line" ] && continue
    case "$line" in
      \[[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]*) echo "$line" >> "$TMP/sem_cand.tmp" ;;
      *) echo "$line" >> "$TMP/hoje_keep.tmp" ;;
    esac
  done < "$T_HOJE"

  if [ -s "$TMP/hoje_keep.tmp" ]; then cp "$TMP/hoje_keep.tmp" "$HOJE"; else : > "$HOJE"; fi

  : > "$TMP/sem_uniq.tmp"
  if [ -s "$TMP/sem_cand.tmp" ]; then
    while IFS= read -r line || [ -n "$line" ]; do
      line="${line%$'\r'}"
      [ -z "$line" ] && continue
      if ! grep -qF "$line" "$T_SEM" 2>/dev/null && ! grep -qF "$line" "$TMP/sem_uniq.tmp" 2>/dev/null; then
        echo "$line" >> "$TMP/sem_uniq.tmp"
      fi
    done < "$TMP/sem_cand.tmp"
  fi
  if [ -s "$TMP/sem_uniq.tmp" ]; then
    { echo ""; echo "## $TS (destilado de HOJE)"; cat "$TMP/sem_uniq.tmp"; } >> "$T_SEM"
  fi
fi

# 2. SEMANA -> REGRAS (grep em pipe protegido contra pipefail/set -e)
if [ -s "$T_SEM" ]; then
  grep -E "\[regra\]" "$T_SEM" 2>/dev/null | while read -r line || [ -n "$line" ]; do
    line="${line%$'\r'}"
    if ! grep -qF "$line [PROMOVIDO" "$T_REG" 2>/dev/null; then
      echo "$line [PROMOVIDO-$TS]" >> "$T_REG"
    fi
  done || true
fi

cp "$T_SEM" "$SEMANA"
cp "$T_REG" "$REGRAS"
echo "DESTILACAO OK (idempotente v7): $TS" >&2
