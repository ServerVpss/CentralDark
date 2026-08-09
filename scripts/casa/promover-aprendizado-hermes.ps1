[CmdletBinding()]
param(
    [Parameter(Mandatory)]
    [string]$CandidatePath,

    [string]$RepoRoot = 'E:\CentralDark\Pivete\CentralDark',

    [string]$VaultRoot = 'E:\CentralDark\Pivete\CASA-VAULT'
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Read-Field {
    param(
        [Parameter(Mandatory)][string]$Text,
        [Parameter(Mandatory)][string]$Name
    )

    $match = [regex]::Match($Text, "(?m)^$([regex]::Escape($Name))=(.*)$")
    if (-not $match.Success) {
        throw "CANDIDATE_FIELD_MISSING=$Name"
    }
    return $match.Groups[1].Value.Trim()
}

$inboxRoot = [System.IO.Path]::GetFullPath((Join-Path $VaultRoot '20-INBOX-HERMES'))
$candidateFull = [System.IO.Path]::GetFullPath($CandidatePath)

if (-not $candidateFull.StartsWith($inboxRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw "CANDIDATE_OUTSIDE_INBOX=$candidateFull"
}
if (-not (Test-Path -LiteralPath $candidateFull -PathType Leaf)) {
    throw "CANDIDATE_NOT_FOUND=$candidateFull"
}

$text = Get-Content -LiteralPath $candidateFull -Raw

$sensitivePatterns = @(
    '(?i)BEGIN [A-Z ]*PRIVATE KEY',
    '(?i)(api[_-]?key|access[_-]?token|refresh[_-]?token|password|senha|cookie|session)\s*[:=]\s*\S+',
    '(?i)\.env(?:\.|$)',
    '(?i)authorization:\s*(bearer|basic)\s+\S+'
)
foreach ($pattern in $sensitivePatterns) {
    if ($text -match $pattern) {
        throw 'CANDIDATE_SECRET_SUSPECTED=SIM'
    }
}

$lessonId = Read-Field -Text $text -Name 'LESSON_ID'
$scope = Read-Field -Text $text -Name 'ESCOPO'
$problem = Read-Field -Text $text -Name 'PROBLEMA'
$learning = Read-Field -Text $text -Name 'APRENDIZADO'
$proof = Read-Field -Text $text -Name 'PROVA'
$test = Read-Field -Text $text -Name 'TESTE'
$private = (Read-Field -Text $text -Name 'PRIVADO').ToUpperInvariant()

if ($private -notin @('NAO', 'NÃO', 'NO', 'FALSE')) {
    throw 'CANDIDATE_PRIVATE_BLOCKED=SIM'
}
if ($lessonId -notmatch '^[A-Z0-9][A-Z0-9._-]{2,80}$') {
    throw "LESSON_ID_INVALID=$lessonId"
}

$canonical = Join-Path $RepoRoot 'docs\CONSCIENCIA\APRENDIZADOS.md'
if (-not (Test-Path -LiteralPath $canonical -PathType Leaf)) {
    throw "CANONICAL_LEARNING_FILE_NOT_FOUND=$canonical"
}

$current = Get-Content -LiteralPath $canonical -Raw
if ($current -match "(?m)^###\s+$([regex]::Escape($lessonId))\b") {
    throw "LESSON_ID_ALREADY_EXISTS=$lessonId"
}

$date = Get-Date -Format 'yyyy-MM-dd'
$entry = @"

### $lessonId — $scope
- **Data:** $date
- **Origem:** HERMES-CASA
- **Problema:** $problem
- **Aprendizado:** $learning
- **Prova:** $proof
- **Teste de regressão:** $test
"@

Add-Content -LiteralPath $canonical -Value $entry -Encoding utf8

$promotedDir = Join-Path $inboxRoot 'PROMOVIDOS'
if (-not (Test-Path -LiteralPath $promotedDir)) {
    New-Item -ItemType Directory -Path $promotedDir -Force | Out-Null
}
$destination = Join-Path $promotedDir ([System.IO.Path]::GetFileName($candidateFull))
Move-Item -LiteralPath $candidateFull -Destination $destination -Force

Write-Output 'PROMOTION_STATUS=PASS'
Write-Output "LESSON_ID=$lessonId"
Write-Output "CANONICAL_FILE=$canonical"
Write-Output "CANDIDATE_ARCHIVED=$destination"
