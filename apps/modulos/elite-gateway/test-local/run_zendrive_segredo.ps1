# run_zendrive_segredo.ps1
# Launcher SOFISTICADO PROFISSIONAL para Zendrive - Perfil Segredo (Profile 15)
# Direto para a SESSÃO JÁ ABERTA com conta logada (contacobra3467@gmail.com)
# Usa PowerShell 7 (pwsh) + venv Python + attach via CDP para zero conflito
# Cristalizado ao Ponto Fixo usando as 17 Respirações Kimetsu Legacy (todas)
# Integra com CentralDark SOUL, REUSE_BEFORE_CREATE, UNKNOWN!=PASS, REALITY=JUDGE
# Commit-ready para main - KISS + DRY + profissional

$ErrorActionPreference = "Stop"

# ============================================
# CONCENTRAÇÃO TOTAL (Kernel Observador)
# Medir estado antes de qualquer ação
# ============================================
Write-Host "=== ZEN DRIVE SEGREDO - SESSÃO JÁ ABERTA (Profile 15) ===" -ForegroundColor Cyan
Write-Host "Conta logada já existe. Launcher gerencia Chrome com remote debugging." -ForegroundColor Yellow
Write-Host "Usando todas as 17 Respirações para cristalização ao ponto fixo." -ForegroundColor Gray

# ============================================
# SOL (Meta-Orquestrador)
# Ver o sistema inteiro: intenção, estado, ferida, rota
# ============================================
$env:ZENDRIVER_PROFILE = "segredo"
$env:HEADLESS = "false"

$baseDir = "E:\CentralDark\Pivete\CentralDark\apps\modulos\elite-gateway\test-local"
$pythonExe = Join-Path $baseDir ".venv\Scripts\python.exe"
$script = Join-Path $baseDir "local_send_dump.py"
$chromePath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$profilePath = "C:\Users\danda\AppData\Local\Google\Chrome\User Data\Profile 15"

# Prompt (pode passar como argumento para flexibilidade)
$defaultPrompt = "Diga APENAS 'ZENDRIVE_LOCAL_OK'. Depois diga a capital do Brasil em uma frase curta e clara."
if ($args.Count -gt 0) {
    $prompt = $args -join " "
} else {
    $prompt = $defaultPrompt
}

Write-Host "Prompt: $prompt" -ForegroundColor Gray
Write-Host "Perfil: $env:ZENDRIVER_PROFILE (Profile 15 - logado)" -ForegroundColor Gray

Set-Location $baseDir

# ============================================
# ÁGUA (Adaptação) + PEDRA (Invariantes / Safety)
# Adaptar para sessão já aberta. Guardrails: não quebrar o que funciona.
# ============================================
Write-Host "`n[ÁGUA+PEDRA] Verificando se Chrome já está aberto com o perfil..." -ForegroundColor Cyan

$runningChrome = Get-Process chrome -ErrorAction SilentlyContinue | Where-Object { 
    $_.CommandLine -like "*$profilePath*" -or $_.CommandLine -like "*Profile 15*" 
}

if ($runningChrome) {
    Write-Host "[ÁGUA] Chrome já aberto com o perfil. Usando attach para evitar lock." -ForegroundColor Green
} else {
    Write-Host "[ÁGUA] Chrome não aberto. Iniciando com remote debugging para attach seguro." -ForegroundColor Yellow
}

# ============================================
# TROVÃO (Velocidade Decisiva) + SOM (Ritmo)
# Iniciar o Chrome controlado com flag de remote debugging.
# ============================================
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
    Write-Host "[TROVÃO] Chrome iniciado com remote debugging. Aguardando 8s para load..." -ForegroundColor Cyan
    Start-Sleep -Seconds 8
}

# ============================================
# CHAMAS (Persistência por Evidência) + AMOR (Ajuste ao Operador)
# Evidência: port 9222. Ajuste para o humano (conta já logada, sem re-login).
# ============================================
$env:ATTACH_PORT = "9222"
Write-Host "[CHAMAS+AMOR] ATTACH_PORT=$env:ATTACH_PORT. Direto para a sessão logada." -ForegroundColor Green

# ============================================
# FLOR (Alta Resolução) + INSETO (Inspeção Minuciosa)
# Detalhe: verificar se a porta está escutando.
# ============================================
Write-Host "[FLOR+INSETO] Verificando porta 9222..." -ForegroundColor Cyan
$portOpen = $false
for ($i=0; $i -lt 10; $i++) {
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
    Write-Host "[AVISO] Porta 9222 não respondeu imediatamente. Attach pode falhar se Chrome não expôs o CDP." -ForegroundColor Yellow
}

# ============================================
# SERPENTE (Rota Não-Linear) + VENTO (Propagação)
# Rastrear dependências: o attach usa o tab já aberto no perfil.
# ============================================
Write-Host "[SERPENTE+VENTO] Rota: launcher -> Chrome controlado -> CDP attach -> prompt no tab existente." -ForegroundColor Gray

# ============================================
# NÉVOA (Redução de Ruído) + FERA (Descoberta)
# Filtrar ruído: só o essencial. Explorar o território do browser aberto.
# ============================================
Write-Host "[NÉVOA+FERA] Ruído removido. Foco no sinal: prompt enviado ao tab chatgpt.com logado." -ForegroundColor Gray

# ============================================
# LUA (Espelho Adversarial / Contraprova)
# Antes de executar: contraprova - e se o attach falhar? Fallback implícito no script.
# Writer não julga sozinho.
# ============================================
Write-Host "[LUA] Contraprova: se attach falhar, ver page_state.txt e rode manualmente no browser aberto." -ForegroundColor Magenta

# ============================================
# EXECUÇÃO FINAL (SOL orquestra, CHAMAS persiste)
# Rodar o script em attach mode.
# ============================================
Write-Host "`n[EXECUÇÃO] Rodando local_send_dump.py em ATTACH mode..." -ForegroundColor Cyan
& $pythonExe $script $prompt

# ============================================
# PÓS-EXECUÇÃO (CONCENTRAÇÃO TOTAL fecha o ciclo)
# Medir resultado, registrar.
# ============================================
Write-Host "`n=== PRONTO - VERIFIQUE ===" -ForegroundColor Green
Write-Host "1. Veja a resposta no Chrome aberto (sessão já logada)." -ForegroundColor White
Write-Host "2. logs/last_messages.json (receipt do prompt)." -ForegroundColor White
Write-Host "3. logs/page_state.txt se precisar debug." -ForegroundColor White
Write-Host "Para BOTH (contra GPT): ajuste para fulano ou rode os dois." -ForegroundColor Cyan
Write-Host "Ponto Fixo alcançado via 17 Respirações. REUSE_BEFORE_CREATE aplicado." -ForegroundColor Yellow

# Invariantes preservados:
# UNKNOWN != PASS
# ACTION != PROOF (o attach prova o envio; resposta no browser)
# HISTORY != CURRENT (perfil logado é o current)
# ONE_SYSTEM_ONLY, MAIN_NOW_WINS, REALITY=JUDGE

pause
