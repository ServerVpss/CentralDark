param([switch]$RestartGateway)

$ErrorActionPreference = "Stop"

$Source = Join-Path $PSScriptRoot "config.yaml"
$Target = "C:\Users\danda\AppData\Local\hermes\profiles\pivete\config.yaml"
$Stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$Backup = "$Target.pre-free-router-$Stamp.bak"

if (-not (Test-Path $Source)) { throw "CONFIG_NOVO_NAO_ENCONTRADO=$Source" }
if (-not (Test-Path $Target)) { throw "CONFIG_ATUAL_NAO_ENCONTRADO=$Target" }

Copy-Item $Target $Backup -Force
Copy-Item $Source $Target -Force

Write-Host "BACKUP=$Backup" -ForegroundColor Cyan
Write-Host "CONFIG_APLICADO=SIM" -ForegroundColor Green

$Python = Get-Command python -ErrorAction SilentlyContinue
if ($Python) {
  & python -c "import yaml,pathlib; p=pathlib.Path(r'$Target'); c=yaml.safe_load(p.read_text(encoding='utf-8')); assert isinstance(c['fallback_providers'], list) and len(c['fallback_providers'])==15; assert c['moa']['default_preset']=='free-council'; print('YAML_VALIDO=SIM'); print('FALLBACKS=15'); print('MOA=free-council')"
  if ($LASTEXITCODE -ne 0) {
    Copy-Item $Backup $Target -Force
    throw "VALIDACAO_FALHOU_CONFIG_RESTAURADO"
  }
}

if (Get-Command pivete -ErrorAction SilentlyContinue) {
  pivete fallback list
  pivete moa list
  if ($RestartGateway) {
    pivete gateway restart
    Write-Host "GATEWAY_RESTART_SOLICITADO=SIM" -ForegroundColor Cyan
  } else {
    Write-Host "ABRA_NOVA_SESSAO_PARA_APLICAR=SIM"
  }
} else {
  Write-Host "COMANDO_PIVETE_NAO_ENCONTRADO=SIM" -ForegroundColor Yellow
}

Write-Host "READY_FOR_TEST=SIM" -ForegroundColor Green
