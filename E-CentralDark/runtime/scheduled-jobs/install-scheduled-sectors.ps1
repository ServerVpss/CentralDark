[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference='Stop'

$runner='E:\CentralDark\runtime\scheduled-jobs\run-scheduled-sector.ps1'
if(!(Test-Path -LiteralPath $runner)){ throw ('RUNNER_NOT_FOUND='+$runner) }

$taskPath='\CentralDark\'
$principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Highest
$settings = New-ScheduledTaskSettingsSet -MultipleInstances IgnoreNew -StartWhenAvailable -ExecutionTimeLimit (New-TimeSpan -Minutes 25)

function New-CDTriggers([string[]]$times){
  $list=@()
  foreach($t in $times){ $list += New-ScheduledTaskTrigger -Daily -At $t }
  return $list
}

$defs=@(
  @{Name='Casa Remote Bridge'; Sector='REMOTE_BRIDGE'; Times=@('00:05','03:05','06:05','09:05','11:45')},
  @{Name='Casa Screenpipe Crystal'; Sector='SCREENPIPE_CRYSTAL'; Times=@('00:15','03:15','06:15','09:15','11:50')},
  @{Name='Casa PDF Gate'; Sector='PDF_GATE'; Times=@('00:25','03:25','06:25','09:25','11:55')},
  @{Name='Casa System Sentinel'; Sector='SYSTEM_SENTINEL'; Times=@('00:35','03:35','06:35','09:35','11:40')},
  @{Name='Casa Unified Build'; Sector='UNIFIED_BUILD'; Times=@('00:50','06:50','11:30')}
)

foreach($d in $defs){
  $arg = '-NoProfile -ExecutionPolicy Bypass -File "' + $runner + '" -Sector ' + $d.Sector
  $action=New-ScheduledTaskAction -Execute 'powershell.exe' -Argument $arg
  Register-ScheduledTask -TaskName $d.Name -TaskPath $taskPath -Action $action -Trigger (New-CDTriggers $d.Times) -Principal $principal -Settings $settings -Force | Out-Null
  Write-Output ('REGISTERED='+$taskPath+$d.Name)
}
Write-Output 'FINAL_PASS_CLAIMED=false'
Write-Output 'PDF_GATE_ALWAYS_ACTIVE=true'
