# 🔧 FORJA EXECUTOR — PowerShell 7 Paralelo
# Orquestrador autônomo da Forja, rodando em job background
# Sincronização: Casa ↔ Forja ↔ GitHub ↔ VPS

param(
    [string]$Mode = "sync",  # sync, deploy, monitor, status
    [string]$Setor = "all"   # all, hermes, skills, modulos, casa
)

# ═══════════════════════════════════════════════════════════════════════════
# CONFIGURAÇÃO RAIZ
# ═══════════════════════════════════════════════════════════════════════════

$FORJA_ROOT = "K:\apps\modulos"
$CASA_ROOT = "K:\apps\instinto-superior"
$GIT_ROOT = "K:\"
$VPS_REMOTE = "origin"
$LOG_FILE = "$FORJA_ROOT\.forja-executor.log"

# Cores/Emojis para output
$Sucesso = "✅"
$Erro = "🔴"
$Atencao = "🟡"
$Sync = "🔄"
$Deploy = "🚀"
$Info = "ℹ️"

# ═══════════════════════════════════════════════════════════════════════════
# LOGGING
# ═══════════════════════════════════════════════════════════════════════════

function Log {
    param([string]$Mensagem, [string]$Tipo = "INFO")
    $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $Linha = "[$Timestamp] [$Tipo] $Mensagem"
    Add-Content -Path $LOG_FILE -Value $Linha
    Write-Host $Linha
}

function LogSucesso { Log @args "SUCCESS" }
function LogErro { Log @args "ERROR" }
function LogAtencao { Log @args "WARNING" }

# ═══════════════════════════════════════════════════════════════════════════
# CORE: SINCRONIZAÇÃO CASA ↔ FORJA
# ═══════════════════════════════════════════════════════════════════════════

function SincronizarForja {
    param([string]$Setor = "all")

    LogSucesso "$Sync SINCRONIZANDO FORJA (setor: $Setor)..."

    # Leitura de estado Casa
    $CasaState = Get-Content "$CASA_ROOT\.FIXED_POINT" -ErrorAction SilentlyContinue
    LogInfo "Estado Casa: $CasaState"

    # Mapeamento de setores da Forja
    $Setores = @{
        "hermes" = "$FORJA_ROOT\hermes-config"
        "skills" = "$FORJA_ROOT\skills-registry"
        "modulos" = "$FORJA_ROOT\modulos-inventory"
        "casa" = "$CASA_ROOT\src"
    }

    if ($Setor -eq "all") {
        foreach ($s in $Setores.Keys) {
            SincronizarSetor $s
        }
    } else {
        SincronizarSetor $Setor
    }

    LogSucesso "Sincronização concluída"
}

function SincronizarSetor {
    param([string]$Setor)

    $CaminhoSetor = $Setores[$Setor]

    # Verifica existência
    if (-not (Test-Path $CaminhoSetor)) {
        LogAtencao "Setor $Setor não encontrado em $CaminhoSetor"
        return
    }

    # Calcula hash de estado
    $Hash = (Get-ChildItem -Path $CaminhoSetor -Recurse | Get-FileHash | Measure-Object -Property Hash -Sum).Hash
    LogInfo "Setor [$Setor] hash: $Hash"

    # Marca timestamp
    $Timestamp = Get-Date -Format "o"
    @{ setor = $Setor; hash = $Hash; timestamp = $Timestamp } | ConvertTo-Json |
        Set-Content "$FORJA_ROOT\.sync-$Setor.json"
}

# ═══════════════════════════════════════════════════════════════════════════
# GIT: PULL → SYNC → PUSH (automático, não-bloqueante)
# ═══════════════════════════════════════════════════════════════════════════

function DeployVPS {
    param([string]$Setor = "all")

    LogSucesso "$Deploy PREPARANDO DEPLOY VPS (setor: $Setor)..."

    Push-Location $GIT_ROOT

    try {
        # Fetch remoto (non-blocking)
        & git fetch --no-tags origin main 2>&1 | ForEach-Object { LogInfo $_ }

        # Status
        $Status = & git status --short --branch
        LogInfo "Git status: $Status"

        # Se houver delta local não-pushado
        $LocalAhead = & git rev-list --count origin/main..HEAD
        if ($LocalAhead -gt 0) {
            LogAtencao "Local ahead of origin por $LocalAhead commits, preparando push"

            # Push (não-bloqueante)
            & git push origin main 2>&1 | ForEach-Object { LogInfo $_ }
            LogSucesso "Push concluído"
        } else {
            LogInfo "Sem mudanças locais para push"
        }
    } catch {
        LogErro "Erro ao fazer deploy: $_"
    } finally {
        Pop-Location
    }
}

# ═══════════════════════════════════════════════════════════════════════════
# MONITOR: Status em tempo real
# ═══════════════════════════════════════════════════════════════════════════

function MonitorarForja {
    LogSucesso "$Info MONITORANDO FORJA..."

    while ($true) {
        Clear-Host
        Write-Host "🪬 FORJA MONITOR — $(Get-Date -Format 'HH:mm:ss')" -ForegroundColor Cyan
        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

        # Status Casa
        if (Test-Path "$CASA_ROOT\.FIXED_POINT") {
            $CasaStatus = Get-Content "$CASA_ROOT\.FIXED_POINT"
            Write-Host "Casa:  ✅ $CasaStatus" -ForegroundColor Green
        } else {
            Write-Host "Casa:  🟡 Not synced" -ForegroundColor Yellow
        }

        # Status Forja setores
        $Setores.Keys | ForEach-Object {
            $SyncFile = "$FORJA_ROOT\.sync-$_.json"
            if (Test-Path $SyncFile) {
                $Data = Get-Content $SyncFile | ConvertFrom-Json
                Write-Host "$_: ✅ $(([DateTime]$Data.timestamp).ToString('HH:mm:ss'))" -ForegroundColor Green
            } else {
                Write-Host "$_: 🟡 Pending" -ForegroundColor Yellow
            }
        }

        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        Write-Host "Próxima atualização em 30s... (Ctrl+C para sair)"

        Start-Sleep -Seconds 30
    }
}

# ═══════════════════════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════════════════════

Log "▶ INICIANDO FORJA EXECUTOR (PS7) — Mode: $Mode, Setor: $Setor"

switch ($Mode) {
    "sync" { SincronizarForja $Setor }
    "deploy" { DeployVPS $Setor }
    "monitor" { MonitorarForja }
    "status" {
        Write-Host "🪬 FORJA STATUS"
        Get-Content $LOG_FILE -Tail 20
    }
    default {
        Write-Host "Uso: .\forja-executor-ps7.ps1 -Mode <sync|deploy|monitor|status> -Setor <all|hermes|skills|modulos|casa>"
    }
}

Log "✅ FORJA EXECUTOR FINALIZADO"
