$ErrorActionPreference='Stop'
$dest='E:\CentralDark\_tmp\main-readonly-466d'
if(Test-Path -LiteralPath $dest){ Remove-Item -LiteralPath $dest -Recurse -Force }
git clone --depth 1 --branch main https://github.com/ServerVpss/CentralDark.git $dest
Set-Location $dest
Write-Output ('HEAD=' + (git rev-parse HEAD))
Write-Output ('BRAIN_FILES=' + ((Get-ChildItem -LiteralPath (Join-Path $dest 'docs\BRAIN') -Recurse -File -ErrorAction Stop).Count))
