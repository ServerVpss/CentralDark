$ErrorActionPreference='Stop'
$report=Get-Content -Raw -LiteralPath 'E:\CentralDark\_tmp\brain-vault-diff-20260918.json'|ConvertFrom-Json
$manifestPath='E:\CentralDark\Pivete\CASA-VAULT\00-CANONICO\docs\BRAIN\.hermes-sync-manifest.json'
$manifest=Get-Content -Raw -LiteralPath $manifestPath|ConvertFrom-Json
function BaseHash([string]$path){
  $p=$path -replace '\\','/'
  $prop=$manifest.PSObject.Properties[$p]
  if($prop){ return [string]$prop.Value.Hash }
  return $null
}
$rows=@()
foreach($d in $report.diff){
  $base=BaseHash $d.path
  $rh=if($d.repo){[string]$d.repo.hash}else{$null}
  $vh=if($d.vault){[string]$d.vault.hash}else{$null}
  $rc=if($base -and $rh){$rh -ne $base}elseif($rh){$true}else{$false}
  $vc=if($base -and $vh){$vh -ne $base}elseif($vh){$true}else{$false}
  $class = if($d.state -eq 'REPO_ONLY'){
    if($base -and -not $rc){'VAULT_MISSING_UNCHANGED_REPO'}else{'REPO_NEW_OR_CHANGED'}
  } elseif($d.state -eq 'VAULT_ONLY'){
    if($base -and -not $vc){'REPO_MISSING_UNCHANGED_VAULT'}else{'VAULT_NEW_OR_CHANGED'}
  } else {
    if($rc -and $vc){'BOTH_CHANGED_CONFLICT'}
    elseif($rc){'REPO_CHANGED_ONLY'}
    elseif($vc){'VAULT_CHANGED_ONLY'}
    else{'HASH_DIFF_WITHOUT_BASELINE_SIGNAL'}
  }
  $rows += [pscustomobject]@{path=$d.path;state=$d.state;classification=$class;baseline=$base;repo_hash=$rh;vault_hash=$vh}
}
$rows|ConvertTo-Json -Depth 5|Set-Content -LiteralPath 'E:\CentralDark\_tmp\brain-sync-classified-20260918.json' -Encoding UTF8
$rows|Group-Object classification|Sort-Object Name|Select-Object Name,Count|Format-Table -AutoSize
Write-Output '===MATERIAL NON-REPO-ONLY==='
$rows|Where-Object {$_.classification -notin @('VAULT_MISSING_UNCHANGED_REPO','REPO_NEW_OR_CHANGED')}|Select-Object classification,path|Format-Table -AutoSize
