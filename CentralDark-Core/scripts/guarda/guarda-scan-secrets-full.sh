#!/usr/bin/env bash
# Scan completo de possíveis secrets vazados em arquivos do servidor.
# Roda 1x por dia via cron (03:30).
#
# CORREÇÃO 2026-06-03:
# A versão anterior escrevia o output dentro de /root/Multizap, e o find varria
# essa mesma pasta procurando *.log — então cada execução lia o próprio output
# da rodada anterior e o tamanho dobrava. Em poucos dias chegou em 58G e encheu
# o disco. Mudanças:
#   1) Output movido para /var/log/multizap/ (fora do escopo do find).
#   2) Truncamos o arquivo antes de cada rodada (não acumula entre execuções).
#   3) Limite duro de 5 MB no pipe (head -c) — se algo escapar, não explode.
#   4) Exclusão explícita do próprio output e da pasta /root/Multizap/revisoes
#      (que tem 45k+ arquivos de relatórios e não precisa ser varrida).
set -euo pipefail

OUT_DIR="/var/log/multizap"
OUT="$OUT_DIR/scan-secrets-full.log"
MAX_BYTES=$((5 * 1024 * 1024))   # 5 MB de teto

mkdir -p "$OUT_DIR"
chmod 700 "$OUT_DIR"
: > "$OUT"   # trunca antes de começar
chmod 600 "$OUT"

timeout 600 find /root/Multizap /root/.pm2/logs /var/log \
  -path "*/node_modules/*" -prune -o \
  -path "*/.git/*" -prune -o \
  -path "/root/Multizap/revisoes" -prune -o \
  -path "/var/log/multizap*" -prune -o \
  -type f \
  \( -name "*.env" -o -name "*.log" -o -name "*.bak" -o -name "*.txt" -o -name "*.json" -o -name "*.sh" \) \
  -size -10M \
  ! -samefile "$OUT" \
  -print0 2>/dev/null \
| xargs -0 grep -InE "TOKEN=|SECRET=|PASSWORD=|DATABASE_URL=|SUPABASE_SERVICE|SUPABASE_ACCESS|TELEGRAM_BOT_TOKEN|PRIVATE KEY|postgresql://" 2>/dev/null \
| sed -E 's/(=).+/\1***MASKED***/' \
| head -c "$MAX_BYTES" > "$OUT" || true

chmod 600 "$OUT"

if [ -s "$OUT" ]; then
  echo "⚠️  Scan completo encontrou possíveis secrets. Valores mascarados em $OUT"
  echo "    Tamanho: $(du -h "$OUT" | cut -f1)"
else
  echo "✅ Scan completo limpo."
fi
