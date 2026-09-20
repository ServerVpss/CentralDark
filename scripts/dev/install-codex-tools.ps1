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
    Write-Warning "Python real nao encontrado no PATH nem no fallback LOCALAPPDATA; shim nao criado."
    return
  }

  $shim = Join-Path $InstallDir "python.cmd"
  $content = "@echo off`r`n`"$pythonReal`" %*`r`n"
  Set-Content -LiteralPath $shim -Value $content -Encoding ASCII
}

Install-DirectExe `
  -Name "jq" `
  -Url "https://github.com/jqlang/jq/releases/latest/download/jq-windows-amd64.exe" `
  -ExeName "jq.exe"

Install-DirectExe `
  -Name "yq" `
  -Url "https://github.com/mikefarah/yq/releases/latest/download/yq_windows_amd64.exe" `
  -ExeName "yq.exe"

Install-ZipTool `
  -Repository "cli/cli" `
  -AssetPattern "windows_amd64\.zip$" `
  -ExeName "gh.exe" `
  -FallbackUrl "https://github.com/cli/cli/releases/download/v2.83.1/gh_2.83.1_windows_amd64.zip"

Install-ZipTool `
  -Repository "rhysd/actionlint" `
  -AssetPattern "windows_amd64\.zip$" `
  -ExeName "actionlint.exe" `
  -FallbackUrl "https://github.com/rhysd/actionlint/releases/download/v1.7.7/actionlint_1.7.7_windows_amd64.zip"

Install-ZipTool `
  -Repository "koalaman/shellcheck" `
  -AssetPattern "\.zip$" `
  -ExeName "shellcheck.exe" `
  -FallbackUrl "https://github.com/koalaman/shellcheck/releases/download/v0.11.0/shellcheck-v0.11.0.zip"

Add-PythonShim

Write-Step "Validando ferramentas instaladas"
$checker = Join-Path (Resolve-Path (Join-Path $PSScriptRoot "..\..")) "scripts\dev\check-codex-tools.ps1"
& powershell -NoProfile -ExecutionPolicy Bypass -File $checker

Write-Host ""
Write-Host "Instalacao portatil concluida em:"
Write-Host $InstallDir
Write-Host ""
Write-Host "Este script nao executa gh auth login e nao grava tokens."
Write-Host "Para login GitHub, use depois: gh auth login --web"
