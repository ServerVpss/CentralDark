param(
  [string]$Workdir = 'E:\CentralDark\_MAPA_CASA\GARIMPO-CHEFE',
  [int]$IntervalSec = 15,
  [int]$WindowMinutes = 15,
  [switch]$Status
)

$ErrorActionPreference = 'Stop'
$ctxDir = Join-Path $Workdir 'context'
$latest = Join-Path $ctxDir 'screenpipe-latest.json'
$statusPath = Join-Path $ctxDir 'screenpipe-status.json'
$base = if ($env:SCREENPIPE_LOCAL_API_URL) { $env:SCREENPIPE_LOCAL_API_URL.TrimEnd('/') } else { 'http://127.0.0.1:3030' }

# Same existing Sidecar owner. -Status is non-mutating and does not request/copy
# screen content, accessibility text, tokens, sessions or privileged credentials.
if ($Status) {
  Write-Output 'CENTRALDARK_SCREENPIPE_MODE=READ_ONLY'
  Write-Output "SCREENPIPE_SENSOR=$base"
  try {
    $health = Invoke-RestMethod -Method Get -Uri "$base/health" -TimeoutSec 5
    Write-Output 'SCREENPIPE_HEALTH_HTTP=PASS'
    Write-Output "SCREENPIPE_HEALTH_STATE=$($health.status)"
    Write-Output "SCREENPIPE_FRAME_STATUS=$($health.frame_status)"
    Write-Output "SCREENPIPE_AUDIO_STATUS=$($health.audio_status)"
    if ($health.last_frame_timestamp) {
      Write-Output "SCREENPIPE_LAST_FRAME=$($health.last_frame_timestamp)"
    }
  } catch {
    Write-Output 'SCREENPIPE_HEALTH_HTTP=UNKNOWN'
    Write-Output 'NEXT_CURSOR=Verify existing Screenpipe service on the Casa, without creating a second recorder'
    exit 2
  }
  foreach ($item in @(
    @{ Label = 'SIDECAR_STATUS'; Path = $statusPath },
    @{ Label = 'SIDECAR_LATEST'; Path = $latest }
  )) {
    if (Test-Path -LiteralPath $item.Path -PathType Leaf) {
      $info = Get-Item -LiteralPath $item.Path
      $ageMinutes = [math]::Round(((Get-Date) - $info.LastWriteTime).TotalMinutes, 1)
      $state = if ($ageMinutes -le 2) { 'RECENT' } else { 'STALE' }
      Write-Output "$($item.Label)=$state"
      Write-Output "$($item.Label)_AGE_MINUTES=$ageMinutes"
    } else {
      Write-Output "$($item.Label)=NOT_FOUND_AT_CONFIGURED_WORKDIR"
    }
  }
  Write-Output 'SIDECAR_RUNNING=NOT_ATTESTED_BY_THIS_CHECK'
  Write-Output 'CLAUDE_WINDOW_CONTENT=NOT_READ'
  Write-Output 'UNKNOWN_IS_NOT_PASS=true'
  exit 0
}

New-Item -ItemType Directory -Force -Path $ctxDir | Out-Null

function Get-ScreenpipeToken {
  if ($env:SCREENPIPE_LOCAL_API_KEY) { return $env:SCREENPIPE_LOCAL_API_KEY.Trim() }
  try { $t = (& screenpipe auth token 2>$null | Select-Object -Last 1).Trim(); if ($t) { return $t } } catch {}
  try { $t = (& npx -y screenpipe@latest auth token 2>$null | Select-Object -Last 1).Trim(); if ($t) { return $t } } catch {}
  throw 'SCREENPIPE_TOKEN_UNAVAILABLE'
}

$token = Get-ScreenpipeToken
$headers = @{ Authorization = "Bearer $token"; 'X-Screenpipe-Client' = 'api' }

while ($true) {
  $now = (Get-Date).ToUniversalTime().ToString('o')
  try {
    $health = Invoke-RestMethod -Method Get -Uri "$base/health" -TimeoutSec 5
    $start = [uri]::EscapeDataString("$WindowMinutes`m ago")
    $mode = 'activity-summary'
    try {
      $uri = "$base/activity-summary?start_time=$start&end_time=now&include_recording=false&include_memories=false&include_key_texts=false&include_guidance=false&max_snippets=8&max_snippet_chars=500"
      $ctx = Invoke-RestMethod -Method Get -Uri $uri -Headers $headers -TimeoutSec 30
    } catch {
      $mode = 'search-fallback'
      $fields = [uri]::EscapeDataString('type,content.timestamp,content.app_name,content.window_name,content.text')
      $uri = "$base/search?content_type=accessibility&limit=12&start_time=$start&fields=$fields"
      $ctx = Invoke-RestMethod -Method Get -Uri $uri -Headers $headers -TimeoutSec 12
    }
    $payload = [ordered]@{ generated_at=$now; source='screenpipe'; mode=$mode; device='SEGREDO'; health=$health; context=$ctx }
    $tmp = "$latest.tmp"
    $payload | ConvertTo-Json -Depth 30 | Set-Content -Encoding UTF8 $tmp
    Move-Item -Force $tmp $latest
    [ordered]@{ generated_at=$now; ok=$true; mode=$mode; latest=$latest; remote_mcp='https://mcp.desktopcommander.app/mcp' } | ConvertTo-Json | Set-Content -Encoding UTF8 $statusPath
  } catch {
    [ordered]@{ generated_at=$now; ok=$false; error=$_.Exception.Message; remote_mcp='https://mcp.desktopcommander.app/mcp' } | ConvertTo-Json | Set-Content -Encoding UTF8 $statusPath
  }
  Start-Sleep -Seconds ([Math]::Max($IntervalSec,5))
}
