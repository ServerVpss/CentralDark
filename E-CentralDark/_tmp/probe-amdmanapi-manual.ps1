$ErrorActionPreference='SilentlyContinue'
$procs=Get-Process amdmanapi -ErrorAction SilentlyContinue | Select-Object Id,ProcessName,Path,StartTime
$ports=foreach($x in 8080,8082){
  $c=Get-NetTCPConnection -LocalPort $x -State Listen -ErrorAction SilentlyContinue
  if($c){
    foreach($i in $c){[pscustomobject]@{LocalAddress=$i.LocalAddress;LocalPort=$i.LocalPort;OwningProcess=$i.OwningProcess}}
  } else {
    [pscustomobject]@{LocalAddress=$null;LocalPort=$x;OwningProcess=$null}
  }
}
[pscustomobject]@{processes=$procs;ports=$ports}|ConvertTo-Json -Depth 5