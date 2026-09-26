Write-Host "=== BLOCO 1: COMMIT FANTASMA (top 15 por paged memory) ==="
Get-Process | Where-Object { $_.Id -gt 4 } |
  Sort-Object PagedMemorySize64 -Descending |
  Select-Object -First 15 Name, Id,
    @{n='RAM_MB';e={[math]::Round($_.WS/1MB)}},
    @{n='Commit_MB';e={[math]::Round($_.PagedMemorySize64/1MB)}},
    @{n='Gordura_MB';e={[math]::Round(($_.PagedMemorySize64-$_.WS)/1MB)}} |
  Format-Table -AutoSize

Write-Host "=== BLOCO 2: SOMA POR FAMILIA (top 12 por commit) ==="
Get-Process | Group-Object ProcessName |
  Select-Object Name, Count,
    @{n='RAM_TOTAL_MB';e={[math]::Round((($_.Group | Measure-Object WS -Sum).Sum)/1MB)}},
    @{n='COMMIT_TOTAL_MB';e={[math]::Round((($_.Group | Measure-Object PagedMemorySize64 -Sum).Sum)/1MB)}} |
  Sort-Object COMMIT_TOTAL_MB -Descending |
  Select-Object -First 12 | Format-Table -AutoSize

Write-Host "=== BLOCO 3: PAGEFILE ESTADO ==="
Get-CimInstance Win32_PageFileSetting | Select-Object Name, InitialSize, MaximumSize | Format-Table -AutoSize
Get-CimInstance Win32_PageFileUsage | Select-Object Name, AllocatedBaseSize, CurrentUsage, PeakUsage | Format-Table -AutoSize
Write-Host "=== gerenciamento automatico ligado? ==="
(Get-CimInstance Win32_ComputerSystem).AutomaticManagedPagefile

Write-Host "=== BLOCO 4: PRESSAO E FOLGA ==="
$os = Get-CimInstance Win32_OperatingSystem
$fis = [math]::Round($os.TotalVisibleMemorySize/1MB,2)
$liv = [math]::Round($os.FreePhysicalMemory/1MB,2)
$com = [math]::Round(($os.TotalVirtualMemorySize - $os.FreeVirtualMemory)/1MB,2)
Write-Host ("RAM_Fisica_GB=" + $fis)
Write-Host ("RAM_Livre_GB=" + $liv)
Write-Host ("Commit_GB=" + $com)
Write-Host ("Pressao_Pct=" + [math]::Round($com/$fis*100,1))
Write-Host ("Veredito=" + $(if($com/$fis -gt 0.85){"PAGINANDO"}else{"OK"}))

Write-Host "=== BLOCO 5: DISCOS ESPACO LIVRE ==="
Get-CimInstance Win32_LogicalDisk -Filter "DriveType=3" |
  Select-Object DeviceID,
    @{n='Total_GB';e={[math]::Round($_.Size/1GB,1)}},
    @{n='Livre_GB';e={[math]::Round($_.FreeSpace/1GB,1)}},
    @{n='Livre_Pct';e={[math]::Round($_.FreeSpace/$_.Size*100,1)}} |
  Format-Table -AutoSize

Write-Host "=== BLOCO 6: SERVICOS PESADOS LIGADOS ==="
Get-Service | Where-Object { $_.Status -eq 'Running' } |
  Where-Object { $_.DisplayName -match 'Docker|Search|SysMain|Superfetch|Update|Defender|Backup|Index' } |
  Select-Object Name, DisplayName, StartType | Format-Table -AutoSize

Write-Host "=== BLOCO 7: STARTUP ==="
Get-CimInstance Win32_StartupCommand | Select-Object Name, Location, User | Format-Table -AutoSize

Write-Host "=== BLOCO 8: SAUDE DOS DISCOS ==="
Get-PhysicalDisk | Select-Object DeviceId, FriendlyName, MediaType,
  @{n='Tam_GB';e={[math]::Round($_.Size/1GB)}}, HealthStatus, OperationalStatus |
  Format-Table -AutoSize
