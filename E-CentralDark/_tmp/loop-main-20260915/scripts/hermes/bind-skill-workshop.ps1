[CmdletBinding()]
param(
  [string]$RepoRoot = 'E:\CentralDark\CentralDark',
  [string]$HermesHome = "$env:LOCALAPPDATA\hermes"
)
$ErrorActionPreference = 'Stop'

$source = Join-Path $RepoRoot '.agents\skills\skill-workshop'
$destRoot = Join-Path $HermesHome 'skills'
$dest = Join-Path $destRoot 'skill-workshop'

if (-not (Test-Path (Join-Path $source 'SKILL.md'))) {
  throw "SOURCE_MISSING: $source"
}
New-Item -ItemType Directory -Force -Path $destRoot | Out-Null

if (Test-Path $dest) {
  $item = Get-Item $dest -Force
  $target = @($item.Target) | Select-Object -First 1
  if ($item.LinkType -eq 'Junction' -and $target -and ((Resolve-Path $target).Path -eq (Resolve-Path $source).Path)) {
    Write-Host 'SKILL_WORKSHOP_BIND=PASS_NO_CHANGE'
    exit 0
  }
  throw "DRIFT: destino já existe e não aponta para o owner canônico: $dest"
}

New-Item -ItemType Junction -Path $dest -Target $source | Out-Null
$resolved = (Resolve-Path (Join-Path $dest 'SKILL.md')).Path
if (-not $resolved) { throw 'BIND_PROOF_FAILED' }

Write-Host 'SKILL_WORKSHOP_BIND=PASS'
Write-Host "OWNER=$source"
Write-Host "HERMES_BIND=$dest"
Write-Host 'MODE=LOAD_REFERENCE'
Write-Host 'COPY_BRAIN=false'
