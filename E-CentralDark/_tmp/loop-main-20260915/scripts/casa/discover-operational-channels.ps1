param([switch]$Json)
$ErrorActionPreference='Stop'
$ssh = @(Get-CimInstance Win32_Process -Filter "Name='ssh.exe'")
$pids = @($ssh.ProcessId)
$tcp = @(Get-NetTCPConnection -State Established -ErrorAction SilentlyContinue | Where-Object { $pids -contains $_.OwningProcess })
$rows = foreach($c in $tcp){
  $p=$ssh | Where-Object ProcessId -eq $c.OwningProcess | Select-Object -First 1
  [pscustomobject]@{pid=$c.OwningProcess; remote="$($c.RemoteAddress):$($c.RemotePort)"; state='ESTABLISHED'; created=$p.CreationDate; command_known=[bool]$p.CommandLine}
}
$result=[pscustomobject]@{measured_at_utc=(Get-Date).ToUniversalTime().ToString('o'); ssh_established=$rows.Count; channels=$rows; semantics='NEW_ATTEMPT_FAILED != EXISTING_CHANNEL_DEAD'}
if($Json){$result|ConvertTo-Json -Depth 5}else{$result; $rows|Format-Table -Auto}
if($rows.Count -eq 0){exit 2}
