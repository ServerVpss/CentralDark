$ErrorActionPreference='Continue'
$out=[ordered]@{}
foreach($s in @('AMDManageabilityAPI','AIMTManageabilityService')){
  try{
    Start-Service -Name $s -ErrorAction Stop
    Start-Sleep -Seconds 3
    $svc=Get-Service -Name $s
    $out[$s]=[ordered]@{state=$svc.Status.ToString();started=$true;error=$null}
  }catch{
    $svc=Get-Service -Name $s -ErrorAction SilentlyContinue
    $out[$s]=[ordered]@{state=if($svc){$svc.Status.ToString()}else{'NOT_FOUND'};started=$false;error=$_.Exception.Message}
  }
}
$ports=3274,3275,3277,8080,8082
$po=@()
foreach($p in $ports){
  $x=Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue
  if($x){
    foreach($i in $x){
      $proc=Get-Process -Id $i.OwningProcess -ErrorAction SilentlyContinue
      $po += [pscustomobject]@{port=$p;listen=$true;pid=$i.OwningProcess;process=$proc.ProcessName;path=$proc.Path}
    }
  }else{
    $po += [pscustomobject]@{port=$p;listen=$false;pid=$null;process=$null;path=$null}
  }
}
$out['ports']=$po
$out|ConvertTo-Json -Depth 6