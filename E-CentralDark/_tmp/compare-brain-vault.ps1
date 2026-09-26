$ErrorActionPreference='Stop'
$repo='E:\CentralDark\CentralDark\docs\BRAIN'
$vault='E:\CentralDark\Pivete\CASA-VAULT\00-CANONICO\docs\BRAIN'
$out='E:\CentralDark\_tmp\brain-vault-diff-20260918.json'
function Rel($base,$full){ return $full.Substring($base.Length).TrimStart('\') }
$repoFiles=@{}
Get-ChildItem -LiteralPath $repo -Recurse -File | ForEach-Object {
  $rel=Rel $repo $_.FullName
  $repoFiles[$rel]=@{size=$_.Length;hash=(Get-FileHash -LiteralPath $_.FullName -Algorithm SHA256).Hash;mtime=$_.LastWriteTimeUtc.ToString('o')}
}
$vaultFiles=@{}
Get-ChildItem -LiteralPath $vault -Recurse -File | ForEach-Object {
  $rel=Rel $vault $_.FullName
  $vaultFiles[$rel]=@{size=$_.Length;hash=(Get-FileHash -LiteralPath $_.FullName -Algorithm SHA256).Hash;mtime=$_.LastWriteTimeUtc.ToString('o')}
}
$all=@($repoFiles.Keys + $vaultFiles.Keys | Sort-Object -Unique)
$diff=@()
foreach($rel in $all){
  $r=$repoFiles[$rel]; $v=$vaultFiles[$rel]
  if(-not $r){ $diff += [pscustomobject]@{path=$rel;state='VAULT_ONLY';repo=$null;vault=$v} }
  elseif(-not $v){ $diff += [pscustomobject]@{path=$rel;state='REPO_ONLY';repo=$r;vault=$null} }
  elseif($r.hash -ne $v.hash){ $diff += [pscustomobject]@{path=$rel;state='HASH_DIFF';repo=$r;vault=$v} }
}
$result=[ordered]@{
 observed_at=(Get-Date).ToString('o')
 repo_root=$repo
 vault_root=$vault
 repo_count=$repoFiles.Count
 vault_count=$vaultFiles.Count
 diff_count=$diff.Count
 repo_only=@($diff|Where-Object state -eq 'REPO_ONLY').Count
 vault_only=@($diff|Where-Object state -eq 'VAULT_ONLY').Count
 hash_diff=@($diff|Where-Object state -eq 'HASH_DIFF').Count
 diff=$diff
}
$result|ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $out -Encoding UTF8
Write-Output ('REPO_COUNT='+$repoFiles.Count)
Write-Output ('VAULT_COUNT='+$vaultFiles.Count)
Write-Output ('DIFF_COUNT='+$diff.Count)
Write-Output ('REPO_ONLY='+(@($diff|Where-Object state -eq 'REPO_ONLY').Count))
Write-Output ('VAULT_ONLY='+(@($diff|Where-Object state -eq 'VAULT_ONLY').Count))
Write-Output ('HASH_DIFF='+(@($diff|Where-Object state -eq 'HASH_DIFF').Count))
$diff | Select-Object -First 120 path,state | Format-Table -AutoSize
Write-Output ('REPORT='+$out)
