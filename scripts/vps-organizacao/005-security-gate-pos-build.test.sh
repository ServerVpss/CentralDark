#!/usr/bin/env bash
set -euo pipefail
TARGET="${1:-scripts/vps-organizacao/005-security-gate-pos-build.sh}"
[ -f "$TARGET" ] || { echo "FAIL: missing $TARGET" >&2; exit 2; }

bash -n "$TARGET"
forbidden='rm[[:space:]]+-rf|clamscan[^\n]*(--remove|--move=)|systemctl[[:space:]]+(start|stop|restart|reload|enable|disable)|apt(-get)?[[:space:]]+(install|remove|purge|upgrade)|pm2[[:space:]]+(start|stop|restart|delete|kill)|docker[[:space:]]+(rm|rmi|stop|restart|kill|prune)|git[[:space:]].*(reset[[:space:]]+--hard|clean[[:space:]]+-f)|shutdown|reboot|poweroff'
if grep -En "$forbidden" "$TARGET"; then
  echo "FAIL: security gate contains destructive remediation" >&2
  exit 1
fi

grep -Fq -- '--scanners vuln,misconfig,secret' "$TARGET"
grep -Fq -- '--severity HIGH,CRITICAL' "$TARGET"
grep -Fq -- '--exit-code 1' "$TARGET"
grep -Fq -- 'clamscan --recursive --infected' "$TARGET"
grep -Fq 'BLOCKED' "$TARGET"
grep -Fq 'SECURITY_GATE" "FAIL' "$TARGET"

echo "PASS: post-build security gate remains detect/block-only and fail-closed"
