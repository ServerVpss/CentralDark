[CmdletBinding()]
param(
    [ValidateSet('Init', 'Sync', 'Pull', 'Push', 'Status')]
    [string]$Mode = 'Sync',

    [string]$RepoRoot = 'E:\CentralDark\Pivete\CentralDark',

    [string]$VaultRoot = 'E:\CentralDark\Pivete\CASA-VAULT'
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Ensure-Directory {
    param([Parameter(Mandatory)][string]$Path)
    if (-not (Test-Path -LiteralPath $Path)) {
        New-Item -ItemType Directory -Path $Path -Force | Out-Null
    }
}

function Get-Sha256 {
    param([Parameter(Mandatory)][string]$Path)
    return (Get-FileHash -LiteralPath $Path -Algorithm SHA256).Hash.ToLowerInvariant()
}

function Get-FileMap {
    param([Parameter(Mandatory)][string]$Root)

    $map = @{}
    if (-not (Test-Path -LiteralPath $Root)) {
        return $map
    }

    Get-ChildItem -LiteralPath $Root -File -Recurse | ForEach-Object {
        $relative = [System.IO.Path]::GetRelativePath($Root, $_.FullName).Replace('\', '/')
        $map[$relative] = [ordered]@{
            path = $_.FullName
            hash = Get-Sha256 -Path $_.FullName
        }
    }

    return $map
}

function Copy-Preserved {
    param(
        [Parameter(Mandatory)][string]$Source,
        [Parameter(Mandatory)][string]$Destination
    )

    Ensure-Directory -Path (Split-Path -Parent $Destination)
    Copy-Item -LiteralPath $Source -Destination $Destination -Force
}

function Save-Conflict {
    param(
        [Parameter(Mandatory)][string]$RelativePath,
        [string]$RepoFile,
        [string]$VaultFile,
        [Parameter(Mandatory)][string]$ConflictRoot
    )

    $safeRelative = $RelativePath.Replace('/', [System.IO.Path]::DirectorySeparatorChar)
    if ($RepoFile -and (Test-Path -LiteralPath $RepoFile)) {
        Copy-Preserved -Source $RepoFile -Destination (Join-Path $ConflictRoot ($safeRelative + '.repo'))
    }
    if ($VaultFile -and (Test-Path -LiteralPath $VaultFile)) {
        Copy-Preserved -Source $VaultFile -Destination (Join-Path $ConflictRoot ($safeRelative + '.vault'))
    }
}

function Initialize-Vault {
    param(
        [Parameter(Mandatory)][string]$Repo,
        [Parameter(Mandatory)][string]$Vault
    )

    $folders = @(
        $Vault,
        (Join-Path $Vault '00-CANONICO'),
        (Join-Path $Vault '10-MEMORIA-PRIVADA'),
        (Join-Path $Vault '20-INBOX-HERMES'),
        (Join-Path $Vault '30-ANEXOS'),
        (Join-Path $Vault '90-CONFLITOS'),
        (Join-Path $Vault '.hermes-sync'),
        (Join-Path $Vault '.obsidian')
    )
    $folders | ForEach-Object { Ensure-Directory -Path $_ }

    $obsidianSource = Join-Path $Repo 'docs\CONSCIENCIA\VAULT\obsidian.json'
    $obsidianTarget = Join-Path $Vault '.obsidian\app.json'
    if ((Test-Path -LiteralPath $obsidianSource) -and -not (Test-Path -LiteralPath $obsidianTarget)) {
        Copy-Preserved -Source $obsidianSource -Destination $obsidianTarget
    }

    $readme = Join-Path $Vault 'README.md'
    if (-not (Test-Path -LiteralPath $readme)) {
        @'
# CASA-VAULT

- `00-CANONICO`: sincroniza com `CentralDark/docs/BRAIN`.
- `10-MEMORIA-PRIVADA`: somente nesta Casa; nunca entra no Git.
- `20-INBOX-HERMES`: aprendizados candidatos antes de prova e promoção.
- `30-ANEXOS`: anexos locais por padrão.
- `90-CONFLITOS`: preservação dos dois lados quando houver edição concorrente.

Edite livremente. O Hermes sincroniza apenas `00-CANONICO`.
'@ | Set-Content -LiteralPath $readme -Encoding utf8
    }

    $privateReadme = Join-Path $Vault '10-MEMORIA-PRIVADA\README.md'
    if (-not (Test-Path -LiteralPath $privateReadme)) {
        "# Memória privada`n`nEste conteúdo nunca deve entrar no GitHub." |
            Set-Content -LiteralPath $privateReadme -Encoding utf8
    }

    $inboxReadme = Join-Path $Vault '20-INBOX-HERMES\README.md'
    if (-not (Test-Path -LiteralPath $inboxReadme)) {
        "# Inbox Hermes`n`nDescobertas ficam aqui como candidatas até terem prova, teste e promoção ao canônico." |
            Set-Content -LiteralPath $inboxReadme -Encoding utf8
    }
}

$repoCanonical = Join-Path $RepoRoot 'docs\BRAIN'
$vaultCanonical = Join-Path $VaultRoot '00-CANONICO'
$stateRoot = Join-Path $VaultRoot '.hermes-sync'
$statePath = Join-Path $stateRoot 'state.json'
$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$conflictRoot = Join-Path $VaultRoot ("90-CONFLITOS\$timestamp")

if (-not (Test-Path -LiteralPath $RepoRoot)) {
    throw "REPO_NOT_FOUND=$RepoRoot"
}
if (-not (Test-Path -LiteralPath $repoCanonical)) {
    throw "REPO_CANONICAL_NOT_FOUND=$repoCanonical"
}

Initialize-Vault -Repo $RepoRoot -Vault $VaultRoot

$state = @{}
if (Test-Path -LiteralPath $statePath) {
    $loaded = Get-Content -LiteralPath $statePath -Raw | ConvertFrom-Json
    if ($loaded.files) {
        foreach ($entry in $loaded.files) {
            $state[[string]$entry.path] = [string]$entry.hash
        }
    }
}

$repoMap = Get-FileMap -Root $repoCanonical
$vaultMap = Get-FileMap -Root $vaultCanonical
$allPaths = @($repoMap.Keys + $vaultMap.Keys | Sort-Object -Unique)

$summary = [ordered]@{
    mode = $Mode
    repo_to_vault = 0
    vault_to_repo = 0
    already_equal = 0
    conflicts = 0
    untouched = 0
}

foreach ($relative in $allPaths) {
    $hasRepo = $repoMap.ContainsKey($relative)
    $hasVault = $vaultMap.ContainsKey($relative)
    $repoFile = if ($hasRepo) { [string]$repoMap[$relative].path } else { $null }
    $vaultFile = if ($hasVault) { [string]$vaultMap[$relative].path } else { $null }
    $repoHash = if ($hasRepo) { [string]$repoMap[$relative].hash } else { $null }
    $vaultHash = if ($hasVault) { [string]$vaultMap[$relative].hash } else { $null }
    $baseHash = if ($state.ContainsKey($relative)) { [string]$state[$relative] } else { $null }

    if ($Mode -eq 'Status') {
        if ($hasRepo -and $hasVault -and $repoHash -eq $vaultHash) {
            $summary.already_equal++
        } else {
            $summary.untouched++
        }
        continue
    }

    if ($hasRepo -and $hasVault -and $repoHash -eq $vaultHash) {
        $summary.already_equal++
        continue
    }

    if ($Mode -eq 'Pull') {
        if ($hasRepo) {
            $vaultChanged = $baseHash -and $hasVault -and ($vaultHash -ne $baseHash)
            $repoChanged = -not $baseHash -or ($repoHash -ne $baseHash)
            if ($vaultChanged -and $repoChanged -and $repoHash -ne $vaultHash) {
                Ensure-Directory -Path $conflictRoot
                Save-Conflict -RelativePath $relative -RepoFile $repoFile -VaultFile $vaultFile -ConflictRoot $conflictRoot
                $summary.conflicts++
                continue
            }
            $destination = Join-Path $vaultCanonical $relative
            Copy-Preserved -Source $repoFile -Destination $destination
            $summary.repo_to_vault++
        } else {
            $summary.untouched++
        }
        continue
    }

    if ($Mode -eq 'Push') {
        if ($hasVault) {
            $repoChanged = $baseHash -and $hasRepo -and ($repoHash -ne $baseHash)
            $vaultChanged = -not $baseHash -or ($vaultHash -ne $baseHash)
            if ($repoChanged -and $vaultChanged -and $repoHash -ne $vaultHash) {
                Ensure-Directory -Path $conflictRoot
                Save-Conflict -RelativePath $relative -RepoFile $repoFile -VaultFile $vaultFile -ConflictRoot $conflictRoot
                $summary.conflicts++
                continue
            }
            $destination = Join-Path $repoCanonical $relative
            Copy-Preserved -Source $vaultFile -Destination $destination
            $summary.vault_to_repo++
        } else {
            $summary.untouched++
        }
        continue
    }

    # Init e Sync usam sincronização bidirecional preservando os dois lados.
    if ($hasRepo -and -not $hasVault) {
        Copy-Preserved -Source $repoFile -Destination (Join-Path $vaultCanonical $relative)
        $summary.repo_to_vault++
        continue
    }

    if ($hasVault -and -not $hasRepo) {
        Copy-Preserved -Source $vaultFile -Destination (Join-Path $repoCanonical $relative)
        $summary.vault_to_repo++
        continue
    }

    if (-not $baseHash) {
        Ensure-Directory -Path $conflictRoot
        Save-Conflict -RelativePath $relative -RepoFile $repoFile -VaultFile $vaultFile -ConflictRoot $conflictRoot
        $summary.conflicts++
        continue
    }

    $repoChanged = $repoHash -ne $baseHash
    $vaultChanged = $vaultHash -ne $baseHash

    if ($repoChanged -and -not $vaultChanged) {
        Copy-Preserved -Source $repoFile -Destination $vaultFile
        $summary.repo_to_vault++
    } elseif ($vaultChanged -and -not $repoChanged) {
        Copy-Preserved -Source $vaultFile -Destination $repoFile
        $summary.vault_to_repo++
    } else {
        Ensure-Directory -Path $conflictRoot
        Save-Conflict -RelativePath $relative -RepoFile $repoFile -VaultFile $vaultFile -ConflictRoot $conflictRoot
        $summary.conflicts++
    }
}

if ($Mode -ne 'Status') {
    $repoMapAfter = Get-FileMap -Root $repoCanonical
    $vaultMapAfter = Get-FileMap -Root $vaultCanonical
    $stateEntries = @()

    foreach ($relative in @($repoMapAfter.Keys + $vaultMapAfter.Keys | Sort-Object -Unique)) {
        if ($repoMapAfter.ContainsKey($relative) -and $vaultMapAfter.ContainsKey($relative)) {
            $repoHash = [string]$repoMapAfter[$relative].hash
            $vaultHash = [string]$vaultMapAfter[$relative].hash
            if ($repoHash -eq $vaultHash) {
                $stateEntries += [ordered]@{ path = $relative; hash = $repoHash }
            }
        }
    }

    [ordered]@{
        schema_version = 1
        updated_at = (Get-Date).ToString('o')
        repo_root = $RepoRoot
        vault_root = $VaultRoot
        files = $stateEntries
    } | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath $statePath -Encoding utf8
}

Write-Output "MODE=$($summary.mode)"
Write-Output "REPO_TO_VAULT=$($summary.repo_to_vault)"
Write-Output "VAULT_TO_REPO=$($summary.vault_to_repo)"
Write-Output "ALREADY_EQUAL=$($summary.already_equal)"
Write-Output "CONFLICTS=$($summary.conflicts)"
Write-Output "VAULT_ROOT=$VaultRoot"
Write-Output "REPO_CANONICAL=$repoCanonical"

if ($summary.conflicts -gt 0) {
    Write-Output "CONFLICT_ROOT=$conflictRoot"
    exit 2
}

Write-Output 'SYNC_STATUS=PASS'
