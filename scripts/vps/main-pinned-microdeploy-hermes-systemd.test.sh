#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
SCRIPT="$ROOT/scripts/vps/main-pinned-microdeploy.sh"

hermes_case="$(sed -n '/  hermes)/,/  oauth_broker)/p' "$SCRIPT")"
printf '%s' "$hermes_case" | grep -Fq 'SYSTEMD_SERVICE="centraldark-hermes-core.service"'
printf '%s' "$hermes_case" | grep -Fq 'EXPECTED_EXEC="$TARGET_ROOT/apps/modulos/HERMES-CORE/core/orchestrator.mjs"'
printf '%s' "$hermes_case" | grep -Fq 'HEALTH="http://127.0.0.1:8899/health"'
printf '%s\n' 'HERMES_SYSTEMD_PROMOTION_CONTRACT=PASS'
