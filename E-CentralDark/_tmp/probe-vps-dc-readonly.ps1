$ErrorActionPreference='Continue'
$remote = @'
set +e
echo "HOST=$(hostname)"
echo "TIME=$(date -Is)"
echo "=== DC PROCESS ==="
pgrep -af 'desktop-commander|@wonderwhy-er/desktop-commander|centraldark-mcp-auth' || true
echo "=== SYSTEMD ==="
systemctl --no-pager --type=service --all | grep -Ei 'desktop|commander|centraldark.*mcp|hermes' || true
echo "=== AUTH RECEIPTS ==="
if [ -d /root/.centraldark/mcp-auth/receipts ]; then
  ls -lt /root/.centraldark/mcp-auth/receipts | head -8
else
  echo "MCP_AUTH_RECEIPTS=ABSENT"
fi
echo "=== DEVICE CONFIG ==="
if [ -f /root/.desktop-commander-device/device.json ]; then
  echo "DEVICE_CONFIG=PRESENT"
else
  echo "DEVICE_CONFIG=ABSENT"
fi
echo "=== HERMES ==="
command -v hermes || true
/root/.local/bin/hermes --version 2>/dev/null | head -3 || true
'@
$out = & ssh -o BatchMode=yes -o ConnectTimeout=10 segredo-vpss $remote 2>&1
$code=$LASTEXITCODE
$out | ForEach-Object { Write-Output $_ }
Write-Output ("SSH_EXIT="+$code)
exit $code
