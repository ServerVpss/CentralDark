$ErrorActionPreference='Stop'
$logs=@(
  @{Name='Application';Path="$env:SystemRoot\System32\Winevt\Logs\Application.evtx"},
  @{Name='System';Path="$env:SystemRoot\System32\Winevt\Logs\System.evtx"},
  @{Name='HardwareEvents';Path="$env:SystemRoot\System32\Winevt\Logs\HardwareEvents.evtx"},
  @{Name='Security';Path="$env:SystemRoot\System32\Winevt\Logs\Security.evtx"}
)
$out=@()
foreach($l in $logs){
  $entry=[ordered]@{name=$l.Name;path=$l.Path;file_exists=(Test-Path -LiteralPath $l.Path);accessible=$false;sample_count=0;latest_time=$null;latest_id=$null;latest_level=$null;error=$null}
  try{
    $events=Get-WinEvent -LogName $l.Name -MaxEvents 5 -ErrorAction Stop
    $entry.accessible=$true
    $entry.sample_count=@($events).Count
    if($events){
      $entry.latest_time=$events[0].TimeCreated
      $entry.latest_id=$events[0].Id
      $entry.latest_level=$events[0].LevelDisplayName
    }
  }catch{
    $entry.error=$_.Exception.GetType().Name
  }
  $out += [pscustomobject]$entry
}
$out | ConvertTo-Json -Depth 4