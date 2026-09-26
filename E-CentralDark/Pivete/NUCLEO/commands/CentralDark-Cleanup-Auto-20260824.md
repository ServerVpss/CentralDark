# COMANDO - CentralDark-Cleanup-Auto-20260824.ps1
**Origem:** E:\\CentralDark\\_MAPA_CASA\\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.extracted_CentralDark-Cleanup-Auto-20260824\CentralDark-Cleanup-Auto-20260824\CentralDark-Cleanup-Auto-20260824.ps1
**SHA:** b3edab83a5ac234c
**Timestamp:** 2026-08-26T19:43:48.379834
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- $sourceMissing = 0
- $sourceMissing = @(
- Write-Host "AUTO_STOP phase=DELETE_SAFE reason=POST_DELETE_PROOF_FAILED Deleted=$deleted Skipped=$skippedDelete SourceMissing=$sourceMissing"
- throw "QUARANTINE_MOVE_DEST_MISSING:$qPath"

### Ouro Bruto (primeiros 5000 chars)
```
﻿#requires -Version 5.1
<#
CENTRALDARK — CLEANUP PROOF-DRIVEN
Específico para SEND-CENTRALDARK-AUDIT-20260824-114754.zip

MODOS
  Auto                 -> encadeia tudo sozinho até fixed point; testa rollback e para apenas em bloqueio/UNKNOWN/erro.
  Preview              -> somente mede/classifica.
  DeleteSafe           -> remove somente duplicatas comprovadas em Downloads.
  QuarantineDormant    -> move duplicatas de .hermes-web-ui para quarentena se dormência for provada.
  FinalizeQuarantine   -> apaga quarentena somente com frase explícita + reprova cópia E:.

NUNCA:
  - apaga AppData/Hermes runtime
  - apaga OneDrive
  - apaga repos Git
  - apaga arquivo sensível
  - usa "mesmo nome" como prova
  - aceita hash histórico sem recalcular ao vivo
#>

[CmdletBinding()]
param(
    [ValidateSet('Auto','Preview','DeleteSafe','QuarantineDormant','FinalizeQuarantine')]
    [string]$Mode = 'Preview',

    [string]$AuditZip =
        'C:\CentralDark-Audit\AUDIT-20260824-114754\SEND-CENTRALDARK-AUDIT-20260824-114754.zip',

    [string]$ExpectedAuditSHA256 =
        '7bbc7d0a6f96ccad6696894c5420e7a8ba511de2f34b679ca8204711c2192b2d',

    [string]$UserRoot = 'C:\Users\danda',
    [string]$HouseRoot = 'E:\CentralDark',
    [string]$AuditRoot = 'C:\CentralDark-Audit',

    [string]$QuarantineBatch = '',
    [string]$FinalDeletePhrase = ''
)

Set-StrictMode -Version 2.0
$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

$SafeDeleteRoot = Join-Path $UserRoot 'Downloads'
$DormantRoot = Join-Path $UserRoot '.hermes-web-ui'

$HardProtectedRoots = @(
    (Join-Path $UserRoot 'AppData'),
    (Join-Path $UserRoot '.hermes'),
    (Join-Path $UserRoot '.grok'),
    (Join-Path $UserRoot '.claude'),
    (Join-Path $UserRoot '.codex'),
    (Join-Path $UserRoot '.ssh'),
    (Join-Path $UserRoot 'OneDrive'),
    (Join-Path $UserRoot 'Documents'),
    (Join-Path $UserRoot 'aiox-core')
)

$ExcludedHouseSegments = @(
    '\BACKUPS\',
    '\_QUARANTINE\',
    '\test_unzip\',
    '\TEMP\',
    '\tmp\',
    '\_forense\',
    '\workspace\backups\'
)

$Stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$RunRoot = Join-Path $AuditRoot "CLEANUP-PROOF-$Stamp"
$ExtractRoot = Join-Path $RunRoot 'audit'
$ReceiptCsv = Join-Path $RunRoot 'receipt.csv'
$SummaryTxt = Join-Path $RunRoot 'summary.txt'
$ResidualCsv = Join-Path $RunRoot 'residual-duplicates.csv'
$ConsumerCsv = Join-Path $RunRoot 'dormant-consumers.csv'

New-Item -ItemType Directory -Force -Path $RunRoot | Out-Null

function Normalize-Path {
    param([Parameter(Mandatory=$true)][string]$Path)
    try { return [System.IO.Path]::GetFullPath($Path).TrimEnd('\') }
    catch { return $Path.TrimEnd('\') }
}

function Test-Inside {
    param([string]$Child,[string]$Parent)

    if ([string]::IsNullOrWhiteSpace($Child) -or [string]::IsNullOrWhiteSpace($Parent)) {
        return $false
    }

    $c = Normalize-Path $Child
    $p = Normalize-Path $Parent

    return (
        $c.Equals($p,[System.StringComparison]::OrdinalIgnoreCase) -or
        $c.StartsWith($p + '\',[System.StringComparison]::OrdinalIgnoreCase)
    )
}

function Test-SensitivePath {
    param([string]$Path)
    $n = [System.IO.Path]::GetFileName($Path).ToLowerInvariant()

    if ($n -match '^\.env($|\.)') { return $true }
    if ($n -match '(^|[._-])env($|[._-])') { return $true }
    if ($n -match '^keys?(\.|$)') { return $true }
    if ($n -match 'secret|credential|password|passwd|private.?key') { return $true }
    if ($n -match '\.(pem|pfx|p12|key)$') { return $true }
    if ($n -match '^id_(rsa|ed25519|ecdsa|dsa)') { return $true }
    if ($n -eq '.git-credentials') { return $true }

    return $false
}

function Test-ProtectedRoot {
    param([string]$Path)

    foreach ($root in $HardProtectedRoots) {
        if (Test-Inside $Path $root) { return $true }
    }

    return $false
}

function Get-SHA256 {
    param([string]$Path)

    try {
        return (Get-FileHash -LiteralPath $Path -Algorithm SHA256 -ErrorAction Stop).Hash.ToLowerInvariant()
    } catch {
        return $null
    }
}

function Test-Unlocked {
    param([string]$Path)

    try {
        $s = [System.IO.File]::Open(
            $Path,
            [System.IO.FileMode]::Open,
            [System.IO.FileAccess]::Read,
            [System.IO.FileShare]::None
        )
        $s.Close()
        return $true
    } catch {
        return $false
    }
}

function Split-ProofMatches {
    param([string]$Value)

    if ([string]::IsNullOrWhiteSpace($Value)) { return @() }

    return @(
        $Value -split '\s+\|\s+' |
        Where-Object { -not [string]::IsNullOrWhiteSpace($_) }
    )
}

function Test-HouseProofPathAllowed {
    param([string]$Path)

    if (-not (Test-Inside $Path $HouseRoot)) { return $false }

    foreach ($segment in $ExcludedHouseSegments) {
        if ($Path.IndexOf($segment,[System.StringComparison]::OrdinalIgnoreCase) -ge 0) {
            return $false
        }
    }

    return $true
}

function Get-LiveProofCopy {
 
```