[CmdletBinding()]
param(
    [ValidateSet('Init', 'Sync', 'Pull', 'Push', 'Status')]
    [string]$Mode = 'Status',

    [Parameter(Mandatory = $false)]
    [string]$RepoRoot,

    [Parameter(Mandatory = $false)]
    [string]$VaultRoot,

    [string]$Branch = 'main',

    [string]$PrMother = '1562'
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Out-Kv([string]$Key, $Value) {
    Write-Output ("{0}={1}" -f $Key, $Value)
}

function Invoke-Git([string[]]$GitArgs) {
    $output = & git -C $repoFull @GitArgs 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "git $($GitArgs -join ' ') falhou: $($output -join ' ')"
    }
    return ($output -join "`n").Trim()
}

function Test-CanonicalOrigin([string]$Url) {
    return $Url -match 'github\.com[:/]ServerVpss/CentralDark(\.git)?$'
}

function Invoke-PythonGuard([string[]]$Args) {
    $python = Get-Command python -ErrorAction SilentlyContinue
    if (-not $python) {
        Out-Kv 'META_LUPA_GUARD' 'BLOCKED_PYTHON_NOT_FOUND'
        return $false
    }
    $output = & $python.Source @Args 2>&1
    $code = $LASTEXITCODE
    foreach ($line in $output) { Write-Output $line }
    return ($code -eq 0)
}

# Não reativar defaults físicos por memória histórica. O caller fornece roots
# medidos na Casa. Isso mantém MEMORY != REALITY.
if ([string]::IsNullOrWhiteSpace($RepoRoot) -or [string]::IsNullOrWhiteSpace($VaultRoot)) {
    Out-Kv 'CASA_SYNC_STATUS' 'BLOCKED_LOCAL_PATHS_UNPROVEN'
    Out-Kv 'REPO_ROOT' 'UNKNOWN'
    Out-Kv 'VAULT_ROOT' 'UNKNOWN'
    Out-Kv 'NEXT' 'INSPECIONAR_C_E_READ_ONLY_E_FORNECER_ROOTS_PROVADAS'
    exit 3
}

$repoFull = [System.IO.Path]::GetFullPath($RepoRoot)
$vaultFull = [System.IO.Path]::GetFullPath($VaultRoot)
$repoExists = Test-Path -LiteralPath $repoFull -PathType Container
$vaultExists = Test-Path -LiteralPath $vaultFull -PathType Container

Out-Kv 'SURFACE' 'CASA'
Out-Kv 'PROTOCOL' 'BANDA_META_LUPA_CLAIM_SEAL_SYNC_V1'
Out-Kv 'REQUESTED_MODE' $Mode
Out-Kv 'PR_MOTHER_POLICY' $PrMother
Out-Kv 'REPO_ROOT' $repoFull
Out-Kv 'REPO_EXISTS' $repoExists
Out-Kv 'VAULT_ROOT' $vaultFull
Out-Kv 'VAULT_EXISTS' $vaultExists

if (-not $repoExists -or -not (Test-Path -LiteralPath (Join-Path $repoFull '.git'))) {
    Out-Kv 'CASA_SYNC_STATUS' 'BLOCKED_REPO_INVALID'
    exit 10
}
if (-not $vaultExists) {
    Out-Kv 'CASA_SYNC_STATUS' 'BLOCKED_VAULT_ABSENT'
    exit 11
}

