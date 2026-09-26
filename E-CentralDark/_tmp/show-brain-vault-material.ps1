$j=Get-Content -Raw -LiteralPath 'E:\CentralDark\_tmp\brain-vault-diff-20260918.json'|ConvertFrom-Json
$j.diff | Where-Object { $_.state -in @('VAULT_ONLY','HASH_DIFF') } | ForEach-Object {
  [pscustomobject]@{state=$_.state;path=$_.path;repo_mtime=$_.repo.mtime;vault_mtime=$_.vault.mtime;repo_hash=$_.repo.hash;vault_hash=$_.vault.hash}
} | Format-List
