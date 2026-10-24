param(
  [string]$Workdir = "$env:LOCALAPPDATA\CentralDark\Remote-Tray",
  [int]$RetrySec = 5,
  [switch]$InstallAutoStart
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
  # Engine MIT local STDIO, sem a nuvem do fornecedor.
  if ([string]$config.package -ne '@wonderwhy-er/desktop-commander@0.2.48') {
    throw 'CENTRALDARK_CASA_ENGINE_PIN_MISMATCH'
  }
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
        if ($LASTEXITCODE -ne 0) { throw "TAILSCALE_SERVE_TCP_EXIT:$LASTEXITCODE" }
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

function Start-CentralDarkCasaCommander {
  $agent = Join-Path $root 'CentralDark-Casa-Agent.mjs'
  $node = Get-Command node.exe -ErrorAction SilentlyContinue
  if (-not $node) { $node = Get-Command node -ErrorAction SilentlyContinue }
  $token = [Environment]::GetEnvironmentVariable('CENTRALDARK_CASA_BRIDGE_TOKEN')
  if (-not $node) { Write-HumanStatus 'CASA_COMMANDER' '🔴' 'NODE_MISSING'; return }
  if (-not (Test-Path -LiteralPath $agent)) { Write-HumanStatus 'CASA_COMMANDER' '🔴' 'CASA_AGENT_FILE_MISSING'; return }
  if ([string]::IsNullOrEmpty($token) -or $token.Length -lt 24) {
    Write-HumanStatus 'CASA_COMMANDER' '🔴' 'CENTRALDARK_CASA_BRIDGE_TOKEN_MISSING_OR_SHORT'; return
  }
  try {
    $existing = Invoke-RestMethod -Uri 'http://127.0.0.1:9101/health' -TimeoutSec 2 -ErrorAction Stop
    if ($existing.name -eq 'CentralDark Casa Commander') {
      Write-HumanStatus 'CASA_COMMANDER' '🟢' 'PROCESS_REUSED_PORT_9101'; return
    }
    Write-HumanStatus 'CASA_COMMANDER' '🔴' 'PORT_9101_OWNED_BY_OTHER_PROCESS'; return
  } catch { }
  $outLog = Join-Path $receiptDir 'casa-commander.stdout.log'
  $errLog = Join-Path $receiptDir 'casa-commander.stderr.log'
  $quotedAgent = '"' + $agent + '"'
  try {
    $p = Start-Process -FilePath $node.Source -ArgumentList @($quotedAgent) -PassThru -WindowStyle Hidden -RedirectStandardOutput $outLog -RedirectStandardError $errLog -ErrorAction Stop
    Start-Sleep -Seconds 2
    $health = Invoke-RestMethod 'http://127.0.0.1:9101/health' -TimeoutSec 3 -ErrorAction Stop
    if ($health.name -ne 'CentralDark Casa Commander') { throw 'CASA_AGENT_HEALTH_IDENTITY_MISMATCH' }
    Write-HumanStatus 'CASA_COMMANDER' '🟢' ("CASA_AGENT_HEALTH_OK PID={0}" -f $p.Id)
  } catch {
    Write-HumanStatus 'CASA_COMMANDER' '🔴' ('CASA_AGENT_HEALTH_FAILED:' + $_.Exception.Message)
  }
}
if ($InstallAutoStart) {
  $taskName = 'CentralDark-Casa-Commander'
  $user = [Security.Principal.WindowsIdentity]::GetCurrent().Name
  $action = New-ScheduledTaskAction -Execute (Get-Command powershell.exe).Source -Argument ('-NoProfile -ExecutionPolicy Bypass -File "' + $PSCommandPath + '"')
  $logon = New-ScheduledTaskTrigger -AtLogOn -User $user
  $repeat = New-ScheduledTaskTrigger -Once -At ((Get-Date).AddMinutes(1)) -RepetitionInterval (New-TimeSpan -Minutes 5) -RepetitionDuration (New-TimeSpan -Days 3650)
  $settings = New-ScheduledTaskSettingsSet -MultipleInstances IgnoreNew -StartWhenAvailable -ExecutionTimeLimit (New-TimeSpan -Minutes 2)
  $principal = New-ScheduledTaskPrincipal -UserId $user -LogonType Interactive -RunLevel Limited
  Register-ScheduledTask -TaskName $taskName -Action $action -Trigger @($logon,$repeat) -Settings $settings -Principal $principal -Force -ErrorAction Stop | Out-Null
  Write-HumanStatus 'CASA_AUTOSTART' '🟢' 'TASK_REGISTERED_NOT_REBOOT_PROVEN'
}
Start-CentralDarkCasaCommander
Start-TailscaleServeFromConfig
Test-GitHubLocalAuth
Write-HumanStatus 'CASA_PRIVATE' '🟡' 'CENTRALDARK_MCP_TAILSCALE_NATIVE; E2E_READBACK_PENDING'
