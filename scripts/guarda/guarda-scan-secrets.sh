#!/usr/bin/env bash
set -euo pipefail
OUT="/root/CentralDark/guarda/scan-secrets.log"
mkdir -p /root/CentralDark/guarda

grep -RInE "TOKEN=|SECRET=|PASSWORD=|DATABASE_URL=|SUPABASE_SERVICE|SUPABASE_ACCESS|TELEGRAM_BOT_TOKEN|PRIVATE KEY|postgresql://" \
/root/CentralDark/secrets \
/root/CentralDark/gateway/.env \
/root/CentralDark/wuzapi/.env \
/root/.pm2/logs \
/var/log/auth.log \
2>/dev/null \
| sed -E 's/(=).+/\1***MASKED***/' > "$OUT" || true

chmod 600 "$OUT"

if [ -s "$OUT" ]; then
  echo "⚠️ Secrets encontrados em locais críticos. Valores mascarados em $OUT"
else
  echo "✅ Nenhum secret exposto em locais críticos."
fi
