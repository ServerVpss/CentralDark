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
$hp=Join-Path $Repo '.agents\skills\session-intelligence-harvester\SKILL.md'
$harvester=[ordered]@{path=$hp;exists=(Test-Path $hp);eof_echo_residue=$null;invented_confidence_09=$null;classification='UNKNOWN'}
if(Test-Path $hp){
  $hc=Get-Content -LiteralPath $hp -Raw
  $harvester.eof_echo_residue=(($hc -match '(?m)^EOF\s*$') -or ($hc -match 'session-intelligence-harvester SKILL\.md criado'))
  $harvester.invented_confidence_09=($hc -match 'confidence:\s*0\.9')
  if($harvester.eof_echo_residue -or $harvester.invented_confidence_09){$harvester.classification='MAIN_DEFECT_DETECTED_PR1119_CANDIDATE_FIX'}
  else{$harvester.classification='NO_KNOWN_1119_DEFECT_DETECTED_LOCAL'}
}

# Reutilizar o Portable Kernel canônico.
$checks=@();$node=Get-Command node -ErrorAction SilentlyContinue
if($node -and (Test-Path (Join-Path $Repo 'scripts\lupa\portable-kernel.mjs'))){
  $checks+=RunLogged 'portable-kernel' $node.Source @('scripts/lupa/portable-kernel.mjs','--compact','--export','.artifacts/casa-local/portable-kernel.json','--json') $Repo
  if(Test-Path (Join-Path $Repo 'scripts\lupa\portable-kernel.test.mjs')){
    $checks+=RunLogged 'portable-kernel-test' $node.Source @('scripts/lupa/portable-kernel.test.mjs') $Repo
  }
  if(Test-Path (Join-Path $Repo 'apps\modulos\mcp\tests\admin-administrables.test.mjs')){
    $checks+=RunLogged 'admin-administrables-test' $node.Source @('apps/modulos/mcp/tests/admin-administrables.test.mjs') $Repo
  }
}else{$checks+=[ordered]@{name='portable-kernel';pass=$false;status='BLOCKED_NODE_OR_SCRIPT_MISSING'}}

# Capacidades esperadas: detectar, não duplicar.
$candidates=@(
'Pivete\NUCLEO\skills\auto-destilador\auto_destilador.py',
'Pivete\NUCLEO\docs\reference\CENTRALDARK-MERMAID-ATUAL.md',
'apps\modulos\artifacts-builder','apps\modulos\HERMES-CORE','apps\modulos\hub',
'apps\modulos\mcp','apps\modulos\Bolt','public\central-dark-instinct-2','_MAPA_CASA'
)
$cap=@()
foreach($rel in $candidates){
  $p=Join-Path $Repo $rel;$e=Test-Path -LiteralPath $p
  $kind=if($e -and (Test-Path $p -PathType Leaf)){'file'}elseif($e){'directory'}else{'missing'}
  $cap+=[ordered]@{relative=$rel;path=$p;exists=$e;kind=$kind}
}

# Processos: somente observar; nunca controlar/encerrar.
$want='chrome|msedge|chromium|firefox|screenpipe|hermes|node|python|code|ccleaner'
$procs=@(Get-Process -ErrorAction SilentlyContinue|Where-Object{$_.ProcessName -match $want}|Sort-Object ProcessName,Id|ForEach-Object{
  [ordered]@{name=$_.ProcessName;pid=$_.Id;started=$(try{$_.StartTime.ToUniversalTime().ToString('o')}catch{$null})}
})
$ccRunning=@($procs|Where-Object{$_.name -match '^ccleaner'}).Count -gt 0

# Notepad LocalState: metadados/hash; conteúdo não é lido.
$notepad=@()
$nb=Join-Path $env:LOCALAPPDATA 'Packages\Microsoft.WindowsNotepad_8wekyb3d8bbwe\LocalState'
foreach($sub in @('WindowState','TabState')){
  $p=Join-Path $nb $sub;$entry=[ordered]@{path=$p;exists=(Test-Path $p);content_read=$false;files=@()}
  if(Test-Path $p){
    $all=@(Get-ChildItem -LiteralPath $p -File -Force -ErrorAction SilentlyContinue)
    foreach($f in ($all|Select-Object -First 200)){$entry.files+=(FileMeta $f.FullName)}
    $entry['truncated']=($all.Count -gt 200)
  }
  $notepad+=$entry
}

