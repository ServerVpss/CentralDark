[CmdletBinding()]
param(
    [ValidateSet('Init', 'Sync', 'Pull', 'Push', 'Status')]
    [string]$Mode = 'Status',

    [string]$RepoRoot,

    [string]$VaultRoot
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# Segurança de transição 2026-08-14:
# os defaults E:\CentralDark\... eram hipótese histórica e não podem mais
# iniciar sincronização física antes da inspeção local C:/E:.
# O algoritmo anterior permanece no histórico Git para ser reconciliado depois
# que RepoRoot/VaultRoot/consumidores forem medidos.

if ([string]::IsNullOrWhiteSpace($RepoRoot) -or [string]::IsNullOrWhiteSpace($VaultRoot)) {
    Write-Output 'CASA_SYNC_STATUS=BLOCKED_LOCAL_PATHS_UNPROVEN'
    Write-Output 'REPO_ROOT=UNKNOWN'
    Write-Output 'VAULT_ROOT=UNKNOWN'
    Write-Output 'NEXT=INSPECIONAR_C_E_READ_ONLY_E_FORNECER_ROOTS_PROVADAS'
    exit 3
}

$repoFull = [System.IO.Path]::GetFullPath($RepoRoot)
$vaultFull = [System.IO.Path]::GetFullPath($VaultRoot)

$repoExists = Test-Path -LiteralPath $repoFull -PathType Container
$vaultExists = Test-Path -LiteralPath $vaultFull -PathType Container

if ($Mode -eq 'Status') {
    Write-Output 'CASA_SYNC_STATUS=READ_ONLY'
    Write-Output "REPO_ROOT=$repoFull"
    Write-Output "REPO_EXISTS=$repoExists"
    Write-Output "VAULT_ROOT=$vaultFull"
    Write-Output "VAULT_EXISTS=$vaultExists"
    Write-Output 'MUTATION_ENABLED=false'
    exit 0
}

Write-Output 'CASA_SYNC_STATUS=BLOCKED_PENDING_LOCAL_INSPECTION'
Write-Output "REQUESTED_MODE=$Mode"
Write-Output "REPO_ROOT=$repoFull"
Write-Output "REPO_EXISTS=$repoExists"
Write-Output "VAULT_ROOT=$vaultFull"
Write-Output "VAULT_EXISTS=$vaultExists"
Write-Output 'REASON=C_E_HERMES_HOME_CONSUMERS_AINDA_NAO_PROVADOS'
Write-Output 'NEXT=REVALIDAR_ALGORITMO_ANTIGO_COM_ROOTS_PROVADAS_ANTES_DE_REATIVAR_MUTACAO'
exit 3
