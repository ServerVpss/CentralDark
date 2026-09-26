Get-Counter '\PhysicalDisk(*)\% Idle Time' -SampleInterval 2 -MaxSamples 2 -ErrorAction SilentlyContinue | ForEach-Object {
  $_.CounterSamples | Where-Object { $_.InstanceName -ne '_total' } | Select-Object InstanceName, @{n='Idle_%';e={[math]::Round($_.CookedValue,1)}}
} | Format-Table -AutoSize

Write-Host "=== PAGE FILE ==="
Get-CimInstance Win32_PageFileUsage | Select-Object Name, @{n='Alocado_MB';e={$_.AllocatedBaseSize}}, @{n='Pico_MB';e={$_.PeakUsage}} | Format-Table -AutoSize

Write-Host "=== MEM PRESSURE ==="
$os = Get-CimInstance Win32_OperatingSystem
$fis = [math]::Round($os.TotalVisibleMemorySize/1MB,1)
$com = [math]::Round(($os.TotalVirtualMemorySize - $os.FreeVirtualMemory)/1MB,1)
[PSCustomObject]@{ RAM_Fisica_GB=$fis; Commit_GB=$com; Pressao_Pct=[math]::Round($com/$fis*100,1) } | Format-List
