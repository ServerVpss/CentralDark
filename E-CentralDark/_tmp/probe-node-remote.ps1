$ErrorActionPreference='Continue'
$rows = Get-CimInstance Win32_Process |
  Where-Object { $_.Name -in @('node.exe','pwsh.exe','powershell.exe','cmd.exe','CentralDark-Remote-Tray.exe') } |
  Select-Object ProcessId,ParentProcessId,Name,ExecutablePath,CommandLine
if($rows){ $rows | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath 'E:\CentralDark\_tmp\node-remote-processes.json' -Encoding UTF8 }
