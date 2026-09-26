$ErrorActionPreference='Stop'
$sentinel='E:\CentralDark\CentralDark\scripts\trigger-fabric\system_sentinel.py'
$events='E:\CentralDark\CentralDark\.artifacts\system-sentinel\events.jsonl'
[pscustomobject]@{
 sentinel_exists=(Test-Path -LiteralPath $sentinel)
 python=(python --version 2>&1 | Select-Object -First 1)
 events_before=if(Test-Path -LiteralPath $events){(Get-Content -LiteralPath $events | Measure-Object -Line).Lines}else{0}
}|ConvertTo-Json -Compress