# omega-register.ps1 — braco T-ID se registra no rendezvous com receipt estruturado
# Uso: powershell -File omega-register.ps1 -TerminalId T1 -Facts "..." -Evidence "..." -Unknown "..." -Contradictions "..." -Counterproof "..." -Residual "..." -Verdict "PASS"
# Owner: estende scripts/enxame-3ias.sh (receipts por arquivo) para multi-janela VS Code.
# Regras: ONE_WRITER_PER_SCOPE (cada braco escreve SO seu proprio receipt), UNKNOWN_IS_NOT_PASS.

param(
  [Parameter(Mandatory=$true)] [string]$TerminalId,
  [string]$Facts = '',
  [string]$Evidence = '',
  [string]$Unknown = '',
  [string]$Contradictions = '',
  [string]$Counterproof = '',
  [string]$Residual = '',
  [string]$Verdict = 'UNKNOWN',
  [string]$Registry = "E:/CentralDark/Pivete/OMEGA_RENDEZVOUS.json"
)

$reg = Get-Content $Registry -Raw | ConvertFrom-Json
$now = Get-Date -Format 'yyyy-MM-ddTHH:mm:ssZ'

# achar o braco no WORKERS pelo TERMINAL_ID; se nao existe, auto-declara (ONE_WRITER: cada braco cria seu proprio)
$arm = $reg.WORKERS | Where-Object { $_.TERMINAL_ID -eq $TerminalId }
if (-not $arm) {
  $arm = [PSCustomObject]@{
    TERMINAL_ID = $TerminalId
    STABLE_HASH = "ARM-AUTO-$(($TerminalId).Replace('T',''))"
    ENGINE      = 'UNKNOWN-CLI'
    PID          = $PID
    PARENT       = 'self-declared'
    STATE        = 'ACTIVE'
    BORN_AT      = $now
  }
  $reg.WORKERS += $arm
  Write-Output "AVISO: $TerminalId auto-declarado (nao estava no scan). Rode omega-scan.ps1 para enriquecer PID/ENGINE."
}

$receipt = [PSCustomObject]@{
  TERMINAL_ID = $TerminalId
  FACTS        = $Facts
  EVIDENCE     = $Evidence
  UNKNOWN      = $Unknown
  CONTRADICTIONS = $Contradictions
  COUNTERPROOF = $Counterproof
  RESIDUAL     = $Residual
  VERDICT      = $Verdict
  AT           = $now
}

# garantir array de receipts no braco
if (-not $arm.PSObject.Properties['RECEIPTS']) { $arm | Add-Member -NotePropertyName 'RECEIPTS' -NotePropertyValue @() }
$arm.RECEIPTS += $receipt
$arm.LAST_RECEIPT = $now
$arm.STATE = 'ACTIVE'

$reg | ConvertTo-Json -Depth 8 | Set-Content $Registry -Encoding UTF8
Write-Output "OK $TerminalId receipt gravado em $Registry"
