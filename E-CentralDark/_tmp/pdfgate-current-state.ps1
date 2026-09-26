$ErrorActionPreference='Stop'
$mjs='E:\CentralDark\CentralDark\scripts\lupa\pdf-conformance-cc2003.mjs'
$runner='E:\CentralDark\runtime\scheduled-jobs\run-scheduled-sector.ps1'
[pscustomobject]@{
 observed_at=(Get-Date).ToString('o')
 mjs_sha=(Get-FileHash -Algorithm SHA256 -LiteralPath $mjs).Hash.ToLowerInvariant()
 runner_sha=(Get-FileHash -Algorithm SHA256 -LiteralPath $runner).Hash.ToLowerInvariant()
 mjs_backups=@(Get-ChildItem -LiteralPath (Split-Path $mjs) -Filter ((Split-Path $mjs -Leaf)+'.bak-*') | Sort-Object LastWriteTime -Descending | Select-Object -First 5 FullName,Length,LastWriteTime)
 runner_backups=@(Get-ChildItem -LiteralPath (Split-Path $runner) -Filter ((Split-Path $runner -Leaf)+'.bak-*') | Sort-Object LastWriteTime -Descending | Select-Object -First 5 FullName,Length,LastWriteTime)
 latest_receipt=if(Test-Path "$env:LOCALAPPDATA\CentralDark\ScheduledJobs\receipts\PDF_GATE-latest.json"){Get-Content -Raw "$env:LOCALAPPDATA\CentralDark\ScheduledJobs\receipts\PDF_GATE-latest.json"}else{$null}
}|ConvertTo-Json -Depth 7
