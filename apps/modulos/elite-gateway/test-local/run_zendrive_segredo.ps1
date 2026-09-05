$ErrorActionPreference = 'Stop'
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$python = Join-Path $here '.venv\Scripts\python.exe'
if (-not (Test-Path $python)) { $python = 'python' }
$env:ZENDRIVER_PROFILE = 'segredo'
$env:HEADLESS = 'false'
Push-Location $here
try {
  & $python 'local_send_dump.py' 'zendrive_specialized'
  exit $LASTEXITCODE
}
finally {
  Pop-Location
}
