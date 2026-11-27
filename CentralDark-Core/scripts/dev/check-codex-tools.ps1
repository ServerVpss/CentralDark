param(
  [string]$InstallDir,
  [switch]$Json
)

$ErrorActionPreference = "Continue"

if (-not $InstallDir) {
  if (-not $env:USERPROFILE) {
    throw "USERPROFILE nao definido; informe -InstallDir."
  }
  $InstallDir = Join-Path $env:USERPROFILE "Documents\Codex\tools\codex-bin"
}

$RepoRoot = Resolve-Path (Join-Path $PSScriptRoot "..\..")
$PortableBin = $InstallDir
$PythonFallback = $null
if ($env:LOCALAPPDATA) {
  $PythonFallback = Join-Path $env:LOCALAPPDATA "Programs\Python\Python313\python.exe"
}

function Find-Tool {
  param(
    [Parameter(Mandatory = $true)][string]$Name,
    [string[]]$ExtraCandidates = @(),
    [switch]$PreferPath,
    [switch]$SkipPortable,
    [string[]]$ValidationArgs = @("--version")
  )

  function Test-Candidate {
    param([string]$Path)

    try {
      & $Path @ValidationArgs 1>$null 2>$null
      return ($LASTEXITCODE -eq 0)
    } catch {
      return $false
    }
  }

  if ($PreferPath) {
    $commands = @(Get-Command $Name -All -ErrorAction SilentlyContinue)
    foreach ($cmd in $commands) {
      if ($cmd.Source -and (Test-Candidate -Path $cmd.Source)) {
        return $cmd.Source
      }
    }
  }

  $candidates = @()

  if ((-not $SkipPortable) -and (Test-Path $PortableBin)) {
    $candidates += Join-Path $PortableBin $Name
    if (-not $Name.EndsWith(".exe") -and -not $Name.EndsWith(".cmd")) {
      $candidates += Join-Path $PortableBin "$Name.exe"
      $candidates += Join-Path $PortableBin "$Name.cmd"
    }
  }

  $candidates += $ExtraCandidates

  foreach ($candidate in $candidates) {
    if ($candidate -and (Test-Path $candidate)) {
      if ($PreferPath -and -not (Test-Candidate -Path $candidate)) {
        continue
      }
      return (Resolve-Path $candidate).Path
    }
  }

  if (-not $PreferPath) {
    $cmd = Get-Command $Name -ErrorAction SilentlyContinue
    if ($cmd) {
      return $cmd.Source
    }
  }

  return $null
}

function Get-Version {
  param(
    [Parameter(Mandatory = $true)][string]$Path,
    [string[]]$Args = @("--version")
  )

  try {
    $output = & $Path @Args 2>&1
    if ($LASTEXITCODE -eq 0 -or $output) {
      return (($output | Select-Object -First 1) -as [string]).Trim()
    }
  } catch {
    return "erro: $($_.Exception.Message)"
  }

  return "erro: sem saida"
}

$checks = @(
  @{ Name = "git"; Args = @("--version") },
  @{ Name = "rg"; Args = @("--version") },
  @{ Name = "node"; Args = @("--version") },
  @{ Name = "npm.cmd"; Args = @("--version") },
  @{ Name = "gh"; Args = @("--version") },
  @{ Name = "jq"; Args = @("--version") },
  @{ Name = "yq"; Args = @("--version") },
  @{ Name = "actionlint"; Args = @("-version") },
  @{ Name = "shellcheck"; Args = @("--version") },
  @{ Name = "python"; Args = @("--version"); Extra = @($PythonFallback); PreferPath = $true; SkipPortable = $true }
)

$results = foreach ($check in $checks) {
  $extra = @()
  if ($check.ContainsKey("Extra")) {
    $extra = $check.Extra
  }
  $preferPath = $false
  if ($check.ContainsKey("PreferPath")) {
    $preferPath = [bool]$check.PreferPath
  }
  $skipPortable = $false
  if ($check.ContainsKey("SkipPortable")) {
    $skipPortable = [bool]$check.SkipPortable
  }
  $path = Find-Tool `
    -Name $check.Name `
    -ExtraCandidates $extra `
    -PreferPath:$preferPath `
    -SkipPortable:$skipPortable `
    -ValidationArgs $check.Args
  if ($path) {
    [PSCustomObject]@{
      tool = $check.Name
      present = $true
      path = $path
      version = Get-Version -Path $path -Args $check.Args
    }
  } else {
    [PSCustomObject]@{
      tool = $check.Name
      present = $false
      path = ""
      version = ""
    }
  }
}

if ($Json) {
  $results | ConvertTo-Json -Depth 3
} else {
  "Codex tools check"
  "Repo: $RepoRoot"
  "Portable bin: $PortableBin"
  ""
  $results | Format-Table -AutoSize
}
