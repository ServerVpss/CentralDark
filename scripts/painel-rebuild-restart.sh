#!/usr/bin/env bash
# painel-rebuild-restart.sh
# Comando único: rebuild (git pull), cache-bust, reload Caddy, validação HTTP 200.
# Uso na VPS:
#   bash /root/CentralDark/scripts/painel-rebuild-restart.sh
# Ou one-liner:
#   curl -fsSL https://raw.githubusercontent.com/<org>/<repo>/main/scripts/painel-rebuild-restart.sh | bash
set -euo pipefail

PAINEL_DIR="/root/CentralDark/apps/projeto-dashboard"
BASE_URL="${BASE_URL:-https://status.centralldark.com}"
ASSETS=( "index.html" "app.js" "styles.css" "painel-data.json" )

echo "==> 1/4  git pull"
git -C /root/CentralDark pull --ff-only || git -C /root/CentralDark pull --rebase --autostash

echo "==> 2/4  cache-bust em index.html"
STAMP="$(date -u +%Y%m%d%H%M%S)"
if [ -f "$PAINEL_DIR/index.html" ]; then
  sed -i -E "s#(styles\.css\?v=)[^\"']+#\1${STAMP}#g; s#(app\.js\?v=)[^\"']+#\1${STAMP}#g" "$PAINEL_DIR/index.html"
  echo "    novo stamp: $STAMP"
fi

echo "==> 3/4  reload Caddy"
systemctl reload caddy || systemctl restart caddy

echo "==> 4/4  validação HTTP 200 dos assets públicos"
sleep 2
falhas=0
for f in "${ASSETS[@]}"; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/${f}?t=${STAMP}") || code="000"
  if [ "$code" = "200" ]; then
    echo "    OK  $f  → HTTP $code"
  else
    echo "    ERR $f  → HTTP $code"
    falhas=$((falhas+1))
  fi
done

if [ "$falhas" -gt 0 ]; then
  echo "FALHA: $falhas asset(s) fora do 200"
  exit 1
fi
echo "==> tudo verde · stamp=$STAMP"
