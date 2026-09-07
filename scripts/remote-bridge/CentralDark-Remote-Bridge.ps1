param(
  [string]$Workdir = 'E:\CentralDark\_MAPA_CASA\GARIMPO-CHEFE',
  [int]$RetrySec = 5
)

$ErrorActionPreference = 'Continue'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$sidecar = Join-Path $root 'CentralDark-Context-Sidecar.ps1'
$receiptDir = Join-Path $Workdir 'receipts\remote-bridge'
New-Item -ItemType Directory -Force -Path $receiptDir | Out-Null
$log = Join-Path $receiptDir ("bridge-{0}.log" -f (Get-Date -Format 'yyyyMMdd-HHmmss'))

$sidecarProc = $null
if (Test-Path $sidecar) {
  $sidecarProc = Start-Process powershell.exe -ArgumentList @(
    '-NoProfile','-ExecutionPolicy','Bypass','-File',"`"$sidecar`"",'-Workdir',"`"$Workdir`""
  ) -WindowStyle Hidden -PassThru
  Add-Content $log ("[{0}] SCREENPIPE_SIDECAR_PID={1}" -f (Get-Date -Format o), $sidecarProc.Id)
}

try {
  while ($true) {
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
    Add-Content $log ("[{0}] REMOTE_MCP_EXIT={1}; retry_in={2}s" -f (Get-Date -Format o), $exit, $RetrySec)
    Start-Sleep -Seconds ([Math]::Max($RetrySec,3))
  }
} finally {
  if ($sidecarProc -and -not $sidecarProc.HasExited) { Stop-Process -Id $sidecarProc.Id -ErrorAction SilentlyContinue }
}
