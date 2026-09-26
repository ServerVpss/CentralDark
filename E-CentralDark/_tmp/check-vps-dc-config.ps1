$ErrorActionPreference='Continue'
$out = 'E:\CentralDark\_tmp\check-vps-dc-config.out.txt'
$ssh=(Get-Command ssh -ErrorAction Stop).Source
$config='C:\Users\Administrador\.ssh\config'
$result = & $ssh -F $config -o BatchMode=yes -o ConnectTimeout=8 segredo-vpss "hostname; pgrep -af desktop-commander || true; pgrep -af centraldark-mcp-auth || true; test -f /root/.desktop-commander-device/device.json && echo DEVICE_CONFIG=PRESENT || echo DEVICE_CONFIG=ABSENT" 2>&1
$result | Set-Content -LiteralPath $out -Encoding UTF8
"EXIT=$LASTEXITCODE" | Add-Content -LiteralPath $out
