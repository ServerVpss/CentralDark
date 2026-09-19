# run_zendrive_segredo.ps1
# CentralDark - launcher local Zendrive + handoff canonico.
# Fluxo: captura -> Master Cycle -> RANDOLF/Hub -> Central de Notificacoes.
# UNKNOWN != PASS. Nenhuma etapa imprime FIXED_POINT sem receipt do bridge.

$ErrorActionPreference = "Stop"

$baseDir = Split-Path -Parent $PSCommandPath
$localPython = Join-Path $baseDir ".venv\Scripts\python.exe"
$captureScript = Join-Path $baseDir "local_send_dump.py"
$bridgeScript = Join-Path $baseDir "zendrive_gateway_bridge.py"
$chromePath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$chromeUserDataDir = "C:\Users\danda\AppData\Local\Google\Chrome\User Data"
$chromeProfileDirectory = "Profile 15"

$env:ZENDRIVER_PROFILE = "segredo"
$env:HEADLESS = "false"
$env:ATTACH_PORT = "9222"
if (-not $env:CENTRALDARK_SOURCE_SURFACE) { $env:CENTRALDARK_SOURCE_SURFACE = "HERMES_DESKTOP_ZENDRIVE" }
if (-not $env:CENTRALDARK_INPUT_MODE) { $env:CENTRALDARK_INPUT_MODE = "text" }

$defaultPrompt = "Diga APENAS 'ZENDRIVE_LOCAL_OK'. Depois diga a capital do Brasil em uma frase curta e clara."
$prompt = if ($args.Count -gt 0) { $args -join " " } else { $defaultPrompt }

Write-Host "=== ZENDRIVE -> CENTRALDARK ===" -ForegroundColor Cyan
Write-Host "Superficie: $env:CENTRALDARK_SOURCE_SURFACE" -ForegroundColor Gray
Write-Host "Perfil humano: ORQUESTRACAO_SOL" -ForegroundColor Gray
if ($env:CENTRALDARK_SESSION_ID) {
    Write-Host "Sessao observada: $env:CENTRALDARK_SESSION_ID (proveniencia; nao autoridade)" -ForegroundColor Gray
} else {
    Write-Host "Sessao observada: UNKNOWN - bridge nao inventara ID" -ForegroundColor Yellow
}

if (Test-Path $localPython) {
    $pythonExe = $localPython
} else {
    $pythonCmd = Get-Command python -ErrorAction SilentlyContinue
    if (-not $pythonCmd) {
        $pythonCmd = Get-Command py -ErrorAction SilentlyContinue
    }
    if (-not $pythonCmd) {
        throw "PONTO_DESLIGADO: Python nao encontrado. Instale Python ou crie .venv em $baseDir."
    }
    $pythonExe = $pythonCmd.Source
    Write-Host "Python local .venv ausente; usando runtime do sistema: $pythonExe" -ForegroundColor Yellow
}

foreach ($required in @($captureScript, $bridgeScript, $chromePath)) {
    if (-not (Test-Path $required)) {
        throw "PONTO_DESLIGADO: arquivo obrigatorio ausente: $required"
    }
}

Set-Location $baseDir

function Test-LocalTcpPort {
    param([int]$Port)
    try {
        $tcp = New-Object System.Net.Sockets.TcpClient
        $tcp.Connect("127.0.0.1", $Port)
        $tcp.Close()
        return $true
    } catch {
        return $false
    }
}

if (-not (Test-LocalTcpPort -Port 9222)) {
    $chromeArgs = @(
        "--remote-debugging-port=9222",
        "--user-data-dir=`"$chromeUserDataDir`"",
        "--profile-directory=`"$chromeProfileDirectory`"",
        "--no-first-run",
        "--disable-default-apps",
        "https://chatgpt.com"
    )
    Start-Process -FilePath $chromePath -ArgumentList $chromeArgs -WindowStyle Normal
    Start-Sleep -Seconds 8
}

$portOpen = $false
for ($i = 0; $i -lt 10; $i++) {
    if (Test-LocalTcpPort -Port 9222) {
        $portOpen = $true
        break
    }
    Start-Sleep -Milliseconds 500
}
if (-not $portOpen) {
    Write-Host "EVIDENCIA FALTANTE: CDP 9222 nao respondeu; captura pode falhar." -ForegroundColor Yellow
}

Write-Host "`n[1/2] Captura Zendrive..." -ForegroundColor Cyan
& $pythonExe $captureScript capture --prompt $prompt
$captureExit = $LASTEXITCODE
if ($captureExit -ne 0) {
    Write-Host "QUEBRADO: captura saiu com codigo $captureExit. Handoff nao sera falsamente marcado como verde." -ForegroundColor Red
    exit $captureExit
}

Write-Host "`n[2/2] Handoff canonico: Master Cycle -> RANDOLF/Hub -> Notificacoes..." -ForegroundColor Cyan
& $pythonExe $bridgeScript
$bridgeExit = $LASTEXITCODE

switch ($bridgeExit) {
    0 {
        Write-Host "PROVADO: bridge fechou todos os pontos configurados no runtime." -ForegroundColor Green
    }
    2 {
        Write-Host "EVIDENCIA FALTANTE: codigo e rota estao ligados, mas um ou mais receipts de runtime nao fecharam." -ForegroundColor Yellow
    }
    default {
        Write-Host "QUEBRADO: handoff falhou com codigo $bridgeExit." -ForegroundColor Red
    }
}

Write-Host "`nReceipts locais:" -ForegroundColor Gray
Write-Host "- logs/last_messages.json" -ForegroundColor Gray
Write-Host "- saida JSON centraldark.zendrive-handoff.v1 acima" -ForegroundColor Gray
Write-Host "Regra: SOURCE_COMMITTED != RUNTIME_PROVEN; UNKNOWN != PASS." -ForegroundColor Gray

exit $bridgeExit
