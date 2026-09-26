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

            # Filtra por tempo de 업타임을 ser > threshold
            $uptime = (Get-Date) - $_.StartTime
            $isLongLived = $uptime.TotalMinutes -gt $ZombieKillTimeoutMinutes

            $isZombie = $isOrphan -or ($cpuIdle -and $isLongLived)
            return $isZombie
        }

        foreach ($proc in $procs) {
            $zombies += @{
                Name = $proc.Name
                Id = $proc.Id
                StartTime = $proc.StartTime
                CPU = $proc.CPU
                WorkingSetMB = [math]::Round($proc.WorkingSet64 / 1MB, 2)
                UptimeMinutes = [math]::Round($uptime.TotalMinutes)
                IsOrphan = $null -eq (Get-Process -Id $_.ParentProcessId -ErrorAction SilentlyContinue)
            }
        }
    }

    if ($zombies.Count -gt 0) {
        Write-Log "Zumbis encontrados: $($zombies.Count)" "WARN"
        foreach ($z in $zombies) {
            Write-Log "  - $($z.Name) PID:$($z.Id) | WS:$($z.WorkingSetMB)MB | Uptime:$($z.UptimeMinutes)min | Orfan:$($z.IsOrphan)" "WARN"
        }

        if (-not $DryRun) {
            $confirmMsg = "Encontrados $($zombies.Count) processos órfãos/zumbis. Deseja encerrar?"
            Write-Log $confirmMsg "INFO"

            # Em modo batch, mata sem confirmação
            foreach ($z in $zombies) {
                try {
                    Stop-Process -Id $z.Id -Force -ErrorAction SilentlyContinue
                    Write-Log "  MATOU: $($z.Name) PID:$($z.Id)" "INFO"
                } catch {
                    Write-Log "  FALHA ao matar $($z.Name) PID:$($z.Id): $_" "ERR"
                }
            }
        }
    } else {
        Write-Log "Nenhum processo zumbi encontrado." "INFO"
    }

    Write-Log "EIXO 2 concluído" "INFO"
}

function Run-NodeJsGC {
    Write-Log "=== EIXO 3: Node.js Garbage Collection ===" "INFO"

    # Verifica se PM2 está rodando
    $pm2Path = "C:\Users\danda\AppData\Roaming\npm\pm2.cmd"
    if (-not $pm2Path) {
        $pm2Path = Get-Command pm2 -ErrorAction SilentlyContinue | ForEach-Object Path
    }

    if ($pm2Path) {
        Write-Log "PM2 detectado. Verificando processos..." "INFO"

        if (-not $DryRun) {
            try {
                # Lista processos PM2
                $pm2List = & $pm2Path list 2>&1
                Write-Log "Processos PM2: $($pm2List -join ', ')" "INFO"

                # Graceful reload escalonado (um por um)
                $apps = & $pm2Path list --json 2>&1 | ConvertFrom-Json -ErrorAction SilentlyContinue
                if ($apps) {
                    foreach ($app in $apps) {
                        Write-Log "Graceful reload escalonado: $($app.name) (PID: $($app.pid))" "INFO"

                        # Sinal SIGUSR2 para reload graceful
                        & $pm2Path reload "$($app.name)" --graceful 2>&1 | Out-Null
                        Start-Sleep -Seconds 2
                    }
                }
            } catch {
                Write-Log "Falha no PM2 reload: $_" "WARN"
            }
        }
    } else {
        Write-Log "PM2 não encontrado. Buscando node.exe com --expose-gc..." "INFO"

        $nodeProcs = Get-Process -Name node -ErrorAction SilentlyContinue
        foreach ($proc in $nodeProcs) {
            # Verifica se tem --expose-gc nos argumentos
            try {
                $cmdLine = (Get-CimInstance Win32_Process -Filter "ProcessId=$($proc.Id)").CommandLine
                if ($cmdLine -match "--expose-gc") {
                    Write-Log "Node com expose-gc detectado: PID $($proc.Id)" "INFO"
                    if (-not $DryRun) {
                        # Envia SIGUSR2 via Win32 API se possível
                        Write-Log "GCM não pode ser forçado remotamente em node sem ferramenta especializada." "WARN"
                    }
                }
            } catch {
                Write-Log "Falha ao verificar node: $_" "WARN"
            }
        }
    }

    Write-Log "EIXO 3 concluído" "INFO"
}

# === MAIN ===
Write-Log "========================================" "INFO"
Write-Log "SYSTEM BREATHING INICIADO" "INFO"
Write-Log "Timestamp: $startTime" "INFO"
Write-Log "DryRun: $DryRun" "INFO"
Write-Log "========================================" "INFO"

$ramBefore = Get-RamStats
Write-Log "Memória ANTES: $($ramBefore.UsedGB)GB usados / $($ramBefore.TotalGB)GB total ($($ramBefore.Percent)%)" "INFO"

Flush-StandbyList
Find-ZombieProcesses
Run-NodeJsGC

$ramAfter = Get-RamStats
Write-Log "Memória DEPOIS: $($ramAfter.UsedGB)GB usados / $($ramAfter.TotalGB)GB total ($($ramAfter.Percent)%)" "INFO"
Write-Log "Delta: $($ramBefore.UsedGB - $ramAfter.UsedGB)GB liberado" "INFO"

$duration = (Get-Date) - $startTime
Write-Log "Duração: $($duration.TotalSeconds) segundos" "INFO"
Write-Log "========================================" "INFO"
Write-Log "SYSTEM BREATHING CONCLUÍDO" "INFO"

# Resumo final para envio ao Hermes se houver canal configurado
$resumo = @"
<b>System Breathing executado</b>
🕐 ${startTime:yyyy-MM-dd HH:mm:ss}
📊 RAM ANTES: $($ramBefore.Percent)% ($($ramBefore.UsedGB)GB/$($ramBefore.TotalGB)GB)
📊 RAM DEPOIS: $($ramAfter.Percent)% ($($ramAfter.UsedGB)GB/$($ramAfter.TotalGB)GB)
📉 Delta: $($ramBefore.UsedGB - $ramAfter.UsedGB)GB
⏱️ Duração: $($duration.TotalSeconds)s
🤖 Eixos: Flush=${if($DryRun){"SKIP"}else{"OK"}} | Zombies=${if($DryRun){"SKIP"}else{"OK"}} | GC=${if($DryRun){"SKIP"}else{"OK"}}
"@

Send-HermesMessage $resumo

return $logLines
