<#
.SYNOPSIS
Replay CentralDark via rota JÁ conhecida: SEGREDO Windows -> OpenSSH alias Segredo-VPS -> VPS.
Não configura serviços, não instala dependências, não copia credenciais.
#>
[CmdletBinding()]
param(
 [string]$ZipPath,
 [ValidateSet('audit','scan','pulse-plan','apply-reconciler','hakai-check','mcp-rebuilder','replay','resume','papagaio-check')][string]$Mode='audit',
 [string]$Alias='Segredo-VPS',
 [switch]$RepairKnown,
 [string]$OriginalPath,
 [string]$DerivedPath
)
$ErrorActionPreference='Stop'
# PAPAGAIO check is deliberately LOCAL. Do not upload personal documents to VPS.
if($Mode -eq 'papagaio-check') {
  if(-not $OriginalPath){$OriginalPath=Join-Path $env:USERPROFILE 'Documents\👑🧠 COMPOUNDING ENGINEERING.txt'}
  if(-not $DerivedPath){$DerivedPath=Join-Path $env:USERPROFILE 'Documents\PAPAGAIO IRMAO.txt'}
  $orig=(Resolve-Path -LiteralPath $OriginalPath).Path
  $new=(Resolve-Path -LiteralPath $DerivedPath).Path
  [byte[]]$a=[IO.File]::ReadAllBytes($orig)
  [byte[]]$b=[IO.File]::ReadAllBytes($new)
  $same=($b.Length -ge $a.Length)
  if($same){for($i=0;$i -lt $a.Length;$i++){if($a[$i] -ne $b[$i]){$same=$false;break}}}
  $h1=(Get-FileHash -LiteralPath $orig -Algorithm SHA256).Hash
  $h2=(Get-FileHash -LiteralPath $new -Algorithm SHA256).Hash
  Write-Host ('📜 ORIGINAL_BYTES='+$a.Length+' SHA256='+$h1)
  Write-Host ('🦜 DERIVED_BYTES='+$b.Length+' SHA256='+$h2)
  if(-not $same){
    Write-Warning 'PAPAGAIO_INTEGRAL=FAIL: resumiu, alterou ou truncou. Nenhum arquivo modificado.'
    throw 'REWRITE_NOT_APPEND_ONLY'
  }
  Write-Host ('🟢 PAPAGAIO_INTEGRAL=PASS; PREFIXO_BYTE_A_BYTE=true; ADICIONADOS='+($b.Length-$a.Length))
  return
}
if(-not $ZipPath){throw 'ZIP_PATH_REQUIRED_EXCEPT_PAPAGAIO_CHECK'}
$zip=(Resolve-Path -LiteralPath $ZipPath).Path
if(-not (Get-Command ssh -ErrorAction SilentlyContinue)){throw 'SSH_NAO_DISPONIVEL_NO_WINDOWS'}
if(-not (Get-Command scp -ErrorAction SilentlyContinue)){throw 'SCP_NAO_DISPONIVEL_NO_WINDOWS'}
if($Alias -ne 'Segredo-VPS'){throw 'ALIASES_NAO_MEDIDOS_BLOQUEADOS'}
$opts=@('-o','BatchMode=yes','-o','ConnectTimeout=8','-o','StrictHostKeyChecking=yes','-o','IdentitiesOnly=yes')
$tag='centraldark-replay-'+[guid]::NewGuid().ToString('N').Substring(0,12)
$remoteZip='/tmp/'+$tag+'.zip'
$remoteDir='/tmp/'+$tag
Write-Host ('🪬 [CASA] MODO='+$Mode+' DESTINO='+$Alias+' (alias preexistente)')
& ssh @opts $Alias 'printf SSH_ROUTE_PASS' ; if($LASTEXITCODE -ne 0){throw 'SSH_ROUTE_BLOCKED'}
& scp @opts $zip "${Alias}:$remoteZip"; if($LASTEXITCODE -ne 0){throw 'SCP_FAILED'}
$flag=if($RepairKnown -and $Mode -in @('replay','resume')){' --repair-known'}else{''}
if($RepairKnown -and $Mode -notin @('replay','resume')){throw 'REPAIR_KNOWN_ONLY_REPLAY_OR_RESUME'}
$cmd="set -Eeuo pipefail; mkdir -p '$remoteDir'; unzip -q '$remoteZip' -d '$remoteDir'; bash '$remoteDir/CENTRALDARK_EXECUCAO_INTEGRAL_20261012/executar-tudo.sh' '--$Mode'$flag"
try {
  & ssh @opts $Alias $cmd
  if($LASTEXITCODE -eq 3 -and $Mode -in @('replay','resume')){
     Write-Warning 'REPLAY_INCOMPLETE=TRUE: verifique o ultimo [BLOCKED] e NEXT_CURSOR; nenhum HAKAI/DEPLOY forçado.'
  } elseif($LASTEXITCODE -ne 0){throw ('REMOTE_EXIT='+$LASTEXITCODE)}
}
finally {
 # Limpeza SOMENTE da pasta temporária gerada pelo pacote, jamais repo/VPS/root.
 & ssh @opts $Alias "rm -f '$remoteZip'; rm -r '$remoteDir'" | Out-Null
}
