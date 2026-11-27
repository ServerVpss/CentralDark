#!/usr/bin/env bash
set -euo pipefail

TARGET="${1:-scripts/vps-organizacao/003-inventario-rebuild-readonly.sh}"
[ -f "$TARGET" ] || { echo "FAIL: missing $TARGET" >&2; exit 2; }

bash -n "$TARGET"

forbidden='(^|[;&|[:space:]])(apt(-get)?|dnf|yum|apk|pacman|zypper)[[:space:]]+(install|remove|purge|upgrade)|rm[[:space:]]+-rf|systemctl[[:space:]]+(start|stop|restart|reload|enable|disable)|service[[:space:]][^[:space:]]+[[:space:]]+(start|stop|restart|reload)|pm2[[:space:]]+(start|stop|restart|delete|kill|save)|docker[[:space:]]+(rm|rmi|stop|restart|kill|prune)|docker[[:space:]]+compose[[:space:]]+(down|up|restart|rm)|ufw[[:space:]]+(enable|disable|allow|deny|delete|reset)|iptables[[:space:]]|nft[[:space:]]+(add|delete|flush)|git[[:space:]].*(reset[[:space:]]+--hard|clean[[:space:]]+-f)|shutdown|reboot|poweroff'

if grep -En "$forbidden" "$TARGET"; then
  echo "FAIL: read-only contract violated" >&2
  exit 1
fi

if grep -En '(^|[[:space:]])(cat|less|more|tail|head)[[:space:]]+[^#\n]*\.env|pm2[[:space:]]+jlist|printenv|env[[:space:]]*$' "$TARGET"; then
  echo "FAIL: possible secret-value exposure" >&2
  exit 1
fi

grep -Fq 'MODE=READ_ONLY' "$TARGET"
grep -Fq 'MALWARE_VERDICT=NOT_PROVEN' "$TARGET"
grep -Fq 'TRUST_CURRENT_HOST=NO' "$TARGET"
grep -Fq 'SHA256SUMS' "$TARGET"
grep -Fq 'env-key-names-only' "$TARGET"

echo "PASS: inventory script remains syntax-valid, read-only and fail-honest"
