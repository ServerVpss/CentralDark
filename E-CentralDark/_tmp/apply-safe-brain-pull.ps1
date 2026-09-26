$ErrorActionPreference='Stop'
$repo='E:\CentralDark\CentralDark\docs\BRAIN'
$vault='E:\CentralDark\Pivete\CASA-VAULT\00-CANONICO\docs\BRAIN'
$conf='E:\CentralDark\Pivete\CASA-VAULT\90-CONFLITOS\2026-09-18-brain-sync'
$j=Get-Content -Raw -LiteralPath 'E:\CentralDark\_tmp\brain-sync-classified-20260918.json'|ConvertFrom-Json
$copied=@();$preserved=@();$skipped=@()
function EnsureParent($p){$d=Split-Path -Parent $p;if($d){New-Item -ItemType Directory -Force -Path $d|Out-Null}}
foreach($x in $j){
  $rel=[string]$x.path
  if($rel -like '.obsidian\*' -or $rel -eq '.hermes-sync-manifest.json'){ $skipped += $rel; continue }
  $src=Join-Path $repo $rel
  $dst=Join-Path $vault $rel
  if($x.classification -in @('REPO_NEW_OR_CHANGED','REPO_CHANGED_ONLY')){
    if(Test-Path -LiteralPath $src){
      EnsureParent $dst
      Copy-Item -LiteralPath $src -Destination $dst -Force
      $copied += $rel
    }
  } elseif($x.classification -eq 'BOTH_CHANGED_CONFLICT'){
    foreach($side in @('repo','vault')){
      $from=if($side -eq 'repo'){$src}else{$dst}
      if(Test-Path -LiteralPath $from){
        $to=Join-Path (Join-Path $conf $side) $rel
        EnsureParent $to
        Copy-Item -LiteralPath $from -Destination $to -Force
      }
    }
    # Canonical repo copy wins projection after both versions are preserved.
    if(Test-Path -LiteralPath $src){
      EnsureParent $dst
      Copy-Item -LiteralPath $src -Destination $dst -Force
      $copied += $rel
      $preserved += $rel
    }
  }
}
$receipt=[ordered]@{
 schema='centraldark.casa.brain.safe-pull.v1'
 observed_at=(Get-Date).ToString('o')
 source_repo_head='7bdfd52ad2d8be2dabe957fbd3b51ada7c261d97'
 remote_main_head='466d8c058f0f173111b3d783cb6ed74900240a71'
 note='remote main differs in docs/BRAIN by two known additions; applied separately'
 copied_count=$copied.Count
 conflicts_preserved=$preserved
 skipped_local_ui=$skipped
 vault_changed_only_not_overwritten=@($j|Where-Object classification -eq 'VAULT_CHANGED_ONLY'|ForEach-Object path)
 vault_new_not_overwritten=@($j|Where-Object classification -eq 'VAULT_NEW_OR_CHANGED'|ForEach-Object path)
 unknown_is_not_pass=$true
}
$receiptPath='E:\CentralDark\Pivete\CASA-VAULT\.hermes-sync\receipts\2026-09-18-brain-safe-pull.json'
EnsureParent $receiptPath
$receipt|ConvertTo-Json -Depth 8|Set-Content -LiteralPath $receiptPath -Encoding UTF8
Write-Output ('COPIED='+$copied.Count)
Write-Output ('CONFLICTS_PRESERVED='+$preserved.Count)
Write-Output ('SKIPPED='+$skipped.Count)
Write-Output ('RECEIPT='+$receiptPath)
