param(
    [ValidateSet('All','Segredo','Fulano')]
    [string]$Profile = 'All',
    [switch]$SkipBuild,
    [switch]$SkipAuth
)

$ErrorActionPreference = 'Continue'
Set-StrictMode -Version 2.0

$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$Runtime = Join-Path $env:LOCALAPPDATA 'CentralDark\UnifiedRuntime'
$SharedLogDir = Join-Path $Runtime 'logs'
$ReceiptDir = Join-Path $Runtime 'receipts'
New-Item -ItemType Directory -Force -Path $SharedLogDir,$ReceiptDir | Out-Null
$Log = Join-Path $SharedLogDir ('unified-' + (Get-Date -Format 'yyyyMMdd-HHmmss') + '.log')
$Profiles = if ($Profile -eq 'All') { @('Segredo','Fulano') } else { @($Profile) }

function W([string]$m) {
  $line = "$(Get-Date -Format o) $m"
  $line | Tee-Object -FilePath $Log -Append | Out-Null
  Write-Host $m
}

function Test-TcpPort([string]$HostName, [int]$Port, [int]$TimeoutMs = 1500) {
  $client = New-Object System.Net.Sockets.TcpClient
  try {
    $iar = $client.BeginConnect($HostName, $Port, $null, $null)
    if (-not $iar.AsyncWaitHandle.WaitOne($TimeoutMs, $false)) { return $false }
    $client.EndConnect($iar)
    return $true
  } catch { return $false }
  finally { try { $client.Close() } catch {} }
}

function Test-HttpReachable([string]$Uri, [int]$TimeoutSec = 8) {
  try {
    $r = Invoke-WebRequest -UseBasicParsing -Uri $Uri -Method Get -TimeoutSec $TimeoutSec -ErrorAction Stop
    return "HTTP_$($r.StatusCode)"
  } catch {
    if ($_.Exception.Response) {
      try { return "HTTP_$([int]$_.Exception.Response.StatusCode)" } catch {}
    }
    return 'UNREACHABLE'
  }
}

function Get-DesktopCommanderRemoteProcess {
  try {
    return Get-CimInstance Win32_Process -ErrorAction SilentlyContinue |
      Where-Object {
        $_.CommandLine -and
        $_.CommandLine -match '(?i)(desktop-commander|@wonderwhy-er\\desktop-commander).*remote'
      } |
      Select-Object -First 1
  } catch {
    return $null
  }
}

