$ErrorActionPreference='SilentlyContinue'
$all=Get-CimInstance Win32_Process | Where-Object {
  $_.Name -ieq 'CentralDark-Remote-Tray.exe' -or
  ($_.ExecutablePath -and $_.ExecutablePath -match 'CentralDark-Remote-Tray') -or
  ($_.CommandLine -and $_.CommandLine -match 'CentralDark-Remote-Tray')
} | Select-Object ProcessId,ParentProcessId,Name,ExecutablePath,CommandLine
$bridge=Get-Process CentralDarkBridge -ErrorAction SilentlyContinue | Select-Object Id,ProcessName,StartTime,Path
[pscustomobject]@{legacy_tray=$all;bridge=$bridge}|ConvertTo-Json -Depth 6