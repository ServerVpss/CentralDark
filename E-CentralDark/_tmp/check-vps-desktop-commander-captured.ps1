$ErrorActionPreference = 'Continue'
$out = 'E:\CentralDark\_tmp\vps-desktop-commander-check.out.txt'
$err = 'E:\CentralDark\_tmp\vps-desktop-commander-check.err.txt'
Remove-Item -LiteralPath $out,$err -Force -ErrorAction SilentlyContinue
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
$remote | ssh -o BatchMode=yes -o ConnectTimeout=8 segredo-vpss 'bash -s' 1>$out 2>$err
$code = $LASTEXITCODE
Write-Host "SSH_EXIT=$code"
Write-Host "STDOUT=$out"
Write-Host "STDERR=$err"
if (Test-Path -LiteralPath $out) { Get-Content -LiteralPath $out -Raw }
if (Test-Path -LiteralPath $err) { Write-Host '--- STDERR ---'; Get-Content -LiteralPath $err -Raw }
exit $code
