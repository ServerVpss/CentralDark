$ErrorActionPreference = 'Stop'
$repo = 'E:\CentralDark\CentralDark'
$wt = 'E:\CentralDark\worktrees\tlc23-master-fixed-point-20260915'
$branch = 'cristal/tlc23-master-fixed-point-20260915'
git -C $repo fetch origin main
if (Test-Path $wt) {
  Write-Host 'WORKTREE_EXISTS'
  git -C $wt status --short --branch
} else {
  $exists = git -C $repo branch --list $branch
  if ($exists) { git -C $repo worktree add $wt $branch }
  else { git -C $repo worktree add -b $branch $wt origin/main }
}
Write-Host 'HEAD'
git -C $wt rev-parse HEAD
git -C $wt status --short --branch
