$ErrorActionPreference='Stop'
$proc=Get-CimInstance Win32_Process | Where-Object { $_.Name -eq 'Obsidian.exe' } |
  Select-Object ProcessId,ParentProcessId,ExecutablePath,CommandLine
$logs=@(
  "$env:APPDATA\obsidian\obsidian.log",
  "$env:APPDATA\obsidian\log.txt",
  "E:\CentralDark\Pivete\CASA-VAULT\.obsidian\logs\obsidian.log"
)
[pscustomobject]@{
  observed_at=(Get-Date).ToString('o')
  processes=$proc
  log_candidates=@($logs | ForEach-Object {
    [pscustomobject]@{path=$_;exists=(Test-Path -LiteralPath $_)}
  })
}|ConvertTo-Json -Depth 6
