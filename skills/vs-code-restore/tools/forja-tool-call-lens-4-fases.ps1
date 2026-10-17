#requires -Version 5.1
<#
.SYNOPSIS
  CentralDark Forja: CONSTRUIR -> INSTALAR -> CONECTAR -> PROVAR.
.DESCRIPTION
  Usa apenas owners existentes (ZENDRIVE, MCP, Cockpit). Executar na Casa.
  Faz instalacao LOCAL de VSIX apenas apos build e gates positivos.
  Nao altera main/VPS, chaves, Tailscale ACL, git index nem servicos.
  Estado de autenticação/fluxo Tool Call Lens precisa de teste E2E autorizado.
.EXAMPLE
  pwsh -NoProfile -File K:\skills\vs-code-restore\tools\forja-tool-call-lens-4-fases.ps1
#>
[CmdletBinding()]
param(
  [string]$Root = 'K:\',
  [string]$SshAlias = 'segredo-vpss',
  [switch]$NoInstall
)
$ErrorActionPreference = 'Stop'
$started = (Get-Date).ToUniversalTime().ToString('o')
$receipt = [ordered]@{
  schema = 'centraldark.forja.toolcall-lens.v1'
  startedAt = $started
  root = $Root
  mode = 'CASA_LOCAL_ONLY'
  phases = @()
  e2e = 'UNKNOWN'
  published = $false
}
$outDir = Join-Path ([IO.Path]::GetTempPath()) 'CentralDark-Forja-Lens'
New-Item -ItemType Directory -Path $outDir -Force | Out-Null
$outFile = Join-Path $outDir ('toolcall-lens-' + (Get-Date -Format 'yyyyMMdd-HHmmss') + '.json')
function Phase([string]$name, [scriptblock]$body) {
  $entry = [ordered]@{ phase = $name; state = 'RUNNING'; detail = ''; measuredAt = '' }
  try {
    $detail = & $body
    $entry.state = 'PASS'
    $entry.detail = [string]$detail
    Write-Host ("PASS " + $name + " - " + $entry.detail)
  } catch {
    $entry.state = 'BLOCKED'
    $entry.detail = $_.Exception.Message
    Write-Warning ($name + ': ' + $entry.detail)
  }
  $entry.measuredAt = (Get-Date).ToUniversalTime().ToString('o')
  $script:receipt.phases += [pscustomobject]$entry
  return ($entry.state -eq 'PASS')
}
function ExecChecked([string]$command,[string[]]$arguments,[string]$workingDir) {
  Push-Location -LiteralPath $workingDir
  try {
    & $command @arguments
    if ($LASTEXITCODE -ne 0) { throw ("EXIT_" + $LASTEXITCODE + " " + $command) }
  } finally { Pop-Location }
}
$extDir = Join-Path $Root 'skills\vs-code-restore'
$mcpDir = Join-Path $Root 'apps\modulos\mcp'
$uiDir = Join-Path $Root 'apps\instinto-superior'
$pkg = Join-Path $extDir 'package.json'
$vsix = Join-Path $outDir 'centraldark-vscode-restore-0.1.4.vsix'
$ready = Phase '01_CONSTRUIR' {
  foreach ($f in @(
    $pkg,
    (Join-Path $extDir 'src\extension.ts'),
    (Join-Path $mcpDir 'src\admin.js'),
    (Join-Path $mcpDir 'tests\tool-call-observability.test.mjs'),
    (Join-Path $uiDir 'src\components\central\ObservabilidadeCentralDark.tsx')
  )) {
    if (-not (Test-Path -LiteralPath $f)) { throw 'SOURCE_MISSING: ' + $f }
  }
  $p = Get-Content -LiteralPath $pkg -Raw | ConvertFrom-Json
  if ($p.version -ne '0.1.4') { throw 'ZENDRIVE_SOURCE_NOT_0.1.4' }
  if (-not ((Get-Content -LiteralPath (Join-Path $mcpDir 'src\admin.js') -Raw).Contains('toolLensRegistrar'))) {
    throw 'MCP_TOOL_LENS_SOURCE_NOT_IN_CASA'
  }
  if (-not ((Get-Content -LiteralPath (Join-Path $uiDir 'src\components\central\ObservabilidadeCentralDark.tsx') -Raw).Contains('ToolCallLensMcp'))) {
    throw 'COCKPIT_TOOL_LENS_SOURCE_NOT_IN_CASA'
  }
  ExecChecked 'node' @('--check','src/admin.js') $mcpDir
  ExecChecked 'node' @('--test','tests/tool-call-observability.test.mjs') $mcpDir
  ExecChecked 'npm.cmd' @('ci','--ignore-scripts') $extDir
  ExecChecked 'npm.cmd' @('run','compile') $extDir
  ExecChecked 'npx.cmd' @('--yes','@vscode/vsce','package','--out',$vsix) $extDir
  ExecChecked 'npm.cmd' @('run','verify:hud') $uiDir
  ExecChecked 'npm.cmd' @('run','build') $uiDir
  if (-not (Test-Path -LiteralPath $vsix)) { throw 'VSIX_MISSING' }
  'NODE_MCP_TEST + TSC + VSIX + HUD_TEST + COCKPIT_BUILD'
}
$installed = $false
if ($ready) {
  if ($NoInstall) {
    $receipt.phases += [pscustomobject]@{ phase='02_INSTALAR'; state='SKIPPED'; detail='NoInstall escolhido'; measuredAt=(Get-Date).ToUniversalTime().ToString('o') }
  } else {
    $installed = Phase '02_INSTALAR' {
      $code = Get-Command 'code.cmd' -ErrorAction SilentlyContinue
      if (-not $code) { $code = Get-Command 'code' -ErrorAction SilentlyContinue }
      if (-not $code) { throw 'VS_CODE_CLI_MISSING' }
      & $code.Source --install-extension $vsix
      if ($LASTEXITCODE -ne 0) { throw 'VSIX_INSTALL_FAILED' }
      $present = & $code.Source --list-extensions --show-versions
      if ($LASTEXITCODE -ne 0 -or -not ($present -match '(?im)^centraldark\.centraldark-vscode-restore@0\.1\.4\s*$')) {
        throw 'VSIX_VERSION_READBACK_MISSING'
      }
      'VSIX_VERSION_0.1.4_VISIBLE'
    }
  }
}
$connected = $false
if ($installed) {
  $connected = Phase '03_CONECTAR' {
    $ssh = Get-Command ssh.exe -ErrorAction SilentlyContinue
    if (-not $ssh) { $ssh = Get-Command ssh -ErrorAction SilentlyContinue }
    if (-not $ssh) { throw 'SSH_CLI_MISSING' }
    if ($SshAlias -notmatch '^[a-zA-Z0-9._-]+$') { throw 'INVALID_SSH_ALIAS' }
    $remote = & $ssh.Source -o 'BatchMode=yes' -o 'StrictHostKeyChecking=yes' -o 'ConnectTimeout=8' $SshAlias "printf 'CENTRALDARK_SSH_READBACK_OK\n'"
    if ($LASTEXITCODE -ne 0 -or $remote -notcontains 'CENTRALDARK_SSH_READBACK_OK') {
      throw 'SSH_REMOTE_READBACK_FAILED'
    }
    $r = Invoke-WebRequest -Uri 'http://127.0.0.1:3000/' -UseBasicParsing -TimeoutSec 8
    if ($r.StatusCode -ne 200) { throw 'COCKPIT_HTTP_NOT_200' }
    'SSH_AUTH_OK + COCKPIT_HTTP_200'
  }
}
if ($connected) {
  $null = Phase '04_PROVAR' {
    # Instalação local + SSH + HTTP não equivalem a RECEIPT de tools/call.
    # E2E autenticado depende do contexto autorizado do Cockpit/MCP.
    $receipt.e2e = 'AWAITING_AUTHORIZED_CALL_ID_AND_COCKPIT_UI_READBACK'
    throw 'E2E_TOOL_CALL_NOT_MEASURED: verificar call_id real no Admin e no Cockpit'
  }
}
if (-not $ready) {
  foreach ($name in @('02_INSTALAR','03_CONECTAR','04_PROVAR')) {
    $receipt.phases += [pscustomobject]@{phase=$name;state='BLOCKED';detail='PREVIOUS_GATE_BLOCKED';measuredAt=(Get-Date).ToUniversalTime().ToString('o')}
  }
} elseif (-not $installed) {
  foreach ($name in @('03_CONECTAR','04_PROVAR')) {
    $receipt.phases += [pscustomobject]@{phase=$name;state='BLOCKED';detail='PREVIOUS_GATE_BLOCKED';measuredAt=(Get-Date).ToUniversalTime().ToString('o')}
  }
} elseif (-not $connected) {
  $receipt.phases += [pscustomobject]@{phase='04_PROVAR';state='BLOCKED';detail='PREVIOUS_GATE_BLOCKED';measuredAt=(Get-Date).ToUniversalTime().ToString('o')}
}
$receipt.endedAt = (Get-Date).ToUniversalTime().ToString('o')
$receipt | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $outFile -Encoding UTF8
Write-Host ('RECIBO=' + $outFile)
if (@($receipt.phases | Where-Object {$_.state -ne 'PASS'}).Count -gt 0) { exit 3 }
exit 0
