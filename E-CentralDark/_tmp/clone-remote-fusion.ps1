$ErrorActionPreference='Stop'
$dest='E:\CentralDark\_WORKTREES\remote-tray-fusion-20260918'
if(Test-Path $dest){ Remove-Item -LiteralPath $dest -Recurse -Force }
New-Item -ItemType Directory -Force -Path 'E:\CentralDark\_WORKTREES' | Out-Null
git clone --depth 1 --branch main https://github.com/ServerVpss/CentralDark.git $dest
Set-Location $dest
Write-Output ('CLONE_HEAD=' + (git rev-parse HEAD))
Write-Output ('STATUS=' + ((git status --porcelain) -join ';'))