# Browsers: somente metadados de storage/cache; nunca Cookies/Login Data/Web Data.
$roots=@(
[ordered]@{name='Chrome';root=(Join-Path $env:LOCALAPPDATA 'Google\Chrome\User Data')},
[ordered]@{name='Edge';root=(Join-Path $env:LOCALAPPDATA 'Microsoft\Edge\User Data')},
[ordered]@{name='Chromium';root=(Join-Path $env:LOCALAPPDATA 'Chromium\User Data')},
[ordered]@{name='Brave';root=(Join-Path $env:LOCALAPPDATA 'BraveSoftware\Brave-Browser\User Data')}
)
$browser=@()
foreach($b in $roots){
  if(-not(Test-Path $b.root)){$browser+=[ordered]@{name=$b.name;root=$b.root;exists=$false};continue}
  $po=@()
  foreach($p in @(Get-ChildItem -LiteralPath $b.root -Directory -Force -ErrorAction SilentlyContinue|Where-Object{$_.Name -eq 'Default' -or $_.Name -like 'Profile *'})){
    $stores=@()
    foreach($rel in @('Local Storage','Session Storage','IndexedDB','Cache','Code Cache','Service Worker')){
      $s=DirSummary (Join-Path $p.FullName $rel) 5000;if($s){$stores+=$s}
    }
    $po+=[ordered]@{profile=$p.Name;path=$p.FullName;stores=$stores;sensitive_content_read=$false}
  }
  $browser+=[ordered]@{name=$b.name;root=$b.root;exists=$true;profiles=$po}
}

# Screenpipe: presença, não DB/conteúdo.
$sp=[ordered]@{process_running=(@($procs|Where-Object{$_.name -match 'screenpipe'}).Count -gt 0);locations=@()}
foreach($p in @((Join-Path $env:LOCALAPPDATA 'screenpipe'),(Join-Path $HOME '.screenpipe'),(Join-Path $Repo 'screenpipe'))){
  $sp.locations+=[ordered]@{path=$p;exists=(Test-Path $p);summary=$(if(Test-Path $p){DirSummary $p 2000}else{$null})}
}

# Descobrir package.json de primeira parte. Sem install.
$targets=@()
$pkgFiles=@(Get-ChildItem -LiteralPath $Repo -Filter package.json -File -Recurse -ErrorAction SilentlyContinue|Where-Object{
  $_.FullName -notmatch '\\node_modules\\|\\\.git\\|\\dist\\|\\build\\|\\_MAPA_CASA\\|\\\.artifacts\\'
})
foreach($pf in $pkgFiles){
  try{
    $o=Get-Content -LiteralPath $pf.FullName -Raw|ConvertFrom-Json
    $build=$null;$test=$null
    if($o.scripts){
      $bp=$o.scripts.PSObject.Properties['build'];if($bp){$build=[string]$bp.Value}
      $tp=$o.scripts.PSObject.Properties['test'];if($tp){$test=[string]$tp.Value}
    }
    if($build -or $test){
      $dir=$pf.Directory.FullName
      $danger=(($build+' '+$test) -match '(?i)deploy|publish|git\s+push|force-push|reset\s+--hard|ssh\b|scp\b|rsync\b|wrangler\b|vercel\b|netlify\b|firebase\b|docker\s+push|kubectl\b|helm\b|curl\b|wget\b|invoke-webrequest')
      $targets+=[ordered]@{dir=$dir;package=$o.name;build=$build;test=$test;local_node_modules=(Test-Path (Join-Path $dir 'node_modules'));blocked_by_script_policy=$danger}
    }
  }catch{}
}
Write-Utf8 (Join-Path $Out 'package-targets.json') (To-Json $targets 10)

# Build/test local, serializado. Nunca instala dependência.
$buildResults=@()
if($Mode -in @('Build','Full')){
  if($dirty){$buildResults+=[ordered]@{status='BLOCKED_DIRTY_WORKTREE';reason='Não atropelar trabalho vivo.'}}
  else{
    $npm=Get-Command npm -ErrorAction SilentlyContinue
    if(-not $npm){$buildResults+=[ordered]@{status='BLOCKED_NPM_MISSING'}}
    else{
      $env:npm_config_offline='true';$env:npm_config_audit='false';$env:npm_config_fund='false';$env:PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD='1'
      foreach($t in $targets){
        if($t.blocked_by_script_policy){$buildResults+=[ordered]@{package=$t.package;dir=$t.dir;status='BLOCKED_SCRIPT_NETWORK_OR_DEPLOY_PATTERN'};continue}
        if(-not $t.local_node_modules){$buildResults+=[ordered]@{package=$t.package;dir=$t.dir;status='BLOCKED_DEPENDENCIES_NOT_LOCAL_NO_INSTALL'};continue}
        $safe=($t.package -replace '[^a-zA-Z0-9._-]','_')
        if($t.test){$buildResults+=RunLogged ('test-'+$safe) $npm.Source @('run','test','--if-present') $t.dir}
        if($t.build){$buildResults+=RunLogged ('build-'+$safe) $npm.Source @('run','build','--if-present') $t.dir}
      }
    }
  }
}

