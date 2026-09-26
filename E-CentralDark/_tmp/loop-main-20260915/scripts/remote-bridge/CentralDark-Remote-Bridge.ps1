param(
  [string]$Workdir = 'E:\CentralDark\_MAPA_CASA\GARIMPO-CHEFE',
  [int]$RetrySec = 5
)

$ErrorActionPreference = 'Continue'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$sidecar = Join-Path $root 'CentralDark-Context-Sidecar.ps1'
$configPath = Join-Path $root 'CENTRALDARK-REMOTE-BRIDGE.config.json'
$receiptDir = Join-Path $Workdir 'receipts\remote-bridge'
New-Item -ItemType Directory -Force -Path $receiptDir | Out-Null
$log = Join-Path $receiptDir ("bridge-{0}.log" -f (Get-Date -Format 'yyyyMMdd-HHmmss'))

$desktopPackage = $null
$config = $null
try {
  if (-not (Test-Path -LiteralPath $configPath)) {
    throw "REMOTE_BRIDGE_CONFIG_MISSING:$configPath"
  }
  $config = Get-Content -Raw -LiteralPath $configPath | ConvertFrom-Json
  $desktopPackage = [string]$config.package
  if ([string]::IsNullOrWhiteSpace($desktopPackage)) {
    throw 'DESKTOP_COMMANDER_PACKAGE_PIN_MISSING'
  }
  if ($desktopPackage -match '@latest$') {
    throw "DESKTOP_COMMANDER_PACKAGE_MUST_BE_PINNED:$desktopPackage"
  }
  Add-Content $log ("[{0}] DESKTOP_COMMANDER_PACKAGE={1}" -f (Get-Date -Format o), $desktopPackage)
} catch {
  Add-Content $log ("[{0}] REMOTE_BRIDGE_CONFIG_ERROR={1}" -f (Get-Date -Format o), $_.Exception.Message)
  throw
}

function Write-HumanStatus {
  param([string]$Component, [string]$State, [string]$Message)
  try {
    $ctxDir = Join-Path $Workdir 'context'
    New-Item -ItemType Directory -Force -Path $ctxDir | Out-Null
    $statusPath = Join-Path $ctxDir 'bridge-human-status.json'
    $payload = [ordered]@{
      generated_at = (Get-Date).ToUniversalTime().ToString('o')
      component = $Component
      state = $State
      message = $Message
      legend = [ordered]@{
        green = '🟢 ok/provado no escopo'
        yellow = '🟡 atencao/pendente ou opcional'
        red = '🔴 falha observada'
      }
    }
    $tmp = "$statusPath.tmp"
    $payload | ConvertTo-Json -Depth 10 | Set-Content -Encoding UTF8 $tmp
    Move-Item -Force $tmp $statusPath
    Add-Content $log ("[{0}] HUMAN_STATUS {1} {2} {3}" -f (Get-Date -Format o), $Component, $State, $Message)
  } catch {
    Add-Content $log ("[{0}] HUMAN_STATUS_ERROR={1}" -f (Get-Date -Format o), $_.Exception.Message)
  }
}

