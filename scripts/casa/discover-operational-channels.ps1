# CENTRALDARK — Casa: inventario SSH/PID somente leitura.
# Owner existente. Sem iniciar, parar, autenticar ou delegar processos.
[CmdletBinding()]
param(
  [switch]$Json,
  [switch]$IncludeRuntime
)

$ErrorActionPreference = 'Stop'
$measuredAt = (Get-Date).ToUniversalTime().ToString('o')
$sshProbe = 'PASS'
$ssh = @()
try {
  $ssh = @(Get-CimInstance Win32_Process -Filter "Name='ssh.exe'" -ErrorAction Stop)
} catch {
  $sshProbe = 'UNKNOWN'
}
$sshPids = @($ssh | ForEach-Object { [int]$_.ProcessId })
$tcp = @()
try {
  $tcp = @(Get-NetTCPConnection -State Established -ErrorAction Stop |
    Where-Object { $sshPids -contains [int]$_.OwningProcess })
} catch {
  $sshProbe = 'UNKNOWN'
}
$rows = @(
  foreach ($c in $tcp) {
    $p = $ssh | Where-Object { $_.ProcessId -eq $c.OwningProcess } | Select-Object -First 1
    [pscustomobject]@{
      pid = [int]$c.OwningProcess
      remote = "$($c.RemoteAddress):$($c.RemotePort)"
      state = 'ESTABLISHED'
      created = $p.CreationDate
      command_known = [bool]$p.CommandLine
    }
  }
)
$result = [ordered]@{
  measured_at_utc = $measuredAt
  ssh_established = $rows.Count
  channels = $rows
  semantics = 'NEW_ATTEMPT_FAILED != EXISTING_CHANNEL_DEAD'
}

if ($IncludeRuntime) {
  function Get-LocalServiceState([string]$ServiceName) {
    $svc = Get-Service -Name $ServiceName -ErrorAction SilentlyContinue
    if ($null -eq $svc) {
      return [pscustomobject]@{ name = $ServiceName; state = 'NOT_INSTALLED'; start_type = $null }
    }
    return [pscustomobject]@{
      name = $ServiceName
      state = [string]$svc.Status
      start_type = [string]$svc.StartType
    }
  }

  $sshListen = 'UNKNOWN'
  try {
    $listeners = @(Get-NetTCPConnection -LocalPort 22 -State Listen -ErrorAction Stop)
    $sshListen = if ($listeners.Count -gt 0) { 'LISTENING' } else { 'NOT_LISTENING' }
  } catch {
    # Falha do sensor ou permissao nao equivale a porta fechada.
    $sshListen = 'UNKNOWN'
  }

  $processProbe = 'PASS'
  $candidates = @()
  try {
    $all = @(Get-CimInstance Win32_Process -ErrorAction Stop)
    foreach ($p in $all) {
      $name = [string]$p.Name
      $role = $null
      if ($name -match '(?i)^hermes(?:[-_a-z0-9]*)?\.exe$') {
        $role = 'HERMES_CANDIDATE'
      } elseif ($name -match '(?i)^python(?:3(?:\.\d+)?)?\.exe$' -and
                [string]$p.ExecutablePath -match '(?i)[\/\\]\.hermes[\/\\]') {
        $role = 'HERMES_PYTHON_CANDIDATE'
      } elseif ($name -match '(?i)^code(?: - insiders)?\.exe$') {
        $role = 'VSCODE'
      } elseif ($name -match '(?i)^(pwsh|powershell)\.exe$') {
        $role = 'POWERSHELL'
      } elseif ($name -match '(?i)^ssh\.exe$') {
        $role = 'SSH_CLIENT'
      }
      if ($null -eq $role) { continue }
      $candidates += [pscustomobject]@{
        pid = [int]$p.ProcessId
        parent_pid = [int]$p.ParentProcessId
        name = $name
        role = $role
        started_at = $p.CreationDate
      }
    }
  } catch {
    $processProbe = 'UNKNOWN'
  }

  $result['schema'] = 'centraldark.casa-process-inventory.v1'
  $result['origin_host'] = [string]$env:COMPUTERNAME
  $result['origin_platform'] = 'windows'
  $result['ssh_probe'] = $sshProbe
  $result['ssh_server'] = Get-LocalServiceState 'sshd'
  $result['ssh_listen_22'] = $sshListen
  $result['tailscale_service'] = Get-LocalServiceState 'Tailscale'
  $result['process_probe'] = $processProbe
  $result['process_candidates_count'] = $candidates.Count
  $result['process_candidates'] = @($candidates | Select-Object -First 80)
  $result['processes_truncated'] = ($candidates.Count -gt 80)
  $result['cline_extension_session'] = 'UNKNOWN'
  $result['hermes_session_ack'] = 'UNKNOWN'
  $result['delegation'] = [ordered]@{
    state = 'DISCOVERY_ONLY'
    executor = 'EXISTING_HERMES_KANBAN_OR_AUTHORIZED_SHELL'
    rule = 'PID_IS_NOT_A_REMOTE_DISPATCH_ADDRESS'
    next_cursor = 'CONFIRM_HOST_SESSION_AUTH_TASK_ID_ACK_BEFORE_DISPATCH'
  }
}

if ($Json) {
  [pscustomobject]$result | ConvertTo-Json -Depth 8
} else {
  [pscustomobject]$result
  $rows | Format-Table -AutoSize
}

# Compatibilidade: no modo historico, sem sessao SSH established -> exit 2.
# -IncludeRuntime mede tambem sshd/PIDs mesmo quando nao ha cliente SSH ativo.
if (-not $IncludeRuntime -and $rows.Count -eq 0) { exit 2 }
