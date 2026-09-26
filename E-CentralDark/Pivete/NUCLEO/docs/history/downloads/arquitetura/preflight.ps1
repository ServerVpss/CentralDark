param(
  [string]$Repo = "E:\CentralDark"
)

$ErrorActionPreference = "Stop"

Write-Host "CENTRALDARK PREFLIGHT — READ ONLY"
Write-Host "Repo: $Repo"

$checks = @(
  "LEIA-ME-IA.md",
  "AGENTS.md",
  ".agents\skills\session-intelligence-harvester\SKILL.md",
  ".agents\skills\knowledge-compiler\SKILL.md",
  ".agents\skills\meta-lupa\SKILL.md",
  "docs\ARQUITETURA\JARVIS-ORQUESTRACAO-DELTA-E-ESCRITOR-UNICO.md"
)

foreach ($rel in $checks) {
  $p = Join-Path $Repo $rel
  $status = if (Test-Path $p) { "FOUND" } else { "MISSING" }
  Write-Host "$status`t$rel"
}

if (Test-Path (Join-Path $Repo ".git")) {
  Push-Location $Repo
  try {
    Write-Host "`nGIT:"
    git status --short --branch
    git rev-parse HEAD
  } finally {
    Pop-Location
  }
} else {
  Write-Host "GIT=UNKNOWN (no .git at target)"
}

Write-Host "`nMUTATION=ZERO"
