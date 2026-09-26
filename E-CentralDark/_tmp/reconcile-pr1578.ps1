$ErrorActionPreference='Stop'
$stamp=Get-Date -Format 'yyyyMMdd-HHmmss'
$work="E:\CentralDark\_tmp\pr1578-reconcile-$stamp"
$branch='cristal/direct-centraldark-mcp-bridge-20260918'
New-Item -ItemType Directory -Force -Path $work | Out-Null
Remove-Item -LiteralPath $work -Force -Recurse
& gh repo clone ServerVpss/CentralDark $work -- --filter=blob:none
if($LASTEXITCODE -ne 0){ throw "CLONE_FAILED:$LASTEXITCODE" }
Push-Location $work
try{
  git fetch origin main $branch
  if($LASTEXITCODE -ne 0){ throw "FETCH_FAILED:$LASTEXITCODE" }
  git checkout -B $branch "origin/$branch"
  if($LASTEXITCODE -ne 0){ throw "CHECKOUT_FAILED:$LASTEXITCODE" }
  $head=(git rev-parse HEAD).Trim()
  $main=(git rev-parse origin/main).Trim()
  Write-Host "WORKTREE=$work"
  Write-Host "HEAD_BEFORE=$head"
  Write-Host "MAIN=$main"
  git merge --no-commit --no-ff origin/main
  $mergeExit=$LASTEXITCODE
  $conflicts=@(git diff --name-only --diff-filter=U)
  Write-Host "MERGE_EXIT=$mergeExit"
  Write-Host "CONFLICT_COUNT=$($conflicts.Count)"
  $conflicts | ForEach-Object { Write-Host "CONFLICT=$_" }
  git status --short
} finally {
  Pop-Location
}
