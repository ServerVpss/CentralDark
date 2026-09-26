$ErrorActionPreference='SilentlyContinue'
$out = Get-CimInstance Win32_Process |
  Where-Object {
    ($_.CommandLine -match 'desktop-commander') -or
    ($_.CommandLine -match 'CentralDark-Remote') -or
    ($_.Name -match '^CentralDark-Remote.*\.exe$')
  } |
  Select-Object ProcessId,ParentProcessId,Name,ExecutablePath,CommandLine
$out | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath "$env:LOCALAPPDATA\CentralDark\Remote-Tray\owned-processes.json" -Encoding UTF8
