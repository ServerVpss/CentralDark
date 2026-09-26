$ErrorActionPreference = 'Stop'

$mjs = 'E:\CentralDark\CentralDark\scripts\lupa\pdf-conformance-cc2003.mjs'
$runner = 'E:\CentralDark\runtime\scheduled-jobs\run-scheduled-sector.ps1'
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'

Copy-Item -LiteralPath $mjs -Destination ($mjs + '.bak-' + $stamp) -Force
Copy-Item -LiteralPath $runner -Destination ($runner + '.bak-' + $stamp) -Force

Write-Host "BACKUP_OK"
Write-Host "MJS_BACKUP=$($mjs).bak-$stamp"
Write-Host "RUNNER_BACKUP=$($runner).bak-$stamp"
