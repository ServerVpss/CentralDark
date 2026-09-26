param(
  [string]$Folder = (Get-Location).Path,
  [string]$OutDir = ""
)

$ErrorActionPreference = "Stop"
if ([string]::IsNullOrWhiteSpace($OutDir)) {
  $OutDir = Join-Path $Folder "_CentralDark_Duas_Camadas"
}

function Get-OnePackage([string[]]$Patterns, [string]$Exclude = "") {
  $hits = @()
  foreach ($p in $Patterns) {
    $hits += Get-ChildItem -LiteralPath $Folder -Filter $p -File -ErrorAction SilentlyContinue
  }
  if ($Exclude) { $hits = $hits | Where-Object { $_.Name -notlike $Exclude } }
  $hits = $hits | Sort-Object LastWriteTime -Descending -Unique
  if (-not $hits -or $hits.Count -lt 1) { throw "Pacote não encontrado: $($Patterns -join ', ')" }
  return $hits[0]
}

$base = Get-OnePackage @("CentralDark_Deploy_Package_2026-08-20*.zip") "*Package_2*"
$delta = Get-OnePackage @("CentralDark_Deploy_Package_2_2026-08-20.zip")

Write-Host "BASE : $($base.FullName)"
Write-Host "DELTA: $($delta.FullName)"
Write-Host "OUT  : $OutDir"

if (Test-Path $OutDir) {
  $stamp = Get-Date -Format "yyyyMMdd-HHmmss"
  Rename-Item -LiteralPath $OutDir -NewName ("_CentralDark_Duas_Camadas.backup-" + $stamp)
}
New-Item -ItemType Directory -Path $OutDir | Out-Null

$baseOut = Join-Path $OutDir "BASE"
$deltaOut = Join-Path $OutDir "DELTA"
Expand-Archive -LiteralPath $base.FullName -DestinationPath $baseOut -Force
Expand-Archive -LiteralPath $delta.FullName -DestinationPath $deltaOut -Force

$baseHash = (Get-FileHash -Algorithm SHA256 -LiteralPath $base.FullName).Hash.ToLower()
$deltaHash = (Get-FileHash -Algorithm SHA256 -LiteralPath $delta.FullName).Hash.ToLower()

$prompt = Get-ChildItem -Path $deltaOut -Recurse -Filter "00-SUPER-PROMPT.md" | Select-Object -First 1
$contract = Get-ChildItem -Path $deltaOut -Recurse -Filter "13-execution-contract.yaml" | Select-Object -First 1
$snapshot = Get-ChildItem -Path $deltaOut -Recurse -Filter "12-live-snapshot.yaml" | Select-Object -First 1

$mission = Join-Path $OutDir "MISSION-MERGED.md"
@"
# CENTRALDARK — MISSÃO MESCLADA / DUAS CAMADAS

BASE_ZIP=$($base.Name)
BASE_SHA256=$baseHash
DELTA_ZIP=$($delta.Name)
DELTA_SHA256=$deltaHash

## REGRA
Base + delta são material de missão.
Canônico GitHub + runtime medido são o Judge atual.
O delta NÃO concede deploy/restart/mutação de produção.

## SUPER PROMPT
$(Get-Content -Raw -LiteralPath $prompt.FullName)

## CONTRATO DE EXECUÇÃO
$(Get-Content -Raw -LiteralPath $contract.FullName)

## SNAPSHOT HISTÓRICO PARA RECONCILIAÇÃO
$(Get-Content -Raw -LiteralPath $snapshot.FullName)
"@ | Set-Content -LiteralPath $mission -Encoding UTF8

$receipt = [ordered]@{
  schema = "centraldark.two-packages.prepare.v1"
  prepared_at = (Get-Date).ToString("o")
  base = [ordered]@{ file=$base.Name; sha256=$baseHash }
  delta = [ordered]@{ file=$delta.Name; sha256=$deltaHash }
  output = $OutDir
  mission_file = $mission
  production_mutation_executed = $false
  agent_execution_executed = $false
}
$receipt | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath (Join-Path $OutDir "PREPARE-RECEIPT.json") -Encoding UTF8

Write-Host ""
Write-Host "OK: duas camadas preparadas." -ForegroundColor Green
Write-Host "Missão: $mission" -ForegroundColor Cyan
Write-Host "Nenhum deploy/restart/agente foi disparado." -ForegroundColor Yellow
Write-Host ""
Write-Host "Próximo passo: abra MISSION-MERGED.md no agente autorizado."
