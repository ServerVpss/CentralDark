#!/usr/bin/env bash
set -euo pipefail

TARGET="${1:-scripts/vps-organizacao/004-preflight-vps-limpa.sh}"
[ -f "$TARGET" ] || { echo "FAIL: missing $TARGET" >&2; exit 2; }

bash -n "$TARGET"
forbidden='rm[[:space:]]+-rf|systemctl[[:space:]]+(start|stop|restart|reload|enable|disable)|apt(-get)?[[:space:]]+(install|remove|purge|upgrade)|pm2[[:space:]]+(start|stop|restart|delete|kill)|docker[[:space:]]+(rm|rmi|stop|restart|kill|prune)|docker[[:space:]]+compose[[:space:]]+(down|up|restart|rm)|ufw[[:space:]]+(enable|disable|allow|deny|delete|reset)|iptables[[:space:]]|nft[[:space:]]+(add|delete|flush)|git[[:space:]].*(reset[[:space:]]+--hard|clean[[:space:]]+-f)|shutdown|reboot|poweroff'
if grep -En "$forbidden" "$TARGET"; then
  echo "FAIL: clean preflight mutated its target contract" >&2
  exit 1
fi

grep -Fq 'MODE" "READ_ONLY' "$TARGET"
grep -Fq 'MALWARE_VERDICT" "NOT_PROVEN' "$TARGET"
grep -Fq 'READY_FOR_BOOTSTRAP' "$TARGET"
grep -Fq 'KNOWN_RUNTIME_ROOTS_ABSENT' "$TARGET"

echo "PASS: clean-VPS preflight remains syntax-valid and read-only"
