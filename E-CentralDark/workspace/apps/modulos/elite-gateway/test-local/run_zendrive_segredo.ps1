# run_zendrive_segredo.ps1
# CentralDark — launcher local Zendrive + handoff canônico.
# Fluxo: captura → Master Cycle → RANDOLF/Hub → Central de Notificações.
# UNKNOWN != PASS. Nenhuma etapa imprime FIXED_POINT sem receipt do bridge.

$ErrorActionPreference = "Stop"

$baseDir = "E:\CentralDark\Pivete\CentralDark\apps\modulos\elite-gateway\test-local"
$pythonExe = Join-Path $baseDir ".venv\Scripts\python.exe"
$captureScript = Join-Path $baseDir "local_send_dump.py"
$bridgeScript = Join-Path $baseDir "zendrive_gateway_bridge.py"
$chromePath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$profilePath = "C:\Users\danda\AppData\Local\Google\Chrome\User Data\Profile 15"

$env:ZENDRIVER_PROFILE = "segredo"
$env:HEADLESS = "false"
$env:ATTACH_PORT = "9222"
if (-not $env:CENTRALDARK_SOURCE_SURFACE) { $env:CENTRALDARK_SOURCE_SURFACE = "HERMES_DESKTOP_ZENDRIVE" }
if (-not $env:CENTRALDARK_INPUT_MODE) { $env:CENTRALDARK_INPUT_MODE = "text" }

$defaultPrompt = "Diga APENAS 'ZENDRIVE_LOCAL_OK'. Depois diga a capital do Brasil em uma frase curta e clara."
$prompt = if ($args.Count -gt 0) { $args -join " " } else { $defaultPrompt }

Write-Host "=== ZENDRIVE → CENTRALDARK ===" -ForegroundColor Cyan
Write-Host "Superfície: $env:CENTRALDARK_SOURCE_SURFACE" -ForegroundColor Gray
Write-Host "Perfil humano: 😎 Orquestração SOL 🌞" -ForegroundColor Gray
if ($env:CENTRALDARK_SESSION_ID) {
    Write-Host "Sessão observada: $env:CENTRALDARK_SESSION_ID (proveniência; não autoridade)" -ForegroundColor Gray
} else {
    Write-Host "Sessão observada: UNKNOWN — bridge não inventará ID" -ForegroundColor Yellow
}

foreach ($required in @($pythonExe, $captureScript, $bridgeScript, $chromePath)) {
    if (-not (Test-Path $required)) {
        throw "PONTO_DESLIGADO: arquivo obrigatório ausente: $required"
    }
}

Set-Location $baseDir

# Detecta o Chrome sem depender de CommandLine em Get-Process (não é propriedade confiável).
$runningChrome = Get-Process chrome -ErrorAction SilentlyContinue
if (-not $runningChrome) {
    $chromeArgs = @(
        "--remote-debugging-port=9222",
        "--user-data-dir=`"$profilePath`"",
        "--profile-directory=`"Profile 15`"",
        "--no-first-run",
        "--disable-default-apps",
        "https://chatgpt.com"
    )
    Start-Process -FilePath $chromePath -ArgumentList $chromeArgs -WindowStyle Normal
    Start-Sleep -Seconds 8
}

$portOpen = $false
for ($i = 0; $i -lt 10; $i++) {
    try {
        $tcp = New-Object System.Net.Sockets.TcpClient
        $tcp.Connect("127.0.0.1", 9222)
        $tcp.Close()
        $portOpen = $true
        break
    } catch {
        Start-Sleep -Milliseconds 500
    }
}
if (-not $portOpen) {
    Write-Host "EVIDÊNCIA FALTANTE: CDP 9222 não respondeu; captura pode falhar." -ForegroundColor Yellow
}

Write-Host "`n[1/2] Captura Zendrive..." -ForegroundColor Cyan
& $pythonExe $captureScript $prompt
$captureExit = $LASTEXITCODE
if ($captureExit -ne 0) {
    Write-Host "QUEBRADO: captura saiu com código $captureExit. Handoff não será falsamente marcado como verde." -ForegroundColor Red
    exit $captureExit
}

Write-Host "`n[2/2] Handoff canônico: Master Cycle → RANDOLF/Hub → Notificações..." -ForegroundColor Cyan
& $pythonExe $bridgeScript
$bridgeExit = $LASTEXITCODE

switch ($bridgeExit) {
    0 {
        Write-Host "PROVADO: bridge fechou todos os pontos configurados no runtime." -ForegroundColor Green
    }
    2 {
        Write-Host "EVIDÊNCIA FALTANTE: código e rota estão ligados, mas um ou mais receipts de runtime não fecharam." -ForegroundColor Yellow
    }
    default {
        Write-Host "QUEBRADO: handoff falhou com código $bridgeExit." -ForegroundColor Red
    }
}

Write-Host "`nReceipts locais:" -ForegroundColor Gray
Write-Host "- logs/last_messages.json" -ForegroundColor Gray
Write-Host "- saída JSON centraldark.zendrive-handoff.v1 acima" -ForegroundColor Gray
Write-Host "Regra: SOURCE_COMMITTED != RUNTIME_PROVEN; UNKNOWN != PASS." -ForegroundColor Gray

exit $bridgeExit
