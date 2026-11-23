param(
  [string]$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
)

$ErrorActionPreference = 'Stop'
$AppRoot = Join-Path $RepoRoot 'apps\modulos\Bolt\source'
$ReceiptDir = Join-Path $AppRoot 'dist'

if (-not (Test-Path $AppRoot)) { throw "CENTRALDARK_APP_ROOT_MISSING=$AppRoot" }
if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) { throw 'PNPM_NOT_FOUND' }

Push-Location $AppRoot
try {
  Write-Host '#ACORDAR → INSTALLER_PREFLIGHT'
  pnpm install --frozen-lockfile
  pnpm test:centraldark-desktop
  pnpm centraldark:build:win

  $setup = Get-ChildItem $ReceiptDir -Filter 'CentralDark-Setup-*.exe' | Sort-Object LastWriteTime -Descending | Select-Object -First 1
  if (-not $setup) { throw 'CENTRALDARK_SETUP_EXE_MISSING' }

  $latest = Get-ChildItem $ReceiptDir -Filter 'latest*.yml' | Sort-Object LastWriteTime -Descending | Select-Object -First 1
  if (-not $latest) { throw 'CENTRALDARK_UPDATE_METADATA_MISSING' }

  $hash = (Get-FileHash $setup.FullName -Algorithm SHA256).Hash.ToLowerInvariant()
  $receipt = @(
    'INSTALLER_CONTRACT=PASS',
    "CENTRALDARK_SETUP=$($setup.FullName)",
    "CENTRALDARK_SETUP_SHA256=$hash",
    "AUTO_UPDATE_METADATA=$($latest.FullName)",
    'INSTALLER_OWNER=electron-builder.yml',
    'UPDATER_OWNER=electron/main/utils/auto-update.ts'
  )
  $receipt | Set-Content -Encoding utf8 (Join-Path $ReceiptDir 'INSTALLER-RECEIPT.txt')
  "$hash  $($setup.Name)" | Set-Content -Encoding ascii (Join-Path $ReceiptDir 'SHA256SUMS.txt')
  $receipt | ForEach-Object { Write-Host $_ }
}
finally {
  Pop-Location
}
