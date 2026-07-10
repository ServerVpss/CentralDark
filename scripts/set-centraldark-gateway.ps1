# ============================================================
# CentralDark Gateway - Setter de variaveis de ambiente (Windows)
# Uso recomendado (copiar/colar no PowerShell):
#   powershell -NoProfile -ExecutionPolicy Bypass -File "$env:USERPROFILE\Downloads\set-centraldark-gateway.ps1"
#
# LOGS:
#   Todas as acoes, erros e diagnostico do ambiente sao gravados em:
#     %USERPROFILE%\CentralDark\logs\setup-<timestamp>.log
#   O caminho e mostrado no final. Se o gateway responder, o log e
#   enviado (best-effort) para ajudar o suporte a te socorrer rapido.
# ============================================================

param(
  # IMPORTANTE: sem /v1 no final - Claude Desktop e clientes OpenAI-compat
  # anexam /v1/... sozinhos. Com /v1 aqui vira /v1/v1/models -> 404.
  [string]$Url = "https://api.centralldark.com",
  [string]$Key = "cdk_live_UW_-Ad10vjqkFOcVYtUry2nrwhKAdE9L7lMUEesDktE",
  [switch]$NoUpload
)

$ErrorActionPreference = "Stop"

# ---------- Preparar diretorio e arquivo de log ----------
$stamp   = Get-Date -Format "yyyyMMdd-HHmmss"
$logDir  = Join-Path $env:USERPROFILE "CentralDark\logs"
$logFile = Join-Path $logDir ("setup-{0}.log" -f $stamp)
$runId   = [guid]::NewGuid().ToString()

New-Item -ItemType Directory -Force -Path $logDir | Out-Null

function Mask([string]$s) {
  if ([string]::IsNullOrEmpty($s)) { return "" }
  if ($s.Length -le 12) { return "***" }
  return $s.Substring(0, 10) + "..." + $s.Substring($s.Length - 4)
}

function Log {
  param(
    [string]$Level = "INFO",
    [string]$Message
  )
  $ts   = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
  $line = "[{0}] [{1}] {2}" -f $ts, $Level, $Message
  Add-Content -Path $logFile -Value $line -Encoding UTF8
  switch ($Level) {
    "ERRO"  { Write-Host $line -ForegroundColor Red }
    "AVISO" { Write-Host $line -ForegroundColor Yellow }
    "OK"    { Write-Host $line -ForegroundColor Green }
    default { Write-Host $line -ForegroundColor Gray }
  }
}

$overallOk = $true
$testHttp  = $null
$testErr   = $null

try {
  Write-Host ""
  Write-Host "=== CentralDark Gateway - Setup Windows ===" -ForegroundColor Green
  Write-Host ("RunID: {0}" -f $runId) -ForegroundColor DarkGray
  Write-Host ("Log:   {0}" -f $logFile) -ForegroundColor DarkGray
  Write-Host ""

  Log "INFO" ("RunID={0}" -f $runId)
  Log "INFO" ("Usuario={0}  Host={1}  OS={2}" -f $env:USERNAME, $env:COMPUTERNAME, [System.Environment]::OSVersion.VersionString)
  Log "INFO" ("PowerShell={0}" -f $PSVersionTable.PSVersion.ToString())
  Log "INFO" ("URL={0}  KEY={1}" -f $Url, (Mask $Key))

  Log "OK" "[1/4] CENTRALDARK_GATEWAY_URL"
  [System.Environment]::SetEnvironmentVariable("CENTRALDARK_GATEWAY_URL", $Url, "User")

  Log "OK" "[2/4] CENTRALDARK_GATEWAY_KEY (oculta)"
  [System.Environment]::SetEnvironmentVariable("CENTRALDARK_GATEWAY_KEY", $Key, "User")

  Log "OK" "[3/4] ANTHROPIC_BASE_URL"
  [System.Environment]::SetEnvironmentVariable("ANTHROPIC_BASE_URL", $Url, "User")

  Log "OK" "[4/4] ANTHROPIC_API_KEY (oculta)"
  [System.Environment]::SetEnvironmentVariable("ANTHROPIC_API_KEY", $Key, "User")

  Log "OK" "Variaveis salvas no escopo do usuario."
  Log "AVISO" "Feche e abra o Claude Desktop / Cursor / VSCode para carregarem."

  # ---------- Teste de conexao ----------
  Log "INFO" ("Testando GET {0}/v1/models" -f $Url)
  try {
    $r = Invoke-WebRequest -Uri "$Url/v1/models" `
        -Headers @{ Authorization = "Bearer $Key" } `
        -UseBasicParsing -TimeoutSec 15
    $testHttp = [int]$r.StatusCode
    Log "OK" ("Gateway respondeu HTTP {0} - {1} bytes" -f $testHttp, $r.RawContentLength)
  } catch {
    $overallOk = $false
    $testErr = $_.Exception.Message
    if ($_.Exception.Response) {
      try { $testHttp = [int]$_.Exception.Response.StatusCode } catch {}
    }
    Log "ERRO" ("Falha no teste HTTP {0}: {1}" -f $testHttp, $testErr)
  }
}
catch {
  $overallOk = $false
  Log "ERRO" ("Excecao geral: {0}" -f $_.Exception.Message)
  Log "ERRO" ($_.ScriptStackTrace)
}
finally {
  Log "INFO" ("Resultado final: {0}" -f ($(if ($overallOk) { "OK" } else { "FALHA" })))

  # ---------- Envio best-effort do log pro gateway ----------
  if (-not $NoUpload -and $overallOk) {
    try {
      $payload = @{
        run_id     = $runId
        source     = "set-centraldark-gateway.ps1"
        version    = "1.1"
        timestamp  = (Get-Date).ToString("o")
        user       = $env:USERNAME
        host       = $env:COMPUTERNAME
        os         = [System.Environment]::OSVersion.VersionString
        powershell = $PSVersionTable.PSVersion.ToString()
        ok         = $overallOk
        http       = $testHttp
        error      = $testErr
        log        = (Get-Content -Raw -Path $logFile -ErrorAction SilentlyContinue)
      } | ConvertTo-Json -Depth 5 -Compress

      Invoke-WebRequest -Uri "$Url/v1/diag/setup-log" `
        -Method POST `
        -Headers @{ Authorization = "Bearer $Key"; "Content-Type" = "application/json" } `
        -Body $payload -UseBasicParsing -TimeoutSec 10 | Out-Null
      Log "OK" "Log enviado ao suporte (diag/setup-log)."
    } catch {
      # Silencioso: endpoint pode nao existir ainda. Log fica local.
      Log "AVISO" ("Nao foi possivel enviar o log ao suporte: {0}" -f $_.Exception.Message)
    }
  }

  Write-Host ""
  Write-Host "----------------------------------------------" -ForegroundColor DarkGray
  if ($overallOk) {
    Write-Host "STATUS: OK" -ForegroundColor Green
  } else {
    Write-Host "STATUS: FALHA - envie o arquivo de log abaixo pro suporte" -ForegroundColor Red
  }
  Write-Host ("RunID:  {0}" -f $runId) -ForegroundColor DarkGray
  Write-Host ("Log:    {0}" -f $logFile) -ForegroundColor Cyan
  Write-Host "----------------------------------------------" -ForegroundColor DarkGray
  Write-Host ""
  Write-Host "Pressione ENTER para fechar..." -ForegroundColor DarkGray
  [void][System.Console]::ReadLine()
}
