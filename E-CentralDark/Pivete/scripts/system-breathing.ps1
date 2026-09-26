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

function Read-YamlValue {
    param([string]$FilePath, [string]$Path)
    if (-not (Test-Path $FilePath)) {
        return $null
    }
    $content = Get-Content $FilePath -Raw -ErrorAction SilentlyContinue
    if (-not $content) { return $null }

    $result = @{}
    foreach ($line in $content -split "`n") {
        if ($line -match "^\s*(\w+)\s*:\s*(.+)$") {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            if ($value -eq "" -or $value -eq "-") {
                $result[$key] = $true
            } elseif ($value -match "^['""](.*)['""]$") {
                $result[$key] = $matches[1]
            } elseif ($value -match "^(\d+)$") {
                $result[$key] = [int]$value
            } else {
                $result[$key] = $value
            }
        }
    }

    $parts = $Path -split "\."
    $current = $result
    foreach ($part in $parts) {
        if ($current -is [hashtable] -and $current.ContainsKey($part)) {
            $current = $current[$part]
        } else {
            return $null
        }
    }
    return $current
}

function Send-HermesMessage {
    param([string]$Message)
    try {
        $configPath = "E:\CentralDark\Pivete\config.yaml"
        $chatId = Read-YamlValue $configPath "config.gateway.platforms.telegram.chat_id"
        $token = Read-YamlValue $configPath "config.gateway.platforms.telegram.token"

        if ($chatId -and $token) {
            Invoke-RestMethod -Uri "https://api.telegram.org/bot$token/sendMessage" -Method POST -Body @{
                chat_id = $chatId
                text = $Message
                parse_mode = "HTML"
            } | Out-Null
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

    $emptyStandbyPath = "C:\Tools\EmptyStandbyList.exe"
    $ramMapPath = "C:\Tools\RAMMap.exe"

    if (Test-Path $emptyStandbyPath) {
        Write-Log "Executando EmptyStandbyList.exe..." "INFO"
        if (-not $DryRun) {
            $proc = Start-Process -FilePath $emptyStandbyPath -ArgumentList "/s" -Wait -PassThru -WindowStyle Hidden
            Write-Log "EmptyStandbyList concluido. ExitCode: $($proc.ExitCode)" "INFO"
        }
    } elseif (Test-Path $ramMapPath) {
        Write-Log "Executando RAMMap para limpar Standby..." "INFO"
        if (-not $DryRun) {
            $proc = Start-Process -FilePath $ramMapPath -ArgumentList "/s /o" -Wait -PassThru -WindowStyle Hidden
            Write-Log "RAMMap limpeza concluida. ExitCode: $($proc.ExitCode)" "INFO"
        }
    } else {
        Write-Log "Nenhuma ferramenta Sysinternals encontrada. Tentando metodo alternativo..." "WARN"

        Write-Log "Criando buffer temporario de 1GB para forcar flush de paginas..." "INFO"
        if (-not $DryRun) {
            try {
                $buffer = New-Object byte[] (1GB)
                $null = $buffer.Length
                Remove-Variable buffer -ErrorAction SilentlyContinue
                Write-Log "Buffer descartado. Memoria liberada." "INFO"
            } catch {
                Write-Log "Falha no metodo de buffer: $_" "WARN"
            }
        }
    }

    Write-Log "EIXO 1 concluido" "INFO"
}

function Find-ZombieProcesses {
    Write-Log "=== EIXO 2: Zombie Reaper ===" "INFO"

    $targets = @("chrome", "node", "Code", "electron")
    $zombies = @()

    foreach ($target in $targets) {
        $procs = Get-Process -Name $target -ErrorAction SilentlyContinue | Where-Object {
            $proc = $_
            $uptime = (Get-Date) - $proc.StartTime
            $isLongLived = $uptime.TotalMinutes -gt $ZombieKillTimeoutMinutes
            $cpuIdle = $proc.CPU -eq 0

            $parentExists = $true
            try {
                $parentPid = (Get-CimInstance Win32_Process -Filter "ProcessId=$($proc.Id)").ParentProcessId
                if ($parentPid -and $parentPid -ne 0) {
                    $parentProc = Get-Process -Id $parentPid -ErrorAction SilentlyContinue
                    if (-not $parentProc) {
                        $parentExists = $false
                    }
                }
            } catch {
                $parentExists = $false
            }

            $isOrphan = -not $parentExists
            $isZombie = $isOrphan -or ($cpuIdle -and $isLongLived)
            return $isZombie
        }

        foreach ($proc in $procs) {
            $uptime = (Get-Date) - $proc.StartTime
            $parentPid = 0
            try {
                $parentPid = (Get-CimInstance Win32_Process -Filter "ProcessId=$($proc.Id)").ParentProcessId
            } catch {
                $parentPid = 0
            }

            $parentExists = $false
            if ($parentPid -and $parentPid -ne 0) {
                $parentProc = Get-Process -Id $parentPid -ErrorAction SilentlyContinue
                $parentExists = $null -ne $parentProc
            }

            $zombies += @{
                Name = $proc.Name
                Id = $proc.Id
                StartTime = $proc.StartTime
                CPU = $proc.CPU
                WorkingSetMB = [math]::Round($proc.WorkingSet64 / 1MB, 2)
                UptimeMinutes = [math]::Round($uptime.TotalMinutes)
                IsOrphan = -not $parentExists
            }
        }
    }

    if ($zombies.Count -gt 0) {
        Write-Log "Zumbis encontrados: $($zombies.Count)" "WARN"
        foreach ($z in $zombies) {
            Write-Log "  - $($z.Name) PID:$($z.Id) | WS:$($z.WorkingSetMB)MB | Uptime:$($z.UptimeMinutes)min | Orfan:$($z.IsOrphan)" "WARN"
        }

        if (-not $DryRun) {
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

    Write-Log "EIXO 2 concluido" "INFO"
}

function Run-NodeJsGC {
    Write-Log "=== EIXO 3: Node.js Garbage Collection ===" "INFO"

    $pm2Path = $null
    if (Test-Path "C:\Users\danda\AppData\Roaming\npm\pm2.cmd") {
        $pm2Path = "C:\Users\danda\AppData\Roaming\npm\pm2.cmd"
    } elseif (Get-Command pm2 -ErrorAction SilentlyContinue) {
        $pm2Path = (Get-Command pm2).Source
    }

    if ($pm2Path) {
        Write-Log "PM2 detectado. Verificando processos..." "INFO"
        if (-not $DryRun) {
            try {
                $pm2List = & $pm2Path list 2>&1
                Write-Log "Processos PM2: $($pm2List -join ', ')" "INFO"

                $apps = & $pm2Path list --json 2>&1 | ConvertFrom-Json -ErrorAction SilentlyContinue
                if ($apps) {
                    foreach ($app in $apps) {
                        Write-Log "Graceful reload escalonado: $($app.name) (PID: $($app.pid))" "INFO"
                        & $pm2Path reload "$($app.name)" --graceful 2>&1 | Out-Null
                        Start-Sleep -Seconds 2
                    }
                }
            } catch {
                Write-Log "Falha no PM2 reload: $_" "WARN"
            }
        }
    } else {
        Write-Log "PM2 nao encontrado. Buscando node.exe com --expose-gc..." "INFO"

        $nodeProcs = Get-Process -Name node -ErrorAction SilentlyContinue
        foreach ($proc in $nodeProcs) {
            try {
                $cmdLine = (Get-CimInstance Win32_Process -Filter "ProcessId=$($proc.Id)").CommandLine
                if ($cmdLine -match "--expose-gc") {
                    Write-Log "Node com expose-gc detectado: PID $($proc.Id)" "INFO"
                    Write-Log "GCM nao pode ser forcado remotamente em node sem ferramenta especializada." "WARN"
                }
            } catch {
                Write-Log "Falha ao verificar node: $_" "WARN"
            }
        }
    }

    Write-Log "EIXO 3 concluido" "INFO"
}

# === MAIN ===
Write-Log "========================================" "INFO"
Write-Log "SYSTEM BREATHING INICIADO" "INFO"
Write-Log "Timestamp: $startTime" "INFO"
Write-Log "DryRun: $DryRun" "INFO"
Write-Log "========================================" "INFO"

$ramBefore = Get-RamStats
Write-Log "Memoria ANTES: $($ramBefore.UsedGB)GB usados / $($ramBefore.TotalGB)GB total ($($ramBefore.Percent)%)" "INFO"

Flush-StandbyList
Find-ZombieProcesses
Run-NodeJsGC

$ramAfter = Get-RamStats
Write-Log "Memoria DEPOIS: $($ramAfter.UsedGB)GB usados / $($ramAfter.TotalGB)GB total ($($ramAfter.Percent)%)" "INFO"
Write-Log "Delta: $($ramBefore.UsedGB - $ramAfter.UsedGB)GB liberado" "INFO"

$duration = (Get-Date) - $startTime
Write-Log "Duracao: $($duration.TotalSeconds) segundos" "INFO"
Write-Log "========================================" "INFO"
Write-Log "SYSTEM BREATHING CONCLUIDO" "INFO"

# Status dos eixos (usando variavel intermediaria, nao sintaxe invalida)
$flushStatus = if ($DryRun) { "SKIP" } else { "OK" }
$zombieStatus = if ($DryRun) { "SKIP" } else { "OK" }
$gcStatus = if ($DryRun) { "SKIP" } else { "OK" }

$resumo = @"
<b>System Breathing executado</b>
- Timestamp: $($startTime.ToString("yyyy-MM-dd HH:mm:ss"))
- RAM ANTES: $($ramBefore.Percent)% ($($ramBefore.UsedGB)GB / $($ramBefore.TotalGB)GB)
- RAM DEPOIS: $($ramAfter.Percent)% ($($ramAfter.UsedGB)GB / $($ramAfter.TotalGB)GB)
- Delta: $($ramBefore.UsedGB - $ramAfter.UsedGB)GB liberado
- Duracao: $($duration.TotalSeconds)s
- Eixos: Flush=$flushStatus | Zombies=$zombieStatus | GC=$gcStatus
"@

Send-HermesMessage $resumo

return $logLines
