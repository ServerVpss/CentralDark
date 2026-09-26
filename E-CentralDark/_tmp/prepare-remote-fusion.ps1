$ErrorActionPreference='Stop'
$repo='E:\CentralDark\CentralDark'
$wt='E:\CentralDark\_WORKTREES\remote-tray-fusion-20260918'
Write-Output '=== TOOLCHAIN ==='
$dot=(Get-Command dotnet.exe -ErrorAction SilentlyContinue)
if($dot){ & $dot.Source --version } else { Write-Output 'DOTNET=MISSING' }
$csc=(Get-Command csc.exe -ErrorAction SilentlyContinue)
if($csc){ Write-Output ('CSC=' + $csc.Source) } else { Write-Output 'CSC=MISSING' }
Write-Output '=== FETCH ==='
Set-Location $repo
git fetch origin main --prune
Write-Output ('ORIGIN_MAIN=' + (git rev-parse origin/main))
Write-Output '=== WORKTREE ==='
if(Test-Path $wt){ Write-Output 'WORKTREE_EXISTS=true' } else { git worktree add --detach $wt origin/main }
Set-Location $wt
Write-Output ('WT_HEAD=' + (git rev-parse HEAD))
Write-Output ('WT_STATUS=' + ((git status --porcelain) -join ';'))
