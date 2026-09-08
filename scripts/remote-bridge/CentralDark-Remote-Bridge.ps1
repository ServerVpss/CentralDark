param(
  [string]$Workdir = 'E:\CentralDark\_MAPA_CASA\GARIMPO-CHEFE',
  [int]$RetrySec = 5,
  [switch]$NoRouter
)

$ErrorActionPreference = 'Continue'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Split-Path -Parent (Split-Path -Parent $root)
$configPath = Join-Path $root 'CENTRALDARK-REMOTE-BRIDGE.config.json'
$sidecar = Join-Path $root 'CentralDark-Context-Sidecar.ps1'
$receiptDir = Join-Path $Workdir 'receipts\remote-bridge'
$contextDir = Join-Path $Workdir 'context'
New-Item -ItemType Directory -Force -Path $receiptDir | Out-Null
New-Item -ItemType Directory -Force -Path $contextDir | Out-Null
$log = Join-Path $receiptDir ("bridge-{0}.log" -f (Get-Date -Format 'yyyyMMdd-HHmmss'))

$config = $null
if (Test-Path $configPath) {
  try { $config = Get-Content -Raw $configPath | ConvertFrom-Json } catch { $config = $null }
}
$routerUrl = if ($config -and $config.omni_router_url) { [string]$config.omni_router_url } else { 'http://127.0.0.1:8099' }
$stateRel = if ($config -and $config.bridge_state_file) { [string]$config.bridge_state_file } else { 'context\centraldark-live-state.json' }
$stateFile = if ([IO.Path]::IsPathRooted($stateRel)) { $stateRel } else { Join-Path $Workdir $stateRel }
$launcherRel = if ($config -and $config.omni_launcher) { [string]$config.omni_launcher } else { 'scripts\launch_omni_router.py' }
$launcher = if ([IO.Path]::IsPathRooted($launcherRel)) { $launcherRel } else { Join-Path $repoRoot $launcherRel }

$sidecarProc = $null
$routerProc = $null

function Test-OmniRouter {
  try {
    $r = Invoke-WebRequest -UseBasicParsing -Uri ($routerUrl.TrimEnd('/') + '/health') -TimeoutSec 2
    return ($r.StatusCode -ge 200 -and $r.StatusCode -lt 300)
  } catch { return $false }
}

function Write-LiveState([string]$RemoteState, [string]$Detail = '') {
  $routerOnline = Test-OmniRouter
  $state = [ordered]@{
    schema = 'centraldark.live-state.v1'
    checked_at = (Get-Date).ToString('o')
    device = 'SEGREDO'
    one_system_only = $true
    one_router_only = $true
    omni_router = [ordered]@{
      url = $routerUrl
      status = $(if ($routerOnline) { 'ONLINE' } else { 'OFFLINE' })
      pid = $(if ($routerProc -and -not $routerProc.HasExited) { $routerProc.Id } else { $null })
    }
    remote_bridge = [ordered]@{
      status = $RemoteState
      required_for_core = $false
      detail = $Detail
    }
    screenpipe_sidecar = [ordered]@{
      status = $(if ($sidecarProc -and -not $sidecarProc.HasExited) { 'RUNNING' } else { 'UNKNOWN' })
      pid = $(if ($sidecarProc -and -not $sidecarProc.HasExited) { $sidecarProc.Id } else { $null })
    }
    external_providers_required = $false
    action_is_proof = $false
    unknown_is_not_pass = $true
  }
  $tmp = "$stateFile.tmp"
  $state | ConvertTo-Json -Depth 6 | Set-Content -Encoding UTF8 $tmp
  Move-Item -Force $tmp $stateFile
}

function Start-OmniRouter {
  if ($NoRouter -or (Test-OmniRouter)) { return }
  if (-not (Test-Path $launcher)) {
    Add-Content $log ("[{0}] OMNI_LAUNCHER_MISSING={1}" -f (Get-Date -Format o), $launcher)
    return
  }
  $python = Get-Command python -ErrorAction SilentlyContinue
  if (-not $python) { $python = Get-Command py -ErrorAction SilentlyContinue }
  if (-not $python) {
    Add-Content $log ("[{0}] OMNI_PYTHON_NOT_FOUND" -f (Get-Date -Format o))
    return
  }
  $routerProc = Start-Process $python.Source -ArgumentList @("`"$launcher`"") -WorkingDirectory $repoRoot -WindowStyle Hidden -PassThru
  Add-Content $log ("[{0}] OMNI_ROUTER_PID={1}; launcher={2}" -f (Get-Date -Format o), $routerProc.Id, $launcher)
  Start-Sleep -Seconds 2
}

if (Test-Path $sidecar) {
  $sidecarProc = Start-Process powershell.exe -ArgumentList @(
    '-NoProfile','-ExecutionPolicy','Bypass','-File',"`"$sidecar`"",'-Workdir',"`"$Workdir`""
  ) -WindowStyle Hidden -PassThru
  Add-Content $log ("[{0}] SCREENPIPE_SIDECAR_PID={1}" -f (Get-Date -Format o), $sidecarProc.Id)
}

try {
  Start-OmniRouter
  Write-LiveState 'STARTING'
  while ($true) {
    if (-not (Test-OmniRouter)) { Start-OmniRouter }
    Write-LiveState 'CONNECTING'
    Add-Content $log ("[{0}] REMOTE_MCP_CONNECT=https://mcp.desktopcommander.app/mcp" -f (Get-Date -Format o))
    Push-Location $Workdir
    try {
      & npx -y @wonderwhy-er/desktop-commander@latest remote *>> $log
      $exit = $LASTEXITCODE
    } catch {
      Add-Content $log ("[{0}] REMOTE_MCP_ERROR={1}" -f (Get-Date -Format o), $_.Exception.Message)
      $exit = 1
    } finally {
      Pop-Location
    }

    $tail = ''
    try { $tail = (Get-Content $log -Tail 30 -ErrorAction SilentlyContinue) -join "`n" } catch {}
    $remoteState = if ($tail -match 'Invalid Refresh Token: Already Used') { 'AUTH_STALE' } elseif ($exit -eq 0) { 'DISCONNECTED_CLEAN' } else { 'RETRYING' }
    Write-LiveState $remoteState ("exit={0}" -f $exit)
    Add-Content $log ("[{0}] REMOTE_MCP_EXIT={1}; state={2}; retry_in={3}s" -f (Get-Date -Format o), $exit, $remoteState, $RetrySec)

    $sleep = if ($remoteState -eq 'AUTH_STALE') { [Math]::Max($RetrySec,30) } else { [Math]::Max($RetrySec,3) }
    Start-Sleep -Seconds $sleep
  }
} finally {
  Write-LiveState 'STOPPING'
  if ($sidecarProc -and -not $sidecarProc.HasExited) { Stop-Process -Id $sidecarProc.Id -ErrorAction SilentlyContinue }
  if ($routerProc -and -not $routerProc.HasExited) { Stop-Process -Id $routerProc.Id -ErrorAction SilentlyContinue }
}
