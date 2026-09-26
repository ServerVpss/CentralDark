$ssh=(Get-Command ssh.exe).Source
$res=& $ssh '-G' 'segredo-vpss' 2>&1
$res | Select-String '^(hostname|user|identityfile|port) ' | Set-Content -LiteralPath 'E:\CentralDark\_tmp\ssh-config-probe.txt' -Encoding UTF8