function Start-TailscaleServeFromConfig {
  if (-not $config -or -not $config.tailscale -or -not $config.tailscale.serve_enabled) { return }
  $tailscale = Get-Command tailscale -ErrorAction SilentlyContinue
  if (-not $tailscale) {
    Write-HumanStatus 'TAILSCALE_SERVE' '🟡' 'tailscale nao encontrado neste Windows; bridge remoto continua sem tunel local.'
    return
  }
  foreach ($route in @($config.tailscale.routes)) {
    try {
      if ($route.protocol -eq 'tcp') {
        $publicPort = $route.public_port
        if (-not $publicPort -and $route.public_port_env) { $publicPort = [Environment]::GetEnvironmentVariable([string]$route.public_port_env) }
        $target = $route.target
        if (-not $target -and $route.target_env) { $target = [Environment]::GetEnvironmentVariable([string]$route.target_env) }
        if (-not $publicPort -or -not $target) {
          Write-HumanStatus ("TAILSCALE_{0}" -f $route.name) '🟡' 'rota opcional sem porta/alvo configurado; pulando.'
          continue
        }
        & $tailscale.Source serve --tcp $publicPort tcp://$target *>> $log
        Write-HumanStatus ("TAILSCALE_{0}" -f $route.name) '🟢' ("tunel tcp://tailnet:{0} -> {1}. Serve para: {2}" -f $publicPort, $target, $route.human_purpose)
      } elseif ($route.protocol -eq 'http') {
        $targetPort = [int]$route.target_port
        if ($targetPort -gt 0) {
          & $tailscale.Source serve --bg --http 443 $targetPort *>> $log
          Write-HumanStatus ("TAILSCALE_{0}" -f $route.name) '🟢' ("tunel HTTPS tailnet -> 127.0.0.1:{0}. Serve para: {1}" -f $targetPort, $route.human_purpose)
        }
      }
    } catch {
      Write-HumanStatus ("TAILSCALE_{0}" -f $route.name) '🔴' $_.Exception.Message
    }
  }
}

function Test-GitHubLocalAuth {
  $gh = Get-Command gh -ErrorAction SilentlyContinue
  if (-not $gh) {
    Write-HumanStatus 'GITHUB_AUTH' '🟡' 'gh nao encontrado; nao copiar refresh token. Autentique gh neste host se GitHub for necessario.'
    return
  }
  try {
    & $gh.Source auth status *>> $log
    if ($LASTEXITCODE -eq 0) {
      Write-HumanStatus 'GITHUB_AUTH' '🟢' 'gh auth status executado neste host; usar gh/keyring local, sem copiar refresh token para .env/log/arquivo.'
    } else {
      Write-HumanStatus 'GITHUB_AUTH' '🟡' 'gh existe, mas auth status ainda nao provou login. Rode gh auth login/device flow neste host.'
    }
  } catch {
    Write-HumanStatus 'GITHUB_AUTH' '🟡' 'gh existe, mas auth status ainda nao provou login. Rode gh auth login/device flow neste host.'
  }
}

Start-TailscaleServeFromConfig
Test-GitHubLocalAuth

$sidecarProc = $null
if (Test-Path $sidecar) {
  $sidecarProc = Start-Process powershell.exe -ArgumentList @(
    '-NoProfile','-ExecutionPolicy','Bypass','-File',"`"$sidecar`"",'-Workdir',"`"$Workdir`""
  ) -WindowStyle Hidden -PassThru
  Add-Content $log ("[{0}] SCREENPIPE_SIDECAR_PID={1}" -f (Get-Date -Format o), $sidecarProc.Id)
}

try {
  while ($true) {
    Add-Content $log ("[{0}] REMOTE_MCP_CONNECT=https://mcp.desktopcommander.app/mcp" -f (Get-Date -Format o))
    Push-Location $Workdir
    try {
      & npx -y $desktopPackage remote *>> $log
      $exit = $LASTEXITCODE
    } catch {
      Add-Content $log ("[{0}] REMOTE_MCP_ERROR={1}" -f (Get-Date -Format o), $_.Exception.Message)
      $exit = 1
    } finally {
      Pop-Location
    }
    try {
      $tail = Get-Content -LiteralPath $log -Tail 80 -ErrorAction SilentlyContinue
      if (($tail -join "`n") -match 'Unexpected end of JSON input|Failed to reload config') {
        Write-HumanStatus 'DESKTOP_COMMANDER_CONFIG' '🔴' 'Desktop Commander remoto conectou, mas ha JSON local quebrado/vazio no config do proprio Desktop Commander. Ponte online != config saudavel.'
      }
    } catch {}
    Add-Content $log ("[{0}] REMOTE_MCP_EXIT={1}; retry_in={2}s" -f (Get-Date -Format o), $exit, $RetrySec)
    Start-Sleep -Seconds ([Math]::Max($RetrySec,3))
  }
} finally {
  if ($sidecarProc -and -not $sidecarProc.HasExited) { Stop-Process -Id $sidecarProc.Id -ErrorAction SilentlyContinue }
}
