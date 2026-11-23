#!/bin/bash
set -uo pipefail
GW_DIR="${GATEWAY_DIR:-/root/Multizap/gateway}"
WH_FILE="${GW_DIR}/src/services/webhookService.js"
BACKUP="${WH_FILE}.backup.clone-deck"

[ ! -f "$WH_FILE" ] && echo "[ERRO] arquivo não encontrado" && exit 1

# Se tem backup limpo, restaurar
[ -f "$BACKUP" ] && cp "$BACKUP" "$WH_FILE" && echo "[OK] Backup restaurado"

# Verificar se já tem inject
grep -q "127.0.0.1:5000" "$WH_FILE" 2>/dev/null && echo "[SKIP] já injetado" && exit 0

# Fazer backup limpo (se não existe)
[ ! -f "$BACKUP" ] && cp "$WH_FILE" "$BACKUP"

# Encontrar a linha exata e número
LINE_NUM=$(grep -n "const started = Date.now();" "$WH_FILE" | head -1 | cut -d: -f1)

if [ -z "$LINE_NUM" ] || [ "$LINE_NUM" = "0" ]; then
  echo "[ERRO] Padrão 'const started' não encontrado"
  exit 1
fi

echo "[INFO] Injetando na linha $LINE_NUM"

# Injetar ANTES dessa linha usando sed com número de linha
sed -i "${LINE_NUM}i\\    try{require('axios').post('http://127.0.0.1:5000/api/webhooks/wuzapi',payload,{timeout:5000}).catch(function(){});}catch(e){}" "$WH_FILE"

if grep -q "127.0.0.1:5000" "$WH_FILE" 2>/dev/null; then
  echo "[OK] Inject na linha $LINE_NUM"
  pm2 restart MultiZap-Gateway > /dev/null 2>&1
  echo "[OK] Gateway reiniciado"
else
  echo "[ERRO] Falhou — restaurando"
  [ -f "$BACKUP" ] && cp "$BACKUP" "$WH_FILE"
fi
