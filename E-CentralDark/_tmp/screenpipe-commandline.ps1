$ErrorActionPreference='SilentlyContinue'
$p=Get-CimInstance Win32_Process -Filter "ProcessId=45952"
[pscustomobject]@{
 ProcessId=$p.ProcessId
 Name=$p.Name
 ExecutablePath=$p.ExecutablePath
 CommandLine=$p.CommandLine
 ParentProcessId=$p.ParentProcessId
}|ConvertTo-Json -Depth 4