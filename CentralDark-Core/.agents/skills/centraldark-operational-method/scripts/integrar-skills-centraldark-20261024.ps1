param([switch]$ReconstruirImportacaoHistorica)
# Protecao: este script e a importacao INICIAL. A manutencao recorrente usa atualizar-catalogo-self-healing.ps1.
# Nao regravar catalogos refinados sem autorizacao explicita para restaurar o snapshot historico.
if (-not $ReconstruirImportacaoHistorica) {
 Write-Output 'IMPORTACAO_HISTORICA_PROTEGIDA: operacao sem escrita. Para atualizacao automatica use atualizar-catalogo-self-healing.ps1.'
 Write-Output 'Para reconstruir deliberadamente o catalogo inicial: -ReconstruirImportacaoHistorica (substitui indice e catalogo elaborados).'
 return
}
$ErrorActionPreference='Stop'
$root='K:\.agents\skills'
$canon=Join-Path $root 'centraldark-operational-method'
$dest=Join-Path $canon 'catalogo\skills-integradas'
New-Item -ItemType Directory -Force -Path $dest | Out-Null
$source=@(Get-ChildItem -LiteralPath $root -Directory | Where-Object {$_.Name -like 'centraldark-*' -and $_.Name -ne 'centraldark-operational-method'} | Sort-Object Name)
$items=@()
foreach($dir in $source){
 $target=Join-Path $dest $dir.Name
 if(-not (Test-Path -LiteralPath $target)){Copy-Item -LiteralPath $dir.FullName -Destination $target -Recurse -Force}
 $srcFiles=@(Get-ChildItem -LiteralPath $dir.FullName -File -Recurse -Force)
 $dstFiles=@(Get-ChildItem -LiteralPath $target -File -Recurse -Force)
 if($srcFiles.Count -ne $dstFiles.Count){throw "COUNT_MISMATCH: $($dir.Name)"}
 foreach($f in $srcFiles){
  $rel=$f.FullName.Substring($dir.FullName.Length+1)
  $dstFile=Join-Path $target $rel
  $hasher=[System.Security.Cryptography.SHA256]::Create()
  $sha=[BitConverter]::ToString($hasher.ComputeHash([IO.File]::ReadAllBytes($f.FullName))).Replace('-','')
  $shaDest=[BitConverter]::ToString($hasher.ComputeHash([IO.File]::ReadAllBytes($dstFile))).Replace('-','')
  $hasher.Dispose()
  if($sha -ne $shaDest){throw "SHA_MISMATCH: $($f.FullName)"}
  $items+= [pscustomobject]@{skill=$dir.Name; original=$f.FullName; canonico=$dstFile; relativo=$rel; sha256=$sha; bytes=$f.Length}
 }
}
$catalog=Join-Path $canon 'catalogo'
$items | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath (Join-Path $catalog 'ARQUIVOS.json') -Encoding utf8
$lines=@('# CATALOGO CANONICO CENTRALDARK','','Owner: centraldark-operational-method','Copia integral verificada com SHA256. Origens preservadas por compatibilidade.','','## Modulos incorporados','')
foreach($s in $source){
 $n=@($items|Where-Object {$_.skill -eq $s.Name}).Count
 $lines += "- **$($s.Name)** ($n arquivos): skills-integradas/$($s.Name)"
}
$lines+=@('','## Descoberta e auditoria','','- Inventario SHA256: ARQUIVOS.json','- Indice: INDICE-PESQUISA.md','- Pesquisa: ../scripts/pesquisar-catalogo.ps1','- Para C:\root usar Hermes da Casa. Nao confundir com Hermes da VPS.','- Kanban READY sem assignee nao executa. Exigir prova do arquivo e conteudo.','- Origens preservadas; nao modificar GitHub/main.')
$lines|Set-Content -LiteralPath (Join-Path $catalog 'CATALOGO.md') -Encoding utf8
$index=@('# INDICE DE PESQUISA','','Pesquisa: powershell -File K:\.agents\skills\centraldark-operational-method\scripts\pesquisar-catalogo.ps1 -Termo kanban','','## Arquivos incorporados','')
foreach($it in $items){$index+= "- "+$it.skill+"/"+$it.relativo+" | origem: "+$it.original}
$index|Set-Content -LiteralPath (Join-Path $catalog 'INDICE-PESQUISA.md') -Encoding utf8
$search=@'
param([Parameter(Mandatory=$true)][string]$Termo)
$base=Split-Path -Parent $PSScriptRoot
$all=Get-ChildItem -LiteralPath $base -File -Recurse -Force | Where-Object {$_.Extension -in '.md','.py','.ps1','.json','.yaml','.yml','.sh','.ts','.js','.tsx','.cmd','.txt' -and $_.Name -ne 'ARQUIVOS.json'}
$all | Select-String -Pattern $Termo -SimpleMatch -List | ForEach-Object {[pscustomobject]@{Arquivo=$_.Path;Linha=$_.LineNumber;Texto=$_.Line.Trim()}} | Format-Table -Wrap
'@
$search|Set-Content -LiteralPath (Join-Path $canon 'scripts\pesquisar-catalogo.ps1') -Encoding utf8
$entry=Join-Path $canon 'SKILL.md'
$original=Get-Content -LiteralPath $entry -Raw -Encoding UTF8
$marker='## Entrada canonica do catalogo integrado (2026-10-24)'
if(-not $original.Contains($marker)){
 $insert=@"

$marker

- Catalogo unico: catalogo/CATALOGO.md
- Indice pesquisavel: catalogo/INDICE-PESQUISA.md
- Inventario com SHA256: catalogo/ARQUIVOS.json
- Pesquisa: powershell -File scripts/pesquisar-catalogo.ps1 -Termo kanban
- Uma entrada canonica e modulos especializados reutilizados, mantendo originais por compatibilidade.
- Hermes Kanban da Casa usa hermes.exe LOCAL, com assignee existente, nao Hermes VPS.
- READY sem assignee nao executa. Confirmar estado, arquivo e conteudo.
- Nao alterar GitHub/main sem autorizacao.

"@
 $needle='# METODO OPERACIONAL CENTRALDARK'
 if(-not $original.Contains($needle)){throw 'SKILL_HEADER_NOT_FOUND'}
 $updated=$original.Replace($needle,$needle+[Environment]::NewLine+$insert)
 Set-Content -LiteralPath $entry -Value $updated -Encoding UTF8 -NoNewline
}
Write-Output ('INTEGRADAS='+$source.Count+' ARQUIVOS='+$items.Count+' DESTINO='+$dest)
Write-Output ('INDEX_OK='+(Test-Path (Join-Path $catalog 'INDICE-PESQUISA.md'))+' SEARCH_OK='+(Test-Path (Join-Path $canon 'scripts\pesquisar-catalogo.ps1')))
