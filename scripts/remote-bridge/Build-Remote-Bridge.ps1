param(
  [string]$OutDir = (Join-Path $PSScriptRoot 'canonical\dist'),
  [switch]$OpenAfterBuild
)

# #OBSERVACOES#
# @owner scripts/remote-bridge/Build-Remote-Bridge.ps1
# @doc_ref scripts/remote-bridge/CORPO-UNICO-CAPACIDADES.md
# @last_updated 2026-11-08T23:58:29Z
# @implementado wrapper relativo para o builder canonico, sem dependencia do drive K:
# @estado SOURCE_READY_RUNTIME_PENDING
# @next_cursor compilar CentralDark-Remote-Bridge.exe e executar --self-test

$ErrorActionPreference = 'Stop'
$builder = Join-Path $PSScriptRoot 'canonical\Build-Remote-Bridge.ps1'

if (-not (Test-Path -LiteralPath $builder -PathType Leaf)) {
  throw "CANONICAL_BUILDER_NOT_FOUND:$builder"
}

& $builder -OutDir $OutDir -OpenAfterBuild:$OpenAfterBuild
if ($LASTEXITCODE -ne 0) {
  exit $LASTEXITCODE
}
