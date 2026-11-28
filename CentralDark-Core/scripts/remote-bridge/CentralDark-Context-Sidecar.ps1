param(
  [string]$Workdir = $(if ($env:CENTRALDARK_WORKDIR) { $env:CENTRALDARK_WORKDIR } else { (Get-Location).Path }),
  [int]$IntervalSec = 15,
  [int]$WindowMinutes = 15,
  [switch]$Status,
  [switch]$AuthStatus,
  [string]$ReadPath
)

$ErrorActionPreference = 'Stop'
$ctxDir = Join-Path $Workdir 'context'
$latest = Join-Path $ctxDir 'screenpipe-latest.json'
$statusPath = Join-Path $ctxDir 'screenpipe-status.json'
$base = if ($env:SCREENPIPE_LOCAL_API_URL) { $env:SCREENPIPE_LOCAL_API_URL.TrimEnd('/') } else { 'http://127.0.0.1:3030' }

# Resolve the already configured local API key for the current Windows user.
# Never print the key, read extension storage or inspect another user's profile.
function Get-ScreenpipeToken {
  param([switch]$ConfiguredOnly)
  if (-not [string]::IsNullOrWhiteSpace($env:SCREENPIPE_LOCAL_API_KEY)) {
    return [pscustomobject]@{ Value = $env:SCREENPIPE_LOCAL_API_KEY.Trim(); Source = 'Process' }
  }
  try {
    $value = [Environment]::GetEnvironmentVariable('SCREENPIPE_LOCAL_API_KEY', [EnvironmentVariableTarget]::User)
    if (-not [string]::IsNullOrWhiteSpace($value)) {
      return [pscustomobject]@{ Value = $value.Trim(); Source = 'User' }
    }
  } catch {}
  if (-not $ConfiguredOnly) {
    try {
      if (Get-Command screenpipe -ErrorAction SilentlyContinue) {
        $value = (& screenpipe auth token 2>$null | Select-Object -Last 1)
        if ($LASTEXITCODE -eq 0 -and -not [string]::IsNullOrWhiteSpace($value)) {
          return [pscustomobject]@{ Value = $value.Trim(); Source = 'InstalledCLI' }
        }
      }
    } catch {}
  }
  throw 'SCREENPIPE_TOKEN_UNAVAILABLE'
}

# A local bearer must never be forwarded to another origin or redirect.
function Assert-ScreenpipeLocalOrigin {
  $origin = $null
  if (-not [uri]::TryCreate($base, [UriKind]::Absolute, [ref]$origin) -or
      $origin.Scheme -ne 'http' -or $origin.Host -notin @('127.0.0.1','localhost','[::1]','::1') -or
      $origin.Port -ne 3030 -or $origin.AbsolutePath -ne '/' -or
      $origin.UserInfo -or $origin.Query -or $origin.Fragment) {
    throw 'SCREENPIPE_LOCAL_ORIGIN_REQUIRED'
  }
}

function Invoke-ScreenpipeRead {
  param([string]$Path, [hashtable]$Headers)
  if ($Path -match '[\\\r\n#]' -or
      ($Path -cnotin @('/health','/vision/list','/audio/list','/audio/device/status') -and
       $Path -cnotmatch '^/search\?[^#]+$')) {
    throw 'SCREENPIPE_READ_PATH_NOT_ALLOWED'
  }
  if ($Path.StartsWith('/search?')) {
    $limits = @(
      foreach ($part in $Path.Substring(8).Split('&')) {
        $pair = $part.Split('=',2)
        $name = [uri]::UnescapeDataString($pair[0])
        if ($name -ieq 'limit') {
          if ($name -cne 'limit' -or $pair.Count -ne 2) { throw 'SCREENPIPE_READ_LIMIT_REQUIRED_1_TO_20' }
          [uri]::UnescapeDataString($pair[1])
        }
      }
    )
    $limit = 0
    if ($limits.Count -ne 1 -or $limits[0] -cnotmatch '^[0-9]+$' -or -not [int]::TryParse($limits[0],[ref]$limit) -or $limit -lt 1 -or $limit -gt 20) {
      throw 'SCREENPIPE_READ_LIMIT_REQUIRED_1_TO_20'
    }
  }
  try {
    return Invoke-WebRequest -Uri "$base$Path" -Method Get -Headers $Headers -UseBasicParsing -MaximumRedirection 0 -TimeoutSec 10
  } catch {
    if ($_.Exception.Response) { throw ('SCREENPIPE_HTTP_' + [int]$_.Exception.Response.StatusCode) }
    throw 'SCREENPIPE_READ_UNAVAILABLE'
  }
}

