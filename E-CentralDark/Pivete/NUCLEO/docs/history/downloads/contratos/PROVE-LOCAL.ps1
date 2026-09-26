#requires -Version 5.1
[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)]
    [string]$RepoRoot
)

Set-StrictMode -Version 2.0
$ErrorActionPreference = 'Stop'
$RepoRoot = [IO.Path]::GetFullPath($RepoRoot).TrimEnd('\')

Push-Location $RepoRoot
try {
    & git diff --check
    if ($LASTEXITCODE -ne 0) { throw 'GIT_DIFF_CHECK_FAIL' }

    & python scripts/trigger-fabric/verify_repo_contract.py .
    if ($LASTEXITCODE -ne 0) { throw 'REPO_CONTRACT_VERIFY_FAIL' }

    & python scripts/trigger-fabric/test_pombo_handoff_counterproof.py .
    if ($LASTEXITCODE -ne 0) { throw 'POMBO_OWNER_COUNTERPROOF_FAIL' }

    Write-Host 'LOCAL_PROOF=PASS'
    Write-Host 'CI_RUNTIME=EVIDENCIA_FALTANTE_UNTIL_PR_RUN'
    Write-Host 'API_CENTRALLDARK_RUNTIME=EVIDENCIA_FALTANTE'
}
finally {
    Pop-Location
}
