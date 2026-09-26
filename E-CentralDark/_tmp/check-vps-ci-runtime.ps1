$ErrorActionPreference='Stop'
$remote = @'
set -Eeuo pipefail
date -Is
hostname
echo "=== GH RUNNER SERVICES ==="
systemctl --no-pager --type=service --all | grep -Ei 'actions.runner|github|runner' || true
echo "=== HERMES ==="
systemctl --no-pager --type=service --all | grep -Ei 'hermes' || true
pm2 jlist 2>/dev/null | python3 -c 'import json,sys; a=json.load(sys.stdin); print([(x.get("name"),x.get("pm2_env",{}).get("status"),x.get("pid")) for x in a if "hermes" in x.get("name","").lower()])' 2>/dev/null || true
echo "=== DESKTOP COMMANDER ==="
systemctl --no-pager --type=service --all | grep -Ei 'desktop|commander|centraldark-mcp' || true
pgrep -af 'desktop-commander|@wonderwhy-er|centraldark-mcp-auth' || true
echo "=== RESTART REQUIRED ==="
test -f /var/run/reboot-required && cat /var/run/reboot-required || echo NO_REBOOT_MARKER
'@
& ssh segredo-vpss $remote
exit $LASTEXITCODE
