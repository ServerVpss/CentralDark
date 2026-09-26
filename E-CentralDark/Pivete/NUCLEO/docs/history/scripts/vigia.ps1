<#
  ============================================================
  CentralDark - VIGIA (modo watch)  (Windows)
  scripts\vigia.ps1
  ------------------------------------------------------------
  Fica rodando e regenera o painel a cada N segundos.
  Deixe esta janela aberta e o painel aberto no navegador:
  voce ve o Hermes trabalhando quase ao vivo.
  Ctrl + C para parar.
  ============================================================
#>
[CmdletBinding()]
param([int]$Segundos = 30)

$Raiz = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Write-Host ""
Write-Host "  VIGIA LIGADO - atualizando o painel a cada $Segundos s" -ForegroundColor Green
Write-Host "  Ctrl + C para parar" -ForegroundColor DarkGray
Write-Host ""

while ($true) {
  try { & (Join-Path $Raiz "scripts\gerar-painel.ps1") }
  catch { Write-Host ("  erro: " + $_.Exception.Message) -ForegroundColor Red }
  Start-Sleep -Seconds $Segundos
}
