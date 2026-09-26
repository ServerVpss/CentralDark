$ErrorActionPreference = 'Continue'
$ProgressPreference = 'SilentlyContinue'

function Timestamp { (Get-Date).ToString('yyyyMMdd-HHmmss') }
$Stamp = Timestamp
$Desktop = [Environment]::GetFolderPath('Desktop')
$Runtime = Join-Path $env:LOCALAPPDATA 'CentralDark\UnifiedRuntime'
$LegacyOneShot = Join-Path $env:LOCALAPPDATA 'CentralDark\OneShot' # leitura de logs legados; nao e runtime ativo
$ToolRoot = Join-Path $Runtime 'tools\LogCollector'
$OutRoot = Join-Path $env:TEMP ("CentralDark-LOG-COLLECT-$Stamp")
$ZipPath = Join-Path $Desktop ("CentralDark-LOGS-$Stamp.zip")
New-Item -ItemType Directory -Force -Path $OutRoot | Out-Null

$manifest = [ordered]@{
  collected_at = (Get-Date).ToString('o')
  runtime = $Runtime
  one_shot = $OneShot
  tool_root = $ToolRoot
  output_zip = $ZipPath
  copied_files = @()
  missing_paths = @()
  skipped_sensitive = @()
  notes = @()
}

function Is-SensitivePath([string]$p) {
  $n = [IO.Path]::GetFileName($p).ToLowerInvariant()
  if ($n -match '\.(dpapi|key|crt|pem|pfx|p12|env)$') { return $true }
  if ($n -match '(token|secret|password|passwd|credential|cookie|session)') { return $true }
  return $false
}

function Redact-Text([string]$text) {
  $t = $text
  $t = $t -replace '(?i)(bearer\s+)[A-Za-z0-9._~+/=-]+', '$1[REDACTED]'
  $t = $t -replace '(?i)(access[_-]?token"?\s*[:=]\s*"?)[^",\s]+', '$1[REDACTED]'
  $t = $t -replace '(?i)(refresh[_-]?token"?\s*[:=]\s*"?)[^",\s]+', '$1[REDACTED]'
  $t = $t -replace '(?i)(id[_-]?token"?\s*[:=]\s*"?)[^",\s]+', '$1[REDACTED]'
  $t = $t -replace '(?i)(client[_-]?secret"?\s*[:=]\s*"?)[^",\s]+', '$1[REDACTED]'
  $t = $t -replace '(?i)(password"?\s*[:=]\s*"?)[^",\s]+', '$1[REDACTED]'
  $t = $t -replace '(?i)(authorization"?\s*[:=]\s*"?)[^",\r\n]+', '$1[REDACTED]'
  return $t
}

function Copy-TextSafe([string]$Source, [string]$DestRel) {
  try {
    if (-not (Test-Path -LiteralPath $Source)) { return }
    if (Is-SensitivePath $Source) { $manifest.skipped_sensitive += $Source; return }
    $item = Get-Item -LiteralPath $Source -ErrorAction Stop
    if ($item.Length -gt 20971520) { $manifest.notes += "SKIPPED_LARGE=$Source SIZE=$($item.Length)"; return }
    $Dest = Join-Path $OutRoot $DestRel
    New-Item -ItemType Directory -Force -Path (Split-Path $Dest -Parent) | Out-Null
    $raw = Get-Content -LiteralPath $Source -Raw -ErrorAction Stop
    Set-Content -LiteralPath $Dest -Value (Redact-Text $raw) -Encoding UTF8
    $manifest.copied_files += $DestRel
  } catch {
    $manifest.notes += "COPY_FAIL=$Source ERROR=$($_.Exception.Message)"
  }
}

