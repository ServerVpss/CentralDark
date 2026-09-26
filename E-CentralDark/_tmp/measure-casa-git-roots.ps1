$ErrorActionPreference='SilentlyContinue'
$candidates=@(
 'E:\CentralDark\clean',
 'E:\CentralDark\full',
 'E:\CentralDark\workspace',
 'E:\CentralDark\wt-channel-crystal',
 'E:\CentralDark\_WORKTREES\pr1562-funnel',
 'E:\CentralDark\_WORKTREES\pr1574-runtime-gate',
 'E:\CentralDark\_WORKTREES\zendrive-hermes-live'
)
$result=@()
foreach($p in $candidates){
  if(!(Test-Path -LiteralPath $p)){continue}
  & git -C $p rev-parse --is-inside-work-tree *> $null
  if($LASTEXITCODE -ne 0){continue}
  $head=(& git -C $p rev-parse HEAD 2>$null | Select-Object -First 1)
  $branch=(& git -C $p branch --show-current 2>$null | Select-Object -First 1)
  $origin=(& git -C $p rev-parse origin/main 2>$null | Select-Object -First 1)
  $status=@(& git -C $p status --porcelain=v1 2>$null)
  $remote=(& git -C $p remote get-url origin 2>$null | Select-Object -First 1)
  $result += [pscustomobject]@{path=$p;head=$head;branch=$branch;origin_main=$origin;dirty_count=$status.Count;remote=$remote}
}
$result | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath 'E:\CentralDark\_tmp\measure-casa-git-roots.json' -Encoding UTF8
Write-Output 'CASA_GIT_ROOTS_RECEIPT=E:\CentralDark\_tmp\measure-casa-git-roots.json'