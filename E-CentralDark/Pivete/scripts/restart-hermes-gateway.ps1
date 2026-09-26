<#
.SYNOPSIS
    Reinicializa o Hermes Agent Gateway / Dashboard após falha ou erro.
.DESCRIPTION
    Mata processos hermes.exe e python.exe associados ao gateway,
    aguarda release da porta 8787, e sobe o gateway de novo.
    Testa /health após subir e reporta resultado.
.NOTES
    - Requer privilégios de usuário (não admin) para matar processos próprios.
    - Usa o caminho do venv do hermes para o executável.
#>

$ErrorActionPreference = "Stop"
$HERMES_BIN = "C:\Users\danda\AppData\Local\hermes\hermes-agent\venv\Scripts\hermes.exe"
$HEALTH_URL = "http://localhost:8787/health"
$PORT = 8787
$MAX_WAIT = 30  # segundos para a porta liberar

function Write-Status([string]$Message) {
    $ts = Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ"
    Write-Host "[$ts] $Message"
}

function Test-PortOpen {
    $tcp = New-Object System.Net.Sockets.TcpClient
    try {
        $tcp.Connect("127.0.0.1", $PORT)
        $tcp.Close()
        return $true
    } catch {
        return $false
    }
}

function Stop-HermesGateway {
    Write-Status "Parando processos Hermes Gateway..."

    # Mata processos python.exe que estejam ouvindo na porta 8787
    $pythonPids = Get-NetTCPConnection -LocalPort $PORT -State Listen -ErrorAction SilentlyContinue |
        ForEach-Object { $_.OwningProcess } |
        Sort-Object -Unique

    if ($pythonPids) {
        foreach ($pid in $pythonPids) {
            Write-Status "Matando PID $pid (python.exe na porta $PORT)..."
            Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
        }
    }

    # Mata processos hermes.exe que possam estar no gateway
    $hermesPids = Get-Process -Name "hermes" -ErrorAction SilentlyContinue |
        Where-Object { $_.MainWindowTitle -eq "" -or $_.MainWindowTitle -eq $null } |
        Select-Object -First 5 -ErrorAction SilentlyContinue

    if ($hermesPids) {
        foreach ($p in $hermesPids) {
            Write-Status "Matando hermes.exe PID $($p.Id)..."
            Stop-Process -Id $p.Id -Force -ErrorAction SilentlyContinue
        }
    }

    Write-Status "Aguardando porta $PORT liberar..."
    $elapsed = 0
    while ($ elapsed -lt $MAX_WAIT) {
        if (-not (Test-PortOpen)) {
            Write-Status "Porta $PORT liberada após $($elapsed)s."
            return $true
        }
        Start-Sleep -Seconds 1
        $elapsed++
    }

    Write-Status "AVISO: porta $PORT ainda ouvindo após $($MAX_WAIT)s."
    return $false
}

function Start-HermesGateway {
    Write-Status "Iniciando Hermes Gateway via $HERMES_BIN..."

    $env:HERMES_HOME = "C:\Users\danda\.hermes"
    $env:HERMES_CONFIG_PATH = "C:\Users\danda\.hermes\config.yaml"

    $proc = Start-Process -FilePath $HERMES_BIN -ArgumentList "dashboard" `
        -PassThru -NoNewWindow -ErrorAction Stop

    Write-Status "Processo Hermes iniciado PID $($proc.Id). Aguardando subida..."

    # Aguarda até a porta 8787 ouvir ou timeout
    $elapsed = 0
    while ($elapsed -lt 45) {
        if (Test-PortOpen) {
            Write-Status "Gateway subiu na porta $PORT após $($elapsed)s."
            return $true
        }
        Start-Sleep -Seconds 2
        $elapsed += 2
    }

    Write-Status "FALHA: gateway não subiu na porta $PORT após 45s."
    return $false
}

function Test-HealthEndpoint {
    Write-Status "Verificando /health em $HEALTH_URL..."
    try {
        $response = Invoke-RestMethod -Uri $HEALTH_URL -Method Get -TimeoutSec 10 -ErrorAction Stop
        Write-Status "Resposta do health: $($response | ConvertTo-Json -Compress)"
        return $true
    } catch {
        Write-Status "Health check falhou: $_"
        return $false
    }
}

# --- Fluxo principal ---
Write-Status "=== REINICIALIZAÇÃO DO HERMES GATEWAY INICIADA ==="

# 1. Parar processo antigo
$stopped = Stop-HermesGateway

# 2. Startar novo
if ($stopped) {
    $started = Start-HermesGateway
} else {
    Write-Status "AVISO: porta não liberou, tentando start mesmo assim..."
    $started = Start-HermesGateway
}

# 3. Verificar se subiu
if ($started) {
    $healthOk = Test-HealthEndpoint
    if ($healthOk) {
        Write-Status "=== GATEWAY REINICIALIZADO COM SUCESSO ==="
        exit 0
    } else {
        Write-Status "=== GATEWAY SUBIU MAS /HEALTH FALHOU ==="
        exit 2
    }
} else {
    Write-Status "=== FALHA: GATEWAY NÃO SUBIU ==="
    exit 1
}
