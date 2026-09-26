$ErrorActionPreference='Stop'
$out=[ordered]@{}
$r1=Invoke-WebRequest -UseBasicParsing 'https://grafo.centralldark.com/api/graph?mode=vivo' -TimeoutSec 15
$j1=$r1.Content|ConvertFrom-Json
$out.graph_status=$r1.StatusCode
$out.graph_nodes=@($j1.nodes).Count
$out.graph_edges=@($j1.edges).Count
$u='https://kagejpghnwdfymddwxuf.supabase.co/functions/v1/plugin-release?arquivo=manifest.json'
$r2=Invoke-WebRequest -UseBasicParsing $u -TimeoutSec 15
$j2=$r2.Content|ConvertFrom-Json
$out.update_status=$r2.StatusCode
$out.update_id=$j2.id
$out.update_version=$j2.version
$dir='E:\CentralDark\CentralDark\docs\.obsidian\plugins\centraldark-grafo-vivo'
$m=Get-Content -Raw (Join-Path $dir 'manifest.json')|ConvertFrom-Json
$enabled=@(Get-Content -Raw 'E:\CentralDark\CentralDark\docs\.obsidian\community-plugins.json'|ConvertFrom-Json) -contains $m.id
$out.local_id=$m.id
$out.local_version=$m.version
$out.local_enabled=$enabled
$out.local_main_sha=(Get-FileHash -Algorithm SHA256 (Join-Path $dir 'main.js')).Hash.ToLowerInvariant()
$out|ConvertTo-Json -Depth 4