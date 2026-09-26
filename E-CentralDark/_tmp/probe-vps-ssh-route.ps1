$ErrorActionPreference='SilentlyContinue'
$key='C:\Users\Administrador\.ssh\segredo_vps_ed25519'
$tnc=Test-NetConnection -ComputerName 89.117.78.124 -Port 22 -WarningAction SilentlyContinue
$ssh=(Get-Command ssh.exe -ErrorAction SilentlyContinue)
[pscustomobject]@{
 observed_at=(Get-Date).ToString('o')
 key_exists=(Test-Path -LiteralPath $key)
 ssh_path=if($ssh){$ssh.Source}else{$null}
 tcp22=$tnc.TcpTestSucceeded
 remote_address=$tnc.RemoteAddress.IPAddressToString
} | ConvertTo-Json -Compress
& ssh.exe -o BatchMode=yes -o ConnectTimeout=8 -i $key root@89.117.78.124 "printf 'SSH_OK\n'; hostname" 2> 'E:\CentralDark\_tmp\vps-ssh-stderr.log'
Write-Output ("SSH_EXIT="+$LASTEXITCODE)
