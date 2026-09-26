$ErrorActionPreference = "Stop"

# LEIGO: confirma se o Node e os arquivos principais existem, sem mostrar nenhuma chave.
# PROFISSIONAL: gate local de versão major, configuração e presença booleana de provider.
$nodeRaw = (& node --version).Trim()
$major = [int](($nodeRaw -replace '^v','').Split('.')[0])
if ($major -lt 22) {
    Write-Output "STATUS=BLOCKED_NODE_VERSION"
    Write-Output "NODE_VERSION=$nodeRaw"
    exit 1
}

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$required = @(
    "config\providers.json",
    "config\commands.json",
    "bin\uai.mjs",
    "scripts\verify.mjs"
)
$missing = @($required | Where-Object { -not (Test-Path (Join-Path $root $_) -PathType Leaf) })
if ($missing.Count -gt 0) {
    Write-Output "STATUS=BLOCKED_MISSING_FILES"
    $missing | ForEach-Object { Write-Output "MISSING=$_" }
    exit 1
}

$providerPresent = [bool]$env:CENTRALDARK_API_KEY -or [bool]$env:OPENAI_API_KEY -or [bool]$env:ANTHROPIC_API_KEY
Write-Output "STATUS=PASS"
Write-Output "NODE_VERSION=$nodeRaw"
Write-Output "PROVIDER_KEY_PRESENT=$($providerPresent.ToString().ToUpper())"
Write-Output "SECRET_VALUE_PRINTED=NAO"