function Ensure-DesktopCommanderRemote {
  param([hashtable]$Checks)

  $deviceConfig = Join-Path $env:USERPROFILE '.desktop-commander-device\device.json'
  $entry = Join-Path $Root 'vendor\desktop-commander-dist\dist\index.js'
  $node = Get-Command node.exe -ErrorAction SilentlyContinue
  if (-not $node) { $node = Get-Command node -ErrorAction SilentlyContinue }

  $Checks['REMOTE_DEVICE_CONFIG_PRESENT'] = [bool](Test-Path -LiteralPath $deviceConfig)
  $Checks['REMOTE_VENDORED_ENTRY_PRESENT'] = [bool](Test-Path -LiteralPath $entry)
  $Checks['REMOTE_NODE_PRESENT'] = [bool]$node
  $Checks['LEGACY_REMOTE_TRAY_LAUNCHED'] = $false
  $Checks['TRAY_OWNER_CENTRALDARK_BRIDGE'] = $true

  $running = Get-DesktopCommanderRemoteProcess
  if ($running) {
    $Checks['REMOTE_DC_PROCESS_PRESENT'] = $true
    $Checks['REMOTE_DC_REUSED'] = $true
    $Checks['REMOTE_DC_STARTED_BY_UNIFIED'] = $false
    $Checks['REMOTE_DC_PID'] = [int]$running.ProcessId
    W "REMOTE_DC=REUSED PID=$($running.ProcessId)"
    return $running
  }

  if (-not $Checks['REMOTE_DEVICE_CONFIG_PRESENT']) {
    $Checks['REMOTE_DC_PROCESS_PRESENT'] = $false
    $Checks['REMOTE_DC_REUSED'] = $false
    $Checks['REMOTE_DC_STARTED_BY_UNIFIED'] = $false
    W 'REMOTE_DC=NOT_STARTED_NO_PERSISTED_SESSION'
    return $null
  }

  if (-not $Checks['REMOTE_VENDORED_ENTRY_PRESENT'] -or -not $node) {
    $Checks['REMOTE_DC_PROCESS_PRESENT'] = $false
    $Checks['REMOTE_DC_REUSED'] = $false
    $Checks['REMOTE_DC_STARTED_BY_UNIFIED'] = $false
    W 'REMOTE_DC=NOT_STARTED_RUNTIME_PREREQUISITE_MISSING'
    return $null
  }

  try {
    $started = Start-Process -FilePath $node.Source -ArgumentList @($entry,'remote') -WorkingDirectory (Split-Path -Parent $entry) -WindowStyle Hidden -PassThru
    W "REMOTE_DC=START_REQUESTED PID=$($started.Id) ENTRY=$entry"
    Start-Sleep -Milliseconds 1500

    $running = Get-DesktopCommanderRemoteProcess
    if ($running) {
      $Checks['REMOTE_DC_PROCESS_PRESENT'] = $true
      $Checks['REMOTE_DC_REUSED'] = $false
      $Checks['REMOTE_DC_STARTED_BY_UNIFIED'] = $true
      $Checks['REMOTE_DC_PID'] = [int]$running.ProcessId
      W "REMOTE_DC=STARTED PID=$($running.ProcessId)"
      return $running
    }

    $Checks['REMOTE_DC_PROCESS_PRESENT'] = $false
    $Checks['REMOTE_DC_REUSED'] = $false
    $Checks['REMOTE_DC_STARTED_BY_UNIFIED'] = $false
    W 'REMOTE_DC=START_REQUESTED_BUT_NOT_PROVEN'
  } catch {
    $Checks['REMOTE_DC_PROCESS_PRESENT'] = $false
    $Checks['REMOTE_DC_REUSED'] = $false
    $Checks['REMOTE_DC_STARTED_BY_UNIFIED'] = $false
    W "REMOTE_DC=START_FAIL ERROR=$($_.Exception.Message)"
  }

  return $null
}

function Find-Screenpipe {
  $direct = @()
  try { $direct += (Get-Command screenpipe.exe -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Source -ErrorAction SilentlyContinue) } catch {}
  $direct += @(
    (Join-Path $env:LOCALAPPDATA 'screenpipe\screenpipe.exe'),
    (Join-Path $env:LOCALAPPDATA 'Programs\screenpipe\screenpipe.exe'),
    (Join-Path $env:APPDATA 'screenpipe\screenpipe.exe'),
    (Join-Path $env:USERPROFILE '.screenpipe\screenpipe.exe'),
    'E:\CentralDark\screenpipe.exe',
    'E:\CentralDark\apps\screenpipe\screenpipe.exe',
    'C:\Program Files\screenpipe\screenpipe.exe',
    'C:\Program Files (x86)\screenpipe\screenpipe.exe'
  )

  $hit = $direct | Where-Object { $_ -and (Test-Path -LiteralPath $_) } | Select-Object -First 1
  if ($hit) { return $hit }

  foreach ($base in @($env:LOCALAPPDATA, $env:APPDATA, 'E:\CentralDark')) {
    if (-not $base -or -not (Test-Path -LiteralPath $base)) { continue }
    try {
      $candidate = Get-ChildItem -LiteralPath $base -Filter 'screenpipe.exe' -File -Recurse -Depth 4 -ErrorAction SilentlyContinue | Select-Object -First 1
      if ($candidate) { return $candidate.FullName }
    } catch {}
  }

  return $null
}

$receipt = [ordered]@{
  schema='centraldark.unified.oneshot.canonical'
  observed_at=(Get-Date).ToString('o')
  root=$Root
  runtime=$Runtime
  profiles=$Profiles
  checks=[ordered]@{}
  unknown_is_not_pass=$true
  tray_is_bridge_state=$true
  one_system_only=$true
}

