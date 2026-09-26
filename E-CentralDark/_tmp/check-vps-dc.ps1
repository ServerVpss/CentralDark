$ErrorActionPreference='Stop'
$ssh = "$env:WINDIR\System32\OpenSSH\ssh.exe"
$config = "$env:USERPROFILE\.ssh\config"
$remote = @'
date -Is
hostname
echo ===PROCESSES===
pgrep -af 'desktop-commander|centraldark-mcp-auth|npx.*remote' || true
echo ===DEVICE_CONFIG===
if [ -f /root/.desktop-commander-device/device.json ]; then echo PRESENT; else echo ABSENT; fi
echo ===SYSTEMD===
systemctl --no-pager --type=service --all | grep -Ei 'desktop|centraldark|hermes|mcp' || true
'@
& $ssh -F $config segredo-vpss $remote 2>&1
exit $LASTEXITCODE
