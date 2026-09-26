Start-Sleep -Seconds 30
$repo='E:\CentralDark\worktrees\tlc23-master-fixed-point-20260915'
Set-Location $repo
gh pr view 1534 --json headRefOid,mergeable,statusCheckRollup
gh run list --branch cristal/tlc23-master-fixed-point-20260915 --limit 15 --json databaseId,headSha,status,conclusion,workflowName,name,url