W 'CENTRALDARK_UNIFIED_ONESHOT=START'
W "ROOT=$Root"
W "PROFILES=$($Profiles -join ',')"
W "SKIP_AUTH=$SkipAuth"
W 'TRAY_IS_BRIDGE_STATE=true'
W 'UNKNOWN_IS_NOT_PASS=true'

$CentralDarkHome = if ($env:CENTRALDARK_HOME) { $env:CENTRALDARK_HOME } else { 'E:\CentralDark' }
$receipt.checks['CASA_FOUND'] = [bool](Test-Path -LiteralPath $CentralDarkHome)
W "CASA_FOUND=$($receipt.checks['CASA_FOUND']) PATH=$CentralDarkHome"

$mcpLocalTcp = Test-TcpPort '127.0.0.1' 9100
$receipt.checks['MCP_9100_LOCAL'] = $mcpLocalTcp
W "MCP_9100_LOCAL=$mcpLocalTcp"

$publicState = Test-HttpReachable 'https://mcp.centralldark.com/mcp'
$publicReachable = ($publicState -ne 'UNREACHABLE')
$receipt.checks['MCP_PUBLIC'] = $publicState
$receipt.checks['MCP_PUBLIC_REACHABLE'] = $publicReachable
$receipt.checks['MCP_ROUTE_AVAILABLE'] = ($mcpLocalTcp -or $publicReachable)
W "MCP_PUBLIC=$publicState"
W "MCP_ROUTE_AVAILABLE=$($receipt.checks['MCP_ROUTE_AVAILABLE'])"

