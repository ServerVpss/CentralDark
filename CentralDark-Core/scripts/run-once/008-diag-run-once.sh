#!/bin/bash
source /root/Multizap/secrets/wabot.env 2>/dev/null
SUPA_URL="${SUPABASE_URL:-}"; SUPA_KEY="${SUPABASE_SERVICE_ROLE_KEY:-}"
CLONE_DECK="/root/Multizap/apps/clone-deck"

# Listar o que existe em run-once
RUN_ONCE=$(ls "$CLONE_DECK/scripts/run-once/"*.sh 2>/dev/null | tr '\n' ',')
DONE=$(ls "$CLONE_DECK/scripts/run-once/done/" 2>/dev/null | tr '\n' ',')
WRAPPER=$([ -f "$CLONE_DECK/scripts/run-once-wrapper.sh" ] && echo "EXISTS" || echo "MISSING")
PD_HEAD=$(head -20 "$CLONE_DECK/scripts/post-deploy.sh" | grep -c "wrapper")
GIT_SHA=$(cd "$CLONE_DECK" && git rev-parse --short HEAD)

[ -n "$SUPA_URL" ] && curl -s -X POST "${SUPA_URL}/rest/v1/system_logs" \
  -H "apikey: ${SUPA_KEY}" -H "Authorization: Bearer ${SUPA_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"action\":\"run-once.008.diag\",\"level\":\"info\",\"details\":{\"git_sha\":\"${GIT_SHA}\",\"wrapper\":\"${WRAPPER}\",\"pd_has_wrapper\":${PD_HEAD},\"pending\":\"${RUN_ONCE}\",\"done\":\"${DONE}\"}}" > /dev/null 2>&1
