param([switch]$SomenteVerificar)
$ErrorActionPreference = 'Stop'
$raiz = Split-Path -Parent $PSScriptRoot
$catalogo = Join-Path $raiz 'catalogo'
$estadoPath = Join-Path $catalogo 'ESTADO-AUTOCURA.json'
$inventarioPath = Join-Path $catalogo 'ARQUIVOS-VIVOS.json'
$indiceVivoPath = Join-Path $catalogo 'INDICE-VIVO.md'
$historicoPath = Join-Path $catalogo 'HISTORICO-MUDANCAS.jsonl'
$validacaoPath = Join-Path $catalogo 'VALIDACAO-AUTOMATICA.md'
$inicio = '<!-- AUTOCATALOGO:INICIO -->'
$fim = '<!-- AUTOCATALOGO:FIM -->'
$agora = (Get-Date).ToString('yyyy-MM-ddTHH:mm:sszzz')
$relogio = (Get-Date).ToString('yyyy-MM-dd HH:mm:ss zzz')
$bt = [char]96
$excluidos = @('catalogo/ESTADO-AUTOCURA.json','catalogo/ARQUIVOS-VIVOS.json','catalogo/INDICE-VIVO.md','catalogo/HISTORICO-MUDANCAS.jsonl','catalogo/VALIDACAO-AUTOMATICA.md')
function Hash-Bytes([byte[]]$bytes) {
  $sha = [System.Security.Cryptography.SHA256]::Create()
  try { return [BitConverter]::ToString($sha.ComputeHash($bytes)).Replace('-','').ToLowerInvariant() }
  finally { $sha.Dispose() }
}
function Salvar-Se-Mudou([string]$caminho,[string]$texto) {
  if ((Test-Path -LiteralPath $caminho) -and ([IO.File]::ReadAllText($caminho) -ceq $texto)) { return }
  $tmp = "$caminho.tmp-$PID"
  try {
    [IO.File]::WriteAllText($tmp,$texto,(New-Object System.Text.UTF8Encoding($false)))
    Move-Item -LiteralPath $tmp -Destination $caminho -Force
  } finally { if (Test-Path -LiteralPath $tmp) { Remove-Item -LiteralPath $tmp -Force } }
}
function Atualizar-Bloco([string]$caminho,[string]$bloco) {
  $texto = [IO.File]::ReadAllText($caminho)
  $completo = "$inicio"+[Environment]::NewLine+$bloco.TrimEnd()+[Environment]::NewLine+"$fim"
  if ($texto.Contains($inicio) -and $texto.Contains($fim)) {
    $pattern = '(?s)'+[regex]::Escape($inicio)+'.*?'+[regex]::Escape($fim)
    $novo = [regex]::Replace($texto,$pattern,[System.Text.RegularExpressions.MatchEvaluator]{param($m) $completo},1)
  } else { $novo = $texto.TrimEnd()+[Environment]::NewLine+[Environment]::NewLine+$completo+[Environment]::NewLine }
  Salvar-Se-Mudou $caminho $novo
}
$antigo = @{}
if (Test-Path -LiteralPath $estadoPath) {
  $old = Get-Content -LiteralPath $estadoPath -Raw -Encoding UTF8 | ConvertFrom-Json
  if ($old -and $old.arquivos) { foreach ($r in $old.arquivos) { $antigo[$r.caminho] = $r } }
}
$arquivos = New-Object System.Collections.ArrayList
$problemas = New-Object System.Collections.ArrayList
# Promove apenas recibos produzidos pela verificacao do Hermes, sem substituir o texto original.
$diretorioProvas = Join-Path $catalogo 'comprovacoes'
$comprovacoes = @()
if (Test-Path -LiteralPath $diretorioProvas) {
  foreach ($arquivoProva in @(Get-ChildItem -LiteralPath $diretorioProvas -Filter '*.json' -File | Sort-Object Name)) {
    try {
      $prova = Get-Content -LiteralPath $arquivoProva.FullName -Raw -Encoding UTF8 | ConvertFrom-Json
      $campos = @('missao','acao','arquivo','criado_em','por_que_fazer','por_que_nao_fazer_outra_coisa','por_que_usar','por_que_modificar','o_que_mudou','contraprova')
      $faltando = @($campos | Where-Object { [string]::IsNullOrWhiteSpace([string]$prova.$_) })
      if ($prova.veredito -ne 'PROVADO' -or $prova.verificador -ne 'registrar-prova-hermes-casa.ps1' -or $faltando.Count -gt 0) {
        [void]$problemas.Add("PROVA_INCOMPLETA_OU_INVALIDA: $($arquivoProva.Name)")
      } else { $comprovacoes += $prova }
    } catch { [void]$problemas.Add("PROVA_JSON_INVALIDO: $($arquivoProva.Name)") }
  }
}
if ($comprovacoes.Count -gt 0 -and !$SomenteVerificar) {
  $resumoProvas = New-Object System.Collections.Generic.List[string]
  $resumoProvas.Add('## Melhorias comprovadas e incorporadas sem regressao')
  $resumoProvas.Add('')
  $resumoProvas.Add('Registros aditivos comprovados no Windows Casa pelo script verificador. Nao substituem receitas anteriores. Cada registro preserva sua origem, razoes e contraprova.')
  foreach ($prova in $comprovacoes) {
    $resumoProvas.Add('')
    $resumoProvas.Add("### $($prova.missao) — $($prova.acao)")
    $resumoProvas.Add("- Criado em: $($prova.criado_em); destino: $($prova.arquivo)")
    $resumoProvas.Add("- Por que fazer: $($prova.por_que_fazer)")
    $resumoProvas.Add("- Por que nao fazer outra coisa: $($prova.por_que_nao_fazer_outra_coisa)")
    $resumoProvas.Add("- Por que usar: $($prova.por_que_usar)")
    $resumoProvas.Add("- Por que modificar: $($prova.por_que_modificar)")
    $resumoProvas.Add("- O que mudou: $($prova.o_que_mudou)")
    $resumoProvas.Add("- Contraprova: $($prova.contraprova)")
    $resumoProvas.Add("- Resultado: PROVADO na operacao/alvo avaliados. Recibo: catalogo/comprovacoes/$($prova.missao).json")
  }
  Atualizar-Bloco (Join-Path $raiz 'SKILL.md') ($resumoProvas -join [Environment]::NewLine)
}
$docs = @(Get-ChildItem -LiteralPath $raiz -Recurse -Force -File |
  Where-Object { $_.FullName -notmatch '[\\/]__pycache__[\\/]|\.pyc$|\.tmp-\d+$' } |
  Sort-Object FullName)
