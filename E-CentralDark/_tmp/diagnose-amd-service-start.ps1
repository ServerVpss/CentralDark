$ErrorActionPreference='SilentlyContinue'
$cpu=Get-CimInstance Win32_Processor | Select-Object Name,Manufacturer,ProcessorId
$cs=Get-CimInstance Win32_ComputerSystem | Select-Object Manufacturer,Model,SystemType
$svc=@()
foreach($n in @('AMDManageabilityAPI','AIMTManageabilityService')){
  $x=Get-CimInstance Win32_Service -Filter "Name='$n'"
  $svc += [pscustomobject]@{Name=$x.Name;State=$x.State;StartMode=$x.StartMode;StartName=$x.StartName;PathName=$x.PathName}
}
$since=(Get-Date).AddMinutes(-20)
$events=Get-WinEvent -FilterHashtable @{LogName='System';StartTime=$since} -ErrorAction SilentlyContinue |
 Where-Object { $_.ProviderName -eq 'Service Control Manager' -and ($_.Message -match 'AMDManageabilityAPI|AMD Manageability API|AIMTManageabilityService|AIM-T Manageability') } |
 Select-Object TimeCreated,Id,LevelDisplayName,Message
$appEvents=Get-WinEvent -FilterHashtable @{LogName='Application';StartTime=$since} -ErrorAction SilentlyContinue |
 Where-Object { $_.Message -match 'amdmanapi|AIMTSvc|AMD Manageability|AIM-T' } |
 Select-Object TimeCreated,Id,ProviderName,LevelDisplayName,Message
[pscustomobject]@{cpu=$cpu;computer=$cs;services=$svc;system_events=$events;application_events=$appEvents}|ConvertTo-Json -Depth 7