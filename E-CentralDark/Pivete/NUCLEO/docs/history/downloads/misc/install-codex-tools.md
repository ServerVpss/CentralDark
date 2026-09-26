# OUTRO - install-codex-tools.ps1
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\scripts\dev\install-codex-tools.ps1
**SHA:** b7f44d501ada12a6
**Timestamp:** 2026-08-26T19:32:51.063705
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- throw "Nao encontrei asset para $Repository com padrao: $AssetPattern"

### Ouro Bruto (primeiros 5000 chars)
```
param(
  [string]$InstallDir
)

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

if (-not $InstallDir) {
  if (-not $env:USERPROFILE) {
    throw "USERPROFILE nao definido; informe -InstallDir."
  }
  $InstallDir = Join-Path $env:USERPROFILE "Documents\Codex\tools\codex-bin"
}

$DownloadDir = Join-Path (Split-Path -Parent $InstallDir) "downloads"

New-Item -ItemType Directory -Force -Path $InstallDir, $DownloadDir | Out-Null

function Write-Step {
  param([string]$Message)
  Write-Host ""
  Write-Host "==> $Message"
}

function Download-File {
  param(
    [Parameter(Mandatory = $true)][string]$Url,
    [Parameter(Mandatory = $true)][string]$OutFile
  )

  curl.exe -L --fail --retry 3 --retry-delay 2 -o $OutFile $Url
}

function Get-LatestReleaseAsset {
  param(
    [Parameter(Mandatory = $true)][string]$Repository,
    [Parameter(Mandatory = $true)][string]$AssetPattern
  )

  $release = Invoke-RestMethod `
    -Headers @{ "User-Agent" = "centraldark-codex-tools" } `
    -Uri "https://api.github.com/repos/$Repository/releases/latest"

  $asset = $release.assets | Where-Object { $_.name -match $AssetPattern } | Select-Object -First 1
  if (-not $asset) {
    throw "Nao encontrei asset para $Repository com padrao: $AssetPattern"
  }

  return $asset
}

function Install-ExeFromZipAsset {
  param(
    [Parameter(Mandatory = $true)][string]$Repository,
    [Parameter(Mandatory = $true)][string]$AssetPattern,
    [Parameter(Mandatory = $true)][string]$ExeName
  )

  $asset = Get-LatestReleaseAsset -Repository $Repository -AssetPattern $AssetPattern
  $zipPath = Join-Path $DownloadDir $asset.name
  $extractDir = Join-Path $DownloadDir ([IO.Path]::GetFileNameWithoutExtension($asset.name))

  Write-Step "Baixando $ExeName de $Repository"
  Download-File -Url $asset.browser_download_url -OutFile $zipPath

  if (Test-Path $extractDir) {
    Remove-Item -LiteralPath $extractDir -Recurse -Force
  }

  Expand-Archive -LiteralPath $zipPath -DestinationPath $extractDir -Force

  $exe = Get-ChildItem -LiteralPath $extractDir -Recurse -Filter $ExeName | Select-Object -First 1
  if (-not $exe) {
    throw "Nao encontrei $ExeName dentro de $($asset.name)"
  }

  Copy-Item -LiteralPath $exe.FullName -Destination (Join-Path $InstallDir $ExeName) -Force
}

function Install-ExeFromZipUrl {
  param(
    [Parameter(Mandatory = $true)][string]$Name,
    [Parameter(Mandatory = $true)][string]$Url,
    [Parameter(Mandatory = $true)][string]$ExeName
  )

  $zipName = Split-Path -Leaf ([Uri]$Url).AbsolutePath
  $zipPath = Join-Path $DownloadDir $zipName
  $extractDir = Join-Path $DownloadDir ([IO.Path]::GetFileNameWithoutExtension($zipName))

  Write-Step "Baixando $Name"
  Download-File -Url $Url -OutFile $zipPath

  if (Test-Path $extractDir) {
    Remove-Item -LiteralPath $extractDir -Recurse -Force
  }

  Expand-Archive -LiteralPath $zipPath -DestinationPath $extractDir -Force

  $exe = Get-ChildItem -LiteralPath $extractDir -Recurse -Filter $ExeName | Select-Object -First 1
  if (-not $exe) {
    throw "Nao encontrei $ExeName dentro de $zipName"
  }

  Copy-Item -LiteralPath $exe.FullName -Destination (Join-Path $InstallDir $ExeName) -Force
}

function Install-ZipTool {
  param(
    [Parameter(Mandatory = $true)][string]$Repository,
    [Parameter(Mandatory = $true)][string]$AssetPattern,
    [Parameter(Mandatory = $true)][string]$ExeName,
    [Parameter(Mandatory = $true)][string]$FallbackUrl
  )

  try {
    Install-ExeFromZipAsset -Repository $Repository -AssetPattern $AssetPattern -ExeName $ExeName
  } catch {
    Write-Warning "Falha ao consultar release latest de $Repository; usando fallback direto. $($_.Exception.Message)"
    Install-ExeFromZipUrl -Name $ExeName -Url $FallbackUrl -ExeName $ExeName
  }
}

function Install-DirectExe {
  param(
    [Parameter(Mandatory = $true)][string]$Name,
    [Parameter(Mandatory = $true)][string]$Url,
    [Parameter(Mandatory = $true)][string]$ExeName
  )

  Write-Step "Baixando $Name"
  Download-File -Url $Url -OutFile (Join-Path $InstallDir $ExeName)
}

function Resolve-PythonReal {
  $installRoot = [IO.Path]::GetFullPath($InstallDir).TrimEnd("\")
  $commands = @(Get-Command "python" -All -ErrorAction SilentlyContinue)

  foreach ($command in $commands) {
    if (-not $command.Source) {
      continue
    }

    $candidate = [IO.Path]::GetFullPath($command.Source)
    if ($candidate.StartsWith($installRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
      continue
    }

    try {
      $output = & $candidate --version 2>&1
      if ($LASTEXITCODE -eq 0 -and $output) {
        return $candidate
      }
    } catch {
      continue
    }
  }

  if ($env:LOCALAPPDATA) {
    $fallback = Join-Path $env:LOCALAPPDATA "Programs\Python\Python313\python.exe"
    if (Test-Path $fallback) {
      return (Resolve-Path $fallback).Path
    }
  }

  return $null
}

function Add-PythonShim {
  $pythonReal = Resolve-PythonReal
  if (-not $pythonReal) {
    Write-Warning "P
```