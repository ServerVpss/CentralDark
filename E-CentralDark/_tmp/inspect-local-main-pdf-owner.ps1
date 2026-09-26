$ErrorActionPreference='Stop'
$repo='E:\CentralDark\CentralDark'
Push-Location $repo
try {
  $head = git rev-parse HEAD
  $branch = git branch --show-current
  $status = git status --short
  $remote = git remote -v
  $lupaExists = Test-Path -LiteralPath (Join-Path $repo 'scripts\lupa')
  $pdfExists = Test-Path -LiteralPath (Join-Path $repo 'scripts\lupa\pdf-conformance-cc2003.mjs')
  $lupaFiles = if($lupaExists){ Get-ChildItem -LiteralPath (Join-Path $repo 'scripts\lupa') -File -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Name } else { @() }
  [pscustomobject]@{
    observed_at=(Get-Date).ToString('o')
    head=$head
    branch=$branch
    status=$status
    remote=$remote
    lupa_exists=$lupaExists
    pdf_owner_exists=$pdfExists
    lupa_files=$lupaFiles
  } | ConvertTo-Json -Depth 6
} finally { Pop-Location }