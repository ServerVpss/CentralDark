#requires -Version 5.1
[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)]
    [string]$RepoRoot
)

Set-StrictMode -Version 2.0
$ErrorActionPreference = 'Stop'

$ExpectedBase = '6bff74d4beec72ac0cc08828715f7f5d7f393dfe'
$RepoRoot = [IO.Path]::GetFullPath($RepoRoot).TrimEnd('\')
$PackageRoot = Split-Path -Parent $PSScriptRoot
$PatchRoot = Join-Path $PackageRoot 'PATCH_TREE'

if (-not (Test-Path -LiteralPath (Join-Path $RepoRoot '.git'))) {
    throw "NOT_A_GIT_WORKTREE: $RepoRoot"
}

$remote = (& git -C $RepoRoot remote get-url origin 2>$null | Select-Object -First 1)
if ($remote -notmatch 'ServerVpss/CentralDark') {
    throw "WRONG_REPOSITORY_ORIGIN: $remote"
}

$status = @(& git -C $RepoRoot status --porcelain=v1)
if ($status.Count -gt 0) {
    throw 'WORKTREE_DIRTY: use branch/worktree limpa'
}

$head = (& git -C $RepoRoot rev-parse HEAD).Trim()
if ($head -ne $ExpectedBase) {
    throw "BASE_HEAD_CHANGED: expected=$ExpectedBase actual=$head. Recalibre antes de aplicar."
}

$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$backup = Join-Path $PackageRoot "LOCAL-BACKUP-$stamp"
New-Item -ItemType Directory -Force -Path $backup | Out-Null

Get-ChildItem -LiteralPath $PatchRoot -File -Recurse | ForEach-Object {
    $rel = $_.FullName.Substring($PatchRoot.Length).TrimStart('\')
    $target = Join-Path $RepoRoot $rel
    $targetParent = Split-Path -Parent $target

    if (Test-Path -LiteralPath $target -PathType Leaf) {
        $backupPath = Join-Path $backup $rel
        New-Item -ItemType Directory -Force -Path (Split-Path -Parent $backupPath) | Out-Null
        Copy-Item -LiteralPath $target -Destination $backupPath -Force
    }

    New-Item -ItemType Directory -Force -Path $targetParent | Out-Null
    Copy-Item -LiteralPath $_.FullName -Destination $target -Force
}

Write-Host 'APPLY_LOCAL=PASS'
Write-Host "BASE_HEAD=$head"
Write-Host "BACKUP=$backup"
Write-Host 'COMMIT=NOT_EXECUTED'
Write-Host 'PUSH=NOT_EXECUTED'
Write-Host 'DEPLOY=NOT_EXECUTED'
