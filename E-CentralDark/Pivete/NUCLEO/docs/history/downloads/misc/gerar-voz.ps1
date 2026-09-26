# CentralDark — Gerador de Voz (Windows / PowerShell)
# Uso:  .\gerar-voz.ps1 -Texto "Fala Pivete" -Voz nova
param(
  [Parameter(Mandatory=$true)][string]$Texto,
  [string]$Voz = "nova",
  [string]$Saida = "",
  [string]$Instrucoes = "Fale em portugues brasileiro nativo, tom natural e conversacional.",
  [double]$Velocidade = 1.0
)

$ErrorActionPreference = "Stop"

$Rota  = "https://kagejpghnwdfymddwxuf.supabase.co/functions/v1/audio-speech"
$Chave = "[REDIGIDO-PRESERVACAO]"

$VozesValidas = @("alloy","ash","ballad","coral","echo","fable","onyx","nova","sage","shimmer","verse","marin","cedar")
if ($VozesValidas -notcontains $Voz) {
  Write-Host "Voz invalida: $Voz" -ForegroundColor Red
  Write-Host "Validas: $($VozesValidas -join ', ')" -ForegroundColor Yellow
  exit 1
}

if ([string]::IsNullOrWhiteSpace($Saida)) {
  $Saida = "voz-$Voz-$(Get-Date -Format 'HHmmss').mp3"
}

$corpo = @{
  input           = $Texto
  voice           = $Voz
  response_format = "mp3"
  instructions    = $Instrucoes
  speed           = $Velocidade
} | ConvertTo-Json -Compress

Write-Host "Gerando com a voz '$Voz'..." -ForegroundColor Cyan
try {
  Invoke-WebRequest -Uri $Rota -Method Post `
    -Headers @{ "Content-Type" = "application/json"; "apikey" = $Chave } `
    -Body ([System.Text.Encoding]::UTF8.GetBytes($corpo)) `
    -OutFile $Saida | Out-Null
} catch {
  Write-Host "Falhou: $($_.Exception.Message)" -ForegroundColor Red
  exit 1
}

$tam = (Get-Item $Saida).Length
Write-Host "Pronto: $Saida ($([math]::Round($tam/1KB)) KB)" -ForegroundColor Green
Start-Process $Saida
