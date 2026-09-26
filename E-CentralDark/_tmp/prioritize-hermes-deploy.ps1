$ErrorActionPreference='Continue'
$repo='ServerVpss/CentralDark'
$keep=35347815359
$states=@('in_progress','queued')
foreach($state in $states){
  $json = gh run list --repo $repo --status $state --limit 100 --json databaseId,workflowName,headSha 2>$null
  if(-not $json){ continue }
  $runs = $json | ConvertFrom-Json
  foreach($r in $runs){
    if([int64]$r.databaseId -eq $keep){ continue }
    gh run cancel $r.databaseId --repo $repo 2>$null | Out-Null
    Write-Output ('CANCEL_REQUESTED='+$r.databaseId+' WORKFLOW='+$r.workflowName+' HEAD='+$r.headSha)
  }
}
Write-Output ('KEPT_RUN='+$keep)
