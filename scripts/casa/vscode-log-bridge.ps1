# Casa -> VPS: envia somente metadados. Log bruto e contas continuam no disco da Casa.
[CmdletBinding()]
param(
  [string]$Source = "K:\TEMP\logs\LOGS-VS-CODE.log",
  [string]$StatePath = "K:\TEMP\cache\vscode-log-bridge.cursor.json",
  [string]$SshAlias = "segredo-vpss",
  [string]$TailscaleIP = "100.90.199.124",
  [ValidateRange(1024,262144)][int]$MaxBytes = 65536,
  [switch]$DryRun,
  [switch]$InstallTask
)
$ErrorActionPreference = "Stop"
if ($InstallTask) {
  # A janela antiga piscava porque pwsh.exe era executado em sessao Interactive.
  # wscript.exe chama o mesmo coletor com janela oculta e devolve o exit code.
  $runner = Join-Path (Split-Path -Parent $PSCommandPath) "vscode-log-bridge-hidden.vbs"
  if (!(Test-Path -LiteralPath $runner -PathType Leaf)) { throw "Launcher oculto ausente: $runner" }
  $wscript = Join-Path $env:WINDIR "System32\wscript.exe"
  $action = New-ScheduledTaskAction -Execute $wscript -Argument ("//B //Nologo " + [char]34 + $runner + [char]34)
  $trigger = New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(1) -RepetitionInterval (New-TimeSpan -Minutes 1)
  $account = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name
  $principal = New-ScheduledTaskPrincipal -UserId $account -LogonType Interactive -RunLevel Limited
  Register-ScheduledTask -TaskName "CentralDark-VSCode-LogBridge" -Action $action -Trigger $trigger -Principal $principal -Description "Sinais VS Code via SSH para funil unico (sem texto bruto)" -Force | Out-Null
  "TASK_INSTALLED=CentralDark-VSCode-LogBridge"
  return
}
if (!(Test-Path -LiteralPath $Source -PathType Leaf)) {
  Write-Output '{"state":"ATTENTION","reason":"source_missing","source":"LOGS-VS-CODE.log"}'
  exit 3
}
$info = Get-Item -LiteralPath $Source
$creationEpoch = $info.CreationTimeUtc.ToString("o", [Globalization.CultureInfo]::InvariantCulture)
$state = $null
if (Test-Path -LiteralPath $StatePath) {
  try { $state = Get-Content -LiteralPath $StatePath -Raw -Encoding UTF8 | ConvertFrom-Json -DateKind String }
  catch { $state = $null }
}
# A mesma criacao pode sobreviver a uma truncagem. Nova geracao invalida o cursor remoto.
$generation = 0
if ($state -and ($state.epoch -eq $creationEpoch -or $state.epoch -like ($creationEpoch + '-g*'))) {
  if ($null -ne $state.generation) { $generation = [Math]::Max(0, [int]$state.generation) }
  if ([long]$state.offset -gt $info.Length) { $generation++ }
}
$epoch = if ($generation -gt 0) { $creationEpoch + '-g' + $generation } else { $creationEpoch }
$reset = !$state -or $state.epoch -ne $epoch -or [long]$state.offset -gt $info.Length
$offset = if ($reset) { [Math]::Max(0L, [long]$info.Length - [long]$MaxBytes) } else { [long]$state.offset }
$skipFirstPartial = $reset -and $offset -gt 0
$buffer = New-Object byte[] $MaxBytes
$stream = [IO.File]::Open($Source, [IO.FileMode]::Open, [IO.FileAccess]::Read, [IO.FileShare]::ReadWrite)
try {
  [void]$stream.Seek($offset, [IO.SeekOrigin]::Begin)
  $size = $stream.Read($buffer, 0, $buffer.Length)
} finally { $stream.Dispose() }
$signals = @()
$next = [long]$offset
if ($size -gt 0) {
  $lf = [Array]::LastIndexOf($buffer, [byte]10, $size - 1)
  if ($lf -ge 0) {
    $content = [Text.Encoding]::UTF8.GetString($buffer, 0, $lf + 1)
    $lines = $content.Split([char]10)
    for ($i = 0; $i -lt ($lines.Length - 1); $i++) {
      $rawLine = $lines[$i]
      $next += [Text.Encoding]::UTF8.GetByteCount($rawLine + [char]10)
      if ($skipFirstPartial) { $skipFirstPartial = $false; continue }
      if ([string]::IsNullOrWhiteSpace($rawLine)) { continue }
      $level = "info"
      if ($rawLine -match '(?i)\[(error|fatal)\]') { $level = "error" }
      elseif ($rawLine -match '(?i)\[(warn|warning)\]') { $level = "warn" }
      elseif ($rawLine -match '(?i)\[debug\]') { $level = "debug" }
      $component = "vscode"
      if ($rawLine -match '\[GitHub Copilot Chat\]') { $component = "copilot" }
      elseif ($rawLine -match '\[Git\]') { $component = "git" }
      elseif ($rawLine -match '(?i)Extension Host|Host de Extens[aã]o') { $component = "extension-host" }
      elseif ($rawLine -match '(?i)terminal|ptyhost') { $component = "terminal" }
      elseif ($rawLine -match '(?i)\bMCP\b') { $component = "mcp" }
      elseif ($rawLine -match '(?i)remote.ssh|remote-ssh') { $component = "remote-ssh" }
      $hashBytes = [Security.Cryptography.SHA256]::HashData([Text.Encoding]::UTF8.GetBytes($rawLine))
      $hash = [Convert]::ToHexString($hashBytes).ToLowerInvariant()
      $signals += @{ end_offset = $next; hash = $hash; level = $level; component = $component }
    }
  }
}
# Same Casa writer, same SSH receipt. Browser cache is only an installed-file signal.
# No credentials, profile files, command line, or absolute user path leave Windows.
function Get-PlaywrightProbe {
  $unknown = @{ cache_state='UNKNOWN'; revision=$null; runtime_state='UNPROVEN'; process_count=0 }
  $localAppData = [Environment]::GetFolderPath('LocalApplicationData')
  if ([string]::IsNullOrWhiteSpace($localAppData)) { return $unknown }
  $cache = Join-Path $localAppData 'ms-playwright'
  if (!(Test-Path -LiteralPath $cache -PathType Container)) {
    return @{ cache_state='ABSENT'; revision=$null; runtime_state='NOT_RUNNING'; process_count=0 }
  }
  $revisions = @(Get-ChildItem -LiteralPath $cache -Directory -ErrorAction SilentlyContinue |
    Where-Object { $_.Name -match '^chromium-([0-9]+)$' } |
    ForEach-Object { [int]($_.Name -replace '^chromium-', '') } | Sort-Object -Descending)
  foreach ($revision in $revisions) {
    $headed = Join-Path $cache ("chromium-{0}\chrome-win64\chrome.exe" -f $revision)
    $headless = Join-Path $cache ("chromium_headless_shell-{0}\chrome-headless-shell-win64\chrome-headless-shell.exe" -f $revision)
    if ((Test-Path -LiteralPath $headed -PathType Leaf) -and (Test-Path -LiteralPath $headless -PathType Leaf)) {
      $n = 0
      try {
        $n = @(Get-CimInstance Win32_Process -Filter "Name='chrome-headless-shell.exe' OR Name='chrome.exe'" -ErrorAction Stop |
          Where-Object { $_.ExecutablePath -and (
            [string]::Equals($_.ExecutablePath, $headless, [StringComparison]::OrdinalIgnoreCase) -or
            [string]::Equals($_.ExecutablePath, $headed, [StringComparison]::OrdinalIgnoreCase)) }).Count
      } catch { return @{ cache_state='FILES_PRESENT'; revision=[string]$revision; runtime_state='UNKNOWN'; process_count=0 } }
      return @{ cache_state='FILES_PRESENT'; revision=[string]$revision; runtime_state=$(if($n -gt 0){'PROCESS_OBSERVED'}else{'NOT_RUNNING'}); process_count=[Math]::Min($n,100) }
    }
  }
  return @{ cache_state='INCOMPLETE'; revision=$null; runtime_state='UNPROVEN'; process_count=0 }
}

