#!/bin/bash
set -uo pipefail
CLONE_DECK="${CLONE_DECK:-/root/Multizap/apps/clone-deck}"
CRM_DIR="$CLONE_DECK/apps/crm"
CRM_PORT="${CLONE_DECK_CRM_PORT:-3010}"
LOG="/var/log/clone-deck-crm-fix.log"
ts() { date '+%Y-%m-%d %H:%M:%S'; }

echo "[$(ts)] === FIX CRM BUILD v4 START ===" >> "$LOG"

cd "$CRM_DIR" || { echo "[$(ts)] ERRO: $CRM_DIR nao existe" >> "$LOG"; exit 1; }

# 1. Limpar caches (manter node_modules)
rm -rf dist .output .vinxi .vite-temp .vite node_modules/.vite node_modules/.cache 2>/dev/null || true

# 2. Instalar deps
if [ ! -d "node_modules/@lovable.dev" ]; then
  echo "[$(ts)] npm install..." >> "$LOG"
  npm install --include=dev >> "$LOG" 2>&1
fi

# 3. Build
echo "[$(ts)] npm run build..." >> "$LOG"
NODE_OPTIONS=--max-old-space-size=4096 npm run build >> "$LOG" 2>&1
BUILD_CODE=$?
echo "[$(ts)] Build exit: $BUILD_CODE" >> "$LOG"

if [ "$BUILD_CODE" -ne 0 ]; then
  echo "[$(ts)] BUILD FALHOU" >> "$LOG"
  exit 1
fi

# 4. Iniciar com PM2 usando env loader
pm2 delete CloneDeck-CRM >/dev/null 2>&1 || true

# Carregar env vars
source /root/Multizap/secrets/wabot.env 2>/dev/null || true

# Criar ecosystem config com env vars mapeadas
cat > "$CRM_DIR/ecosystem.config.cjs" << ECOEOF
module.exports = {
  apps: [{
    name: "CloneDeck-CRM",
    script: "npx",
    args: "vite preview --host 0.0.0.0 --port $CRM_PORT",
    cwd: "$CRM_DIR",
    interpreter: "/bin/bash",
    interpreter_args: "-c 'source /root/Multizap/secrets/wabot.env && export SUPABASE_PUBLISHABLE_KEY=\"\$VITE_SUPABASE_ANON_KEY\" && exec npx vite preview --host 0.0.0.0 --port $CRM_PORT'",
    env: {
      NODE_ENV: "production",
    }
  }]
};
ECOEOF

# Alternativa: usar wrapper script direto
cat > "$CRM_DIR/start-crm.sh" << 'STARTEOF'
#!/bin/bash
source /root/Multizap/secrets/wabot.env 2>/dev/null || true
export SUPABASE_PUBLISHABLE_KEY="${VITE_SUPABASE_ANON_KEY}"
export SUPABASE_URL
export SUPABASE_SERVICE_ROLE_KEY
cd /root/Multizap/apps/clone-deck/apps/crm
exec npx vite preview --host 0.0.0.0 --port 3010
STARTEOF
chmod +x "$CRM_DIR/start-crm.sh"

pm2 start "$CRM_DIR/start-crm.sh" --name CloneDeck-CRM >> "$LOG" 2>&1
pm2 save >> "$LOG" 2>&1

sleep 8
HTTP=$(curl -sk -o /dev/null -w "%{http_code}" --connect-timeout 5 "http://127.0.0.1:${CRM_PORT}" 2>/dev/null)
echo "[$(ts)] CRM HTTP: $HTTP" >> "$LOG"

echo "[$(ts)] === FIX CRM BUILD v4 END ===" >> "$LOG"
