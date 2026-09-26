$os = Get-CimInstance Win32_OperatingSystem
$fis = [math]::Round($os.TotalVisibleMemorySize/1MB,1)
$com = [math]::Round(($os.TotalVirtualMemorySize - $os.FreeVirtualMemory)/1MB,1)
Write-Host ("RAM_Fisica_GB=" + $fis + " Commit_GB=" + $com + " Pressao_Pct=" + [math]::Round($com/$fis*100,1))
Get-CimInstance Win32_PageFileUsage | Select-Object Name,AllocatedBaseSize,PeakUsage | Format-Table -AutoSize
