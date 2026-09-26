$ErrorActionPreference='SilentlyContinue'
$targets=@(
 'C:\Program Files\AMD\Manageability API\bin\dashcli.exe',
 'C:\Program Files\AMD\Manageability API\bin\amdmanapi.exe',
 'C:\Program Files\AMD Management Console\bin\AMCService.exe',
 'C:\Program Files\AMD Management Console\bin\AMCWebService.exe',
 'C:\Program Files\AMD\Manageability Service\bin\AIMTSvc.exe'
)
$versions=foreach($t in $targets){
 if(Test-Path $t){
   $i=(Get-Item $t).VersionInfo
   [pscustomobject]@{Path=$t;FileVersion=$i.FileVersion;ProductVersion=$i.ProductVersion;ProductName=$i.ProductName}
 }
}
$dashHelp=''
if(Test-Path 'C:\Program Files\AMD\Manageability API\bin\dashcli.exe'){
  $dashHelp=& 'C:\Program Files\AMD\Manageability API\bin\dashcli.exe' --help 2>&1 | Out-String
  if(-not $dashHelp){$dashHelp=& 'C:\Program Files\AMD\Manageability API\bin\dashcli.exe' -h 2>&1 | Out-String}
}
$configFiles=@()
foreach($r in @('C:\Program Files\AMD\Manageability API','C:\Program Files\AMD Management Console','C:\Program Files\AMD\Manageability Service')){
 if(Test-Path $r){
   $configFiles += Get-ChildItem -LiteralPath $r -Recurse -File -ErrorAction SilentlyContinue |
      Where-Object { $_.Extension -in '.json','.xml','.config','.ini','.yaml','.yml','.conf' } |
      Select-Object FullName,Length,LastWriteTime
 }
}
[pscustomobject]@{
 observed_at=(Get-Date).ToString('o')
 versions=$versions
 dash_help=($dashHelp -split [Environment]::NewLine | Select-Object -First 80)
 config_files=$configFiles
}|ConvertTo-Json -Depth 7