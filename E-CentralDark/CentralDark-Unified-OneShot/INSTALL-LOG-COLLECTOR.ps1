param([switch]$RunNow)
$ErrorActionPreference = 'Stop'
$Runtime = Join-Path $env:LOCALAPPDATA 'CentralDark\UnifiedRuntime'
$InstallRoot = Join-Path $Runtime 'tools\LogCollector'
New-Item -ItemType Directory -Force -Path $InstallRoot | Out-Null
Copy-Item -Force -Path (Join-Path $PSScriptRoot 'COLLECT-CENTRALDARK-LOGS.ps1') -Destination (Join-Path $InstallRoot 'COLLECT-CENTRALDARK-LOGS.ps1')
Copy-Item -Force -Path (Join-Path $PSScriptRoot 'RUN-COLLECTOR.cmd') -Destination (Join-Path $InstallRoot 'RUN-COLLECTOR.cmd')
Write-Host "CENTRALDARK_LOG_COLLECTOR_INSTALLED=$InstallRoot"
if ($RunNow) {
  & powershell.exe -NoProfile -ExecutionPolicy Bypass -File (Join-Path $InstallRoot 'COLLECT-CENTRALDARK-LOGS.ps1')
}
