# COMANDO - check-prerequisites.ps1
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\evidence\session-completa-20260806\.extracted_GATILHO-UNIVERSAL-IA-RIGOR-MAXIMO\GATILHO-UNIVERSAL-IA\scripts\check-prerequisites.ps1
**SHA:** 2bfe8b3f89ad8d5a
**Timestamp:** 2026-08-28T02:57:25.405192
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- $missing = @($required | Where-Object { -not (Test-Path (Join-Path $root $_) -PathType Leaf) })
- $missing | ForEach-Object { Write-Output "MISSING=$_" }

### Ouro Bruto (primeiros 5000 chars)
```
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

```