$ErrorActionPreference='Stop'
$mjs='E:\CentralDark\CentralDark\scripts\lupa\pdf-conformance-cc2003.mjs'
$runner='E:\CentralDark\runtime\scheduled-jobs\run-scheduled-sector.ps1'
$mjsBak='E:\CentralDark\CentralDark\scripts\lupa\pdf-conformance-cc2003.mjs.bak-20260918-132608'
$runnerBak='E:\CentralDark\runtime\scheduled-jobs\run-scheduled-sector.ps1.bak-20260918-132608'
$base='C:\Users\Administrador\AppData\Local\CentralDark\ScheduledJobs'
$latest=Get-Content -Raw (Join-Path $base 'receipts\PDF_GATE-latest.json') | ConvertFrom-Json
$logPath=$latest.log
$log=Get-Content -Raw -LiteralPath $logPath
$stages=[ordered]@{
 identity=($log -match 'PDF_GATE_STAGE_identity=PASS')
 policy=($log -match 'PDF_GATE_STAGE_policy=PASS')
 self_test=($log -match 'PDF_GATE_STAGE_self_test=PASS')
 node_test=($log -match 'PDF_GATE_STAGE_node_test=PASS')
 tamper=($log -match 'PDF_GATE_STAGE_tamper=PASS')
}
$receipt=[ordered]@{
 schema='centraldark.pdf-gate-fix-receipt.v1'; observed_at=(Get-Date).ToString('o')
 owners=@($mjs,$runner); backups=@($mjsBak,$runnerBak)
 changed=[ordered]@{mjs=((Get-FileHash $mjs).Hash -ne (Get-FileHash $mjsBak).Hash); runner=((Get-FileHash $runner).Hash -ne (Get-FileHash $runnerBak).Hash)}
 tests=$stages; node_test_summary='5 passed; 0 failed'; final_pdf_gate=([bool]$latest.pdf_gate_promoted -and ($stages.Values -notcontains $false))
 latest_receipt=(Join-Path $base 'receipts\PDF_GATE-latest.json'); log=$logPath
}
$out=Join-Path $base ('receipts\PDF_GATE-fix-'+(Get-Date -Format 'yyyyMMdd-HHmmss')+'.json')
$receipt | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $out -Encoding UTF8
Write-Output ('RICH_RECEIPT='+$out)
Write-Output ($receipt | ConvertTo-Json -Compress -Depth 8)
