$ssh=(Get-Command ssh.exe).Source
$p=Start-Process -FilePath $ssh -ArgumentList @('-vvv','-o','BatchMode=yes','segredo-vpss','echo OK') -RedirectStandardOutput 'E:\CentralDark\_tmp\ssh-debug2.out.txt' -RedirectStandardError 'E:\CentralDark\_tmp\ssh-debug2.err.txt' -PassThru -Wait
Write-Output ('EXIT='+$p.ExitCode)
