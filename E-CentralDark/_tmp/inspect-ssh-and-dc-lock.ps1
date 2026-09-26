$ErrorActionPreference = 'Continue'
$targets = @(42660,22992,29048)
$out = foreach ($pidValue in $targets) {
  $p = Get-CimInstance Win32_Process -Filter "ProcessId=$pidValue" -ErrorAction SilentlyContinue
  if ($null -eq $p) {
    [pscustomobject]@{ pid=$pidValue; present=$false }
  } else {
    [pscustomobject]@{
      pid=$pidValue
      present=$true
      name=$p.Name
      executablePath=$p.ExecutablePath
      parentProcessId=$p.ParentProcessId
      commandLine=$p.CommandLine
    }
  }
}
$tcp = Get-NetTCPConnection -OwningProcess 22992,29048 -ErrorAction SilentlyContinue |
  Select-Object LocalAddress,LocalPort,RemoteAddress,RemotePort,State,OwningProcess
[pscustomobject]@{
  observed_at = (Get-Date).ToString('o')
  processes = $out
  tcp = $tcp
} | ConvertTo-Json -Depth 6
