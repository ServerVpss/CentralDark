<#
  ============================================================
  CentralDark - REGISTRAR ACAO  (Windows)
  scripts\registrar.ps1
  ------------------------------------------------------------
  OBRIGATORIO para qualquer IA que trabalhar nesta pasta.
  Grava 1 linha em historico\acoes.jsonl e regenera o painel.

  Exemplos:
    .\scripts\registrar.ps1 -Acao "Comecei o roteador" -Area codigo -Status andamento
    .\scripts\registrar.ps1 -Acao "Roteador pronto"    -Area codigo -Status ok    -Detalhe "3 arquivos"
    .\scripts\registrar.ps1 -Acao "Falhou o build"     -Area infra  -Status erro  -Detalhe "porta ocupada"
  ============================================================
#>
[CmdletBinding()]
param(
  [Parameter(Mandatory=$true)][string]$Acao,
  [ValidateSet("codigo","docs","infra","git","painel","pesquisa")][string]$Area = "codigo",
  [ValidateSet("ok","erro","andamento")][string]$Status = "ok",
  [string]$Detalhe = "",
  [string]$Autor   = "Hermes",
  [switch]$AbrirPainel
)

$ErrorActionPreference = "Stop"
$Raiz = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)

$dirHist = Join-Path $Raiz "historico"
New-Item -ItemType Directory -Force -Path $dirHist | Out-Null
$arqHist = Join-Path $dirHist "acoes.jsonl"

# se a acao anterior desse mesmo autor estava "andamento" com o mesmo texto,
# ela permanece no historico - o painel mostra sempre a mais recente no topo.
$reg = [ordered]@{
  ts      = (Get-Date -Format "o")
  quando  = (Get-Date -Format "dd/MM/yyyy HH:mm:ss")
  autor   = $Autor
  acao    = $Acao
  area    = $Area
  status  = $Status
  detalhe = $Detalhe
}

$linha = ($reg | ConvertTo-Json -Depth 4 -Compress)
Add-Content -Path $arqHist -Value $linha -Encoding UTF8

$cor = switch ($Status) { "ok" {"Green"} "erro" {"Red"} default {"Yellow"} }
Write-Host ("  registrado [{0}] {1}" -f $Status.ToUpper(), $Acao) -ForegroundColor $cor

& (Join-Path $Raiz "scripts\gerar-painel.ps1")

if ($AbrirPainel) { Start-Process (Join-Path $Raiz "paineis\PAINEL.html") }
