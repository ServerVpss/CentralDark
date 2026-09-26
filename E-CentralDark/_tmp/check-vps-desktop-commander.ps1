$ErrorActionPreference = 'Stop'
$remote = @'
set -u
echo "=== VPS CHECK ==="
date -Is
hostname
echo "--- desktop commander processes ---"
pgrep -af 'desktop-commander|@wonderwhy-er|centraldark-mcp-auth|npx.*remote' || true
echo "--- device config ---"
if [ -f /root/.desktop-commander-device/device.json ]; then echo DEVICE_CONFIG=PRESENT; else echo DEVICE_CONFIG=ABSENT; fi
echo "--- systemd matching ---"
systemctl --no-pager --type=service --all | grep -Ei 'desktop|centraldark|hermes|mcp' || true
echo "--- ports ---"
ss -tlpn | grep -Ei '(:1986|:9000|:9100|:9300|:3000|:4010|:8080|:5000|:11434)' || true
echo "--- pm2 ---"
command -v pm2 >/dev/null 2>&1 && pm2 jlist || echo PM2_NOT_FOUND
echo "--- root centraldark head ---"
cd /root/CentralDark 2>/dev/null && git rev-parse --abbrev-ref HEAD && git rev-parse HEAD && git status --short | head -80 || true
'@
$remote | ssh segredo-vpss 'bash -s'
exit $LASTEXITCODE
