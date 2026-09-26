$ErrorActionPreference = 'Stop'
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$m = 'E:\CentralDark\CentralDark\scripts\lupa\pdf-conformance-cc2003.mjs'
$r = 'E:\CentralDark\runtime\scheduled-jobs\run-scheduled-sector.ps1'
$mBackup = $m + '.bak-' + $stamp
$rBackup = $r + '.bak-' + $stamp
Copy-Item -LiteralPath $m -Destination $mBackup -Force
Copy-Item -LiteralPath $r -Destination $rBackup -Force
[pscustomobject]@{
  stamp = $stamp
  mjs_backup = $mBackup
  runner_backup = $rBackup
} | ConvertTo-Json -Compress
