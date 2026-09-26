<#
  ============================================================
  CentralDark - ATUALIZACAO SEGURA  (Windows)
  scripts\atualizar.ps1
  ------------------------------------------------------------
  1. Descobre onde voce esta (clone git? copia de ZIP?)
     CASO A (git) -> backup .bundle + fetch + merge --ff-only
     CASO B (ZIP) -> NAO mexe na pasta; clona AO LADO
  2. Confere areas protegidas
  3. Registra a acao no historico e regenera o painel

  Uso:
    .\scripts\atualizar.ps1                    # so confere, nada muda
    .\scripts\atualizar.ps1 -Aplicar           # aplica de verdade
    .\scripts\atualizar.ps1 -Aplicar -Clonar   # autoriza clonar no CASO B

  Regra do Pivete: nada destrutivo. Sem force-push. Sem reset --hard.
  Nunca apaga pasta antiga.
  ============================================================
#>
[CmdletBinding()]
param(
  [switch]$Aplicar,
  [switch]$Clonar,
  [switch]$SemPainel,
  [string]$Repo   = "https://github.com/ServerVpss/CentralDark.git",
  [string]$Branch = "pivete/dev"
)

$ErrorActionPreference = "Stop"
$Raiz = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $Raiz
$Avisos = @()

function Passo([string]$nome, [string]$estado, [string]$detalhe) {
  $cor = switch ($estado) { "ok" {"Green"} "warn" {"Yellow"} "bad" {"Red"} default {"Gray"} }
  $ico = switch ($estado) { "ok" {"OK "} "warn" {"!! "} "bad" {"XX "} default {".. "} }
  Write-Host ("  {0}{1,-30} {2}" -f $ico, $nome, $detalhe) -ForegroundColor $cor
}

Write-Host ""
Write-Host "  CENTRALDARK - ATUALIZACAO SEGURA" -ForegroundColor Green
Write-Host "  pasta: $Raiz" -ForegroundColor DarkGray
Write-Host ("  modo:  {0}" -f $(if($Aplicar){"APLICAR"}else{"SO CHECAR (nada muda)"})) -ForegroundColor DarkGray
Write-Host ""

# ---------- git instalado? ----------
$temGit = $null -ne (Get-Command git -ErrorAction SilentlyContinue)
if (-not $temGit) {
  Passo "git instalado" "bad" "nao encontrado no PATH"
  $Avisos += "Instale o Git: https://git-scm.com/download/win"
} else { Passo "git instalado" "ok" (git --version) }

# ---------- classificar a pasta ----------
$ehRepo = $temGit -and (Test-Path (Join-Path $Raiz ".git"))
$branchAtual = "-"; $sujo = $false; $atras = 0

if ($ehRepo) {
  Passo "tipo da pasta" "ok" "CASO A - clone git de verdade"
  $branchAtual = (git rev-parse --abbrev-ref HEAD).Trim()
  $sujo = (@(git status --porcelain)).Count -gt 0
  Passo "branch atual" $(if($branchAtual -eq "main"){"warn"}else{"ok"}) $branchAtual
  Passo "trabalho nao salvo" $(if($sujo){"warn"}else{"ok"}) $(if($sujo){"HA arquivos modificados"}else{"limpo"})
  try {
    git fetch --all --prune --quiet
    $cnt = (git rev-list --left-right --count "HEAD...origin/$branchAtual" 2>$null)
    if ($cnt) { $p = $cnt -split "\s+"; $atras = [int]$p[1]; Passo "comparado com o GitHub" "ok" "$($p[0]) a frente / $atras atras" }
  } catch { Passo "comparado com o GitHub" "bad" $_.Exception.Message }
} else {
  Passo "tipo da pasta" "warn" "CASO B - copia de ZIP (sem .git)"
  $Avisos += "Esta pasta veio de ZIP. O script clona AO LADO, sem apagar nada."
}

