$ErrorActionPreference='Continue'
$ssh='C:\Windows\System32\OpenSSH\ssh.exe'
$key='C:\Users\Administrador\.ssh\segredo_vps_ed25519'
$out='E:\CentralDark\_tmp\vps-runner-check.out.txt'
$remote=@'
hostname
date -Is
echo "=== RUNNER SERVICES ==="
systemctl --no-pager --type=service --all | grep -Ei 'actions.runner|github|runner|centraldark|hermes' || true
echo "=== RUNNER PROCESSES ==="
pgrep -af 'Runner.Listener|Runner.Worker|actions-runner|run.sh' || true
echo "=== DESKTOP COMMANDER ==="
pgrep -af 'desktop-commander|centraldark-mcp-auth' || true
'@
& $ssh -i $key -o BatchMode=yes -o ConnectTimeout=8 root@89.117.78.124 $remote *>&1 | Set-Content -LiteralPath $out -Encoding UTF8
"EXIT=$LASTEXITCODE" | Add-Content -LiteralPath $out -Encoding UTF8
Get-Content -LiteralPath $out
