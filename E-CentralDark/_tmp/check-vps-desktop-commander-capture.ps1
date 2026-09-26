$ErrorActionPreference = 'Continue'
$out = 'E:\CentralDark\_tmp\vps-dc-check.out.txt'
$err = 'E:\CentralDark\_tmp\vps-dc-check.err.txt'
$cmds = @(
  'date -Is',
  'hostname',
  'whoami',
  'echo "=== DC PROCESSES ==="',
  'pgrep -af "desktop-commander|centraldark-mcp-auth|wonderwhy|mcp-auth|npx.*remote" || true',
  'echo "=== DEVICE CONFIG ==="',
  'if [ -f /root/.desktop-commander-device/device.json ]; then echo DEVICE_CONFIG=PRESENT; else echo DEVICE_CONFIG=ABSENT; fi',
  'echo "=== AUTH PROFILES ==="',
  'ls -la /root/.centraldark/mcp-auth/profiles 2>/dev/null || true'
)
$cmds += @(
  'echo "=== RECEIPTS ==="',
  'ls -lt /root/.centraldark/mcp-auth/receipts 2>/dev/null | head -10 || true',
  'echo "=== SERVICES ==="',
  'systemctl --no-pager --type=service --all | grep -Ei "desktop|centraldark|hermes|mcp" || true'
)
$remote = $cmds -join [Environment]::NewLine
Remove-Item -LiteralPath $out,$err -Force -ErrorAction SilentlyContinue
$remote | ssh -o BatchMode=yes -o ConnectTimeout=12 segredo-vpss bash -s 1> $out 2> $err
$code = $LASTEXITCODE
Write-Host "SSH_EXIT=$code"
Write-Host "OUT=$out"
Write-Host "ERR=$err"
if (Test-Path -LiteralPath $out) { Write-Host '---OUT---'; Get-Content -LiteralPath $out }
if (Test-Path -LiteralPath $err) { Write-Host '---ERR---'; Get-Content -LiteralPath $err }
exit $code