$batch = @{
  source = "LOGS-VS-CODE.log"; epoch = $epoch; from_offset = [long]$offset
  to_offset = [long]$next; source_last_write_utc = $info.LastWriteTimeUtc.ToString("o")
  signals = @($signals)
  playwright = Get-PlaywrightProbe
}
if ($DryRun) {
  Write-Output ("DRY_RUN source=LOGS-VS-CODE.log signals={0} offset={1}->{2} bytes={3}" -f $signals.Count, $offset, $next, $info.Length)
  return
}
$remoteScript = "/root/CentralDark/scripts/vps/ingest-vscode-log.mjs"
$sshBase = @("-o", "BatchMode=yes", "-o", "ConnectTimeout=7", "-o", "StrictHostKeyChecking=yes")
$routes = @(
  @{ name = "tailscale"; args = @("-o", "HostName=$TailscaleIP", $SshAlias) },
  @{ name = "ssh-direct"; args = @($SshAlias) }
)
$receipt = $null
foreach ($route in $routes) {
  $batch.route = $route.name
  $json = $batch | ConvertTo-Json -Depth 5 -Compress
  $sshArgs = @($sshBase) + @($route.args) + @("node", $remoteScript)
  try {
    $reply = $json | & ssh @sshArgs 2>$null
    if ($LASTEXITCODE -ne 0) { continue }
    $parsed = ($reply | Select-Object -Last 1 | ConvertFrom-Json -ErrorAction Stop)
    if ($parsed.ok -eq $true -and [long]$parsed.offset -eq $next) {
      $receipt = $parsed
      break
    }
  } catch { continue }
}
if ($null -eq $receipt) {
  Write-Output '{"state":"ATTENTION","reason":"routes_unavailable","alternatives":"retry_private_then_ssh_direct","source":"LOGS-VS-CODE.log"}'
  exit 4
}
$dir = Split-Path -Parent $StatePath
New-Item -ItemType Directory -Force -Path $dir | Out-Null
$temp = "$StatePath.$PID.tmp"
@{ epoch = $epoch; generation = $generation; offset = [long]$next; route = $receipt.route; updated_at_utc = [DateTime]::UtcNow.ToString("o") } |
  ConvertTo-Json -Compress | Set-Content -LiteralPath $temp -Encoding UTF8
Move-Item -LiteralPath $temp -Destination $StatePath -Force
Write-Output ($receipt | ConvertTo-Json -Compress)
