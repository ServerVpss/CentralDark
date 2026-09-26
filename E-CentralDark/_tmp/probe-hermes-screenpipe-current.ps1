$ErrorActionPreference='SilentlyContinue'
$names=@('screenpipe-app','Hermes')
$procs=Get-Process -Name $names -ErrorAction SilentlyContinue | Select-Object Id,ProcessName,StartTime,Path
$listeners=@()
foreach($proc in @($procs)){
  $conns=Get-NetTCPConnection -State Listen -OwningProcess $proc.Id -ErrorAction SilentlyContinue
  foreach($c in @($conns)){
    $listeners += [pscustomobject]@{
      ProcessId=$proc.Id
      ProcessName=$proc.ProcessName
      Address=$c.LocalAddress
      Port=$c.LocalPort
    }
  }
}
$probes=@()
foreach($port in @($listeners.Port | Sort-Object -Unique)){
  foreach($scheme in @('http','https')){
    $uri="${scheme}://127.0.0.1:$port/"
    try{
      $r=Invoke-WebRequest -Uri $uri -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop
      $probes += [pscustomobject]@{Uri=$uri;StatusCode=[int]$r.StatusCode;Ok=$true}
    }catch{
      $status=$null
      try{$status=[int]$_.Exception.Response.StatusCode.value__}catch{}
      $probes += [pscustomobject]@{Uri=$uri;StatusCode=$status;Ok=($null -ne $status)}
    }
  }
}
[pscustomobject]@{
 observed_at=(Get-Date).ToString('o')
 processes=$procs
 listeners=$listeners
 probes=$probes
} | ConvertTo-Json -Depth 6