#!/bin/bash
# hermes-launcher.sh — Profile switcher for Hermes via PM2
# Usage: hermes-launcher.sh <profile> [notify_chat_id]
# Requires: PM2, curl, TELEGRAM_BOT_TOKEN env var for notifications

set -euo pipefail

PROFILE="${1:-default}"
CHAT_ID="${2:-}"
BOT_TOKEN="${TELEGRAM_BOT_TOKEN:-}"

# Valid profiles (adjust to your setup)
VALID_PROFILES=("default" "pivete" "sol")
if [[ ! " ${VALID_PROFILES[*]} " =~ " ${PROFILE} " ]]; then
  echo "Invalid profile: $PROFILE. Valid: ${VALID_PROFILES[*]}"
  exit 1
fi

PM2_NAME="hermes-${PROFILE}"
ECOSYSTEM_FILE="/root/CentralDark/ecosystem.config.js"
LOG_DIR="/root/CentralDark/logs"

# Ensure log directory exists
mkdir -p "${LOG_DIR}"

# 1. Stop ALL other hermes instances (only one active at a time)
echo "Stopping other Hermes instances..."
pm2 stop hermes-* 2>/dev/null || true

# 2. Start/restart target profile
echo "Starting profile: ${PROFILE}..."
if pm2 restart "${PM2_NAME}" --update-env 2>/dev/null; then
  echo "Restarted existing PM2 process: ${PM2_NAME}"
else
  echo "Starting new PM2 process from ecosystem..."
  pm2 start "${ECOSYSTEM_FILE}" --only "${PM2_NAME}"
fi

# 3. Health check (adjust port per profile if needed)
# Default port mapping — customize if profiles use different ports
case "${PROFILE}" in
  pivete) PORT=8081 ;;
  sol)    PORT=8082 ;;
  *)      PORT=8080 ;;
esac

echo "Waiting for health check on port ${PORT}..."
for i in {1..30}; do
  if curl -sf "http://localhost:${PORT}/health" >/dev/null 2>&1; then
    echo "Health check passed!"
    break
  fi
  if [[ $i -eq 30 ]]; then
    echo "ERROR: Health check failed after 30s"
    # Notify failure if chat_id provided
    if [[ -n "${CHAT_ID}" && -n "${BOT_TOKEN}" ]]; then
      curl -s -X POST "https://api.telegram.org/bot${BOT_TOKEN}/sendMessage" \
        -d "chat_id=${CHAT_ID}" \
        -d "text=❌ Falha ao ativar perfil ${PROFILE}: health check falhou" \
        -d "parse_mode=HTML" >/dev/null
    fi
    exit 1
  fi
  sleep 1
done

# 4. Notify via Telegram if chat_id provided
if [[ -n "${CHAT_ID}" && -n "${BOT_TOKEN}" ]]; then
  curl -s -X POST "https://api.telegram.org/bot${BOT_TOKEN}/sendMessage" \
    -d "chat_id=${CHAT_ID}" \
    -d "text=✅ Perfil ativo: ${PROFILE}" \
    -d "parse_mode=HTML" >/dev/null
fi

echo "Profile ${PROFILE} active on port ${PORT} (PM2: ${PM2_NAME})"
pm2 save  # Persist PM2 state (CRITICAL per CLAUDE.md)