function Copy-TreeLogs([string]$Base, [string]$Label) {
  if (-not (Test-Path -LiteralPath $Base)) { $manifest.missing_paths += $Base; return }
  $patterns = @('*.log','*.json','*.jsonl','*.txt','*.md')
  foreach ($pat in $patterns) {
    Get-ChildItem -LiteralPath $Base -Recurse -File -Filter $pat -ErrorAction SilentlyContinue | ForEach-Object {
      $full = $_.FullName
      $rel = $full.Substring($Base.Length).TrimStart('\','/')
      Copy-TextSafe $full (Join-Path $Label $rel)
    }
  }
}

function Sanitize-DeviceJson([string]$Source, [string]$DestRel) {
  try {
    if (-not (Test-Path -LiteralPath $Source)) { return }
    $raw = Get-Content -LiteralPath $Source -Raw -ErrorAction Stop
    $redacted = Redact-Text $raw
    $Dest = Join-Path $OutRoot $DestRel
    New-Item -ItemType Directory -Force -Path (Split-Path $Dest -Parent) | Out-Null
    Set-Content -LiteralPath $Dest -Value $redacted -Encoding UTF8
    $manifest.copied_files += $DestRel
  } catch { $manifest.notes += "DEVICE_JSON_REDACT_FAIL=$Source ERROR=$($_.Exception.Message)" }
}

Copy-TreeLogs (Join-Path $Runtime 'logs') 'UnifiedRuntime/logs'
Copy-TreeLogs (Join-Path $Runtime 'profiles') 'UnifiedRuntime/profiles'
Copy-TreeLogs (Join-Path $OneShot 'logs') 'OneShot/logs'
Copy-TreeLogs (Join-Path $OneShot 'auth') 'OneShot/auth-redacted'

# Device state redigido: pega soh se existir; nunca copia token bruto sem regex.
Get-ChildItem -LiteralPath $Runtime -Recurse -File -Filter 'device.json' -ErrorAction SilentlyContinue | ForEach-Object {
  $rel = $_.FullName.Substring($Runtime.Length).TrimStart('\','/')
  Sanitize-DeviceJson $_.FullName (Join-Path 'UnifiedRuntime/device-json-redacted' $rel)
}
$HomeDevice = Join-Path $env:USERPROFILE '.desktop-commander-device\device.json'
if (Test-Path -LiteralPath $HomeDevice) { Sanitize-DeviceJson $HomeDevice 'UserProfile/.desktop-commander-device/device.json.redacted' }

# Inventario de portas/processos, sem commandline para nao vazar segredo.
try {
  $ports = 3030,3031,9100,9180
  $tcp = foreach ($port in $ports) { Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object LocalAddress,LocalPort,RemoteAddress,RemotePort,State,OwningProcess }
  $tcp | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath (Join-Path $OutRoot 'inventory/ports.json') -Encoding UTF8
  $manifest.copied_files += 'inventory/ports.json'
} catch { $manifest.notes += "PORT_INVENTORY_FAIL=$($_.Exception.Message)" }

try {
  $names = 'node','screenpipe','CentralDark','CentralDark-Unified-OneShot','CentralDark-Remote-Tray','powershell','pwsh'
  $procs = Get-Process -ErrorAction SilentlyContinue | Where-Object { $names -contains $_.ProcessName -or $_.ProcessName -like '*CentralDark*' -or $_.ProcessName -like '*screenpipe*' } | Select-Object ProcessName,Id,Path,StartTime
  $procs | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath (Join-Path $OutRoot 'inventory/processes.json') -Encoding UTF8
  $manifest.copied_files += 'inventory/processes.json'
} catch { $manifest.notes += "PROCESS_INVENTORY_FAIL=$($_.Exception.Message)" }

try {
  $dirs = @($Runtime, (Join-Path $Runtime 'profiles'), (Join-Path $Runtime 'logs'), $LegacyOneShot, $ToolRoot)
  $dirStatus = foreach ($d in $dirs) { [ordered]@{ path=$d; exists=(Test-Path -LiteralPath $d) } }
  $dirStatus | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath (Join-Path $OutRoot 'inventory/paths.json') -Encoding UTF8
  $manifest.copied_files += 'inventory/paths.json'
} catch { $manifest.notes += "PATH_INVENTORY_FAIL=$($_.Exception.Message)" }

$manifest | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath (Join-Path $OutRoot 'COLLECTOR-MANIFEST.json') -Encoding UTF8

if (Test-Path -LiteralPath $ZipPath) { Remove-Item -LiteralPath $ZipPath -Force -ErrorAction SilentlyContinue }
Compress-Archive -Path (Join-Path $OutRoot '*') -DestinationPath $ZipPath -CompressionLevel Optimal -Force
Write-Host "CENTRALDARK_LOGS_ZIP=$ZipPath"
Write-Host "SOURCE_RUNTIME=$Runtime"
Write-Host "COLLECTOR_TEMP=$OutRoot"
Write-Host "SAFE_REDACTION=ON"