$readRequested = $PSBoundParameters.ContainsKey('ReadPath')
if ($AuthStatus -or $readRequested) {
  if ($Status -or ($AuthStatus -and $readRequested)) { throw 'SCREENPIPE_MODE_CONFLICT' }
  Assert-ScreenpipeLocalOrigin
  $credential = Get-ScreenpipeToken -ConfiguredOnly
  $headers = @{ Authorization = "Bearer $($credential.Value)"; 'X-Screenpipe-Client' = 'api' }
  if ($readRequested) {
    # Explicitly requested one-shot read. Never write a snapshot or log a key.
    $response = Invoke-ScreenpipeRead -Path $ReadPath -Headers $headers
    Write-Output $response.Content
    exit 0
  }
  $results = @(
    foreach ($path in @('/search?content_type=ocr&limit=1&fields=type','/search?content_type=audio&limit=1&fields=type','/search?content_type=accessibility&limit=1&fields=type','/vision/list','/audio/list')) {
      try {
        $response = Invoke-ScreenpipeRead -Path $path -Headers $headers
        $row = [ordered]@{ route = $path; http = [int]$response.StatusCode }
        if ($path.StartsWith('/search?')) {
          $body = $response.Content | ConvertFrom-Json
          $row.rows = @($body.data | Where-Object { $_ -ne $null }).Count
        }
        [pscustomobject]$row
      } catch {
        $code = if ($_.Exception.Message -match '^SCREENPIPE_HTTP_(\d{3})$') { [int]$Matches[1] } else { 0 }
        [pscustomobject]@{ route = $path; http = $code }
      }
    }
  )
  $ok = @($results | Where-Object { $_.http -ne 200 }).Count -eq 0
  [ordered]@{ ok = $ok; credential_source = $credential.Source; mode = 'read-only-auth-probe'; results = $results } | ConvertTo-Json -Depth 5 -Compress
  if (-not $ok) { exit 2 }
  exit 0
}

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

Assert-ScreenpipeLocalOrigin
$credential = Get-ScreenpipeToken
$headers = @{ Authorization = "Bearer $($credential.Value)"; 'X-Screenpipe-Client' = 'api' }

while ($true) {
  $now = (Get-Date).ToUniversalTime().ToString('o')
  try {
    $health = Invoke-RestMethod -Method Get -Uri "$base/health" -TimeoutSec 5
    $start = [uri]::EscapeDataString("$WindowMinutes`m ago")
    $mode = 'activity-summary'
    try {
      $uri = "$base/activity-summary?start_time=$start&end_time=now&include_recording=false&include_memories=false&include_key_texts=false&include_guidance=false&max_snippets=8&max_snippet_chars=500"
      $ctx = Invoke-RestMethod -Method Get -Uri $uri -Headers $headers -MaximumRedirection 0 -TimeoutSec 30
    } catch {
      $mode = 'search-fallback'
      $fields = [uri]::EscapeDataString('type,content.timestamp,content.app_name,content.window_name,content.text')
      $uri = "$base/search?content_type=accessibility&limit=12&start_time=$start&fields=$fields"
      $ctx = Invoke-RestMethod -Method Get -Uri $uri -Headers $headers -MaximumRedirection 0 -TimeoutSec 12
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
