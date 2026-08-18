[CmdletBinding()]
param(
    [Parameter(Mandatory)]
    [string]$CandidatePath,

    [string]$RepoRoot,

    [string]$VaultRoot
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# O fluxo de promoção antigo dependia de defaults físicos E:\CentralDark\...
# ainda não medidos. Até a inspeção C:/E:, não mover candidato nem escrever
# em docs/CONSCIENCIA/APRENDIZADOS.md a partir de caminho local presumido.

if ([string]::IsNullOrWhiteSpace($RepoRoot) -or [string]::IsNullOrWhiteSpace($VaultRoot)) {
    Write-Output 'HERMES_LEARNING_PROMOTION=BLOCKED_LOCAL_PATHS_UNPROVEN'
    Write-Output 'REPO_ROOT=UNKNOWN'
    Write-Output 'VAULT_ROOT=UNKNOWN'
    Write-Output 'CANDIDATE_NOT_TOUCHED=true'
    exit 3
}

$repoFull = [System.IO.Path]::GetFullPath($RepoRoot)
$vaultFull = [System.IO.Path]::GetFullPath($VaultRoot)
$candidateFull = [System.IO.Path]::GetFullPath($CandidatePath)

Write-Output 'HERMES_LEARNING_PROMOTION=BLOCKED_PENDING_LOCAL_INSPECTION'
Write-Output "REPO_ROOT=$repoFull"
Write-Output "VAULT_ROOT=$vaultFull"
Write-Output "CANDIDATE_PATH=$candidateFull"
Write-Output 'CANDIDATE_NOT_TOUCHED=true'
Write-Output 'REASON=C_E_HERMES_HOME_ACTIVE_VAULT_AINDA_NAO_PROVADOS'
Write-Output 'NEXT=REVALIDAR_FLUXO_DE_PROMOCAO_COM_ROOTS_PROVADAS'
exit 3
