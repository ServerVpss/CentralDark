param(
  [string]$OutDir = (Join-Path $PSScriptRoot 'canonical\dist'),
  [switch]$OpenAfterBuild,
  [switch]$Dev
)

# #OBSERVACOES#
# @owner scripts/remote-bridge/Build-Remote-Bridge.ps1
# @doc_ref scripts/remote-bridge/CORPO-UNICO-CAPACIDADES.md
# @last_updated 2026-11-08T23:58:29Z
# @implementado wrapper relativo para o builder canonico, sem dependencia do drive K:
# @estado SOURCE_READY_RUNTIME_PENDING
# @next_cursor compilar CentralDark-Remote-Bridge.exe e executar --self-test

$ErrorActionPreference = 'Stop'
if ($Dev) {
  $ui = Join-Path $PSScriptRoot 'ui'
  $viteUrl = 'http://127.0.0.1:5173/'
  $viteProcess = $null

  function Test-BridgeVite {
    try {
      $page = Invoke-WebRequest $viteUrl -UseBasicParsing -TimeoutSec 3
      if ($page.StatusCode -ne 200) { return $false }
      $source = Invoke-WebRequest ($viteUrl + 'src/App.jsx') -UseBasicParsing -TimeoutSec 5
      return $source.StatusCode -eq 200 -and $source.Content.Contains('window.centralDark')
    } catch { return $false }
  }

  if (-not (Test-BridgeVite)) {
    $listener = Get-NetTCPConnection -LocalPort 5173 -State Listen -ErrorAction SilentlyContinue
    if (-not $listener) {
      $viteProcess = Start-Process -FilePath 'cmd.exe' -ArgumentList '/d','/c','npm run dev' -WorkingDirectory $ui -NoNewWindow -PassThru
      Write-Host ('BRIDGE_DEV_VITE_START_PID=' + $viteProcess.Id)
    }
  }
  $ready = $false
  for ($i = 0; $i -lt 120; $i++) {
    if (Test-BridgeVite) { $ready = $true; break }
    Start-Sleep -Milliseconds 500
  }
  if (-not $ready) { throw 'BRIDGE_DEV_VITE_NOT_READY_OR_PORT_5173_CONFLICT' }
  Write-Host 'BRIDGE_DEV_VITE_READY=http://127.0.0.1:5173/'

  $env:CENTRALDARK_BRIDGE_DEV_URL = $viteUrl
  $electron = Join-Path $ui 'node_modules\electron\dist\electron.exe'
  if (-not (Test-Path -LiteralPath $electron -PathType Leaf)) { throw 'ELECTRON_DEV_BINARY_MISSING' }
  $existing = @(Get-CimInstance Win32_Process -Filter "name = 'electron.exe'" -ErrorAction SilentlyContinue |
    Where-Object { $_.CommandLine -like ('"' + $electron + '" .*') -and $_.CommandLine -notmatch '--type=' })
  if ($existing.Count -gt 0) {
    Write-Host ('BRIDGE_DEV_ELECTRON_ALREADY_RUNNING_PID=' + $existing[0].ProcessId)
  } else {
    $appProcess = Start-Process -FilePath $electron -ArgumentList '.', '--centraldark-dev=5173' -WorkingDirectory $ui -WindowStyle Normal -PassThru
    Write-Host ('BRIDGE_DEV_ELECTRON_STARTED_PID=' + $appProcess.Id)
  }
  if ($viteProcess) {
    Write-Host 'BRIDGE_DEV_HMR_ACTIVE: monitorando o Vite no terminal atual'
    Wait-Process -Id $viteProcess.Id
    if ($viteProcess.ExitCode -ne 0) { throw ('BRIDGE_DEV_VITE_EXIT=' + $viteProcess.ExitCode) }
  }
  return
}

$builder = Join-Path $PSScriptRoot 'canonical\Build-Remote-Bridge.ps1'

if (-not (Test-Path -LiteralPath $builder -PathType Leaf)) {
  throw "CANONICAL_BUILDER_NOT_FOUND:$builder"
}

& $builder -OutDir $OutDir -OpenAfterBuild:$OpenAfterBuild
if ($LASTEXITCODE -ne 0) {
  exit $LASTEXITCODE
}
