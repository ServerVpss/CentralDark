$ErrorActionPreference='Continue'
$out='E:\CentralDark\_tmp\ssh-vps-current.out.txt'
$err='E:\CentralDark\_tmp\ssh-vps-current.err.txt'
Remove-Item -LiteralPath $out,$err -Force -ErrorAction SilentlyContinue
$args=@('-vvv','-o','BatchMode=yes','-o','ConnectTimeout=8','segredo-vpss','hostname')
$p=Start-Process -FilePath 'C:\Windows\System32\OpenSSH\ssh.exe' -ArgumentList $args -NoNewWindow -PassThru -Wait -RedirectStandardOutput $out -RedirectStandardError $err
Write-Output ('SSH_EXIT='+$p.ExitCode)
Write-Output ('OUT='+$out)
Write-Output ('ERR='+$err)