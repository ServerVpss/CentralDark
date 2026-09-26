$ErrorActionPreference='SilentlyContinue'
$proc=Get-Process -Name screenpipe-app -ErrorAction SilentlyContinue | Select-Object -First 1
$envUrl=[Environment]::GetEnvironmentVariable('SCREENPIPE_LOCAL_API_URL','Process')
if(-not $envUrl){$envUrl=[Environment]::GetEnvironmentVariable('SCREENPIPE_LOCAL_API_URL','User')}
if(-not $envUrl){$envUrl=[Environment]::GetEnvironmentVariable('SCREENPIPE_LOCAL_API_URL','Machine')}
$roots=@(
  'C:\Users\Administrador\.screenpipe',
  'C:\Users\danda\.screenpipe',
  'C:\Users\Administrador\AppData\Local\screenpipe',
  'C:\Users\danda\AppData\Local\screenpipe'
)
$configFiles=@()
foreach($r in $roots){
  if(Test-Path -LiteralPath $r){
    $configFiles += Get-ChildItem -LiteralPath $r -Recurse -File -ErrorAction SilentlyContinue |
      Where-Object { $_.Name -match 'config|settings|env|json|toml|yaml|yml' } |
      Select-Object -First 80 FullName,Length,LastWriteTime
  }
}
[pscustomobject]@{
 observed_at=(Get-Date).ToString('o')
 process=if($proc){[pscustomobject]@{id=$proc.Id;path=$proc.Path}}else{$null}
 screenpipe_local_api_url=$envUrl
 roots=@($roots | ForEach-Object {[pscustomobject]@{path=$_;exists=(Test-Path -LiteralPath $_)}})
 config_files=$configFiles
}|ConvertTo-Json -Depth 6