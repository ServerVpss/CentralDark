param(
    [ValidateSet('All','Segredo','Fulano')]
    [string]$Profile = 'All',
    [switch]$SkipBuild
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

function Get-RemoteTrayProcess {
  try {
    $p = Get-CimInstance Win32_Process -ErrorAction SilentlyContinue |
      Where-Object {
        $_.Name -ieq 'CentralDark-Remote-Tray.exe' -or
        ($_.ExecutablePath -and $_.ExecutablePath -match 'CentralDark-Remote-Tray') -or
        ($_.CommandLine -and $_.CommandLine -match 'CentralDark-Remote-Tray')
      } | Select-Object -First 1
    return $p
  } catch { return $null }
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
}

W 'CENTRALDARK_UNIFIED_ONESHOT=START'
W "ROOT=$Root"
W "PROFILES=$($Profiles -join ',')"
W 'UNKNOWN_IS_NOT_PASS=true'

$CentralDarkHome = if ($env:CENTRALDARK_HOME) { $env:CENTRALDARK_HOME } else { 'E:\CentralDark' }
$receipt.checks['CASA_FOUND'] = [bool](Test-Path -LiteralPath $CentralDarkHome)
W "CASA_FOUND=$($receipt.checks['CASA_FOUND']) PATH=$CentralDarkHome"

$mcpTcp = Test-TcpPort '127.0.0.1' 9100
$receipt.checks['MCP_9100_TCP'] = $mcpTcp
W "MCP_9100_TCP=$mcpTcp"

$publicState = Test-HttpReachable 'https://mcp.centralldark.com/mcp'
$receipt.checks['MCP_PUBLIC'] = $publicState
W "MCP_PUBLIC=$publicState"

$oauth = Join-Path $Root 'integration\OAUTH-CONNECT.ps1'
foreach ($p in $Profiles) {
  $profileRoot = Join-Path $Runtime ("profiles\" + $p)
  New-Item -ItemType Directory -Force -Path `
    $profileRoot,(Join-Path $profileRoot 'logs'),(Join-Path $profileRoot 'auth'),(Join-Path $profileRoot 'remote-home') | Out-Null
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
  }
}

$TrayRoot = Join-Path $Root 'vendor\remote-tray'
$tray = Get-ChildItem -LiteralPath $TrayRoot -Filter 'CentralDark-Remote-Tray.exe' -Recurse -File -ErrorAction SilentlyContinue | Select-Object -First 1
if ($tray) {
  $running = Get-RemoteTrayProcess
  if (-not $running) {
    Start-Process -FilePath $tray.FullName -WorkingDirectory $tray.DirectoryName
    Start-Sleep -Milliseconds 400
    $running = Get-RemoteTrayProcess
    if ($running) { W "REMOTE_TRAY=STARTED PID=$($running.ProcessId) PATH=$($tray.FullName)" }
    else { W "REMOTE_TRAY=START_REQUESTED PATH=$($tray.FullName)" }
  } else {
    W "REMOTE_TRAY=REUSED PID=$($running.ProcessId)"
  }
  $receipt.checks['REMOTE_TRAY_PRESENT'] = $true
  $receipt.checks['REMOTE_TRAY_SINGLE_INSTANCE_REUSE'] = $true
} else {
  $receipt.checks['REMOTE_TRAY_PRESENT'] = $false
  $receipt.checks['REMOTE_TRAY_SINGLE_INSTANCE_REUSE'] = $false
  W 'REMOTE_TRAY=NOT_FOUND'
}

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
foreach ($port in @(3030,3031,9100)) {
  $value = Test-TcpPort '127.0.0.1' $port
  $receipt.checks["PORT_$port"] = $value
  W "PORT_$port=$value"
}

$builder = Join-Path $Root 'BUILD.ps1'
$exe = Join-Path $Root 'dist\CentralDarkBridge.exe'
if (-not $SkipBuild -and (Test-Path -LiteralPath $builder)) {
  try {
    & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $builder
    W "BRIDGE_BUILD_EXIT=$LASTEXITCODE"
  } catch {
    W "BRIDGE_BUILD_FAIL=$($_.Exception.Message)"
  }
}
if (Test-Path -LiteralPath $exe) {
  $bridge = Get-Process -Name 'CentralDarkBridge' -ErrorAction SilentlyContinue
  if (-not $bridge) {
    Start-Process -FilePath $exe -WorkingDirectory (Split-Path -Parent $exe)
    W "CENTRALDARK_BRIDGE=STARTED PATH=$exe"
  } else {
    W "CENTRALDARK_BRIDGE=ALREADY_RUNNING PID=$($bridge.Id -join ',')"
  }
  $receipt.checks['BRIDGE_EXE_PRESENT'] = $true
} else {
  $receipt.checks['BRIDGE_EXE_PRESENT'] = $false
  W 'CENTRALDARK_BRIDGE=BUILD_OUTPUT_ABSENT'
}

$receipt.completed_at=(Get-Date).ToString('o')
$receiptPath = Join-Path $ReceiptDir ('unified-' + (Get-Date -Format 'yyyyMMdd-HHmmss') + '.json')
$receipt | ConvertTo-Json -Depth 10 | Set-Content -LiteralPath $receiptPath -Encoding UTF8

W 'CENTRALDARK_UNIFIED_ONESHOT=END'
W "RECEIPT=$receiptPath"
