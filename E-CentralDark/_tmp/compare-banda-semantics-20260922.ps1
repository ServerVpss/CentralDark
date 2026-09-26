$ErrorActionPreference='Stop'
$mainPath='E:\CentralDark\_tmp\centraldark-ci-main-20260919\docs\BRAIN\01-CONCEITOS\02-BANDA\BANDA_COMPASSO_GLOBAL.json'
$vaultPath='E:\CentralDark\Pivete\CASA-VAULT\00-CANONICO\docs\BRAIN\01-CONCEITOS\02-BANDA\BANDA_COMPASSO_GLOBAL.json'
$m=Get-Content -Raw -LiteralPath $mainPath|ConvertFrom-Json
$v=Get-Content -Raw -LiteralPath $vaultPath|ConvertFrom-Json
function Ids($o){
  $ids=@()
  if($o.items){$ids += @($o.items|ForEach-Object {$_.id})}
  if($o.roster){$ids += @($o.roster|ForEach-Object {$_.id})}
  if($o.members){$ids += @($o.members|ForEach-Object {$_.id})}
  return @($ids|Where-Object {$_}|Sort-Object -Unique)
}
$mi=Ids $m
$vi=Ids $v
$vaultOnly=@($vi|Where-Object {$_ -notin $mi})
$mainOnly=@($mi|Where-Object {$_ -notin $vi})
$mk=@($m.PSObject.Properties.Name|Sort-Object)
$vk=@($v.PSObject.Properties.Name|Sort-Object)
[pscustomobject]@{
 main_top_keys=$mk
 vault_top_keys=$vk
 main_ids=$mi
 vault_ids=$vi
 vault_only_ids=$vaultOnly
 main_only_ids=$mainOnly
 main_id_count=$mi.Count
 vault_id_count=$vi.Count
 main_only_count=$mainOnly.Count
 vault_only_count=$vaultOnly.Count
}|ConvertTo-Json -Depth 6