# CONTRATO - CASA-MAE.ps1
**Origem:** E:\\CentralDark\\_MAPA_CASA\\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.extracted_CENTRALDARK-CASA-LOCAL-RECONCILIADA\CENTRALDARK-CASA-LOCAL-RECONCILIADA\CASA-MAE.ps1
**SHA:** 06043f3205a25228
**Timestamp:** 2026-08-26T19:43:48.321933
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- $missing=@($ownerState|Where-Object{-not $_.exists})
- canonical=[ordered]@{owners_checked=$ownerState.Count;missing=$missing.Count;entries=$ownerState}
- <style>body{background:#071015;color:#d9edf2;font-family:Segoe UI,Arial;margin:0;padding:26px}h1{letter-spacing:2px}h2{color:#e3ae45}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300

### Ouro Bruto (primeiros 5000 chars)
```
param(
  [ValidateSet('Audit','Build','Full')]
  [string]$Mode='Full',
  [switch]$OpenCockpit
)
Set-StrictMode -Version 2.0
$ErrorActionPreference='Stop'

function Write-Utf8([string]$Path,[string]$Text) {
  [IO.File]::WriteAllText($Path,$Text,(New-Object Text.UTF8Encoding($false)))
}
function To-Json($Obj,[int]$Depth=12) { return ($Obj|ConvertTo-Json -Depth $Depth) }

function Find-CentralDarkRoot {
  $c=@()
  if($env:CENTRALDARK_ROOT){$c+=$env:CENTRALDARK_ROOT}
  $c+='E:\CentralDark'; $c+='C:\CentralDark'; $c+=(Get-Location).Path
  foreach($x in ($c|Select-Object -Unique)){
    if(-not $x){continue}
    try{$f=[IO.Path]::GetFullPath($x)}catch{continue}
    if((Test-Path (Join-Path $f '.git')) -and (Test-Path (Join-Path $f 'LEIA-ME-IA.md'))){return $f}
  }
  throw 'CENTRALDARK_ROOT_NOT_FOUND'
}
function GitText([string[]]$Args){
  $o=& git -C $script:Repo @Args 2>&1
  return (($o|Out-String).Trim())
}
function Sha([string]$Path){
  try{return (Get-FileHash -Algorithm SHA256 -LiteralPath $Path).Hash.ToLowerInvariant()}catch{return $null}
}
function FileMeta([string]$Path){
  if(-not(Test-Path -LiteralPath $Path -PathType Leaf)){return $null}
  $f=Get-Item -LiteralPath $Path
  return [ordered]@{path=$f.FullName;bytes=$f.Length;last_write_utc=$f.LastWriteTimeUtc.ToString('o');sha256=(Sha $f.FullName)}
}
function DirSummary([string]$Path,[int]$Limit=5000){
  if(-not(Test-Path -LiteralPath $Path -PathType Container)){return $null}
  $n=0L;$bytes=0L;$latest=$null;$tr=$false
  try{
    foreach($f in (Get-ChildItem -LiteralPath $Path -File -Recurse -Force -ErrorAction SilentlyContinue)){
      $n++;$bytes+=$f.Length
      if(($latest -eq $null)-or($f.LastWriteTimeUtc -gt $latest)){$latest=$f.LastWriteTimeUtc}
      if($n -ge $Limit){$tr=$true;break}
    }
  }catch{}
  return [ordered]@{path=$Path;files_scanned=$n;bytes_scanned=$bytes;truncated=$tr;latest_write_utc=$(if($latest){$latest.ToString('o')}else{$null});content_read=$false}
}
function RunLogged([string]$Name,[string]$Exe,[string[]]$Args,[string]$WorkingDir){
  $log=Join-Path $script:Out ($Name+'.log');$st=Get-Date;$old=(Get-Location);$code=1
  try{
    Set-Location $WorkingDir
    $lines=& $Exe @Args 2>&1
    $code=$LASTEXITCODE
    Write-Utf8 $log (($lines|Out-String))
  }catch{Write-Utf8 $log ($_|Out-String)}
  finally{Set-Location $old}
  return [ordered]@{name=$Name;command=($Exe+' '+($Args -join ' '));working_dir=$WorkingDir;exit_code=$code;pass=($code -eq 0);duration_seconds=[math]::Round(((Get-Date)-$st).TotalSeconds,2);log=$log}
}

$Repo=Find-CentralDarkRoot
$Out=Join-Path $Repo '.artifacts\casa-local'
New-Item -ItemType Directory -Force -Path $Out|Out-Null
$now=(Get-Date).ToUniversalTime().ToString('o')

# T0: estado vivo local; zero rede.
$head=GitText @('rev-parse','HEAD')
$branch=GitText @('branch','--show-current'); if(-not $branch){$branch='DETACHED'}
$dirtyText=GitText @('status','--porcelain=v1')
$dirty=-not [string]::IsNullOrWhiteSpace($dirtyText)
$commitCount=[int64](GitText @('rev-list','--all','--count'))
$trackedList=GitText @('ls-files')
$trackedCount=if([string]::IsNullOrWhiteSpace($trackedList)){0}else{($trackedList -split "`n").Count}
$remote=GitText @('remote','-v')

# Cobertura total do clone local, sem alegar PR remoto.
Write-Utf8 (Join-Path $Out 'git-commits-all.tsv') (GitText @('log','--all','--date=iso-strict','--pretty=format:%H%x09%aI%x09%D%x09%s'))
Write-Utf8 (Join-Path $Out 'git-refs-all.tsv') (GitText @('for-each-ref','--format=%(objectname)%09%(refname)%09%(upstream:short)%09%(subject)'))
Write-Utf8 (Join-Path $Out 'git-tracked-files-all.tsv') (GitText @('ls-files','-s'))
Write-Utf8 (Join-Path $Out 'git-status.txt') $dirtyText
Write-Utf8 (Join-Path $Out 'git-worktrees.txt') (GitText @('worktree','list','--porcelain'))

$owners=@(
'LEIA-ME-IA.md','AGENTS.md',
'docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/SOUL-SOL.md',
'docs/CONSCIENCIA/00-PORTA-DE-ENTRADA-IA.md',
'docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/CAPACIDADES-COGNITIVAS.md',
'docs/CONSCIENCIA/JEITO-CORRETO-DO-PIVETE.md',
'docs/CONSCIENCIA/2026-06-20-padrao-resposta-pivete.md',
'docs/CONSCIENCIA/DICIONARIO-PIVETE-GITHUB.md',
'docs/CONSCIENCIA/CONTRATO-RECONCILIACAO-ANTES-DE-CRIAR.json',
'docs/ARQUITETURA/JARVIS-ORQUESTRACAO-DELTA-E-ESCRITOR-UNICO.md',
'docs/CONSCIENCIA/MULTIBUSSOLA.md','docs/CONSCIENCIA/ADMINISTRAVEIS.json',
'docs/CONSCIENCIA/EXECUCAO-REVERSIVEL.md','docs/CONSCIENCIA/REMEDICAO.md',
'.agents/skills/meta-lupa/SKILL.md','.agents/skills/meta-lupa/AUTOLUPA_CANONICAL_SHA',
'docs/CONSCIENCIA/PROOF-OWNERSHIP.json','docs/CONSCIENCIA/METACOGNICAO-OPERACIONAL.md',
'scripts/lupa/portable-kernel.mjs'
)
$ownerState=@()
foreach($rel in $owners){
  $p=Join-Path $Repo $rel;$m=FileMeta $p
  $ownerState+=[ordered]@{relative=$rel;exists=($m -ne $null);meta=$m}
}
$missing=@($ownerState|Where-Object{-not $_.exists})
Write-Utf8 (Join-Path $Out 'canonical-owners.json') (To-Json $ownerState 12)

# #1119: detectar o defeito observado no main sem fazer merge.
$hp=Join-Path $Repo 
```