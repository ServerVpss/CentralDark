# COMANDO - system-breathing.ps1
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.hermes\scripts\system-breathing.ps1
**SHA:** cb1bd4fb984e6e21
**Timestamp:** 2026-08-28T02:57:50.998446
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- Write-Log "DryRun: $DryRun" "INFO"

### Ouro Bruto (primeiros 5000 chars)
```
<#
.SYNOPSIS
    System Breathing - Memory Flush & Zombie Reaper
    Despressuriza RAM via Standby List Flush + Zombie Reaper + Node.js GC
#>

param(
    [string]$LogPath = "E:\CentralDark\Pivete\logs\system-breathing.log",
    [int]$ZombieKillTimeoutMinutes = 30,
    [switch]$DryRun,
    [switch]$Verbose
)

$ErrorActionPreference = "Continue"
$startTime = Get-Date
$logLines = @()

function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $line = "[$timestamp] [$Level] $Message"
    $script:logLines += $line
    Write-Host $line
    Add-Content -Path $LogPath -Value $line -ErrorAction SilentlyContinue
}

function Send-HermesMessage {
    param([string]$Message)
    # Envia para o canal do Hermes se configurado
    try {
        $configPath = "E:\CentralDark\Pivete\config.yaml"
        if (Test-Path $configPath) {
            $config = Get-Content $configPath | ConvertFrom-Yaml -ErrorAction SilentlyContinue
            if ($config.config.gateway?.platforms?.telegram) {
                $chatId = $config.config.gateway.platforms.telegram.chat_id
                $token = $config.config.gateway.platforms.telegram.token
                if ($chatId -and $token) {
                    Invoke-RestMethod -Uri "https://api.telegram.org/bot$token/sendMessage" -Method POST -Body @{
                        chat_id = $chatId
                        text = $Message
                        parse_mode = "HTML"
                    } | Out-Null
                }
            }
        }
    } catch {
        Write-Log "Falha ao enviar mensagem Hermes: $_" "WARN"
    }
}

function Get-RamStats {
    $os = Get-CimInstance Win32_OperatingSystem
    $total = [math]::Round($os.TotalVisibleMemorySize / 1MB, 2)
    $free = [math]::Round($os.FreePhysicalMemory / 1MB, 2)
    $used = $total - $free
    $percent = [math]::Round(($used / $total) * 100, 2)
    return @{ TotalGB = $total; UsedGB = $used; FreeGB = $free; Percent = $percent }
}

function Flush-StandbyList {
    Write-Log "=== EIXO 1: Standby List Flush ===" "INFO"

    # Método 1: EmptyStandbyList.exe do Sysinternals (se disponível)
    $ramMapPath = "C:\Tools\RAMMap.exe"
    $emptyStandbyPath = "C:\Tools\EmptyStandbyList.exe"

    if (Test-Path $emptyStandbyPath) {
        Write-Log "Executando EmptyStandbyList.exe..." "INFO"
        if (-not $DryRun) {
            $proc = Start-Process -FilePath $emptyStandbyPath -ArgumentList "/s" -Wait -PassThru -WindowStyle Hidden
            Write-Log "EmptyStandbyList concluído. ExitCode: $($proc.ExitCode)" "INFO"
        }
    } elseif (Test-Path $ramMapPath) {
        Write-Log "Executando RAMMap para limpar Standby..." "INFO"
        if (-not $DryRun) {
            $proc = Start-Process -FilePath $ramMapPath -ArgumentList "/s /o" -Wait -PassThru -WindowStyle Hidden
            Write-Log "RAMMap limpeza concluída. ExitCode: $($proc.ExitCode)" "INFO"
        }
    } else {
        Write-Log "Nenhuma ferramenta Sysinternals encontrada. Tentando método alternativo..." "WARN"

        # Método 2: Criar e descartar um grande buffer para forçar cache flush
        Write-Log "Criando buffer temporário de 1GB para forçar flush de páginas..." "INFO"
        if (-not $DryRun) {
            try {
                $buffer = New-Object byte[] (1GB)
                $null = $buffer.Length
                Remove-Variable buffer -ErrorAction SilentlyContinue
                Write-Log "Buffer descartado. Memória liberada." "INFO"
            } catch {
                Write-Log "Falha no método de buffer: $_" "WARN"
            }
        }
    }

    Write-Log "EIXO 1 concluído" "INFO"
}

function Find-ZombieProcesses {
    Write-Log "=== EIXO 2: Zombie Reaper ===" "INFO"

    $targets = @("chrome.exe", "node.exe", "Code.exe", "electron.exe")
    $zombies = @()

    foreach ($target in $targets) {
        $procs = Get-Process -Name $target -ErrorAction SilentlyContinue | Where-Object {
            # Órfão: pai não responde ou pai inexistente
            $parent = Get-CimInstance Win32_Process -Filter "ProcessId=$($_.Id)" | ForEach-Object {
                $parentProc = Get-Process -Id $_.ParentProcessId -ErrorAction SilentlyContinue
                if ($parentProc) {
                    return $parentProc
                }
                return $null
            }

            # Se não tem pai reconhecível ou pai está morto
            $isOrphan = $null -eq $parent

            # Ou pai sem resposta (ping falhou)
            if ($parent -and $parent.Path) {
                try {
                    $ping = Test-Connection -ComputerName localhost -Port $parent.Id -TimeoutSeconds 1 -Count 1 -Quiet
                    # Processos bound to ports podem estar zombies
                } catch {
                    # Ignora erro de ping
                }
            }

            # Ou consumo de CPU está 0 há muito tempo (suspeito zombie)
            $cpuIdle = $_.CPU -eq 0

            
```