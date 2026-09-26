$ErrorActionPreference='SilentlyContinue'
$all=Get-CimInstance Win32_Process | Where-Object { $_.Name -match 'screenpipe|bun' -or $_.CommandLine -match 'screenpipe' }
$out=@()
foreach($x in @($all)){
  $listen=Get-NetTCPConnection -State Listen -OwningProcess $x.ProcessId -ErrorAction SilentlyContinue |
    Select-Object LocalAddress,LocalPort
  $out += [pscustomobject]@{
    pid=$x.ProcessId
    ppid=$x.ParentProcessId
    name=$x.Name
    path=$x.ExecutablePath
    command=$x.CommandLine
    listeners=@($listen)
  }
}
$out|ConvertTo-Json -Depth 6