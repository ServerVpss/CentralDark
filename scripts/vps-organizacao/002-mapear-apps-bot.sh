#!/usr/bin/env bash
set -euo pipefail

BASE="/root/Multizap"
REPO="$BASE/apps/clone-deck"
BOT_REPO="$REPO/apps/bot"
TS="$(date +%Y%m%d-%H%M%S)"
REV="$BASE/revisoes/$TS/mapear-apps-bot"
REPORT="$REV/relatorio-bot.txt"

mkdir -p "$REV/logs/bot" "$REV/logs/pm2"

mask_env_names() {
  sed -E 's/=.*$/=***VALOR_OCULTO***/'
}

{
  echo "============================================================"
  echo "MAPEAMENTO SEGURO DO APPS/BOT"
  echo "Data: $(date)"
  echo "Repo: $REPO"
  echo "Bot: $BOT_REPO"
  echo "Revisao: $REV"
  echo "============================================================"
  echo

  echo "=== 1) Existe apps/bot? ==="
  if [ -d "$BOT_REPO" ]; then
    echo "OK: $BOT_REPO existe"
  else
    echo "FALHA: $BOT_REPO nao encontrado"
  fi
  echo

  echo "=== 2) Arquivos principais do bot ==="
  for f in \
    "$BOT_REPO/package.json" \
    "$BOT_REPO/vite.config.ts" \
    "$BOT_REPO/src/pages/Chats.tsx" \
    "$BOT_REPO/src/pages/Instances.tsx" \
    "$BOT_REPO/src/services/instanceService.ts" \
    "$BOT_REPO/src/services/messageService.ts" \
    "$BOT_REPO/server/src/bridge/supabase-sync.js" \
    "$BOT_REPO/server/src/bridge/supabase-sync.cjs"
  do
    if [ -f "$f" ]; then
      echo "OK: $f"
    else
      echo "AUSENTE: $f"
    fi
  done
  echo

  echo "=== 3) Env encontrados sem valores ==="
  find "$BOT_REPO" -maxdepth 5 -type f \( -name '.env' -o -name '.env.*' \) 2>/dev/null | sort | while read -r envfile; do
    echo "--- $envfile ---"
    grep -E '^[A-Za-z_][A-Za-z0-9_]*=' "$envfile" 2>/dev/null | mask_env_names | sed -n '1,120p' || true
  done
  echo

  echo "=== 4) QR / qrcode citacoes no bot ==="
  grep -RInE 'qr|qrcode|QRCode|qr_code|connection.*qr' "$BOT_REPO/src" "$BOT_REPO/server" 2>/dev/null | sed -n '1,160p' || true
  echo

  echo "=== 5) Chats / realtime citacoes no bot ==="
  grep -RInE 'realtime|channel|message|messages|ticket|chat' "$BOT_REPO/src" "$BOT_REPO/server" 2>/dev/null | sed -n '1,180p' || true
  echo

  echo "=== 6) Fix/test soltos no repo raiz ==="
  find "$REPO" -maxdepth 1 -type f \( -name 'fix-*.cjs' -o -name 'test-*.cjs' -o -name 'test-*.sh' \) -printf '%f\n' 2>/dev/null | sort | sed -n '1,200p' || true
  echo

  echo "=== 7) PM2 relacionado ao bot ==="
  pm2 list 2>&1 | tee "$REV/logs/pm2/pm2-list.log" || true
  echo

  echo "=== 8) Logs recentes do bot, se existirem ==="
  find /root/.pm2/logs -maxdepth 1 -type f -iname '*bot*' -o -iname '*telegram*' 2>/dev/null | sort | while read -r log; do
    echo "--- $log ---"
    tail -n 80 "$log" | sed -E 's/(token|secret|password|authorization|apikey|api_key)[=: ]+[^ ,"]+/\1=***OCULTO***/Ig' | tee "$REV/logs/bot/$(basename "$log").tail.txt" || true
  done
  echo

  echo "=== 9) Proxima acao sugerida ==="
  echo "Nao mover o bot ainda. Primeiro consolidar o caminho temporario do QR:"
  echo "$BASE/api/whatsapp/qrcode"
  echo "Depois ajustar Bot/CRM para consumir endpoint unico do Gateway/WuzAPI."

  echo
  echo "============================================================"
  echo "FIM"
  echo "============================================================"
} | tee "$REPORT"

echo
printf 'Relatorio salvo em: %s\n' "$REPORT"
