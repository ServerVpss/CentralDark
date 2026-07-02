# ============================================================================
# instalar-windows.ps1 — instala darkai no Windows via PowerShell
# ============================================================================
# Uso:
#   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
#   .\instalar-windows.ps1
# ============================================================================

$ErrorActionPreference = "Stop"

$InstallDir = "$HOME\.local\bin"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "🚀 Instalando darkai em $InstallDir\darkai.ps1" -ForegroundColor Cyan

if (-Not (Test-Path $InstallDir)) {
    New-Item -ItemType Directory -Path $InstallDir -Force | Out-Null
}

# Cria wrapper PowerShell que chama a lógica
$WrapperContent = @'
# darkai.ps1 — wrapper PowerShell pra edge function ai-proxy
param(
    [string]$System = "",
    [string]$Model = "",
    [switch]$ListModels,
    [switch]$Help,
    [Parameter(ValueFromRemainingArguments=$true)]
    [string[]]$Prompt
)

if ($Help) {
    Write-Host @"
darkai — CLI pra conversar com IAs

USO:
  darkai "sua pergunta"
  darkai -System "papel" "pergunta"
  darkai -Model openai/gpt-5.4 "pergunta"
  darkai -ListModels

VARIÁVEIS (configure via `$env:DARKAI_URL`, etc.):
  DARKAI_URL, DARKAI_ANON_KEY, DARKAI_MODEL
"@
    exit 0
}

if ($ListModels) {
    Write-Host "google/gemini-3-flash-preview (padrão)"
    Write-Host "google/gemini-2.5-pro"
    Write-Host "openai/gpt-5"
    Write-Host "openai/gpt-5.4"
    Write-Host "openai/gpt-5.5"
    exit 0
}

$Url = $env:DARKAI_URL
$AnonKey = $env:DARKAI_ANON_KEY
$DefaultModel = if ($env:DARKAI_MODEL) { $env:DARKAI_MODEL } else { "google/gemini-3-flash-preview" }
$UseModel = if ($Model) { $Model } else { $DefaultModel }

if (-not $Url -or -not $AnonKey) {
    Write-Error "darkai: DARKAI_URL ou DARKAI_ANON_KEY não configuradas"
    exit 1
}

$PromptText = $Prompt -join " "

# Suporte a pipe via stdin
if ($MyInvocation.ExpectingInput) {
    $StdinText = ($input | Out-String).Trim()
    if ($PromptText) {
        $PromptText = "$PromptText`n`n--- CONTEÚDO ---`n$StdinText"
    } else {
        $PromptText = $StdinText
    }
}

if (-not $PromptText) {
    Write-Error "darkai: nenhuma pergunta fornecida"
    exit 1
}

$Body = @{
    prompt = $PromptText
    model = $UseModel
}
if ($System) { $Body["system"] = $System }

$JsonBody = $Body | ConvertTo-Json -Compress

try {
    $Response = Invoke-RestMethod -Uri $Url -Method Post `
        -Headers @{ "Authorization" = "Bearer $AnonKey"; "Content-Type" = "application/json" } `
        -Body $JsonBody -TimeoutSec 120

    if ($Response.error) {
        Write-Error "darkai: $($Response.error) - $($Response.message)"
        exit 2
    }

    $Content = if ($Response.content) { $Response.content } else { $Response.choices[0].message.content }
    Write-Output $Content
} catch {
    Write-Error "darkai: erro na chamada — $_"
    exit 3
}
'@

Set-Content -Path "$InstallDir\darkai.ps1" -Value $WrapperContent -Encoding UTF8

Write-Host "✅ darkai instalado em $InstallDir\darkai.ps1" -ForegroundColor Green
Write-Host ""

# Adiciona ao PATH do usuário
$UserPath = [Environment]::GetEnvironmentVariable("PATH", "User")
if ($UserPath -notlike "*$InstallDir*") {
    [Environment]::SetEnvironmentVariable("PATH", "$UserPath;$InstallDir", "User")
    Write-Host "✅ PATH atualizado (reinicie o terminal)" -ForegroundColor Green
}

Write-Host ""
Write-Host "📝 Configure as variáveis no seu `$PROFILE`:" -ForegroundColor Yellow
Write-Host '   $env:DARKAI_URL = "https://kagejpghnwdfymddwxuf.supabase.co/functions/v1/ai-proxy"'
Write-Host '   $env:DARKAI_ANON_KEY = "sua_anon_key"'
Write-Host '   $env:DARKAI_MODEL = "google/gemini-3-flash-preview"'
Write-Host ""
Write-Host "🎉 Depois roda: darkai `"oi`"" -ForegroundColor Cyan
