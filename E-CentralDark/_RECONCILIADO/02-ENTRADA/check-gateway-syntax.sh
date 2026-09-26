#!/usr/bin/env bash
# ============================================================
# check-gateway-syntax.sh
# Pré-deploy local do Gateway — roda `node --check` em todos
# os .js de multizap-gateway-deploy/gateway, valida que o
# server.js carrega (sem subir HTTP) e bloqueia se algum
# arquivo tiver erro de sintaxe.
#
# Uso:
#   bash scripts/check-gateway-syntax.sh
#
# Saída:
#   0 = tudo OK, deploy seguro
#   1 = arquivo com erro → NÃO faça deploy
# ============================================================

set -uo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
GW="$ROOT_DIR/multizap-gateway-deploy/gateway"

if [ ! -d "$GW" ]; then
  echo "[check-gateway-syntax] pasta $GW não encontrada"
  exit 1
fi

if ! command -v node >/dev/null 2>&1; then
  echo "[check-gateway-syntax] node não está instalado — pulando."
  exit 0
fi

ERROS=0
TOTAL=0
echo "🔍 Validando sintaxe dos .js do Gateway..."
while IFS= read -r f; do
  TOTAL=$((TOTAL+1))
  if ! OUT=$(node --check "$f" 2>&1); then
    echo "❌ $f"
    echo "$OUT" | sed 's/^/    /'
    ERROS=$((ERROS+1))
  fi
done < <(find "$GW" -type f -name "*.js" -not -path "*/node_modules/*")

echo ""
if [ "$ERROS" -gt 0 ]; then
  echo "❌ $ERROS arquivo(s) com erro de sintaxe (de $TOTAL). Deploy BLOQUEADO."
  exit 1
fi
echo "✅ Sintaxe OK em $TOTAL arquivo(s)."

# Smoke-load: tenta resolver os requires top-level do server.js sem subir o app.
# Só vale se node_modules estiver instalado localmente (pula caso contrário).
if [ -d "$GW/node_modules" ]; then
  echo ""
  echo "🔍 Smoke-load do server.js (sem abrir porta)..."
  if ( cd "$GW" && SKIP_LISTEN=1 node -e "
    const Module = require('module');
    const _listen = require('net').Server.prototype.listen;
    require('net').Server.prototype.listen = function() { return this; };
    try { require('./server.js'); console.log('require ok'); }
    catch (e) { console.error('FALHOU:', e && e.stack || e.message); process.exit(1); }
  " ); then
    echo "✅ Smoke-load OK — todos os requires resolveram."
  else
    echo "❌ Smoke-load falhou — server.js não carrega. Deploy BLOQUEADO."
    exit 1
  fi
else
  echo ""
  echo "ℹ  node_modules ausente em $GW — smoke-load pulado."
  echo "    (Na VPS o npm install roda durante o deploy.)"
fi

echo ""
echo "🟢 Gateway pronto pra deploy."
exit 0
