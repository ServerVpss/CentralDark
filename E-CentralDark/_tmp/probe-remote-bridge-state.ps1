$ErrorActionPreference='Stop'
$repo='E:\CentralDark\CentralDark'
$owner=Join-Path $repo 'scripts\remote-bridge'
Write-Output '=== REPO ==='
Set-Location $repo
Write-Output ('HEAD=' + (git rev-parse HEAD))
Write-Output ('BRANCH=' + (git branch --show-current))
Write-Output 'STATUS_BEGIN'
git status --short
Write-Output 'STATUS_END'
Write-Output '=== OWNER FILES ==='
Get-ChildItem -LiteralPath $owner -Force | Select-Object Name,Length,LastWriteTime | Format-Table -AutoSize
Write-Output '=== GO ==='
$go=Get-Command go.exe -ErrorAction SilentlyContinue
if(-not $go){$go=Get-Command go -ErrorAction SilentlyContinue}
if($go){ & $go.Source version } else { Write-Output 'GO=MISSING' }
Write-Output '=== EXISTING EXE ==='
Get-ChildItem -LiteralPath $owner -Filter '*.exe' -ErrorAction SilentlyContinue | Select-Object FullName,Length,LastWriteTime | Format-Table -AutoSize
