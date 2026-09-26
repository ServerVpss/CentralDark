$ErrorActionPreference = 'Continue'
Set-StrictMode -Version Latest
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$LogDir = Join-Path $env:LOCALAPPDATA 'CentralDark\OneShot\logs'
New-Item -ItemType Directory -Force -Path $LogDir | Out-Null
$Log = Join-Path $LogDir ('oneshot-' + (Get-Date -Format 'yyyyMMdd-HHmmss') + '.log')
function W([string]$m) { $line = "$(Get-Date -Format o) $m"; $line | Tee-Object -FilePath $Log -Append; Write-Host $m }
function Find-Screenpipe {
  $candidates = @(
    (Get-Command screenpipe.exe -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Source -ErrorAction SilentlyContinue),
    (Join-Path $env:LOCALAPPDATA 'screenpipe\screenpipe.exe'),
    (Join-Path $env:LOCALAPPDATA 'Programs\screenpipe\screenpipe.exe'),
    (Join-Path $env:USERPROFILE '.screenpipe\screenpipe.exe'),
    'E:\CentralDark\screenpipe.exe',
    'E:\CentralDark\apps\screenpipe\screenpipe.exe'
  ) | Where-Object { $_ -and (Test-Path -LiteralPath $_) }
  return $candidates | Select-Object -First 1
}
W 'CENTRALDARK_ONESHOT=START'
W "ROOT=$Root"
W 'UNKNOWN_IS_NOT_PASS=true'

# 1) Casa
$home = if ($env:CENTRALDARK_HOME) { $env:CENTRALDARK_HOME } else { 'E:\CentralDark' }
W ("CASA=" + ($(if (Test-Path $home) {'FOUND'} else {'NOT_FOUND'})) + " PATH=$home")

# 2) MCP local reachability
try {
  $tcp = Test-NetConnection -ComputerName 127.0.0.1 -Port 9100 -WarningAction SilentlyContinue
  W "MCP_9100_TCP=$($tcp.TcpTestSucceeded)"
} catch { W "MCP_9100_TCP=UNKNOWN ERROR=$($_.Exception.Message)" }

# 3) Remote Tray bundled
$tray = Get-ChildItem -LiteralPath (Join-Path $Root 'vendor\remote-tray') -Filter 'CentralDark-Remote-Tray.exe' -Recurse -File -ErrorAction SilentlyContinue | Select-Object -First 1
if ($tray) {
  $running = Get-Process -Name 'CentralDark-Remote-Tray' -ErrorAction SilentlyContinue
  if (-not $running) { Start-Process -FilePath $tray.FullName; W "REMOTE_TRAY=STARTED PATH=$($tray.FullName)" }
  else { W "REMOTE_TRAY=ALREADY_RUNNING PID=$($running.Id -join ',')" }
} else { W 'REMOTE_TRAY=NOT_FOUND' }

# 4) Screenpipe: consume existing installation, do not duplicate/install blindly.
$sp = Find-Screenpipe
if ($sp) {
  $spr = Get-Process -Name 'screenpipe' -ErrorAction SilentlyContinue
  if (-not $spr) { Start-Process -FilePath $sp; W "SCREENPIPE=STARTED PATH=$sp" }
  else { W "SCREENPIPE=ALREADY_RUNNING PID=$($spr.Id -join ',')" }
} else { W 'SCREENPIPE=NOT_FOUND_ON_THIS_MACHINE' }

# 5) Build/Open CentralDark Bridge UI
$builder = Join-Path $Root 'BUILD.ps1'
if (Test-Path $builder) {
  try {
    & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $builder
    $exe = Join-Path $Root 'dist\CentralDarkBridge.exe'
    if (Test-Path $exe) { Start-Process -FilePath $exe; W "CENTRALDARK_BRIDGE=STARTED PATH=$exe" }
    else { W 'CENTRALDARK_BRIDGE=BUILD_OUTPUT_ABSENT' }
  } catch { W "CENTRALDARK_BRIDGE=BUILD_FAIL ERROR=$($_.Exception.Message)" }
} else { W 'CENTRALDARK_BRIDGE=BUILDER_ABSENT' }

W 'CENTRALDARK_ONESHOT=END'
W "RECEIPT=$Log"
