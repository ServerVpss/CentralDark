$ErrorActionPreference = 'Continue'
Write-Host '=== Get-Command ssh ==='
Get-Command ssh -ErrorAction SilentlyContinue | Format-List *
Write-Host '=== where.exe ssh ==='
where.exe ssh
Write-Host '=== ssh -V captured ==='
$p = Start-Process -FilePath 'ssh' -ArgumentList '-V' -NoNewWindow -PassThru -Wait -RedirectStandardOutput 'E:\CentralDark\_tmp\ssh-v-out.txt' -RedirectStandardError 'E:\CentralDark\_tmp\ssh-v-err.txt'
Write-Host "EXIT=$($p.ExitCode)"
Write-Host 'STDOUT:'
Get-Content 'E:\CentralDark\_tmp\ssh-v-out.txt' -ErrorAction SilentlyContinue
Write-Host 'STDERR:'
Get-Content 'E:\CentralDark\_tmp\ssh-v-err.txt' -ErrorAction SilentlyContinue
