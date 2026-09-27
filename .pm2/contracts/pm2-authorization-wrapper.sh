#!/bin/bash
# PM2 Authorization Wrapper — Validates "PERMITO SEGREDO" before critical operations
# 
# Usage: pm2-auth restart <process-name> "PERMITO SEGREDO: [authorization evidence]"
#
# Blocks unauthorized operations and logs all attempts to audit trail.
#
# Author: Claude Haiku 4.5
# Authorized by: SEGREDO/CHEFE
# Date: 2026-09-20

set -euo pipefail

# Configuration
AUDIT_LOG="/var/log/centraldark-pm2-authorization.log"
PROTECTED_OPERATIONS=("restart" "stop" "update_config" "delete_logs" "scale" "delete_process")
AUTH_PHRASE="PERMITO SEGREDO"
COOLDOWN_SECONDS=30
MAX_RESTARTS_PER_DAY=5

# Telegram alerting
TELEGRAM_BOT_TOKEN="${TELEGRAM_BOT_TOKEN:-}"
TELEGRAM_CHAT_ID="@srver1bot"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

log_audit() {
  local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")
  local operator="${USER:-unknown}"
  local operation="$1"
  local process="$2"
  local status="$3"
  local reason="${4:-}"
  local evidence="${5:-}"
  
  echo "${timestamp} | OP:${operator} | PROC:${process} | OP_TYPE:${operation} | STATUS:${status} | REASON:${reason} | EVIDENCE:${evidence}" \
    | sudo tee -a "${AUDIT_LOG}" > /dev/null
}

alert_telegram() {
  local message="$1"
  if [ -n "${TELEGRAM_BOT_TOKEN}" ]; then
    curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
      -H 'Content-Type: application/json' \
      -d "{
        \"chat_id\": \"${TELEGRAM_CHAT_ID}\",
        \"text\": \"${message}\",
        \"parse_mode\": \"Markdown\"
      }" > /dev/null 2>&1 || true
  fi
}

alert_github() {
  local title="$1"
  local body="$2"
  # Placeholder for GitHub issue creation via API
  # Implementation depends on GitHub CLI or API token availability
  true
}

check_authorization() {
  local auth_string="$1"
  local process="$2"
  local operation="$3"
  
  if [[ ! "${auth_string}" =~ ${AUTH_PHRASE} ]]; then
    return 1
  fi
  return 0
}

check_cooldown() {
  local process="$1"
  local last_op_time=$(grep "PROC:${process}" "${AUDIT_LOG}" 2>/dev/null | tail -1 | cut -d'|' -f1 || echo "0")
  
  if [ "${last_op_time}" != "0" ]; then
    local current_time=$(date +%s)
    local last_time=$(date -d "${last_op_time}" +%s 2>/dev/null || echo "0")
    local elapsed=$((current_time - last_time))
    
    if [ "${elapsed}" -lt "${COOLDOWN_SECONDS}" ]; then
      return 1
    fi
  fi
  return 0
}

check_daily_limit() {
  local process="$1"
  local operation="$2"
  local today=$(date -u +"%Y-%m-%d")
  local count=$(grep "${today}.*PROC:${process}.*OP_TYPE:${operation}.*STATUS:SUCCESS" "${AUDIT_LOG}" 2>/dev/null | wc -l || echo "0")
  
  if [ "${count}" -ge "${MAX_RESTARTS_PER_DAY}" ]; then
    return 1
  fi
  return 0
}

# ============================================================================
# MAIN AUTHORIZATION LOGIC
# ============================================================================

main() {
  local operation="${1:-}"
  local process="${2:-}"
  local auth_string="${3:-}"
  
  # Validate inputs
  if [ -z "${operation}" ] || [ -z "${process}" ]; then
    echo -e "${RED}❌ Usage: pm2-auth <operation> <process-name> [authorization-string]${NC}"
    echo -e "${RED}Authorized operations: ${PROTECTED_OPERATIONS[*]}${NC}"
    exit 1
  fi
  
  # Check if operation is protected
  local is_protected=false
  for protected_op in "${PROTECTED_OPERATIONS[@]}"; do
    if [ "${operation}" = "${protected_op}" ]; then
      is_protected=true
      break
    fi
  done
  
  if [ "${is_protected}" = false ]; then
    echo -e "${YELLOW}⚠️  Operation '${operation}' not in protected list. Proceeding without authorization.${NC}"
    log_audit "${operation}" "${process}" "ALLOWED_UNPROTECTED" ""
    return 0
  fi
  
  # Check authorization
  if ! check_authorization "${auth_string}" "${process}" "${operation}"; then
    echo -e "${RED}🔴 BLOCKED: Operation '${operation}' on '${process}' requires authorization${NC}"
    echo -e "${RED}Missing phrase: \"${AUTH_PHRASE}\"${NC}"
    
    log_audit "${operation}" "${process}" "BLOCKED_NO_AUTH" "" "${auth_string}"
    
    alert_telegram "🔴 *UNAUTHORIZED PM2 OPERATION ATTEMPT*\n\n📌 Process: \`${process}\`\n🔨 Operation: \`${operation}\`\n❌ Auth: MISSING\n👤 Operator: \`${USER}\`\n⏱️ Time: \`$(date -u +\"%Y-%m-%d %H:%M:%S UTC\")\`"
    
    exit 1
  fi
  
  # Check cooldown
  if ! check_cooldown "${process}"; then
    echo -e "${YELLOW}⚠️  Cooldown active (${COOLDOWN_SECONDS}s). Operation may fail.${NC}"
  fi
  
  # Check daily limit
  if [ "${operation}" = "restart" ]; then
    if ! check_daily_limit "${process}" "restart"; then
      echo -e "${RED}🔴 BLOCKED: Daily restart limit (${MAX_RESTARTS_PER_DAY}) reached for '${process}'${NC}"
      log_audit "restart" "${process}" "BLOCKED_DAILY_LIMIT" ""
      exit 1
    fi
  fi
  
  # Execution allowed
  echo -e "${GREEN}✅ Authorization validated${NC}"
  echo -e "${GREEN}🚀 Executing: pm2 ${operation} ${process}${NC}"
  
  log_audit "${operation}" "${process}" "AUTHORIZED" "" "${auth_string}"
  
  # Execute operation
  if pm2 "${operation}" "${process}" 2>/dev/null; then
    log_audit "${operation}" "${process}" "SUCCESS" ""
    alert_telegram "🟢 *PM2 OPERATION COMPLETED*\n\n✅ Process: \`${process}\`\n🔨 Operation: \`${operation}\`\n🎯 Status: SUCCESS\n👤 Operator: \`${USER}\`"
    echo -e "${GREEN}✅ Operation completed successfully${NC}"
    return 0
  else
    log_audit "${operation}" "${process}" "FAILED" ""
    alert_telegram "🔴 *PM2 OPERATION FAILED*\n\n❌ Process: \`${process}\`\n🔨 Operation: \`${operation}\`\n🎯 Status: FAILED\n👤 Operator: \`${USER}\`"
    echo -e "${RED}❌ Operation failed${NC}"
    return 1
  fi
}

main "$@"
