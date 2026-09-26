$ErrorActionPreference='SilentlyContinue'
$names='AMD','DASH','AMC','AIM','Manageability'
$services=Get-CimInstance Win32_Service | Where-Object {
  $n=$_.Name+' '+$_.DisplayName+' '+$_.PathName
  $names | Where-Object { $n -match $_ }
} | Select-Object Name,DisplayName,State,StartMode,PathName

$ports=3274,3275,3277,8080
$listeners=foreach($p in $ports){
  $tcp=Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue
  if($tcp){
    foreach($x in $tcp){
      $proc=Get-Process -Id $x.OwningProcess -ErrorAction SilentlyContinue
      [pscustomobject]@{Port=$p;Protocol='TCP';Address=$x.LocalAddress;PID=$x.OwningProcess;Process=$proc.ProcessName;Path=$proc.Path}
    }
  } else {
    [pscustomobject]@{Port=$p;Protocol='TCP';Address=$null;PID=$null;Process=$null;Path=$null}
  }
}
$roots=@('C:\Program Files\AMD','C:\Program Files (x86)\AMD','C:\Program Files\AMD Manageability','C:\Program Files (x86)\AMD Manageability')
$files=@()
foreach($r in $roots){
 if(Test-Path $r){
   $files += Get-ChildItem -LiteralPath $r -Recurse -File -ErrorAction SilentlyContinue |
      Where-Object { $_.Name -match 'dash|manage|aim|amc' } |
      Select-Object -First 120 FullName,Length,LastWriteTime
 }
}
[pscustomobject]@{
  observed_at=(Get-Date).ToString('o')
  services=$services
  listeners=$listeners
  candidate_files=$files
} | ConvertTo-Json -Depth 6