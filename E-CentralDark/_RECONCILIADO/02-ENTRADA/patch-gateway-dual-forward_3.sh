#!/bin/bash
set -uo pipefail

GW_DIR="${GATEWAY_DIR:-/root/Multizap/gateway}"
WH_FILE="${GW_DIR}/src/services/webhookService.js"

if [ ! -f "$WH_FILE" ]; then
  echo "[ERRO] $WH_FILE não encontrado"
  exit 1
fi

if grep -q "CLONE_DECK_FORWARD" "$WH_FILE" 2>/dev/null; then
  echo "[SKIP] já patcheado"
  exit 0
fi

cp "$WH_FILE" "${WH_FILE}.backup.clone-deck"

# Injetar DIRETAMENTE com sed — sem Python
# Encontrar "const started = Date.now();" e adicionar antes dele
sed -i '/const started = Date.now();/i\    // ═══ CLONE_DECK_FORWARD ═══\n    try { const _a = require("axios"); _a.post("http://127.0.0.1:5000/api/webhooks/wuzapi", payload, { timeout: 5000, headers: { "Content-Type": "application/json" } }).catch(() => {}); } catch(_e) {}\n    // ═══ FIM CLONE_DECK_FORWARD ═══' "$WH_FILE"

if grep -q "CLONE_DECK_FORWARD" "$WH_FILE" 2>/dev/null; then
  echo "[OK] Forward injetado"
  pm2 restart MultiZap-Gateway > /dev/null 2>&1 || true
  echo "[OK] Gateway reiniciado"
else
  echo "[ERRO] Inject falhou"
  cp "${WH_FILE}.backup.clone-deck" "$WH_FILE"
fi
