$ErrorActionPreference='Stop'
$repo='E:\CentralDark\CentralDark'
$vault='E:\CentralDark\Pivete\CASA-VAULT'
$runtime='E:\CentralDark\runtime'

Push-Location $repo
try {
  $head=(git rev-parse HEAD).Trim()
  $branch=(git branch --show-current).Trim()
  $origin=(git rev-parse origin/main 2>$null).Trim()
  $status=@(git status --porcelain=v1)
  $untracked=@($status | Where-Object { $_ -match '^\?\?' })
  $modified=@($status | Where-Object { $_ -notmatch '^\?\?' })
} finally { Pop-Location }

$vaultRecent=@()
if(Test-Path $vault){
  $vaultRecent=Get-ChildItem -LiteralPath $vault -Recurse -File -ErrorAction SilentlyContinue |
    Sort-Object LastWriteTime -Descending |
    Select-Object -First 25 FullName,Length,LastWriteTime
}
$runtimeRecent=@()
if(Test-Path $runtime){
  $runtimeRecent=Get-ChildItem -LiteralPath $runtime -Recurse -File -ErrorAction SilentlyContinue |
    Sort-Object LastWriteTime -Descending |
    Select-Object -First 25 FullName,Length,LastWriteTime
}
[pscustomobject]@{
 observed_at=(Get-Date).ToString('o')
 repo=$repo
 head=$head
 branch=$branch
 origin_main=$origin
 dirty_count=$status.Count
 modified_count=$modified.Count
 untracked_count=$untracked.Count
 status=$status
 vault_recent=$vaultRecent
 runtime_recent=$runtimeRecent
}|ConvertTo-Json -Depth 6