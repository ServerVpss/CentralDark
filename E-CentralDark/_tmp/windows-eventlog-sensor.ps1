param(
  [string]$SentinelPath = "E:\CentralDark\CentralDark\scripts\trigger-fabric\system_sentinel.py",
  [string]$StatePath = "E:\CentralDark\_tmp\windows-eventlog-state.json",
  [int]$PollSeconds = 5,
  [int]$MaxBatch = 100,
  [switch]$Once,
  [switch]$NoSentinel
)

$ErrorActionPreference = "Stop"
$channels = @(
  @{ Name = "Application"; Path = "$env:SystemRoot\System32\Winevt\Logs\Application.evtx"; Mode = "level"; Levels = @(1,2,3) },
  @{ Name = "System"; Path = "$env:SystemRoot\System32\Winevt\Logs\System.evtx"; Mode = "level"; Levels = @(1,2,3) },
  @{ Name = "HardwareEvents"; Path = "$env:SystemRoot\System32\Winevt\Logs\HardwareEvents.evtx"; Mode = "all"; Levels = @() },
  @{ Name = "Security"; Path = "$env:SystemRoot\System32\Winevt\Logs\Security.evtx"; Mode = "ids"; Ids = @(1102,4625,4672,4688,4697,4719,4720,4726,4732) }
)

function Load-State {
  if (Test-Path -LiteralPath $StatePath) {
    try { return (Get-Content -LiteralPath $StatePath -Raw | ConvertFrom-Json -AsHashtable) } catch {}
  }
  return @{}
}

function Save-State([hashtable]$state) {
  $dir = Split-Path -Parent $StatePath
  if ($dir) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
  $tmp = "$StatePath.tmp"
  $state | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $tmp -Encoding UTF8
  Move-Item -Force -LiteralPath $tmp -Destination $StatePath
}

function Read-Channel($cfg) {
  try { return @(Get-WinEvent -LogName $cfg.Name -MaxEvents $MaxBatch -ErrorAction Stop) }
  catch {
    if (Test-Path -LiteralPath $cfg.Path) {
      try { return @(Get-WinEvent -Path $cfg.Path -MaxEvents $MaxBatch -ErrorAction Stop) } catch {}
    }
  }
  return @()
}

function Is-Useful($cfg,$evt) {
  if ($cfg.Mode -eq "all") { return $true }
  if ($cfg.Mode -eq "ids") { return $cfg.Ids -contains [int]$evt.Id }
  return $cfg.Levels -contains [int]$evt.Level
}

function To-SentinelEvent($cfg,$evt) {
  $severity = switch ([int]$evt.Level) {
    1 {"CRITICAL"}
    2 {"ERROR"}
    3 {"WARNING"}
    default {"INFO"}
  }
  $provider=[string]$evt.ProviderName
  $raw="$($cfg.Name)|$($evt.RecordId)|$($evt.Id)|$provider|$($evt.TimeCreated.ToUniversalTime().ToString('o'))"
  $algo=[Security.Cryptography.SHA256]::Create()
  try { $bytes=$algo.ComputeHash([Text.Encoding]::UTF8.GetBytes($raw)) } finally { $algo.Dispose() }
  $sha=([BitConverter]::ToString($bytes)).Replace('-','').ToLowerInvariant()

  [ordered]@{
    observed_at=$evt.TimeCreated.ToUniversalTime().ToString("o")
    source_surface="WINDOWS_EVENT_LOG"
    event_class="WINDOWS_EVENT"
    signature="WINDOWS_EVENT_$severity"
    state=if($severity -in @("CRITICAL","ERROR")){"FAILURE"}elseif($severity -eq "WARNING"){"WARNING"}else{"OBSERVED"}
    evidence_ref="winevt:$($cfg.Name):$($evt.RecordId):sha256:$sha"
    owner="docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/SYSTEM-SENTINEL.yml"
    app_name=$cfg.Name
    process_name=$provider
    frame_id=[string]$evt.RecordId
    error_text="$($cfg.Name) event id=$($evt.Id) provider=$provider level=$severity"
  }
}

function Emit-Event($payload) {
  $json=$payload | ConvertTo-Json -Compress -Depth 6
  if($NoSentinel){ Write-Output $json; return }
  if(!(Test-Path -LiteralPath $SentinelPath)){ throw "SYSTEM_SENTINEL_NOT_FOUND:$SentinelPath" }

  $dir=Split-Path -Parent $StatePath
  New-Item -ItemType Directory -Force -Path $dir | Out-Null
  $tmp=Join-Path $dir ("sentinel-event-"+[Guid]::NewGuid().ToString("N")+".json")
  $helper=Join-Path $dir "sentinel-json-dispatch.py"
  $json | Set-Content -LiteralPath $tmp -Encoding UTF8

  $py=@'
import os, pathlib, subprocess, sys
sentinel = pathlib.Path(sys.argv[1])
payload = pathlib.Path(sys.argv[2]).read_text(encoding="utf-8-sig")
env = os.environ.copy()
env["PYTHONIOENCODING"] = "utf-8"
env["PYTHONUTF8"] = "1"
p = subprocess.run(
    [sys.executable, str(sentinel), "--event-json", payload],
    text=True,
    capture_output=True,
    encoding="utf-8",
    errors="replace",
    env=env,
)
if p.stdout:
    sys.stdout.write(p.stdout)
if p.stderr:
    sys.stderr.write(p.stderr)
raise SystemExit(p.returncode)
'@
  $py | Set-Content -LiteralPath $helper -Encoding UTF8

  try {
    $env:PYTHONIOENCODING="utf-8"
    $env:PYTHONUTF8="1"
    & python $helper $SentinelPath $tmp
    if($LASTEXITCODE -ne 0){ throw "SYSTEM_SENTINEL_INGEST_FAILED:$LASTEXITCODE" }
  } finally {
    Remove-Item -LiteralPath $tmp -Force -ErrorAction SilentlyContinue
  }
}

$state=Load-State
do {
  foreach($cfg in $channels){
    $last=0L
    if($state.ContainsKey($cfg.Name)){ $last=[int64]$state[$cfg.Name] }

    $events=Read-Channel $cfg | Where-Object { $_.RecordId -gt $last } | Sort-Object RecordId
    foreach($evt in $events){
      if(Is-Useful $cfg $evt){ Emit-Event (To-SentinelEvent $cfg $evt) }
      if([int64]$evt.RecordId -gt $last){ $last=[int64]$evt.RecordId }
    }
    $state[$cfg.Name]=$last
  }
  Save-State $state
  if(-not $Once){ Start-Sleep -Seconds ([Math]::Max(1,$PollSeconds)) }
} while(-not $Once)
