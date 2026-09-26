$ErrorActionPreference='Continue'
$ssh = (Get-Command ssh -ErrorAction Stop).Source
$result = & $ssh -o BatchMode=yes -o ConnectTimeout=8 segredo-vpss "hostname; pgrep -af desktop-commander || true; test -f /root/.desktop-commander-device/device.json && echo DEVICE_CONFIG=PRESENT || echo DEVICE_CONFIG=ABSENT" 2>&1
$result | Set-Content -LiteralPath 'E:\CentralDark\_tmp\check-vps-dc-min.out.txt' -Encoding UTF8
"EXIT=$LASTEXITCODE" | Add-Content -LiteralPath 'E:\CentralDark\_tmp\check-vps-dc-min.out.txt'
