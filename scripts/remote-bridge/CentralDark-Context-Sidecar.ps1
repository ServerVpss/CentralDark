param(
  [string]$Workdir = 'E:\CentralDark\_MAPA_CASA\GARIMPO-CHEFE',
  [int]$IntervalSec = 15,
  [int]$WindowMinutes = 15
)

$ErrorActionPreference = 'Stop'
$ctxDir = Join-Path $Workdir 'context'
New-Item -ItemType Directory -Force -Path $ctxDir | Out-Null
$latest = Join-Path $ctxDir 'screenpipe-latest.json'
$status = Join-Path $ctxDir 'screenpipe-status.json'
$base = if ($env:SCREENPIPE_LOCAL_API_URL) { $env:SCREENPIPE_LOCAL_API_URL.TrimEnd('/') } else { 'http://127.0.0.1:3030' }

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
    [ordered]@{ generated_at=$now; ok=$true; mode=$mode; latest=$latest; remote_mcp='https://mcp.desktopcommander.app/mcp' } | ConvertTo-Json | Set-Content -Encoding UTF8 $status
  } catch {
    [ordered]@{ generated_at=$now; ok=$false; error=$_.Exception.Message; remote_mcp='https://mcp.desktopcommander.app/mcp' } | ConvertTo-Json | Set-Content -Encoding UTF8 $status
  }
  Start-Sleep -Seconds ([Math]::Max($IntervalSec,5))
}
