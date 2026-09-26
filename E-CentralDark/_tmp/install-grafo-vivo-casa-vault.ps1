$ErrorActionPreference='Stop'
$src='E:\CentralDark\CentralDark\docs\.obsidian\plugins\centraldark-grafo-vivo'
$dst='E:\CentralDark\Pivete\CASA-VAULT\.obsidian\plugins\centraldark-grafo-vivo'
New-Item -ItemType Directory -Force -Path $dst | Out-Null
Copy-Item -LiteralPath (Join-Path $src 'main.js') -Destination (Join-Path $dst 'main.js') -Force
Copy-Item -LiteralPath (Join-Path $src 'manifest.json') -Destination (Join-Path $dst 'manifest.json') -Force
Copy-Item -LiteralPath (Join-Path $src 'styles.css') -Destination (Join-Path $dst 'styles.css') -Force
Copy-Item -LiteralPath (Join-Path $src 'data.json') -Destination (Join-Path $dst 'data.json') -Force
Write-Output 'PLUGIN_COPY_OK'
