# run_zendrive_segredo.ps1
# Launcher para captura Zendrive no perfil Segredo (Profile 15)
# Usa PowerShell 7 (pwsh) + venv Python
# Rode direto ou via .bat

$ErrorActionPreference = "Stop"

Write-Host "=== ZEN DRIVE - PERFIL SEGREDO (Profile 15) ===" -ForegroundColor Cyan
Write-Host "Direto para a sessão já aberta (conta logada)" -ForegroundColor Yellow

# Config
$env:ZENDRIVER_PROFILE = "segredo"
$env:HEADLESS = "false"

$baseDir = "E:\CentralDark\Pivete\CentralDark\apps\modulos\elite-gateway\test-local"
$pythonExe = Join-Path $baseDir ".venv\Scripts\python.exe"
$script = Join-Path $baseDir "local_send_dump.py"

# Prompt padrão (pode passar como argumento)
$defaultPrompt = "Diga APENAS 'ZENDRIVE_LOCAL_OK'. Depois diga a capital do Brasil em uma frase curta e clara."

if ($args.Count -gt 0) {
    $prompt = $args -join " "
} else {
    $prompt = $defaultPrompt
}

Write-Host "Prompt: $prompt" -ForegroundColor Gray
Write-Host "Perfil: $env:ZENDRIVER_PROFILE" -ForegroundColor Gray
Write-Host "Headless: $env:HEADLESS (false = visível)" -ForegroundColor Gray

Set-Location $baseDir

Write-Host "`nIniciando... (feche o Chrome completamente antes se der lock)" -ForegroundColor Yellow

& $pythonExe $script $prompt

Write-Host "`n=== Pronto. Verifique logs/last_messages.json ===" -ForegroundColor Green
Write-Host "Para o modo BOTH (contra): run_zendrive_both.ps1" -ForegroundColor Cyan
