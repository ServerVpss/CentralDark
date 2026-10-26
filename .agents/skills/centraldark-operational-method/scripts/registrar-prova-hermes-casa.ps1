param(
  [Parameter(Mandatory=$true)][string]$IdMissao,
  [Parameter(Mandatory=$true)][ValidateSet('criar','excluir')][string]$Acao,
  [Parameter(Mandatory=$true)][string]$ArquivoAlvo,
  [string]$ConteudoEsperado,
  [string]$Sha256Esperado,
  [Parameter(Mandatory=$true)][string]$PorQueFazer,
  [Parameter(Mandatory=$true)][string]$PorQueNaoFazerOutraCoisa,
  [Parameter(Mandatory=$true)][string]$PorQueUsar,
  [Parameter(Mandatory=$true)][string]$PorQueModificar,
  [Parameter(Mandatory=$true)][string]$OQueMudou,
  [Parameter(Mandatory=$true)][string]$Contraprova,
  [string]$ReferenciaExterna
)
$ErrorActionPreference='Stop'
$root=Split-Path -Parent $PSScriptRoot
$hermes='C:\Users\Administrador\AppData\Local\hermes\bin\hermes.exe'
if (!(Test-Path -LiteralPath $hermes -PathType Leaf)) { throw 'EXECUTOR_HERMES_CASA_NAO_ENCONTRADO' }
if ($IdMissao -notmatch '^t_[a-zA-Z0-9]+$') { throw 'ID_KANBAN_INVALIDO' }
$full=[IO.Path]::GetFullPath($ArquivoAlvo)
if (-not [IO.Path]::IsPathRooted($ArquivoAlvo)) { throw 'CAMINHO_ALVO_NAO_ABSOLUTO' }
$json=(& $hermes kanban show $IdMissao --json | Out-String)
if ($LASTEXITCODE -ne 0) { throw 'CONSULTA_HERMES_FALHOU' }
$dados=$json | ConvertFrom-Json
$tarefa=$dados.task
if (!$tarefa -or $tarefa.id -ne $IdMissao -or $tarefa.status -ne 'done') { throw 'MISSAO_NAO_CONCLUIDA' }
$execucoes=@($dados.runs)
if (@($execucoes | Where-Object {$_.status -eq 'done' -and $_.outcome -eq 'completed'}).Count -eq 0) { throw 'EXECUCAO_SEM_RESULTADO_COMPROVADO' }
if ($tarefa.workspace_kind -ne 'dir' -or -not $tarefa.workspace_path) { throw 'WORKSPACE_HERMES_INCONSISTENTE' }
$base=[IO.Path]::GetFullPath($tarefa.workspace_path).TrimEnd('\')+'\'
if (-not $full.StartsWith($base,[StringComparison]::OrdinalIgnoreCase)) { throw 'ALVO_FORA_DO_WORKSPACE_KANBAN' }
$existente=Test-Path -LiteralPath $full -PathType Leaf
$hash=$null
if ($Acao -eq 'criar') {
  if (!$existente) { throw 'ARQUIVO_NAO_EXISTE' }
  if (!$PSBoundParameters.ContainsKey('ConteudoEsperado') -and !$Sha256Esperado) { throw 'CRIACAO_EXIGE_CONTEUDO_OU_HASH_ESPERADO' }
  if ($PSBoundParameters.ContainsKey('ConteudoEsperado')) {
    $atual=[IO.File]::ReadAllText($full)
    if ($atual -cne $ConteudoEsperado) { throw 'CONTEUDO_NAO_CONFERE' }
  }
  $sha=[Security.Cryptography.SHA256]::Create()
  try { $hash=[BitConverter]::ToString($sha.ComputeHash([IO.File]::ReadAllBytes($full))).Replace('-','').ToLowerInvariant() } finally { $sha.Dispose() }
  if ($Sha256Esperado -and $hash -ne $Sha256Esperado.ToLowerInvariant()) { throw 'SHA256_NAO_CONFERE' }
}
if ($Acao -eq 'excluir' -and (Test-Path -LiteralPath $full)) { throw 'ALVO_AINDA_EXISTE' }
$receiptDir=Join-Path $root 'catalogo\comprovacoes'
if (!(Test-Path -LiteralPath $receiptDir)) { New-Item -ItemType Directory -Path $receiptDir | Out-Null }
$receiptPath=Join-Path $receiptDir ($IdMissao+'.json')
if (Test-Path -LiteralPath $receiptPath) { throw 'COMPROVACAO_JA_REGISTRADA_PARA_ESTA_MISSAO' }
$instante=(Get-Date).ToString('yyyy-MM-ddTHH:mm:sszzz')
$receipt=[ordered]@{
  especificacao='https://agentskills.io/specification'
  metodo='Michelin 3 estrelas - prova no Windows Casa'
  criado_em=$instante
  veredito='PROVADO'
  verificador='registrar-prova-hermes-casa.ps1'
  missao=$IdMissao
  acao=$Acao
  arquivo=$full
  workspace=$tarefa.workspace_path
  perfil=$tarefa.assignee
  provedor=$tarefa.provider_override
  modelo=$tarefa.model_override
  estado_kanban=$tarefa.status
  hash_arquivo=$hash
  por_que_fazer=$PorQueFazer
  por_que_nao_fazer_outra_coisa=$PorQueNaoFazerOutraCoisa
  por_que_usar=$PorQueUsar
  por_que_modificar=$PorQueModificar
  o_que_mudou=$OQueMudou
  contraprova=$Contraprova
  evidencia_externa=$ReferenciaExterna
  proximo_cursor='Sem pendencias de verificacao para o alvo exato desta missao.'
}
$texto=$receipt | ConvertTo-Json -Depth 6
$tmp=$receiptPath+'.tmp'
try {
  [IO.File]::WriteAllText($tmp,$texto,(New-Object Text.UTF8Encoding($false)))
  Move-Item -LiteralPath $tmp -Destination $receiptPath
} finally { if (Test-Path -LiteralPath $tmp) { Remove-Item -LiteralPath $tmp -Force } }
Write-Output ('PROVA=PROVADO MISSAO='+$IdMissao+' ARQUIVO='+$full)
& (Join-Path $root 'scripts\atualizar-catalogo-self-healing.ps1') | Out-Host