foreach ($f in $docs) {
  $rel = $f.FullName.Substring($raiz.Length+1).Replace('\','/')
  if ($rel -in $excluidos) { continue }
  $norm = $rel -in @('catalogo/CATALOGO.md','catalogo/INDICE-PESQUISA.md')
  $bytes = [IO.File]::ReadAllBytes($f.FullName)
  $conteudo = $null
  if ($f.Extension.ToLowerInvariant() -in @('.md','.ps1','.py','.json','.yml','.yaml','.txt','.sh','.js','.ts','.tsx')) {
    $conteudo = [IO.File]::ReadAllText($f.FullName)
  }
  if ($norm -and $null -ne $conteudo) {
    $conteudoCanonico = [regex]::Replace($conteudo,'(?s)'+[regex]::Escape($inicio)+'.*?'+[regex]::Escape($fim),'')
    $hash = Hash-Bytes ([Text.Encoding]::UTF8.GetBytes($conteudoCanonico))
  } else { $hash = Hash-Bytes $bytes }
  $categoria = if ($f.Name -eq 'SKILL.md') {'skill'} elseif($rel -like 'scripts/*') {'script'} elseif($rel -like 'catalogo/*') {'catalogo'} elseif($rel -like 'references/*') {'referencia'} else {'arquivo'}
  $desc = ''
  if ($categoria -eq 'skill' -and $conteudo) {
    $inicioYaml = [regex]::Match($conteudo,'(?s)^\uFEFF?---\s*\r?\n(.*?)\r?\n---')
    if (-not $inicioYaml.Success) { [void]$problemas.Add("SKILL_SEM_YAML: $rel") }
    else {
      $front = $inicioYaml.Groups[1].Value
      $nome = [regex]::Match($front,'(?m)^name:\s*(.+?)\s*$')
      $descricao = [regex]::Match($front,'(?m)^description:\s*(.+?)\s*$')
      if (!$nome.Success -or !$descricao.Success) { [void]$problemas.Add("SKILL_CAMPOS_OBRIGATORIOS_AUSENTES: $rel") }
      else {
        $desc = $descricao.Groups[1].Value.Trim('"',"'")
        if ($nome.Groups[1].Value.Trim() -cne (Split-Path (Split-Path $f.FullName -Parent) -Leaf)) { [void]$problemas.Add("SKILL_NOME_DIVERGENTE_PASTA: $rel") }
      }
    }
  }
  $links = New-Object System.Collections.ArrayList
  if ($null -ne $conteudo -and $f.Extension -eq '.md') {
    foreach ($m in [regex]::Matches($conteudo,'\]\(([^)\s]+)(?:\s+[^)]*)?\)')) {
      $ref = $m.Groups[1].Value.Trim('<','>')
      if ($ref -match '^(https?://|mailto:|#|data:|sandbox:)' -or $ref -eq '' -or $ref -eq 'URL_DIRETA_DE_EDICAO') { continue }
      $refLimpo = ($ref -split '[#?]',2)[0]
      if ([string]::IsNullOrWhiteSpace($refLimpo)) { continue }
      try {
        $dest = [IO.Path]::GetFullPath((Join-Path $f.DirectoryName ([Uri]::UnescapeDataString($refLimpo).Replace('/','\'))))
        $existe = Test-Path -LiteralPath $dest
        $link = [pscustomobject]@{destino=$ref; existe=[bool]$existe}
        [void]$links.Add($link)
        if (!$existe) { [void]$problemas.Add("LINK_QUEBRADO: $rel => $ref") }
      } catch { [void]$problemas.Add("LINK_INVALIDO: $rel => $ref") }
    }
  }
  $registro = [pscustomobject]@{
    caminho=$rel
    tipo=$categoria
    criado_em=$f.CreationTime.ToString('yyyy-MM-ddTHH:mm:sszzz')
    modificado_em=$f.LastWriteTime.ToString('yyyy-MM-ddTHH:mm:sszzz')
    bytes=$f.Length
    sha256=$hash
    descricao=$desc
    referencias=@($links.ToArray())
  }
  [void]$arquivos.Add($registro)
}
$registros = @($arquivos.ToArray())
$novoMapa = @{}
foreach ($r in $registros) { $novoMapa[$r.caminho] = $r }
$mudancas = New-Object System.Collections.ArrayList
foreach ($r in $registros) {
  $prev = $antigo[$r.caminho]
  if (!$prev) { [void]$mudancas.Add([pscustomobject]@{data=$agora;evento='CRIADO';caminho=$r.caminho;sha_anterior=$null;sha_atual=$r.sha256;descricao='Novo arquivo registrado automaticamente; capacidade nao validada sem prova.'}) }
  elseif ($prev.sha256 -ne $r.sha256 -or ($r.caminho -notin @('catalogo/CATALOGO.md','catalogo/INDICE-PESQUISA.md') -and $prev.modificado_em -ne $r.modificado_em)) {
    [void]$mudancas.Add([pscustomobject]@{data=$agora;evento='MODIFICADO';caminho=$r.caminho;sha_anterior=$prev.sha256;sha_atual=$r.sha256;descricao='Alteracao detectada; integridade catalogada, funcionalidade aguarda prova.'})
  }
}
foreach ($p in $antigo.Keys) {
  if (!$novoMapa.ContainsKey($p)) { [void]$mudancas.Add([pscustomobject]@{data=$agora;evento='AUSENTE';caminho=$p;sha_anterior=$antigo[$p].sha256;sha_atual=$null;descricao='Arquivo desapareceu; nao recriado automaticamente para evitar perda de autoria.'}) }
}
if ($SomenteVerificar) {
  Write-Output ("ARQUIVOS=$($registros.Count) DELTAS=$($mudancas.Count) ALERTAS=$($problemas.Count)")
  if ($mudancas.Count -gt 0) { $mudancas | Select-Object -First 15 | Format-Table }
  if ($mudancas.Count -gt 0) { exit 2 } else { exit 0 }
}
if ($mudancas.Count -eq 0 -and (Test-Path $indiceVivoPath) -and (Test-Path $inventarioPath)) {
  Write-Output ("CATALOGO_ATUALIZADO=SIM DELTAS=0 ARQUIVOS=$($registros.Count)")
  exit 0
}
$tipos = @($registros | Where-Object {$_.tipo -eq 'skill'})
$texto = New-Object System.Collections.Generic.List[string]
$texto.Add('# Índice vivo de todos os arquivos da skill')
$texto.Add('')
$texto.Add("**Atualizado (Casa/Bahia):** $relogio")
$texto.Add("**Total:** $($registros.Count) arquivos. **Skills:** $($tipos.Count). **Mudanças detectadas:** $($mudancas.Count).")
$texto.Add('**Atenção:** SHA e datas comprovam integridade documental, não funcionamento técnico. O método funcional só é considerado provado com recibo e verificação da execução.')
$texto.Add('')
$texto.Add('| Caminho relativo | Categoria | Criado em (Casa) | Modificado em (Casa) | SHA-256 (12) |')
$texto.Add('|---|---|---|---|---|')
foreach ($r in $registros) {
  $nome = $r.caminho.Replace('|','/')
  $texto.Add("| $($bt)$nome$($bt) | $($r.tipo) | $($r.criado_em) | $($r.modificado_em) | $($r.sha256.Substring(0,12)) |")
}
$texto.Add('')
$texto.Add('## Últimas alterações capturadas nesta execução')
if ($mudancas.Count -eq 0) { $texto.Add('Nenhuma.') }
foreach ($m in $mudancas) { $texto.Add("- $($m.data) | $($m.evento) | $($bt)$($m.caminho)$($bt) | $($m.descricao)") }
$completo = ($texto -join [Environment]::NewLine)+[Environment]::NewLine
$inventario = [pscustomobject]@{gerado_em=$agora;fuso_horario='America/Bahia';especificacao='https://agentskills.io/specification';arquivos=$registros}
Salvar-Se-Mudou $inventarioPath ($inventario | ConvertTo-Json -Depth 12)
Salvar-Se-Mudou $indiceVivoPath $completo
$alerts = @('# Validação conservadora dos vínculos e skills','',('Data da verificação: '+$relogio),'','- Sintaxe documental e links são verificações técnicas, não comprovação de execução.','- O sistema não apaga, reescreve nem reverte código e receitas originais automaticamente.','- Referência formal: https://agentskills.io/specification','','## Alertas', '')
if($problemas.Count -eq 0) { $alerts += 'Nenhum alerta estrutural detectado.' }
else { foreach($issue in $problemas) { $alerts += "- $issue" } }
Salvar-Se-Mudou $validacaoPath (($alerts -join [Environment]::NewLine)+[Environment]::NewLine)
$blocoCat = New-Object System.Collections.Generic.List[string]
$blocoCat.Add('## Inventário vivo com horários e rastreabilidade')
$blocoCat.Add('')
$blocoCat.Add("**Última sincronização (Casa):** $relogio. **Arquivos:** $($registros.Count). **Skills:** $($tipos.Count).")
$blocoCat.Add('')
$blocoCat.Add('Este bloco é mantido pelo script canônico. Datas vêm do sistema de arquivos; SHA indica mudança de bytes. Verificação funcional requer prova separada.')
$blocoCat.Add('')
$blocoCat.Add('| Skill | Criada em (Casa) | Modificada em (Casa) | SHA-256 (12) |')
$blocoCat.Add('|---|---|---|---|')
foreach($r in $tipos) { $blocoCat.Add("| $($bt)$($r.caminho)$($bt) | $($r.criado_em) | $($r.modificado_em) | $($r.sha256.Substring(0,12)) |") }
$blocoCat.Add('')
$blocoCat.Add("- [Índice de todos os arquivos com datas](INDICE-VIVO.md)")
$blocoCat.Add("- [Inventário técnico de hashes e referências](ARQUIVOS-VIVOS.json)")
$blocoCat.Add("- [Alertas de integridade](VALIDACAO-AUTOMATICA.md)")
$blocoCat.Add("- [Histórico das alterações](HISTORICO-MUDANCAS.jsonl)")
$blocoCat.Add("- [Método de autorreparo e evidência](../references/AUTO-MELHORIA-COM-PROVA.md)")
$blocoIdx = "## Índice vivo (gerado automaticamente)"+[Environment]::NewLine+[Environment]::NewLine+
  "**Última verificação:** $relogio; $($registros.Count) arquivos catalogados; $($tipos.Count) skills."+
  [Environment]::NewLine+[Environment]::NewLine+"Consulte [INDICE-VIVO.md](INDICE-VIVO.md) para **criação, modificação e SHA de cada arquivo**, e [VALIDACAO-AUTOMATICA.md](VALIDACAO-AUTOMATICA.md) para alertas."
Atualizar-Bloco (Join-Path $catalogo 'CATALOGO.md') ($blocoCat -join [Environment]::NewLine)
Atualizar-Bloco (Join-Path $catalogo 'INDICE-PESQUISA.md') $blocoIdx
$novoEstado = [pscustomobject]@{gerado_em=$agora;formato=1;arquivos=$registros}
Salvar-Se-Mudou $estadoPath ($novoEstado | ConvertTo-Json -Depth 12)
foreach($m in $mudancas) { Add-Content -LiteralPath $historicoPath -Value ($m | ConvertTo-Json -Compress -Depth 5) -Encoding UTF8 }
Write-Output ("CATALOGO_ATUALIZADO=SIM DELTAS=$($mudancas.Count) ARQUIVOS=$($registros.Count) SKILLS=$($tipos.Count) ALERTAS=$($problemas.Count)")
