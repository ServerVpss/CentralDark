<#
.SYNOPSIS
    Template de script de manutenção — ponto de partida para jobs cron Hermes Agent.
    Inclui: log, medição de estado (ex: RAM), detecção de processo-órfão, flush fallback,
    e resumo de entrega no final.
#>

param(
    [string]$LogPath = "E:\CentralDark\Pivete\logs\maintenance.log",
    [switch]$DryRun
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

# Medir estado ANTES
$ram = Get-CimInstance Win32_OperatingSystem
$totalGB = [math]::Round($ram.TotalVisibleMemorySize / 1MB, 2)
$freeGB = [math]::Round($ram.FreePhysicalMemory / 1MB, 2)
$usedGB = $totalGB - $freeGB
$percent = [math]::Round(($usedGB / $totalGB) * 100, 2)
Write-Log "RAM: $usedGB GB usados / $totalGB GB total ($percent%)" "INFO"

# --- EIXO: AÇÃO PRINCIPAL ---
if (-not $DryRun) {
    Write-Log "Ação principal aqui (substituir pelo trabalho real)" "INFO"
} else {
    Write-Log "[DRY RUN] Ação principal seria executada aqui" "INFO"
}

# --- EIXO: PÓS-MEDIDA ---
$ram2 = Get-CimInstance Win32_OperatingSystem
$totalGB2 = [math]::Round($ram2.TotalVisibleMemorySize / 1MB, 2)
$freeGB2 = [math]::Round($ram2.FreePhysicalMemory / 1MB, 2)
$usedGB2 = $totalGB2 - $freeGB2
$percent2 = [math]::Round(($usedGB2 / $totalGB2) * 100, 2)
Write-Log "RAM DEPOIS: $usedGB2 GB usados / $totalGB2 GB total ($percent2%)" "INFO"
Write-Log "Delta: $($usedGB - $usedGB2) GB" "INFO"

$duration = (Get-Date) - $startTime
Write-Log "Duração: $($duration.TotalSeconds)s" "INFO"
Write-Log "========================================" "INFO"
Write-Log "MANUTENÇÃO CONCLUÍDA" "INFO"

# Resumo de entrega
$flushStatus = if ($DryRun) { "SKIP" } else { "OK" }
$resumo = @"
<b>Manutenção executada</b>
- Timestamp: $($startTime.ToString("yyyy-MM-dd HH:mm:ss"))
- RAM ANTES: $percent% ($usedGB GB / $totalGB GB)
- RAM DEPOIS: $percent2% ($usedGB2 GB / $totalGB2 GB)
- Delta: $($usedGB - $usedGB2) GB
- Duração: $($duration.TotalSeconds)s
- Ação: $flushStatus
"@

Write-Host $resumo
return $logLines