# T1: mesma Casa, mesmo alvo.
$t1Head=GitText @('rev-parse','HEAD');$t1Status=GitText @('status','--porcelain=v1')
$t1Dirty=-not [string]::IsNullOrWhiteSpace($t1Status)
$unexpected=(($head -ne $t1Head) -or ((-not $dirty)-and $t1Dirty))

$policy=[ordered]@{no_deploy=$true;no_vps_mutation=$true;no_git_push=$true;no_git_pull_fetch=$true;no_force_push=$true;no_reset_hard=$true;no_ccleaner_action=$true;no_browser_storage_delete=$true;no_cookie_clear=$true;no_credential_extraction=$true;raw_chat_is_not_canonical=$true}
$failedChecks=@($checks|Where-Object{
  $pp=$_.PSObject.Properties['pass'];$sp=$_.PSObject.Properties['status']
  ($pp -and ($pp.Value -eq $false) -and ((-not $sp) -or ($sp.Value -notmatch '^BLOCKED_NODE')))
})
$verdict=if($unexpected){'FAIL_ZERO_REGRESSION'}elseif($missing.Count -gt 0){'BLOCKED_CANONICAL_OWNER_MISSING'}elseif($failedChecks.Count -gt 0){'NOT_PROVED_CHECK_FAILURE'}else{'MEASURED_SCOPE_RECONCILED'}

$receipt=[ordered]@{
 schema_version=1;package_id='CENTRALDARK_CASA_LOCAL_RECONCILIADA';observed_at_utc=$now;mode=$Mode;root=$Repo
 boot=[ordered]@{trigger_chain=@('#ACORDAR','!CALIBRAR','!MULTIBUSSOLA','IF_MUTATION:!EXECUÇÃO_REVERSÍVEL','EXECUTE','IF_MUTATION:!REMEDIÇÃO','REALITY_JUDGE','CRISTALIZAR_OR_NO_CHANGE','FIXED_POINT');new_orchestrator=$false;one_system_only=$true}
 git_t0=[ordered]@{head=$head;branch=$branch;dirty=$dirty;commit_denominator_all_refs=$commitCount;tracked_file_denominator=$trackedCount;remote=$remote}
 coverage=[ordered]@{commits_file='git-commits-all.tsv';refs_file='git-refs-all.tsv';tracked_files_file='git-tracked-files-all.tsv';commits_coverage='ALL_REACHABLE_LOCAL_REFS';tracked_files_coverage='ALL_GIT_INDEX_TRACKED_FILES';remote_pr_coverage='NOT_PROVED_BY_LOCAL_RUNNER'}
 canonical=[ordered]@{owners_checked=$ownerState.Count;missing=$missing.Count;entries=$ownerState}
 session_harvester=$harvester;capabilities=$cap;checks=$checks
 local_sources=[ordered]@{processes=$procs;ccleaner_running_but_untouched=$ccRunning;notepad=$notepad;browser=$browser;screenpipe=$sp}
 builds=$buildResults
 git_t1=[ordered]@{head=$t1Head;dirty=$t1Dirty;status=$t1Status;unexpected_tracked_mutation=$unexpected}
 policy=$policy;verdict=$verdict
 fixed_point='Fechar somente após nova passagem sem informação/delta material. UNKNOWN nunca vira PASS.'
}
Write-Utf8 (Join-Path $Out 'receipt.json') (To-Json $receipt 30)
$h=([ordered]@{observed_at_utc=$now;head=$head;branch=$branch;dirty=$dirty;t1_head=$t1Head;t1_dirty=$t1Dirty;verdict=$verdict}|ConvertTo-Json -Compress)
Add-Content -LiteralPath (Join-Path $Out 'history.jsonl') -Value $h -Encoding UTF8