$oauth = Join-Path $Root 'integration\OAUTH-CONNECT.ps1'
foreach ($p in $Profiles) {
  $profileRoot = Join-Path $Runtime ("profiles\" + $p)
  New-Item -ItemType Directory -Force -Path $profileRoot,(Join-Path $profileRoot 'logs'),(Join-Path $profileRoot 'auth'),(Join-Path $profileRoot 'remote-home') | Out-Null

  if ($SkipAuth) {
    $receipt.checks["AUTH_$($p.ToUpper())"] = 'SKIPPED_BY_OPERATOR'
    W "PROFILE=$p AUTH=SKIPPED"
    continue
  }

  if (Test-Path -LiteralPath $oauth) {
    try {
      W "PROFILE=$p AUTH=START"
      & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $oauth -Profile $p
      $ok = ($LASTEXITCODE -eq 0)
      $receipt.checks["AUTH_$($p.ToUpper())"] = $ok
      W "PROFILE=$p AUTH_PASS=$ok"
    } catch {
      $receipt.checks["AUTH_$($p.ToUpper())"] = $false
      W "PROFILE=$p AUTH_FAIL=$($_.Exception.Message)"
    }
  } else {
    $receipt.checks["AUTH_$($p.ToUpper())"] = $false
    W "PROFILE=$p AUTH_OWNER_NOT_FOUND=$oauth"
  }
}

$remote = Ensure-DesktopCommanderRemote -Checks $receipt.checks

$sp = Find-Screenpipe
if ($sp) {
  $spr = Get-Process -Name 'screenpipe','screenpipe-app' -ErrorAction SilentlyContinue
  if (-not $spr) {
    Start-Process -FilePath $sp -WorkingDirectory (Split-Path -Parent $sp)
    W "SCREENPIPE=STARTED PATH=$sp"
  } else {
    W "SCREENPIPE=ALREADY_RUNNING PID=$($spr.Id -join ',') PATH=$sp"
  }
  $receipt.checks['SCREENPIPE_FOUND'] = $true
} else {
  $receipt.checks['SCREENPIPE_FOUND'] = $false
  W 'SCREENPIPE=NOT_FOUND_ON_THIS_MACHINE'
}

Start-Sleep -Milliseconds 500
$screenpipeApi = Test-TcpPort '127.0.0.1' 3030
$screenpipeMcpHttp = Test-TcpPort '127.0.0.1' 3031
$receipt.checks['SCREENPIPE_3030_API'] = $screenpipeApi
$receipt.checks['SCREENPIPE_3031_MCP_HTTP'] = $screenpipeMcpHttp
$receipt.checks['SCREENPIPE_MCP_HTTP_REQUIRED'] = $false
W "SCREENPIPE_3030_API=$screenpipeApi"
W "SCREENPIPE_3031_MCP_HTTP=$screenpipeMcpHttp OPTIONAL=true"
W "MCP_9100_LOCAL=$mcpLocalTcp"
W "MCP_ROUTE_AVAILABLE=$($receipt.checks['MCP_ROUTE_AVAILABLE'])"

$builder = Join-Path $Root 'BUILD.ps1'
$exe = Join-Path $Root 'dist\CentralDarkBridge.exe'
if (-not $SkipBuild -and (Test-Path -LiteralPath $builder)) {
  try {
    & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $builder
    $receipt.checks['BRIDGE_BUILD_EXIT'] = [int]$LASTEXITCODE
    W "BRIDGE_BUILD_EXIT=$LASTEXITCODE"
  } catch {
    $receipt.checks['BRIDGE_BUILD_EXIT'] = 90
    W "BRIDGE_BUILD_FAIL=$($_.Exception.Message)"
  }
}

if (Test-Path -LiteralPath $exe) {
  $bridge = @(Get-Process -Name 'CentralDarkBridge' -ErrorAction SilentlyContinue)
  if (-not $bridge) {
    Start-Process -FilePath $exe -WorkingDirectory (Split-Path -Parent $exe)
    W "CENTRALDARK_BRIDGE=STARTED PATH=$exe"
    Start-Sleep -Milliseconds 700
    $bridge = @(Get-Process -Name 'CentralDarkBridge' -ErrorAction SilentlyContinue)
  } else {
    W "CENTRALDARK_BRIDGE=ALREADY_RUNNING PID=$($bridge.Id -join ',')"
  }

  $receipt.checks['BRIDGE_EXE_PRESENT'] = $true
  $receipt.checks['BRIDGE_PROCESS_COUNT'] = @($bridge).Count
  $receipt.checks['BRIDGE_SINGLE_INSTANCE'] = (@($bridge).Count -eq 1)
  if ($bridge) { $receipt.checks['BRIDGE_PID'] = [int]$bridge[0].Id }

  $statePath = Join-Path $Runtime 'bridge-state.json'
  if (Test-Path -LiteralPath $statePath) {
    try {
      $state = Get-Content -LiteralPath $statePath -Raw | ConvertFrom-Json
      $receipt.checks['BRIDGE_TRAY_SAME_PROCESS_STATE'] = [bool]$state.tray_same_process
      $receipt.checks['BRIDGE_SINGLE_INSTANCE_STATE'] = [bool]$state.single_instance
      $receipt.checks['BRIDGE_RUNTIME_STATE'] = [string]$state.state
      W "BRIDGE_STATE=$($state.state) TRAY_SAME_PROCESS=$($state.tray_same_process) SINGLE_INSTANCE=$($state.single_instance)"
    } catch {
      $receipt.checks['BRIDGE_TRAY_SAME_PROCESS_STATE'] = $false
      W "BRIDGE_STATE_PARSE_FAIL=$($_.Exception.Message)"
    }
  } else {
    $receipt.checks['BRIDGE_TRAY_SAME_PROCESS_STATE'] = $false
    W "BRIDGE_STATE_NOT_FOUND=$statePath"
  }
} else {
  $receipt.checks['BRIDGE_EXE_PRESENT'] = $false
  W 'CENTRALDARK_BRIDGE=BUILD_OUTPUT_ABSENT'
}

$receipt.completed_at=(Get-Date).ToString('o')
$receiptPath = Join-Path $ReceiptDir ('unified-' + (Get-Date -Format 'yyyyMMdd-HHmmss') + '.json')
$receipt | ConvertTo-Json -Depth 10 | Set-Content -LiteralPath $receiptPath -Encoding UTF8

W 'CENTRALDARK_UNIFIED_ONESHOT=END'
W "RECEIPT=$receiptPath"
