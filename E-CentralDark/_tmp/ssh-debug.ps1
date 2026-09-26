$ErrorActionPreference='Continue'
$ssh=(Get-Command ssh.exe).Source
$res = & $ssh '-vvv' '-o' 'BatchMode=yes' 'segredo-vpss' 'echo OK' 2>&1
$res | Set-Content -LiteralPath 'E:\CentralDark\_tmp\ssh-debug.txt' -Encoding UTF8
Write-Output ('EXIT='+$LASTEXITCODE)
