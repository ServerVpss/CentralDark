# Abre Hermes Desktop (perfil pivete) + mostra handoff
# Nao injeta sessao sozinho no terminal do Electron — so prepara e abre o app.

$ErrorActionPreference = "Stop"
$handoff = "E:\CentralDark\Pivete\NUCLEO\HANDOFF-SESSAO-GROK-PARA-HERMES.md"
$desktop = "C:\Users\danda\AppData\Local\hermes\hermes-agent\apps\desktop\release\win-unpacked\Hermes.exe"
$py = "C:\Users\danda\AppData\Local\hermes\hermes-agent\venv\Scripts\python.exe"
$agent = "C:\Users\danda\AppData\Local\hermes\hermes-agent"

Write-Host "=== HANDOFF ===" -ForegroundColor Cyan
Write-Host $handoff
if (Test-Path $handoff) {
  Write-Host "(arquivo OK)"
} else {
  Write-Host "ERRO: handoff nao encontrado" -ForegroundColor Red
  exit 1
}

# Abre handoff no notepad pra copiar/colar no Hermes se precisar
Start-Process notepad.exe $handoff

# Abre app desktop
if (Test-Path $desktop) {
  Write-Host "Abrindo Hermes Desktop..." -ForegroundColor Green
  Start-Process $desktop
} else {
  Write-Host "Desktop exe nao encontrado: $desktop" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "No Hermes Desktop:" -ForegroundColor Cyan
Write-Host "  1. Abra o terminal/chat do app"
Write-Host "  2. Confirme profile pivete se pedir"
Write-Host "  3. Cole a 'Primeira mensagem sugerida' do handoff (Notepad ja abriu)"
Write-Host ""
Write-Host "Opcional CLI (outra janela, profile pivete + prompt inicial):"
Write-Host "  cd $agent"
Write-Host "  .\venv\Scripts\python.exe -m hermes_cli.main --profile pivete chat -z `"Li o handoff em $handoff. Continua a sessao do Grok com o Pivete. Casa primeiro.`""
Write-Host ""
Write-Host "Pronto. Conversa la no Hermes."
