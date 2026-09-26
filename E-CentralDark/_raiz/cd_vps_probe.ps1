$ErrorActionPreference = 'Continue'
$ssh = "$env:WINDIR\System32\OpenSSH\ssh.exe"
$target = 'segredo-vpss'
$cmd = 'hostname; whoami; pwd; date -u'
& $ssh $target $cmd *> 'E:\CentralDark\cd_vps_probe.out'
"EXIT=$LASTEXITCODE" | Add-Content 'E:\CentralDark\cd_vps_probe.out'
