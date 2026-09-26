$ErrorActionPreference='Stop'
$repo='E:\CentralDark\CentralDark'
$dirtyRaw=@(& git -C $repo status --porcelain=v1)
$dirty=@()
foreach($line in $dirtyRaw){
  if([string]::IsNullOrWhiteSpace($line)){continue}
  $path=$line.Substring(3)
  if($path -match ' -> '){$path=($path -split ' -> ')[-1]}
  $dirty += $path.Trim('"')
}
$incoming=@(& git -C $repo diff --name-only HEAD..origin/main)
$intersection=@($dirty | Where-Object { $incoming -contains $_ } | Sort-Object -Unique)
[pscustomobject]@{
 observed_at=(Get-Date).ToString('o')
 dirty_count=@($dirty).Count
 incoming_changed_count=@($incoming).Count
 collision_count=@($intersection).Count
 collisions=$intersection
 dirty_paths=$dirty
}|ConvertTo-Json -Depth 6
