$ErrorActionPreference='Stop'
$runner = 'E:\CentralDark\runtime\scheduled-jobs\run-scheduled-sector.ps1'
& powershell.exe -NoProfile -ExecutionPolicy Bypass -File $runner -Sector PDF_GATE
exit $LASTEXITCODE
