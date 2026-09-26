$ErrorActionPreference='Stop'
$runner='E:\CentralDark\runtime\scheduled-jobs\run-scheduled-sector.ps1'
$repo='E:\CentralDark\CentralDark\CentralDark'
$probe=Join-Path $repo 'scripts\lupa\pdf-conformance-cc2003.mjs'
$test=Join-Path $repo 'scripts\lupa\pdf-conformance-cc2003.test.mjs'
$pdf=Join-Path $repo 'docs\CONSCIENCIA\04-MCP-E-CONECTORES\tlc23.pdf'
[pscustomobject]@{
 observed_at=(Get-Date).ToString('o')
 runner_exists=(Test-Path -LiteralPath $runner)
 probe_exists=(Test-Path -LiteralPath $probe)
 test_exists=(Test-Path -LiteralPath $test)
 canonical_pdf_exists=(Test-Path -LiteralPath $pdf)
 repo_exists=(Test-Path -LiteralPath $repo)
}|ConvertTo-Json -Compress
& powershell.exe -NoProfile -ExecutionPolicy Bypass -File $runner -Sector PDF_GATE
exit $LASTEXITCODE