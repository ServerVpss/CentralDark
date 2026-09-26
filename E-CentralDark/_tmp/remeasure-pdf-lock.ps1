$ErrorActionPreference='SilentlyContinue'
$target='E:\CentralDark\CentralDark\scripts\lupa\pdf-conformance-cc2003.mjs'
$p=Get-CimInstance Win32_Process | Where-Object { $_.Name -eq 'node.exe' -and $_.CommandLine -match 'desktop-commander|pdf-conformance-cc2003' } |
 Select-Object ProcessId,ParentProcessId,Name,ExecutablePath,CommandLine
[pscustomobject]@{
 observed_at=(Get-Date).ToString('o')
 target_exists=(Test-Path -LiteralPath $target)
 processes=$p
 runner_exists=(Test-Path -LiteralPath 'E:\CentralDark\runtime\scheduled-jobs\run-scheduled-sector.ps1')
 gate_script_exists=(Test-Path -LiteralPath $target)
}|ConvertTo-Json -Depth 5