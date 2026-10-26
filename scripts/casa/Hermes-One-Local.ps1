#requires -Version 5.1
# CentralDark — Hermes ONE Web local; owner: scripts/casa + apps/modulos/HERMES-CORE
# #OBSERVACOES# @owner=scripts/casa/Hermes-One-Local.ps1
# @doc_ref=docs/CONSCIENCIA/RELATORIO-HERMES-ONE-LOCAL-E-COCKPIT-20261025.md
# @last_updated=2026-10-25T12:00:00Z @implementado=launcher idempotente loopback 9119
# @pendente=interface Electron 3D no navegador, autenticacao E2E, empacotamento VPS
# @estado=LOCAL_WEB_ONLY @next_cursor=validar dashboard web e roteamento autorizado no cockpit
[CmdletBinding()]
param(
  [ValidateSet("status","start","stop")]
  [string]$Action = "status"
)
$ErrorActionPreference = "Stop"
$PORT = 9119
$OWNER = "K:\apps\modulos\HERMES-CORE"
$EXE = Join-Path $env:LOCALAPPDATA "hermes\bin\hermes.exe"
if (-not (Test-Path -LiteralPath $OWNER -PathType Container)) { throw "OWNER_NOT_FOUND:$OWNER" }
function Get-OwnerListener {
  @(Get-NetTCPConnection -State Listen -LocalPort $PORT -ErrorAction SilentlyContinue)
}
function Get-WebStatus {
  try {
    $r = Invoke-WebRequest -Uri "http://127.0.0.1:$PORT/" -UseBasicParsing -TimeoutSec 3
    return [pscustomobject]@{ status = [int]$r.StatusCode; contentType = [string]$r.Headers['Content-Type'] }
  } catch {
    $r = $_.Exception.Response
    if ($r) { return [pscustomobject]@{ status = [int]$r.StatusCode; contentType = "" } }
    return $null
  }
}
$ls = @(Get-OwnerListener)
if ($Action -eq "status") {
  $web = Get-WebStatus
  Write-Output ("HERMES_WEB_PORT=9119 LISTENERS=$($ls.Count) HTTP=$($(if($web){$web.status}else{'OFFLINE'}))")
  Write-Output "GATEWAY_EXISTENTE=nao_alterado"
  exit 0
}
if ($Action -eq "start") {
  if ($ls.Count -gt 0) {
    $web = Get-WebStatus
    if ($web) {
      Write-Output "ALREADY_RUNNING:9119 HTTP=$($web.status) PID=$($ls[0].OwningProcess)"
      exit 0
    }
    throw "PORT_9119_OCCUPIED_UNKNOWN_OWNER"
  }
  if (-not (Test-Path -LiteralPath $EXE -PathType Leaf)) { throw "HERMES_EXECUTABLE_NOT_FOUND" }
  $localState = Join-Path $OWNER ".local-web"
  if (-not (Test-Path -LiteralPath $localState)) {
    New-Item -ItemType Directory -Path $localState -Force | Out-Null
  }
  $out = Join-Path $localState "web-stdout.log"
  $err = Join-Path $localState "web-stderr.log"
  # Reusa o Hermes instalado e seu perfil existente; K: possui somente launcher/log.
  # Unico servidor de UI; nao inicia outro gateway 8644.
  $proc = Start-Process -FilePath $EXE -ArgumentList @(
    "dashboard","--skip-build","--host","127.0.0.1","--port","9119","--no-open"
  ) -WorkingDirectory $OWNER -RedirectStandardOutput $out -RedirectStandardError $err -PassThru
  Write-Output "LAUNCHED_REQUEST_PID=$($proc.Id) TARGET=http://127.0.0.1:9119/"
  exit 0
}
# Parada cirurgica: somente PID que escuta 9119 e declara a mesma CLI.
# Nao utilizar 'hermes dashboard --stop': a CLI pararia tambem outros perfis.
if ($Action -eq "stop") {
  if ($ls.Count -eq 0) { Write-Output "ALREADY_STOPPED"; exit 0 }
  $owners = @($ls | Select-Object -ExpandProperty OwningProcess -Unique)
  foreach ($pidValue in $owners) {
    $proc = Get-CimInstance Win32_Process -Filter "ProcessId=$pidValue" -ErrorAction SilentlyContinue
    $commandLine = [string]($proc.CommandLine)
    if (-not $proc -or $proc.Name -notmatch "^(python|hermes)(\.exe)?$" -or
      $commandLine -notmatch 'dashboard' -or
      $commandLine -notmatch '\-\-port\s+9119') {
      throw "STOP_REFUSED_UNKNOWN_OWNER:$pidValue"
    }
  }
  foreach ($pidValue in $owners) {
    Stop-Process -Id $pidValue -ErrorAction Stop
    Write-Output "STOPPED_DASHBOARD_OWNER_PID=$pidValue"
  }
  Start-Sleep -Milliseconds 400
  if (@(Get-OwnerListener).Count -ne 0) {
    throw "DASHBOARD_PORT_STILL_LISTENING"
  }
  Write-Output "DASHBOARD_STOP_VERIFIED=9119"
}
