$ErrorActionPreference='Stop'
$vault='E:\CentralDark\CentralDark\docs'
$pluginId='centraldark-grafo-vivo'
$dest=Join-Path $vault ".obsidian\plugins\$pluginId"
New-Item -ItemType Directory -Force -Path $dest | Out-Null
& gh release download obsidian-plugin-v0.5.0 --repo ServerVpss/CentralDark --pattern 'main.js' --pattern 'manifest.json' --pattern 'styles.css' --dir $dest --clobber
if($LASTEXITCODE -ne 0){ throw "GH_RELEASE_DOWNLOAD_FAILED:$LASTEXITCODE" }
$expected=@{
  'main.js'='2c67e144865bf4ae3ab21926f965f9259b08b9a8503b2189ec553d69272562da'
  'manifest.json'='0db30d1fcbe6bc931106c2187a36e7f415befa785ce68df28fcf915f057734bb'
  'styles.css'='d797d77552f5788846bbb3228b0b9145b21bb6d4a6832f1592b32f93aaa5f043'
}
foreach($name in @('main.js','manifest.json','styles.css')){
  $out=Join-Path $dest $name
  $sha=(Get-FileHash -Algorithm SHA256 -LiteralPath $out).Hash.ToLowerInvariant()
  if($sha -ne $expected[$name]){ throw ("HASH_MISMATCH:{0}:{1}" -f $name,$sha) }
}
$data=[ordered]@{
  urlGrafo='https://grafo.centralldark.com/api/graph?mode=vivo'
  intervaloSegundos=5
  abrirNotaAoClicar=$true
  knowledgeHubPublishEnabled=$true
  knowledgeHubUrl='https://api.centralldark.com/memoria/ingest'
  knowledgeHubToken=''
  autoUpdateAtivo=$true
  autoUpdateBaseUrl='https://kagejpghnwdfymddwxuf.supabase.co/functions/v1/plugin-release'
  autoUpdateIntervaloMinutos=10
  semanticRepoRoot='E:/CentralDark/CentralDark'
  semanticPython=''
}
$data | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath (Join-Path $dest 'data.json') -Encoding UTF8
$cp=Join-Path $vault '.obsidian\community-plugins.json'
$plugins=@()
if(Test-Path -LiteralPath $cp){ $plugins=@(Get-Content -LiteralPath $cp -Raw | ConvertFrom-Json) }
if($plugins -notcontains $pluginId){ $plugins += $pluginId }
$plugins | ConvertTo-Json | Set-Content -LiteralPath $cp -Encoding UTF8
$manifest=Get-Content -LiteralPath (Join-Path $dest 'manifest.json') -Raw | ConvertFrom-Json
[pscustomobject]@{
  PLUGIN_ID=$manifest.id
  VERSION=$manifest.version
  INSTALLED=$true
  HASH_MAIN=(Get-FileHash -Algorithm SHA256 (Join-Path $dest 'main.js')).Hash.ToLowerInvariant()
  AUTO_UPDATE=$data.autoUpdateAtivo
  GRAPH_URL=$data.urlGrafo
  ENABLED=(@(Get-Content -LiteralPath $cp -Raw | ConvertFrom-Json) -contains $pluginId)
  DEST=$dest
} | ConvertTo-Json -Depth 4
