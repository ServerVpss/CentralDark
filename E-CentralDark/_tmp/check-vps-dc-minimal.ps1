$ErrorActionPreference='Continue'
$ssh = (Get-Command ssh.exe -ErrorAction Stop).Source
Write-Output ("SSH_PATH=" + $ssh)
& $ssh -T segredo-vpss "hostname; whoami; pgrep -af desktop-commander || true; pgrep -af centraldark-mcp-auth || true; test -f /root/.desktop-commander-device/device.json && echo DEVICE_CONFIG=PRESENT || echo DEVICE_CONFIG=ABSENT" 2>&1
Write-Output ("SSH_EXIT=" + $LASTEXITCODE)
exit 0
