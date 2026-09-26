$ErrorActionPreference = 'Stop'
$root = 'E:\CentralDark'
$src = Join-Path $root 'Pivete\CentralDark'
$dst = Join-Path $root 'CentralDark'
$stash = Join-Path $root '_RECONCILIADO\centraldark-root-partial-20260913'
$work = 'E:\CentralDark\_MAPA_CASA\GARIMPO-CHEFE'
$log = Join-Path $root '_RECONCILIADO\centraldark-physical-migration-20260913.log'
function Log([string]$message) { Add-Content -LiteralPath $log -Value ("$(Get-Date -Format o) $message") }
try {
  Log 'START'
  cmd /c taskkill /F /T /PID 44480 | Out-Null
  Start-Sleep -Seconds 3
  Move-Item -LiteralPath $dst -Destination $stash -ErrorAction Stop
  cmd /c move "E:\CentralDark\Pivete\CentralDark" "E:\CentralDark\CentralDark" | Out-Null
  if (-not (Test-Path -LiteralPath $dst)) { throw 'MOVE_BLOCKED_AFTER_RELAY_STOP' }
  cmd /c mklink /J "E:\CentralDark\Pivete\CentralDark" "E:\CentralDark\CentralDark" | Out-Null
  $sidecar = Join-Path $dst 'scripts\remote-bridge\CentralDark-Context-Sidecar.ps1'
  if (Test-Path -LiteralPath $sidecar) {
    Start-Process powershell.exe -ArgumentList @('-NoProfile','-ExecutionPolicy','Bypass','-File',$sidecar,'-Workdir',$work) -WindowStyle Hidden
  }
  Start-Process cmd.exe -ArgumentList '/c','npx -y @wonderwhy-er/desktop-commander@latest remote' -WorkingDirectory $dst -WindowStyle Hidden
  Log ('SUCCESS HEAD=' + (& git -C $dst rev-parse HEAD))
} catch {
  $reason = $_.Exception.Message
  Log ('FAIL ' + $reason)
  if (-not (Test-Path -LiteralPath $dst) -and (Test-Path -LiteralPath $stash)) {
    Move-Item -LiteralPath $stash -Destination $dst -ErrorAction SilentlyContinue
  }
  if (Test-Path -LiteralPath $src) {
    Start-Process cmd.exe -ArgumentList '/c','npx -y @wonderwhy-er/desktop-commander@latest remote' -WorkingDirectory $src -WindowStyle Hidden
  }
} finally {
  Unregister-ScheduledTask -TaskName 'CentralDarkPhysicalMigration20260913' -Confirm:$false -ErrorAction SilentlyContinue
}
