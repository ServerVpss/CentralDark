# COMANDO - windows-readonly-audit.ps1
**Origem:** E:\\CentralDark\\_MAPA_CASA\\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.extracted_CentralDark_Fluxo_Bidirecional_Auditoria_RECUPERADO_2026-08-24\CentralDark_Fluxo_Bidirecional_Auditoria_RECUPERADO_2026-08-24\infra\host-audit\windows-readonly-audit.ps1
**SHA:** 6f0358d18863257b
**Timestamp:** 2026-08-26T19:43:49.583264
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- DECISION_GATE=READ_ONLY_COMPLETE_PENDING_EXTERNAL_REVIEW

### Ouro Bruto (primeiros 5000 chars)
```
﻿#requires -Version 5.1
<#
CENTRALDARK — AUDITORIA LOCAL WINDOWS READ-ONLY v2
==================================================
Objetivo:
  Medir C:\Users\<usuario> e E:\CentralDark antes de qualquer movimento/sincronia.

GARANTIAS:
  - NÃO move, copia, renomeia ou apaga dados dos roots medidos.
  - NÃO faz git pull/push/reset/checkout.
  - NÃO lê conteúdo textual de .env/tokens/chaves.
  - NÃO exporta command line completa de processos.
  - NÃO exporta credenciais embutidas em Git remote.
  - Só escreve dentro de AuditRoot.

Mede:
  - volumes C:/E:
  - inventário de arquivos/pastas com timestamps e atributos
  - junctions/symlinks/reparse points
  - roots Git, branch, HEAD, origin sanitizado, dirty state
  - variáveis de caminho selecionadas (HERMES_HOME etc.)
  - consumidores/processos relevantes sem vazar argumentos
  - candidatos CentralDark no perfil C:
  - comparação C -> E por SHA256/nome
  - runtime probes seletivos dentro de AppData
  - pacote SEND sanitizado para revisão externa

IMPORTANTE:
  A auditoria NÃO decide migração.
  ACTIVE/COMPATIBILITY/HISTORICAL/BACKUP/CANDIDATE continuam exigindo prova de consumidor.
#>

[CmdletBinding()]
param(
    [string]$UserRoot = $env:USERPROFILE,
    [string]$HouseRoot = 'E:\CentralDark',
    [string]$AuditRoot = 'C:\CentralDark-Audit',
    [Int64]$MaxHashBytes = 268435456, # 256 MB
    [int]$RuntimeProbeDepth = 4
)

Set-StrictMode -Version 2.0
$ErrorActionPreference = 'Continue'
$ProgressPreference = 'SilentlyContinue'

if ($env:OS -ne 'Windows_NT') {
    throw 'Este script foi desenhado para Windows.'
}

function Normalize-Root {
    param([Parameter(Mandatory=$true)][string]$Path)
    try {
        return [System.IO.Path]::GetFullPath($Path).TrimEnd('\')
    } catch {
        return $Path.TrimEnd('\')
    }
}

$UserRoot  = Normalize-Root $UserRoot
$HouseRoot = Normalize-Root $HouseRoot
$AuditRoot = Normalize-Root $AuditRoot

function Test-PathInside {
    param([string]$Child, [string]$Parent)
    $c = (Normalize-Root $Child) + '\'
    $p = (Normalize-Root $Parent) + '\'
    return $c.StartsWith($p, [System.StringComparison]::OrdinalIgnoreCase)
}

if ((Test-PathInside $AuditRoot $UserRoot) -or (Test-PathInside $AuditRoot $HouseRoot)) {
    throw "AuditRoot deve ficar FORA dos roots medidos. Atual: $AuditRoot"
}

$Stamp      = Get-Date -Format 'yyyyMMdd-HHmmss'
$Out        = Join-Path $AuditRoot "AUDIT-$Stamp"
$PrivateDir = Join-Path $Out 'LOCAL-PRIVATE-NAO-ENVIAR'
$SendDir    = Join-Path $Out 'SEND-ME'

New-Item -ItemType Directory -Force -Path $PrivateDir | Out-Null
New-Item -ItemType Directory -Force -Path $SendDir    | Out-Null

$LogFile = Join-Path $Out 'AUDIT.log'

$Inventory = New-Object 'System.Collections.Generic.List[object]'
$Errors    = New-Object 'System.Collections.Generic.List[object]'
$Links     = New-Object 'System.Collections.Generic.List[object]'
$RepoMap   = @{}
$SeenScanRoots = @{}

function Log {
    param([string]$Message)
    $line = '[{0}] {1}' -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss.fff'), $Message
    Add-Content -LiteralPath $LogFile -Value $line -Encoding UTF8
    Write-Host $line
}

function Add-AuditError {
    param(
        [string]$Stage,
        [string]$Path,
        [string]$Message
    )
    $Errors.Add([pscustomobject]@{
        Time    = (Get-Date).ToString('yyyy-MM-dd HH:mm:ss.fff')
        Stage   = $Stage
        Path    = $Path
        Message = $Message
    })
    Log "ERROR stage=$Stage path=$Path message=$Message"
}

function Get-RelativePathSafe {
    param([string]$Root, [string]$Path)

    try {
        $r = (Normalize-Root $Root)
        $p = [System.IO.Path]::GetFullPath($Path)

        if ($p.Equals($r, [System.StringComparison]::OrdinalIgnoreCase)) {
            return '.'
        }

        $prefix = $r + '\'
        if ($p.StartsWith($prefix, [System.StringComparison]::OrdinalIgnoreCase)) {
            return $p.Substring($prefix.Length)
        }
    } catch {}

    return $Path
}

function Test-SensitiveName {
    param([string]$Name)

    $n = $Name.ToLowerInvariant()

    $exact = @(
        '.env',
        '.git-credentials',
        '.emulator_console_auth_token',
        'id_rsa',
        'id_ed25519',
        'id_ecdsa',
        'id_dsa'
    )

    if ($exact -contains $n) { return $true }

    if ($n -match '^\.env\.') { return $true }
    if ($n -match '(^|[._-])env($|[._-])') { return $true }
    if ($n -match '^keys?(\.|$)') { return $true }
    if ($n -match 'secret|credential|password|passwd|private.?key') { return $true }
    if ($n -match '\.(pem|pfx|p12|key)$') { return $true }

    return $false
}

function Test-PrivateConfigName {
    param([string]$Name)

    $n = $Name.ToLowerInvariant()

    if ($n -like '.claude.json*') { return $true }
    if ($n -like '.npmrc*') { return $true }

    return $n -in @(
        '.gitconfig',
        '.bash_history',
        '.lesshst',
        '.yarnrc',
        '.minttyrc'
    )
}

function Test-WindowsProfileState {
    param([string]$Name)


```