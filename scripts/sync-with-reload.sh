#!/usr/bin/env bash
# CANONICAL_SOURCE=true
# Ciclo pós-sync: git pull + restart dev server + reload frontend
# Reutiliza scripts existentes; não cria V2/V3

set -uo pipefail

REPO_ROOT="${CENTRALDARK_REPO_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}"
INSTINTO_PATH="$REPO_ROOT/apps/instinto-superior"
PORT="${INSTINTO_PORT:-3000}"
RELOAD_INTERVAL="${RELOAD_INTERVAL:-5}"

echo "🔄 SYNC + RELOAD CYCLE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# STEP 1: Git sync (rebase with origin/main)
echo "📥 Step 1: Git sync (origin/main)"
cd "$REPO_ROOT"
if git fetch origin main; then
  if git rebase origin/main; then
    echo "✅ Git sync: PASS"
  else
    echo "⚠️  Git rebase conflict detected"
    git rebase --abort
    exit 1
  fi
else
  echo "❌ Git fetch failed"
  exit 1
fi

# STEP 2: Find and restart Instinto process
echo ""
echo "🔄 Step 2: Restart Instinto Superior dev server"
cd "$INSTINTO_PATH"

# Kill existing process on port 3000/8081
EXISTING_PID=$(lsof -i :3000 2>/dev/null | grep -v COMMAND | awk '{print $2}' | head -1)
if [ -n "$EXISTING_PID" ]; then
  echo "  Stopping existing Instinto (PID $EXISTING_PID)..."
  kill -9 "$EXISTING_PID" 2>/dev/null || true
  sleep 1
fi

# Start dev server (fork, don't block)
echo "  Starting Instinto dev server..."
npm run dev > /tmp/instinto-dev.log 2>&1 &
DEV_PID=$!
echo "  Dev server PID: $DEV_PID"

# Wait for port to be ready
echo "  Waiting for port 3000/8081 to respond..."
MAX_WAIT=30
ELAPSED=0
while [ $ELAPSED -lt $MAX_WAIT ]; do
  if curl -s http://localhost:3000/ >/dev/null 2>&1 || \
     curl -s http://localhost:8081/ >/dev/null 2>&1; then
    echo "✅ Instinto dev server: READY"
    break
  fi
  sleep 1
  ELAPSED=$((ELAPSED + 1))
done

if [ $ELAPSED -ge $MAX_WAIT ]; then
  echo "⚠️  Instinto dev server: TIMEOUT (still starting)"
  echo "  Log: cat /tmp/instinto-dev.log"
fi

# STEP 3: Signal browser to reload (if possible via API or file)
echo ""
echo "🌐 Step 3: Frontend reload signal"
echo "  ℹ️  Browser will need manual reload: CTRL+F5 or CTRL+SHIFT+R"
echo ""
echo "✅ SYNC + RELOAD CYCLE COMPLETE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📍 Instinto is now running at:"
echo "  Local: http://localhost:8081"
echo "  Tailscale: http://100.123.93.25:8081"
echo ""
echo "Log file: /tmp/instinto-dev.log"
echo "Dev PID: $DEV_PID"
