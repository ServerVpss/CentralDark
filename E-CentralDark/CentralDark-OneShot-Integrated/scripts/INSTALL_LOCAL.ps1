$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$Exe = Join-Path $Root 'dist\CentralDarkBridge.exe'
$Target = if ($env:CENTRALDARK_HOME) { Join-Path $env:CENTRALDARK_HOME 'Bridge' } else { 'E:\CentralDark\Bridge' }
if (-not (Test-Path $Exe)) { throw 'Rode BUILD_AND_RUN.cmd primeiro.' }
New-Item -ItemType Directory -Force -Path $Target | Out-Null
Copy-Item -LiteralPath $Exe -Destination (Join-Path $Target 'CentralDarkBridge.exe') -Force
Copy-Item -LiteralPath (Join-Path $Root 'config\bridge.env.example') -Destination (Join-Path $Target 'bridge.env.example') -Force
$h = (Get-FileHash -LiteralPath (Join-Path $Target 'CentralDarkBridge.exe') -Algorithm SHA256).Hash
Write-Host "INSTALL_LOCAL=PASS"
Write-Host "TARGET=$Target"
Write-Host "SHA256=$h"
