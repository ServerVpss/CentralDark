$ErrorActionPreference='SilentlyContinue'
$pids = @(45896,28500,39544,44496,42660)
$out = foreach($id in $pids){
  $p = Get-CimInstance Win32_Process -Filter "ProcessId=$id"
  if($p){
    [pscustomobject]@{
      pid=$p.ProcessId
      name=$p.Name
      parent=$p.ParentProcessId
      path=$p.ExecutablePath
      commandLine=$p.CommandLine
    }
  } else {
    [pscustomobject]@{pid=$id; name='NOT_FOUND'}
  }
}
$out | ConvertTo-Json -Depth 5