# Cockpit único e local, sem CDN.
function Html([object]$v){return [Net.WebUtility]::HtmlEncode([string]$v)}
$checkRows=($checks|ForEach-Object{
  $pp=$_.PSObject.Properties['pass'];$sp=$_.PSObject.Properties['status']
  $st=if($pp -and $pp.Value){'PASS'}elseif($sp){$sp.Value}else{'FAIL'}
  "<tr><td>$(Html $_.name)</td><td>$(Html $st)</td></tr>"
}) -join "`n"
$capRows=($cap|ForEach-Object{"<tr><td>$(Html $_.relative)</td><td>$(Html $_.kind)</td></tr>"}) -join "`n"
$buildRows=($buildResults|ForEach-Object{
  $nm=if($_.PSObject.Properties['package']){$_.package}elseif($_.PSObject.Properties['name']){$_.name}else{'build'}
  $st=if($_.PSObject.Properties['status']){$_.status}elseif($_.PSObject.Properties['pass'] -and $_.pass){'PASS'}else{'FAIL'}
  "<tr><td>$(Html $nm)</td><td>$(Html $st)</td></tr>"
}) -join "`n"
$html=@"
<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>CentralDark Casa Local</title>
<style>body{background:#071015;color:#d9edf2;font-family:Segoe UI,Arial;margin:0;padding:26px}h1{letter-spacing:2px}h2{color:#e3ae45}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:16px}.card{border:1px solid #244652;background:#0b171e;padding:18px;border-radius:12px}.flow{font-family:Consolas,monospace;white-space:pre-wrap;color:#83d8e8}table{width:100%;border-collapse:collapse}td{border-bottom:1px solid #203944;padding:7px}.small{opacity:.78;font-size:13px}</style></head><body>
<h1>CENTRALDARK · CASA LOCAL</h1><div class="small">$(Html $now) · $(Html $Repo)</div>
<div class="grid">
<div class="card"><h2>Estado vivo</h2><p>HEAD <b>$(Html $head)</b></p><p>Branch <b>$(Html $branch)</b></p><p>Dirty T0 <b>$(Html $dirty)</b></p><p>Commits <b>$(Html $commitCount)</b></p><p>Arquivos rastreados <b>$(Html $trackedCount)</b></p><p>Veredito <b>$(Html $verdict)</b></p></div>
<div class="card"><h2>Fluxo único</h2><div class="flow">#ACORDAR → !CALIBRAR → !MULTIBUSSOLA
→ [mutação? !EXECUÇÃO_REVERSÍVEL]
→ ONE WRITER → HERMES → EFEITO
→ [mutou? !REMEDIÇÃO]
→ REALITY JUDGE → CRISTALIZAR|NO_CHANGE
→ FIXED_POINT</div></div>
<div class="card"><h2>Privacidade</h2><p>CCleaner: NÃO ACIONADO</p><p>Cookies/credenciais: NÃO LIDOS</p><p>Git fetch/pull/push: NÃO</p><p>Deploy/VPS: NÃO</p></div>
<div class="card"><h2>Harvester</h2><p>$(Html $harvester.classification)</p></div>
</div>
<div class="grid" style="margin-top:16px">
<div class="card"><h2>Checks</h2><table>$checkRows</table></div>
<div class="card"><h2>Capacidades</h2><table>$capRows</table></div>
<div class="card"><h2>Build local</h2><table>$buildRows</table></div>
</div>
<div class="card" style="margin-top:16px"><h2>Lei da Casa</h2><div class="flow">CHEFE define O QUE. Estado vivo define ONDE. SOL reconcilia. HERMES executa. Writer escreve. Reality Judge decide. RAW ≠ CANONICAL. UNKNOWN ≠ PASS.</div></div>
</body></html>
"@
$cockpit=Join-Path $Out 'CENTRALDARK-CASA-LOCAL.html';Write-Utf8 $cockpit $html

Write-Host "CENTRALDARK_CASA_LOCAL=CONCLUIDO"
Write-Host ("ROOT="+$Repo);Write-Host ("HEAD="+$head);Write-Host ("BRANCH="+$branch)
Write-Host ("COMMITS_DENOMINATOR="+$commitCount);Write-Host ("TRACKED_FILES_DENOMINATOR="+$trackedCount)
Write-Host ("VERDICT="+$verdict);Write-Host ("RECEIPT="+(Join-Path $Out 'receipt.json'));Write-Host ("COCKPIT="+$cockpit)
Write-Host "CCLEANER_ACTION=FORBIDDEN_AND_NOT_INVOKED"
Write-Host "DEPLOY=NO | VPS=NO | GIT_PUSH=NO | NETWORK_FETCH=NO"
if($OpenCockpit){Start-Process $cockpit}
if($verdict -eq 'FAIL_ZERO_REGRESSION'){exit 2}
if($verdict -like 'BLOCKED*' -or $verdict -like 'NOT_PROVED*'){exit 1}
exit 0
