$ErrorActionPreference = 'Continue'
$out = 'E:\CentralDark\_tmp\vps_probe.txt'
"START=$(Get-Date -Format o)" | Set-Content -Path $out -Encoding UTF8
& ssh.exe -o BatchMode=yes -o ConnectTimeout=8 Segredo-VPS hostname *>> $out
"SSH_EXIT=$LASTEXITCODE" | Add-Content -Path $out
& ssh.exe -o BatchMode=yes -o ConnectTimeout=8 Segredo-VPS "cd /root/CentralDark && git rev-parse HEAD && git status --short --branch" *>> $out
"GIT_EXIT=$LASTEXITCODE" | Add-Content -Path $out
& ssh.exe -o BatchMode=yes -o ConnectTimeout=8 Segredo-VPS "pm2 status --no-color" *>> $out
"PM2_EXIT=$LASTEXITCODE" | Add-Content -Path $out
