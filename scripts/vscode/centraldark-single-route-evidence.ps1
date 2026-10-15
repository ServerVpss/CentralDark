# CentralDark single-route evidence probe (read-only)
# Casa Windows -> VS Code -> Hermes -> Desktop Commander -> GitHub.
# Does not start, stop, alter, merge or deploy anything.
[CmdletBinding()]
param([string]$Repo = 'K:\_worktrees\bolt-desktop')
$ErrorActionPreference = 'Stop'
function Emit([string]$Name, [string]$State, [string]$Evidence) {
  [pscustomobject]@{ check=$Name; state=$State; evidence=$Evidence }
}
$results = @()
foreach ($pidValue in @(9872,8224,23332)) {
  $p = Get-CimInstance Win32_Process -Filter "ProcessId=$pidValue" -ErrorAction SilentlyContinue
  if ($null -eq $p) {
    $results += Emit "terminal-$pidValue" 'UNKNOWN' 'process not found'
    continue
  }
  $children = @(Get-CimInstance Win32_Process -Filter "ParentProcessId=$pidValue" -ErrorAction SilentlyContinue)
  $childNames = ($children | ForEach-Object Name | Sort-Object -Unique) -join ','
  $results += Emit "terminal-$pidValue" 'OBSERVED' "shell=$($p.Name); children=$childNames"
}
if (Test-Path -LiteralPath (Join-Path $Repo '.git')) {
  $branch = (& git -C $Repo branch --show-current 2>$null)
  $porcelain = @(& git -C $Repo status --porcelain 2>$null)
  $aheadBehind = (& git -C $Repo rev-list --left-right --count 'HEAD...@{upstream}' 2>$null)
  $results += Emit 'repository' 'OBSERVED' "branch=$branch; changed_entries=$($porcelain.Count); ahead_behind=$aheadBehind"
} else {
  $results += Emit 'repository' 'UNKNOWN' 'git checkout not verified'
}
$results += Emit 'vscode-restore' 'UNKNOWN' 'extension health requires extension-host evidence'
$results += Emit 'telemetry-api' 'UNKNOWN' 'endpoint and authentication not verified'
$results += Emit 'cockpit-browser' 'UNKNOWN' 'click-through and four skins not verified'
$results | ConvertTo-Json -Depth 4
