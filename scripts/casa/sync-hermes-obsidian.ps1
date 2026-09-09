[CmdletBinding()]
param(
    [ValidateSet('Init', 'Sync', 'Pull', 'Push', 'Status')]
    [string]$Mode = 'Status',

    [Parameter(Mandatory = $false)]
    [string]$RepoRoot,

    [Parameter(Mandatory = $false)]
    [string]$VaultRoot
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Out-Kv([string]$Key, $Value) {
    Write-Output ("{0}={1}" -f $Key, $Value)
}

function Ensure-Directory([string]$Path) {
    if (-not (Test-Path -LiteralPath $Path -PathType Container)) {
        New-Item -ItemType Directory -Path $Path -Force | Out-Null
    }
}

function Get-Sha256([string]$Path) {
    return (Get-FileHash -LiteralPath $Path -Algorithm SHA256).Hash.ToLowerInvariant()
}

function Get-FileMap([string]$Root) {
    $map = @{}
    if (-not (Test-Path -LiteralPath $Root -PathType Container)) { return $map }
    Get-ChildItem -LiteralPath $Root -File -Recurse -Force | ForEach-Object {
        $relative = [System.IO.Path]::GetRelativePath($Root, $_.FullName).Replace('\', '/')
        $map[$relative] = [ordered]@{ path = $_.FullName; hash = Get-Sha256 $_.FullName }
    }
    return $map
}

function Copy-Preserved([string]$Source, [string]$Destination) {
    Ensure-Directory (Split-Path -Parent $Destination)
    Copy-Item -LiteralPath $Source -Destination $Destination -Force
}

function Test-CanonicalOrigin([string]$Url) {
    return $Url -match 'github\.com[:/]ServerVpss/CentralDark(\.git)?$'
}

function Test-SuspectSecret([string]$Path) {
    $name = [System.IO.Path]::GetFileName($Path)
    if ($name -match '(?i)^\.env($|\.)|secret|credential|private[-_ ]?key|client[-_ ]?secret|api[-_ ]?key|token') {
        return $true
    }
    $ext = [System.IO.Path]::GetExtension($Path).ToLowerInvariant()
    if ($ext -notin @('.md', '.txt', '.json', '.yml', '.yaml', '.toml', '.ini', '.cfg', '.ps1', '.js', '.mjs', '.ts', '.tsx', '.py', '.sh')) {
        return $false
    }
    try {
        $text = Get-Content -LiteralPath $Path -Raw -ErrorAction Stop
        return $text -match '(?im)(BEGIN [A-Z ]*PRIVATE KEY|(?:api[_ -]?key|client[_ -]?secret|access[_ -]?token|refresh[_ -]?token|password)\s*[:=]\s*["''][^"'']{8,})'
    } catch {
        return $false
    }
}

function Save-Conflict([string]$RelativePath, [string]$RepoFile, [string]$VaultFile, [string]$ConflictRoot) {
    $safe = $RelativePath.Replace('/', [System.IO.Path]::DirectorySeparatorChar)
    if ($RepoFile -and (Test-Path -LiteralPath $RepoFile)) {
        Copy-Preserved $RepoFile (Join-Path $ConflictRoot ($safe + '.repo'))
    }
    if ($VaultFile -and (Test-Path -LiteralPath $VaultFile)) {
        Copy-Preserved $VaultFile (Join-Path $ConflictRoot ($safe + '.vault'))
    }
}

function Initialize-Vault([string]$Repo, [string]$Vault) {
    foreach ($folder in @(
        $Vault,
        (Join-Path $Vault '00-CANONICO'),
        (Join-Path $Vault '10-MEMORIA-PRIVADA'),
        (Join-Path $Vault '20-INBOX-HERMES'),
        (Join-Path $Vault '30-ANEXOS'),
        (Join-Path $Vault '90-CONFLITOS'),
        (Join-Path $Vault '.hermes-sync'),
        (Join-Path $Vault '.obsidian')
    )) { Ensure-Directory $folder }

    $obsidianSource = Join-Path $Repo 'docs\CONSCIENCIA\VAULT\obsidian.json'
    $obsidianTarget = Join-Path $Vault '.obsidian\app.json'
    if ((Test-Path -LiteralPath $obsidianSource) -and -not (Test-Path -LiteralPath $obsidianTarget)) {
        Copy-Preserved $obsidianSource $obsidianTarget
    }

    $readmes = @{
        (Join-Path $Vault 'README.md') = "# CASA-VAULT`n`n00-CANONICO sincroniza com docs/BRAIN. Memoria privada, inbox, anexos e conflitos permanecem locais por padrao.`n"
        (Join-Path $Vault '10-MEMORIA-PRIVADA\README.md') = "# Memoria privada`n`nNunca sincronizar automaticamente com Git.`n"
        (Join-Path $Vault '20-INBOX-HERMES\README.md') = "# Inbox Hermes`n`nAprendizados candidatos aguardam classificacao, prova e promocao ao owner canonico.`n"
    }
    foreach ($path in $readmes.Keys) {
        if (-not (Test-Path -LiteralPath $path)) {
            $readmes[$path] | Set-Content -LiteralPath $path -Encoding utf8
        }
    }
}

function Save-StateAtomic([string]$StatePath, [array]$Entries, [string]$Repo, [string]$Vault) {
    Ensure-Directory (Split-Path -Parent $StatePath)
    $payload = [ordered]@{
        contract_id = 'CENTRALDARK_HERMES_OBSIDIAN_SYNC'
        state_format = 'centraldark.hermes-obsidian-sync'
        updated_at = (Get-Date).ToString('o')
        repo_root = $Repo
        vault_root = $Vault
        files = $Entries
    }
    $tmp = "$StatePath.tmp"
    $payload | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $tmp -Encoding utf8
    Move-Item -LiteralPath $tmp -Destination $StatePath -Force
}

if ([string]::IsNullOrWhiteSpace($RepoRoot) -or [string]::IsNullOrWhiteSpace($VaultRoot)) {
    Out-Kv 'CASA_SYNC_STATUS' 'BLOCKED_LOCAL_PATHS_UNPROVEN'
    Out-Kv 'REPO_ROOT' 'UNKNOWN'
    Out-Kv 'VAULT_ROOT' 'UNKNOWN'
    exit 3
}

$repoFull = [System.IO.Path]::GetFullPath($RepoRoot).TrimEnd('\')
$vaultFull = [System.IO.Path]::GetFullPath($VaultRoot).TrimEnd('\')
$repoCanonical = Join-Path $repoFull 'docs\BRAIN'
$vaultCanonical = Join-Path $vaultFull '00-CANONICO'
$statePath = Join-Path $vaultFull '.hermes-sync\state.json'
$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$conflictRoot = Join-Path $vaultFull ("90-CONFLITOS\$timestamp")

Out-Kv 'SURFACE' 'CASA'
Out-Kv 'PROTOCOL' 'BANDA_META_LUPA_CLAIM_SEAL_SYNC'
Out-Kv 'REQUESTED_MODE' $Mode
Out-Kv 'REPO_ROOT' $repoFull
Out-Kv 'VAULT_ROOT' $vaultFull

if (-not (Test-Path -LiteralPath $repoFull -PathType Container) -or -not (Test-Path -LiteralPath (Join-Path $repoFull '.git'))) {
    Out-Kv 'CASA_SYNC_STATUS' 'BLOCKED_REPO_INVALID'
    exit 10
}
if (-not (Test-Path -LiteralPath $repoCanonical -PathType Container)) {
    Out-Kv 'CASA_SYNC_STATUS' 'BLOCKED_REPO_CANONICAL_ABSENT'
    exit 11
}

$repoPrefix = $repoFull + '\'
$vaultPrefix = $vaultFull + '\'
$vaultInsideRepo = $vaultFull.StartsWith($repoPrefix, [System.StringComparison]::OrdinalIgnoreCase) -or ($vaultFull -ieq $repoFull)
$repoInsideVault = $repoFull.StartsWith($vaultPrefix, [System.StringComparison]::OrdinalIgnoreCase)
Out-Kv 'VAULT_SEPARATE_FROM_REPO' (-not $vaultInsideRepo -and -not $repoInsideVault)
if ($vaultInsideRepo -or $repoInsideVault) {
    Out-Kv 'CASA_SYNC_STATUS' 'BLOCKED_PRIVATE_BOUNDARY_COLLAPSED'
    Out-Kv 'REASON' 'CASA_VAULT_DEVE_SER_SEPARADO_DO_REPO_E_SOMENTE_00_CANONICO_SINCRONIZA'
    exit 12
}

$origin = (& git -C $repoFull remote get-url origin 2>$null | Select-Object -First 1)
if ($LASTEXITCODE -ne 0 -or -not (Test-CanonicalOrigin $origin)) {
    Out-Kv 'CASA_SYNC_STATUS' 'BLOCKED_NON_CANONICAL_ORIGIN'
    exit 13
}
Out-Kv 'ORIGIN_CANONICAL' $true

if ($Mode -eq 'Init') {
    Initialize-Vault $repoFull $vaultFull
} elseif (-not (Test-Path -LiteralPath $vaultFull -PathType Container)) {
    Out-Kv 'CASA_SYNC_STATUS' 'BLOCKED_VAULT_ABSENT'
    exit 14
}

if (-not (Test-Path -LiteralPath $vaultCanonical -PathType Container)) {
    Out-Kv 'CASA_SYNC_STATUS' 'BLOCKED_VAULT_CANONICAL_ABSENT'
    exit 15
}

$state = @{}
if (Test-Path -LiteralPath $statePath) {
    try {
        $loaded = Get-Content -LiteralPath $statePath -Raw | ConvertFrom-Json
        foreach ($entry in @($loaded.files)) {
            if ($entry.path -and $entry.hash) { $state[[string]$entry.path] = [string]$entry.hash }
        }
    } catch {
        Out-Kv 'CASA_SYNC_STATUS' 'BLOCKED_STATE_INVALID'
        exit 16
    }
}

$repoMap = Get-FileMap $repoCanonical
$vaultMap = Get-FileMap $vaultCanonical
$allPaths = @($repoMap.Keys + $vaultMap.Keys | Sort-Object -Unique)
$plan = [System.Collections.Generic.List[object]]::new()
$counts = [ordered]@{ equal = 0; repo_to_vault = 0; vault_to_repo = 0; conflicts = 0; deletion_candidates = 0; blocked_secrets = 0; untouched = 0 }

foreach ($relative in $allPaths) {
    $hasRepo = $repoMap.ContainsKey($relative)
    $hasVault = $vaultMap.ContainsKey($relative)
    $repoFile = if ($hasRepo) { [string]$repoMap[$relative].path } else { $null }
    $vaultFile = if ($hasVault) { [string]$vaultMap[$relative].path } else { $null }
    $repoHash = if ($hasRepo) { [string]$repoMap[$relative].hash } else { $null }
    $vaultHash = if ($hasVault) { [string]$vaultMap[$relative].hash } else { $null }
    $baseHash = if ($state.ContainsKey($relative)) { [string]$state[$relative] } else { $null }

    if ($hasRepo -and $hasVault -and $repoHash -eq $vaultHash) {
        $counts.equal++
        $plan.Add([pscustomobject]@{ kind='equal'; relative=$relative; repo=$repoFile; vault=$vaultFile; base=$repoHash })
        continue
    }

    if ($hasRepo -xor $hasVault) {
        if ($baseHash) {
            $counts.deletion_candidates++
            $plan.Add([pscustomobject]@{ kind='deletion'; relative=$relative; repo=$repoFile; vault=$vaultFile; base=$baseHash })
            continue
        }
        if ($hasRepo -and $Mode -in @('Init','Sync','Pull')) {
            $counts.repo_to_vault++
            $plan.Add([pscustomobject]@{ kind='repo_to_vault'; relative=$relative; repo=$repoFile; vault=(Join-Path $vaultCanonical $relative); base=$null })
            continue
        }
        if ($hasVault -and $Mode -in @('Init','Sync','Push')) {
            if (Test-SuspectSecret $vaultFile) {
                $counts.blocked_secrets++
                $plan.Add([pscustomobject]@{ kind='blocked_secret'; relative=$relative; repo=(Join-Path $repoCanonical $relative); vault=$vaultFile; base=$null })
            } else {
                $counts.vault_to_repo++
                $plan.Add([pscustomobject]@{ kind='vault_to_repo'; relative=$relative; repo=(Join-Path $repoCanonical $relative); vault=$vaultFile; base=$null })
            }
            continue
        }
        $counts.untouched++
        $plan.Add([pscustomobject]@{ kind='untouched'; relative=$relative; repo=$repoFile; vault=$vaultFile; base=$baseHash })
        continue
    }

    if (-not $baseHash) {
        $counts.conflicts++
        $plan.Add([pscustomobject]@{ kind='conflict'; relative=$relative; repo=$repoFile; vault=$vaultFile; base=$null })
        continue
    }

    $repoChanged = $repoHash -ne $baseHash
    $vaultChanged = $vaultHash -ne $baseHash
    if ($repoChanged -and -not $vaultChanged -and $Mode -in @('Sync','Pull')) {
        $counts.repo_to_vault++
        $plan.Add([pscustomobject]@{ kind='repo_to_vault'; relative=$relative; repo=$repoFile; vault=$vaultFile; base=$baseHash })
    } elseif ($vaultChanged -and -not $repoChanged -and $Mode -in @('Sync','Push')) {
        if (Test-SuspectSecret $vaultFile) {
            $counts.blocked_secrets++
            $plan.Add([pscustomobject]@{ kind='blocked_secret'; relative=$relative; repo=$repoFile; vault=$vaultFile; base=$baseHash })
        } else {
            $counts.vault_to_repo++
            $plan.Add([pscustomobject]@{ kind='vault_to_repo'; relative=$relative; repo=$repoFile; vault=$vaultFile; base=$baseHash })
        }
    } elseif ($repoChanged -and $vaultChanged) {
        $counts.conflicts++
        $plan.Add([pscustomobject]@{ kind='conflict'; relative=$relative; repo=$repoFile; vault=$vaultFile; base=$baseHash })
    } else {
        $counts.untouched++
        $plan.Add([pscustomobject]@{ kind='untouched'; relative=$relative; repo=$repoFile; vault=$vaultFile; base=$baseHash })
    }
}

foreach ($key in $counts.Keys) { Out-Kv ($key.ToUpperInvariant()) $counts[$key] }

if ($Mode -eq 'Status') {
    Out-Kv 'CASA_SYNC_STATUS' 'READ_ONLY_MEASURED'
    Out-Kv 'PONTO_FIXO_SYNC' ($(if ($counts.conflicts -eq 0 -and $counts.blocked_secrets -eq 0 -and $counts.deletion_candidates -eq 0 -and $counts.repo_to_vault -eq 0 -and $counts.vault_to_repo -eq 0) { 'PASS' } else { 'NOT_YET' }))
    exit 0
}

if ($counts.blocked_secrets -gt 0) {
    foreach ($item in $plan | Where-Object kind -eq 'blocked_secret') { Out-Kv 'BLOCKED_SECRET_PATH' $item.relative }
    Out-Kv 'CASA_SYNC_STATUS' 'BLOCKED_SECRET_SUSPECT'
    exit 17
}

if ($counts.conflicts -gt 0) {
    Ensure-Directory $conflictRoot
    foreach ($item in $plan | Where-Object kind -eq 'conflict') {
        Save-Conflict $item.relative $item.repo $item.vault $conflictRoot
    }
    Out-Kv 'CONFLICT_ROOT' $conflictRoot
    Out-Kv 'CASA_SYNC_STATUS' 'BLOCKED_CONFLICT_PRESERVED'
    exit 2
}

foreach ($item in $plan) {
    if ($item.kind -eq 'repo_to_vault') { Copy-Preserved $item.repo $item.vault }
    elseif ($item.kind -eq 'vault_to_repo') { Copy-Preserved $item.vault $item.repo }
}

$repoAfter = Get-FileMap $repoCanonical
$vaultAfter = Get-FileMap $vaultCanonical
$entries = [System.Collections.Generic.List[object]]::new()
foreach ($relative in @($repoAfter.Keys + $vaultAfter.Keys | Sort-Object -Unique)) {
    if ($repoAfter.ContainsKey($relative) -and $vaultAfter.ContainsKey($relative)) {
        $rh = [string]$repoAfter[$relative].hash
        $vh = [string]$vaultAfter[$relative].hash
        if ($rh -eq $vh) { $entries.Add([ordered]@{ path=$relative; hash=$rh }) }
    } elseif ($state.ContainsKey($relative)) {
        $entries.Add([ordered]@{ path=$relative; hash=[string]$state[$relative] })
    }
}
Save-StateAtomic $statePath $entries.ToArray() $repoFull $vaultFull

Out-Kv 'CASA_SYNC_STATUS' 'PASS'
Out-Kv 'DELETION_CANDIDATES_PRESERVED' $counts.deletion_candidates
Out-Kv 'NEXT_CURSOR' ($(if ($counts.deletion_candidates -gt 0) { 'REVIEW_DELETION_CANDIDATES' } else { 'NONE_FOR_SYNC_SCOPE' }))
exit 0
