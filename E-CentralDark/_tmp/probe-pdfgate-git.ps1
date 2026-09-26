$ErrorActionPreference='SilentlyContinue'
Set-Location 'E:\CentralDark\CentralDark'
[pscustomobject]@{
  pwd=(Get-Location).Path
  branch=(git branch --show-current 2>$null)
  head=(git rev-parse HEAD 2>$null)
  origin_main=(git rev-parse origin/main 2>$null)
  status=(git status --short 2>$null)
  lupa_exists=(Test-Path -LiteralPath 'scripts\lupa')
  pdf_exists=(Test-Path -LiteralPath 'scripts\lupa\pdf-conformance-cc2003.mjs')
  backups=(Get-ChildItem -LiteralPath 'scripts\lupa' -Filter 'pdf-conformance-cc2003.mjs.bak-*' -ErrorAction SilentlyContinue | Select-Object -ExpandProperty FullName)
}|ConvertTo-Json -Depth 5