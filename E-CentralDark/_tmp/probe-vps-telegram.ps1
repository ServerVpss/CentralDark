$ErrorActionPreference='Continue'
$ssh = (Get-Command ssh.exe).Source
$key = Join-Path $env:USERPROFILE '.ssh\segredo_vps_ed25519'
$remote = 'hostname; whoami; find /root/CentralDark /root/Multizap -maxdepth 5 -type f 2>/dev/null | grep -Ei "(telegram|telethon|pyrogram|\.session$)" | head -200'
$res = & $ssh '-o' 'BatchMode=yes' '-o' 'ConnectTimeout=8' '-i' $key 'root@segredo-vpss' $remote 2>&1
$res | Set-Content -LiteralPath 'E:\CentralDark\_tmp\vps-telegram-probe.txt' -Encoding UTF8
Write-Output ('SSH_EXIT='+$LASTEXITCODE)
Write-Output ('LINES='+@($res).Count)