$repoPrefix = $repoFull.TrimEnd('\') + '\'
$vaultInsideRepo = $vaultFull.StartsWith($repoPrefix, [System.StringComparison]::OrdinalIgnoreCase) -or ($vaultFull -ieq $repoFull)
Out-Kv 'VAULT_INSIDE_REPO' $vaultInsideRepo
if (-not $vaultInsideRepo) {
    Out-Kv 'CASA_SYNC_STATUS' 'BLOCKED_SPLIT_BRAIN_VAULT_OUTSIDE_REPO'
    Out-Kv 'REASON' 'NENHUMA_NOTA_DEVE_TOCAR_SOZINHA_SEM_VINCULO_PROVADO_AO_REPO'
    exit 12
}

$origin = Invoke-Git @('remote', 'get-url', 'origin')
Out-Kv 'ORIGIN' $origin
if (-not (Test-CanonicalOrigin $origin)) {
    Out-Kv 'CASA_SYNC_STATUS' 'BLOCKED_NON_CANONICAL_ORIGIN'
    exit 13
}

$branchNow = Invoke-Git @('branch', '--show-current')
$headBefore = Invoke-Git @('rev-parse', 'HEAD')
$dirtyLines = @(Invoke-Git @('status', '--porcelain') -split "`n" | Where-Object { $_ -ne '' })
$dirtyCount = $dirtyLines.Count

Out-Kv 'BRANCH_LOCAL' $branchNow
Out-Kv 'HEAD_BEFORE' $headBefore
Out-Kv 'DIRTY_COUNT_BEFORE' $dirtyCount
Out-Kv 'PING' "origin/$Branch"

# Status puro não muda nada, mas ainda mede remoto para detectar drift.
try {
    Invoke-Git @('fetch', '--prune', 'origin', $Branch) | Out-Null
} catch {
    Out-Kv 'CASA_SYNC_STATUS' 'BLOCKED_FETCH_FAILED'
    Out-Kv 'ERROR' $_.Exception.Message
    exit 14
}

$originHead = Invoke-Git @('rev-parse', "origin/$Branch")
$behind = [int](Invoke-Git @('rev-list', '--count', "HEAD..origin/$Branch"))
$ahead = [int](Invoke-Git @('rev-list', '--count', "origin/$Branch..HEAD"))
Out-Kv 'REMOTE_HEAD' $originHead
Out-Kv 'BEHIND' $behind
Out-Kv 'AHEAD' $ahead

$metaLupaHash = Join-Path $repoFull 'scripts/lupa/validar_autolupa_hash.py'
$claimGuard = Join-Path $repoFull '.agents/skills/meta-lupa/guardrails/claim_seal.py'
$claimLedger = Join-Path $repoFull '.agents/skills/meta-lupa/references/claim-seals.jsonl'

if (-not (Test-Path -LiteralPath $metaLupaHash) -or -not (Test-Path -LiteralPath $claimGuard) -or -not (Test-Path -LiteralPath $claimLedger)) {
    Out-Kv 'CASA_SYNC_STATUS' 'BLOCKED_META_LUPA_LINK_BROKEN'
    exit 15
}

$metaOk = Invoke-PythonGuard @($metaLupaHash)
$sealSelfOk = Invoke-PythonGuard @($claimGuard, '--self-test')
$sealLedgerOk = Invoke-PythonGuard @($claimGuard, 'validate', $claimLedger)
Out-Kv 'META_LUPA_HASH_OK' $metaOk
Out-Kv 'CLAIM_SEAL_SELF_TEST_OK' $sealSelfOk
Out-Kv 'CLAIM_SEAL_LEDGER_OK' $sealLedgerOk
if (-not $metaOk -or -not $sealSelfOk -or -not $sealLedgerOk) {
    Out-Kv 'CASA_SYNC_STATUS' 'BLOCKED_PROOF_GUARD'
    exit 16
}

if ($Mode -in @('Sync', 'Pull', 'Push') -and $dirtyCount -gt 0) {
    Out-Kv 'CASA_SYNC_STATUS' 'BLOCKED_DIRTY_WORKTREE'
    Out-Kv 'RULE' 'NUNCA_RESETAR_OU_LIMPAR_AUTOMATICAMENTE_TRABALHO_LOCAL'
    exit 20
}

if ($Mode -eq 'Status' -or $Mode -eq 'Init') {
    $fixed = ($headBefore -eq $originHead -and $dirtyCount -eq 0 -and $metaOk -and $sealLedgerOk)
    Out-Kv 'CASA_SYNC_STATUS' 'READ_ONLY_MEASURED'
    Out-Kv 'PONTO_FIXO_SYNC' ($(if ($fixed) { 'PASS' } else { 'NOT_YET' }))
    Out-Kv 'PONG' "local=$headBefore remote=$originHead dirty=$dirtyCount"
    exit 0
}

if ($Mode -in @('Sync', 'Pull')) {
    if ($ahead -gt 0) {
        Out-Kv 'CASA_SYNC_STATUS' 'BLOCKED_LOCAL_AHEAD'
        Out-Kv 'REASON' 'COMMITS_LOCAIS_NAO_SAO_DESCARTADOS_POR_SYNC'
        Out-Kv 'NEXT' 'RECONCILIAR_E_PROMOVER_POR_PR_OU_PUSH_EXPLICITO'
        exit 21
    }
    if ($behind -gt 0) {
        Invoke-Git @('merge', '--ff-only', "origin/$Branch") | Out-Null
    }
}
elseif ($Mode -eq 'Push') {
    if ($Branch -eq 'main' -or $branchNow -eq 'main') {
        Out-Kv 'CASA_SYNC_STATUS' 'BLOCKED_PR_MOTHER_CHILD_REQUIRED'
        Out-Kv 'RULE' 'OBSIDIAN_OUTBOUND_NEVER_PUSHES_MAIN_DIRECTLY'
        Out-Kv 'PR_MOTHER' $PrMother
        Out-Kv 'NEXT' 'USE_EXISTING_CHILD_PROMOTION_BRANCH_AND_PR_MOTHER_FUNNEL'
        exit 24
    }
    if ($behind -gt 0) {
        Out-Kv 'CASA_SYNC_STATUS' 'BLOCKED_BEHIND_REMOTE'
        Out-Kv 'NEXT' 'PULL_FF_ONLY_ANTES_DE_PUSH'
        exit 22
    }
    if ($branchNow -ne $Branch) {
        Out-Kv 'CASA_SYNC_STATUS' 'BLOCKED_BRANCH_MISMATCH'
        Out-Kv 'NEXT' 'CHECKOUT_AUTHORIZED_CHILD_BRANCH'
        exit 23
    }
    if ($ahead -gt 0) {
        Invoke-Git @('push', 'origin', "HEAD:$Branch") | Out-Null
        Invoke-Git @('fetch', '--prune', 'origin', $Branch) | Out-Null
    }
}

$headAfter = Invoke-Git @('rev-parse', 'HEAD')
$remoteAfter = Invoke-Git @('rev-parse', "origin/$Branch")
$dirtyAfter = @(Invoke-Git @('status', '--porcelain') -split "`n" | Where-Object { $_ -ne '' }).Count
$behindAfter = [int](Invoke-Git @('rev-list', '--count', "HEAD..origin/$Branch"))
$aheadAfter = [int](Invoke-Git @('rev-list', '--count', "origin/$Branch..HEAD"))

# Revalidar guardas no estado final: ação não é prova.
$sealFinalOk = Invoke-PythonGuard @($claimGuard, 'validate', $claimLedger)
$fixedPoint = ($headAfter -eq $remoteAfter -and $dirtyAfter -eq 0 -and $behindAfter -eq 0 -and $aheadAfter -eq 0 -and $sealFinalOk)

Out-Kv 'HEAD_AFTER' $headAfter
Out-Kv 'REMOTE_AFTER' $remoteAfter
Out-Kv 'DIRTY_COUNT_AFTER' $dirtyAfter
Out-Kv 'BEHIND_AFTER' $behindAfter
Out-Kv 'AHEAD_AFTER' $aheadAfter
Out-Kv 'CLAIM_SEAL_FINAL_OK' $sealFinalOk
Out-Kv 'PONG' "local=$headAfter remote=$remoteAfter dirty=$dirtyAfter"
Out-Kv 'PONTO_FIXO_SYNC' ($(if ($fixedPoint) { 'PASS' } else { 'NOT_YET' }))

if (-not $fixedPoint) {
    Out-Kv 'CASA_SYNC_STATUS' 'BLOCKED_NOT_FIXED_POINT'
    exit 30
}

Out-Kv 'CASA_SYNC_STATUS' 'PASS'
Out-Kv 'META_LUPA' 'REMEASURED_AFTER_ACTION'
Out-Kv 'NEXT_CURSOR' 'NONE_FOR_SYNC_SCOPE'
exit 0