# ---------- backup ----------
$backup = ""
if ($Aplicar -and $ehRepo -and $atras -gt 0) {
  $backup = Join-Path $env:TEMP ("centraldark-backup-" + (Get-Date -Format "yyyyMMdd-HHmmss") + ".bundle")
  git bundle create $backup --all | Out-Null
  Passo "backup criado" "ok" $backup
}

# ---------- atualizar ----------
$resultado = "NADA_A_FAZER"
if ($ehRepo) {
  if ($atras -eq 0)      { $resultado = "JA_ATUALIZADO";  Passo "atualizacao" "ok"   "ja esta na ultima versao" }
  elseif (-not $Aplicar) { $resultado = "PENDENTE";       Passo "atualizacao" "warn" "$atras commit(s) novos - rode com -Aplicar" }
  elseif ($sujo)         { $resultado = "BLOQUEADO_SUJO"; Passo "atualizacao" "bad"  "salve/commite seu trabalho antes"
                           $Avisos += "Ha alteracoes nao commitadas. Rode: git stash (ou commit) e tente de novo." }
  else {
    git merge --ff-only "origin/$branchAtual" | Out-Null
    if ($LASTEXITCODE -eq 0) { $resultado = "ATUALIZADO"; Passo "atualizacao" "ok" ("agora em " + (git rev-parse --short HEAD)) }
    else { $resultado = "CONFLITO"; Passo "atualizacao" "bad" "historico divergiu - precisa revisao manual"
           $Avisos += "Nao deu fast-forward. NAO use reset --hard sem autorizacao." }
  }
} else {
  $destino = Join-Path (Split-Path -Parent $Raiz) "CentralDark-clone"
  if (-not $Clonar)            { $resultado = "PRECISA_CLONE";   Passo "clone novo" "warn" "use -Aplicar -Clonar para criar em $destino" }
  elseif (Test-Path $destino)  { $resultado = "CLONE_JA_EXISTE"; Passo "clone novo" "warn" "$destino ja existe - nada foi tocado" }
  elseif ($Aplicar)            { git clone --branch $Branch $Repo $destino
                                 $resultado = "CLONADO"; Passo "clone novo" "ok" $destino
                                 $Avisos += "Copie seu trabalho de $Raiz para $destino antes de usar o clone." }
}

# ---------- areas protegidas ----------
$arqProt = Join-Path $Raiz ".github\protected-paths.txt"
if (Test-Path $arqProt) {
  $protegidos = Get-Content $arqProt | Where-Object { $_ -and -not $_.StartsWith("#") }
  $tocados = @()
  if ($ehRepo -and $sujo) {
    $mod = git status --porcelain | ForEach-Object { $_.Substring(3) }
    foreach ($p in $protegidos) {
      $pref = $p.Replace("/**","").Replace("**","")
      foreach ($m in $mod) { if ($m -like "$pref*") { $tocados += $m } }
    }
  }
  if ($tocados.Count -gt 0) {
    Passo "areas protegidas" "bad" ("$($tocados.Count) arquivo(s) tocado(s)")
    $Avisos += "Area protegida alterada: " + ($tocados -join ", ") + " -> exige PERMITO PIVETE."
  } else { Passo "areas protegidas" "ok" "$($protegidos.Count) regras / nenhuma violada" }
}

# ---------- registrar + painel ----------
$det = if ($Avisos.Count -gt 0) { $Avisos -join " | " } else { "sem avisos" }
$st  = switch ($resultado) { "BLOQUEADO_SUJO" {"erro"} "CONFLITO" {"erro"} default {"ok"} }
& (Join-Path $Raiz "scripts\registrar.ps1") -Acao ("Atualizacao: " + $resultado) -Area "git" -Status $st -Detalhe $det -Autor "atualizar.ps1"
& (Join-Path $Raiz "scripts\gerar-painel.ps1") -Resultado $resultado -Backup $backup

Write-Host ""
Write-Host ("  RESULTADO: {0}" -f $resultado) -ForegroundColor Cyan
foreach ($a in $Avisos) { Write-Host ("  ! " + $a) -ForegroundColor Yellow }
Write-Host ""

if (-not $SemPainel) { Start-Process (Join-Path $Raiz "paineis\PAINEL.html") }
