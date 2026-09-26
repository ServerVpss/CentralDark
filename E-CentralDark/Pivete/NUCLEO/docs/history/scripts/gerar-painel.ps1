<#
  ============================================================
  CentralDark - GERADOR DO PAINEL  (Windows)
  scripts\gerar-painel.ps1
  ------------------------------------------------------------
  Le o historico de acoes + o estado do git e escreve
  paineis\dados.js. NAO altera nada no repositorio.
  Chamado por registrar.ps1, atualizar.ps1 e vigia.ps1.
  ============================================================
#>
[CmdletBinding()]
param(
  [string]$Resultado = "",
  [string]$Backup    = ""
)

$ErrorActionPreference = "Stop"
$Raiz = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)

# ---------- 1. estado do git ----------
$temGit  = $null -ne (Get-Command git -ErrorAction SilentlyContinue)
$ehRepo  = $temGit -and (Test-Path (Join-Path $Raiz ".git"))
$branch = "-"; $headLocal = "-"; $headRemoto = "-"; $sujo = $false
$atras = 0; $frente = 0; $arquivosSujos = @(); $ultimoCommit = "-"

if ($ehRepo) {
  Push-Location $Raiz
  try {
    $branch     = (git rev-parse --abbrev-ref HEAD 2>$null).Trim()
    $headLocal  = (git rev-parse --short HEAD 2>$null).Trim()
    $ultimoCommit = (git log -1 --pretty=format:"%s" 2>$null)
    $st = @(git status --porcelain 2>$null)
    $sujo = $st.Count -gt 0
    $arquivosSujos = $st | Select-Object -First 40 | ForEach-Object { $_.Trim() }
    $headRemoto = (git rev-parse --short "origin/$branch" 2>$null)
    if ($LASTEXITCODE -ne 0 -or -not $headRemoto) { $headRemoto = "-" }
    if ($headRemoto -ne "-") {
      $cnt = (git rev-list --left-right --count "HEAD...origin/$branch" 2>$null)
      if ($cnt) { $p = $cnt -split "\s+"; $frente = [int]$p[0]; $atras = [int]$p[1] }
    }
  } catch { } finally { Pop-Location }
}

# ---------- 2. historico de acoes ----------
$arqHist = Join-Path $Raiz "historico\acoes.jsonl"
$acoes = @()
if (Test-Path $arqHist) {
  $linhas = Get-Content $arqHist -Encoding UTF8 | Where-Object { $_.Trim() }
  foreach ($l in $linhas) {
    try { $acoes += ($l | ConvertFrom-Json) } catch { }
  }
}
[array]::Reverse($acoes)
$acoes = $acoes | Select-Object -First 60

$emAndamento = @($acoes | Where-Object { $_.status -eq "andamento" })
$erros       = @($acoes | Where-Object { $_.status -eq "erro" })

# ---------- 3. veredito ----------
if (-not $Resultado) {
  if ($emAndamento.Count -gt 0)        { $Resultado = "TRABALHANDO" }
  elseif ($sujo)                        { $Resultado = "NAO_SALVO" }
  elseif (-not $ehRepo)                 { $Resultado = "PRECISA_CLONE" }
  elseif ($atras -gt 0)                 { $Resultado = "PENDENTE" }
  else                                  { $Resultado = "JA_ATUALIZADO" }
}

# ---------- 4. areas protegidas ----------
$protegidos = @()
$arqProt = Join-Path $Raiz ".github\protected-paths.txt"
if (Test-Path $arqProt) {
  $protegidos = Get-Content $arqProt | Where-Object { $_ -and -not $_.StartsWith("#") }
}

# ---------- 5. escrever dados.js ----------
$dados = [ordered]@{
  gerado        = (Get-Date -Format "dd/MM/yyyy HH:mm:ss")
  pasta         = $Raiz
  ehRepo        = $ehRepo
  branch        = $branch
  headLocal     = $headLocal
  headRemoto    = $headRemoto
  ultimoCommit  = $ultimoCommit
  commitsAtras  = $atras
  commitsFrente = $frente
  sujo          = $sujo
  arquivosSujos = $arquivosSujos
  resultado     = $Resultado
  backup        = $Backup
  totalAcoes    = $acoes.Count
  emAndamento   = $emAndamento.Count
  erros         = $erros.Count
  protegidos    = $protegidos
  acoes         = $acoes
}

$saida = Join-Path $Raiz "paineis\dados.js"
New-Item -ItemType Directory -Force -Path (Split-Path $saida) | Out-Null
$json = $dados | ConvertTo-Json -Depth 6
"window.DADOS = $json;" | Set-Content -Path $saida -Encoding UTF8

Write-Host ("  painel atualizado -> paineis\dados.js  [{0}]" -f $Resultado) -ForegroundColor DarkGreen
