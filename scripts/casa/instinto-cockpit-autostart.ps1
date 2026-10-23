# CentralDark Instinto Superior: idempotent Windows boot launcher.
# Owner: apps/instinto-superior; fixed TCP 8080. No process termination.
$ErrorActionPreference = 'Stop'
$root = 'K:\apps\instinto-superior'
$node = 'C:\Program Files\nodejs\node.exe'
$vite = Join-Path $root 'node_modules\vite\bin\vite.js'
$logDir = 'F:\temp'
$port = 8080
if (-not (Test-Path -LiteralPath $root -PathType Container) -or
    -not (Test-Path -LiteralPath $vite -PathType Leaf) -or
    -not (Test-Path -LiteralPath $node -PathType Leaf)) {
  Write-Output 'COCKPIT=BLOCKED_SOURCE_OR_NODE_MISSING'
  exit 21
}
if (-not (Test-Path -LiteralPath $logDir)) {
  New-Item -ItemType Directory -Path $logDir -Force | Out-Null
}
$listener = @(Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue)
if ($listener.Count -gt 0) {
  $owned = $false
  foreach ($entry in $listener) {
    $proc = Get-CimInstance Win32_Process -Filter "ProcessId=$($entry.OwningProcess)" -ErrorAction SilentlyContinue
    if ($proc -and $proc.Name -eq 'node.exe' -and
      $proc.CommandLine -match 'instinto-superior' -and $proc.CommandLine -match 'vite') {
      $owned = $true
    } else {
      Write-Output "COCKPIT=BLOCKED_PORT_8080_OWNER_$($entry.OwningProcess)"
      exit 22
    }
  }
  if ($owned) {
    try {
      $r = Invoke-WebRequest -Uri 'http://127.0.0.1:8080/sala-controle' -UseBasicParsing -TimeoutSec 5
      if ($r.StatusCode -eq 200) {
        Write-Output 'COCKPIT=ALREADY_RUNNING_HTTP_200'
        exit 0
      }
    } catch {}
    Write-Output 'COCKPIT=BLOCKED_LISTENING_BUT_NOT_HEALTHY'
    exit 23
  }
}
$env:TEMP = $logDir
$env:TMP = $logDir
$out = Join-Path $logDir 'centraldark-cockpit-8080-stdout.log'
$err = Join-Path $logDir 'centraldark-cockpit-8080-stderr.log'
$p = Start-Process -FilePath $node -WorkingDirectory $root -ArgumentList @(
  ('"' + $vite + '"'), '--host', '0.0.0.0', '--port', '8080', '--strictPort'
) -WindowStyle Hidden -RedirectStandardOutput $out -RedirectStandardError $err -PassThru
Write-Output "COCKPIT=START_REQUESTED_PID_$($p.Id)_PORT_8080"