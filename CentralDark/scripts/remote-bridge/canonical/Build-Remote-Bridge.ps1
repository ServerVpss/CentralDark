param(
  [string]$OutDir = "$PSScriptRoot\dist",
  [switch]$OpenAfterBuild
)

# #OBSERVACOES#
# @owner scripts/remote-bridge/canonical/Build-Remote-Bridge.ps1
# @doc_ref scripts/remote-bridge/CORPO-UNICO-CAPACIDADES.md
# @last_updated 2026-11-08T23:58:29Z
# @implementado compila o motor Go existente pelo caminho relativo do owner
# @estado SOURCE_READY_RUNTIME_PENDING
# @next_cursor gerar e provar CentralDark-Remote-Bridge.exe

$ErrorActionPreference = 'Stop'
$remoteBridgeRoot = Split-Path -Parent $PSScriptRoot
$src = Join-Path $remoteBridgeRoot 'CentralDark-Remote-One.go'
$exe = Join-Path $OutDir 'CentralDark-Remote-Bridge.exe'

New-Item -ItemType Directory -Force -Path $OutDir | Out-Null

if (-not (Get-Command go -ErrorAction SilentlyContinue)) {
  throw 'GO_MISSING: instale Go no Windows ou gere o exe em uma maquina com Go. Este builder nao cria segundo app; ele compila o owner canonico CentralDark-Remote-One.go.'
}

$env:GOOS = 'windows'
$env:GOARCH = 'amd64'
& go build -trimpath -ldflags '-s -w' -o $exe $src
if ($LASTEXITCODE -ne 0) { throw "GO_BUILD_FAILED:$LASTEXITCODE" }

& $exe --self-test
if ($LASTEXITCODE -ne 0) { throw "SELF_TEST_FAILED:$LASTEXITCODE" }

Write-Host "[OK] Bridge compilado: $exe"
Write-Host '[INFO] O executavel integra: Desktop Commander Remote, Screenpipe sidecar, gh/keyring local e Tailscale Serve.'
Write-Host '[INFO] Para VSCode temporario: defina CENTRALDARK_VSCODE_TAILSCALE_PORT e CENTRALDARK_VSCODE_LOCAL_TARGET antes de abrir.'

if ($OpenAfterBuild) {
  Start-Process -FilePath $exe -WorkingDirectory (Split-Path -Parent $exe)
  Write-Host '[OK] Bridge aberto.'
}
