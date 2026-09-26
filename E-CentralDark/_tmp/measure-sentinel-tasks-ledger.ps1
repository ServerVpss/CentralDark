$ErrorActionPreference='SilentlyContinue'
$tasks=Get-ScheduledTask -TaskPath '\CentralDark\' -ErrorAction SilentlyContinue |
  Select-Object TaskName,TaskPath,State,@{n='Actions';e={($_.Actions | ForEach-Object { $_.Execute+' '+$_.Arguments }) -join ' | '}},@{n='Triggers';e={($_.Triggers | ForEach-Object { $_.CimClass.CimClassName+':'+$_.StartBoundary }) -join ' | '}}
$events='E:\CentralDark\CentralDark\.artifacts\system-sentinel\events.jsonl'
$last=$null
$lines=0
if(Test-Path -LiteralPath $events){
  $lines=(Get-Content -LiteralPath $events | Measure-Object -Line).Lines
  $last=Get-Content -LiteralPath $events -Tail 1
}
[pscustomobject]@{
 observed_at=(Get-Date).ToString('o')
 tasks=$tasks
 ledger=[pscustomobject]@{path=$events;exists=(Test-Path -LiteralPath $events);lines=$lines;last=$last}
}|ConvertTo-Json -Depth 7