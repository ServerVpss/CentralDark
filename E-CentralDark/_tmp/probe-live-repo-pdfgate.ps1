$ErrorActionPreference='SilentlyContinue'
Set-Location 'E:\CentralDark\CentralDark\CentralDark'
[pscustomobject]@{
  repo=(Get-Location).Path
  branch=(git branch --show-current)
  head=(git rev-parse HEAD)
  origin_main=(git rev-parse origin/main)
  status=(git status --short)
  pdf_exists=(Test-Path -LiteralPath 'scripts\lupa\pdf-conformance-cc2003.mjs')
  pdf_test_exists=(Test-Path -LiteralPath 'scripts\lupa\pdf-conformance-cc2003.test.mjs')
  runner_exists=(Test-Path -LiteralPath 'E:\CentralDark\runtime\scheduled-jobs\run-scheduled-sector.ps1')
  pdf_backups=(Get-ChildItem -LiteralPath 'scripts\lupa' -Filter 'pdf-conformance-cc2003.mjs.bak-*' -ErrorAction SilentlyContinue | Select-Object -ExpandProperty FullName)
}|ConvertTo-Json -Depth 5