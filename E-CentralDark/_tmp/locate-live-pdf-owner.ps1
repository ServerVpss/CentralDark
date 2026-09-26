$ErrorActionPreference='SilentlyContinue'
$roots=@(
 'E:\CentralDark\clean',
 'E:\CentralDark\full',
 'E:\CentralDark\workspace',
 'E:\CentralDark\worktrees\tlc23-master-fixed-point-20260915',
 'E:\CentralDark\worktrees\tlc23-runtime-reconcile-20260915',
 'E:\CentralDark\worktrees\tlc23-source-provenance-20260915',
 'E:\CentralDark\_WORKTREES\pr1574-runtime-gate'
)
$out=@()
foreach($r in $roots){
 if(!(Test-Path -LiteralPath $r)){ continue }
 $git=Test-Path -LiteralPath (Join-Path $r '.git')
 $owner=Join-Path $r 'scripts\lupa\pdf-conformance-cc2003.mjs'
 $head=$null; $branch=$null
 if($git){
   Push-Location $r
   try{
     $head=(git rev-parse HEAD 2>$null)
     $branch=(git branch --show-current 2>$null)
   }finally{Pop-Location}
 }
 $out += [pscustomobject]@{
   root=$r
   git=$git
   head=$head
   branch=$branch
   owner_exists=(Test-Path -LiteralPath $owner)
   owner_path=$owner
 }
}
$out|ConvertTo-Json -Depth 5