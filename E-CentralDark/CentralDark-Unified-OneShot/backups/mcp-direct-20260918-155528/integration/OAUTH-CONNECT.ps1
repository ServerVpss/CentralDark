param(
    [ValidateSet('Segredo','Fulano')]
    [string]$Profile = 'Segredo',
    [switch]$ForceLogin
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version 2.0

$Base = 'https://mcp.centralldark.com'
$Resource = "$Base/admin/mcp"
$Scope = 'admin'
$Runtime = Join-Path $env:LOCALAPPDATA 'CentralDark\UnifiedRuntime'
$ProfileRoot = Join-Path $Runtime ("profiles\" + $Profile)
$LogDir = Join-Path $ProfileRoot 'logs'
$StateDir = Join-Path $ProfileRoot 'auth'
New-Item -ItemType Directory -Force -Path $LogDir,$StateDir | Out-Null
$Log = Join-Path $LogDir ('oauth-' + (Get-Date -Format 'yyyyMMdd-HHmmss') + '.log')
$AccessPath = Join-Path $StateDir 'mcp-admin-access.dpapi'
$RefreshPath = Join-Path $StateDir 'mcp-admin-refresh.dpapi'
$SessionPath = Join-Path $StateDir 'mcp-admin-session.json'

function W([string]$m) {
  $line = "$(Get-Date -Format o) PROFILE=$Profile $m"
  Add-Content -LiteralPath $Log -Value $line -Encoding UTF8
  Write-Host $m
}
function B64Url([byte[]]$bytes) {
  [Convert]::ToBase64String($bytes).TrimEnd('=').Replace('+','-').Replace('/','_')
}
function New-RandomUrl([int]$count=32) {
  $b = New-Object byte[] $count
  [Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($b)
  B64Url $b
}
function FormEncode([hashtable]$h) {
  ($h.GetEnumerator() | ForEach-Object {
    ([uri]::EscapeDataString([string]$_.Key)) + '=' + ([uri]::EscapeDataString([string]$_.Value))
  }) -join '&'
}
function Protect-Text([string]$Value,[string]$Path) {
  Add-Type -AssemblyName System.Security
  $bytes = [Text.Encoding]::UTF8.GetBytes($Value)
  $protected = [Security.Cryptography.ProtectedData]::Protect(
    $bytes,$null,[Security.Cryptography.DataProtectionScope]::CurrentUser
  )
  [IO.File]::WriteAllBytes($Path,$protected)
}
function Unprotect-Text([string]$Path) {
  if (-not (Test-Path -LiteralPath $Path)) { return $null }
  Add-Type -AssemblyName System.Security
  try {
    $protected = [IO.File]::ReadAllBytes($Path)
    $bytes = [Security.Cryptography.ProtectedData]::Unprotect(
      $protected,$null,[Security.Cryptography.DataProtectionScope]::CurrentUser
    )
    return [Text.Encoding]::UTF8.GetString($bytes)
  } catch {
    return $null
  }
}
function Invoke-Mcp([string]$Uri,[string]$Token,[string]$Method,[object]$Params,[int]$Id=1) {
  $payload = @{jsonrpc='2.0';id=$Id;method=$Method}
  if ($null -ne $Params) { $payload.params=$Params }
  $body = $payload | ConvertTo-Json -Depth 8 -Compress
  $headers = @{
    Authorization = "Bearer $Token"
    Accept = 'application/json, text/event-stream'
    'MCP-Protocol-Version' = '2025-06-18'
  }
  Invoke-WebRequest -UseBasicParsing -Uri $Uri -Method Post -ContentType 'application/json' `
    -Headers $headers -Body $body -TimeoutSec 20 -ErrorAction Stop
}
function Parse-McpJson([string]$Text) {
  if ([string]::IsNullOrWhiteSpace($Text)) { return $null }
  $trim = $Text.Trim()
  if ($trim.StartsWith('{') -or $trim.StartsWith('[')) {
    try { return ($trim | ConvertFrom-Json) } catch {}
  }
  foreach ($line in ($Text -split "`r?`n")) {
    if ($line -match '^\s*data:\s*(.+)$') {
      try { return ($Matches[1] | ConvertFrom-Json) } catch {}
    }
  }
  return $null
}
function Test-Token([string]$Token) {
  if ([string]::IsNullOrWhiteSpace($Token)) { return $false }
  try {
    $initParams = @{
      protocolVersion='2025-06-18'
      capabilities=@{}
      clientInfo=@{name="CentralDark-Unified-OneShot-$Profile";version='canonical'}
    }
    $init = Invoke-Mcp -Uri $Resource -Token $Token -Method 'initialize' -Params $initParams -Id 1
    if ($init.StatusCode -ne 200) { return $false }

    $tools = Invoke-Mcp -Uri $Resource -Token $Token -Method 'tools/list' -Params @{} -Id 2
    if ($tools.StatusCode -ne 200) { return $false }
    $parsed = Parse-McpJson ([string]$tools.Content)
    if ($parsed -and $parsed.result -and $parsed.result.tools) {
      W "MCP_TOOLS_LIST=PASS TOOL_COUNT=$(@($parsed.result.tools).Count)"
      return $true
    }
    if ([string]$tools.Content -match 'kit_boas_vindas') {
      W 'MCP_TOOLS_LIST=PASS TOOL_COUNT=UNPARSED'
      return $true
    }
    return $false
  } catch {
    W "TOKEN_TEST=FAIL TYPE=$($_.Exception.GetType().Name)"
    return $false
  }
}
function Save-Tokens($TokenResponse,[string]$ClientId) {
  if ($TokenResponse.access_token) {
    Protect-Text ([string]$TokenResponse.access_token) $AccessPath
  }
  if ($TokenResponse.refresh_token) {
    Protect-Text ([string]$TokenResponse.refresh_token) $RefreshPath
  }
  @{
    client_id = $ClientId
    resource = $Resource
    scope = $Scope
    profile = $Profile
    saved_at = (Get-Date).ToString('o')
    token_type = [string]$TokenResponse.token_type
    expires_in = $TokenResponse.expires_in
  } | ConvertTo-Json | Set-Content -LiteralPath $SessionPath -Encoding UTF8
}

W 'OAUTH_FLOW=START'
W "RESOURCE=$Resource"

if (-not $ForceLogin) {
  $cachedAccess = Unprotect-Text $AccessPath
  if ($cachedAccess) {
    W 'AUTH_CACHE=FOUND'
    if (Test-Token $cachedAccess) {
      W 'AUTH_CACHE=PASS'
      W 'MCP_AUTHENTICATED_E2E=PASS'
      W "OAUTH_RECEIPT=$Log"
      exit 0
    }
    W 'AUTH_CACHE=STALE'
  }

  if ((Test-Path -LiteralPath $SessionPath) -and (Test-Path -LiteralPath $RefreshPath)) {
    try {
      $sess = Get-Content -LiteralPath $SessionPath -Raw | ConvertFrom-Json
      $refresh = Unprotect-Text $RefreshPath
      if ($sess.client_id -and $refresh) {
        $refreshBody = FormEncode @{
          grant_type='refresh_token'
          refresh_token=$refresh
          client_id=[string]$sess.client_id
          resource=$Resource
        }
        $rt = Invoke-RestMethod -Uri "$Base/token" -Method Post `
          -ContentType 'application/x-www-form-urlencoded' -Body $refreshBody -TimeoutSec 20
        if ($rt.access_token) {
          Save-Tokens $rt ([string]$sess.client_id)
          W 'TOKEN_REFRESH=PASS'
          if (Test-Token ([string]$rt.access_token)) {
            W 'MCP_AUTHENTICATED_E2E=PASS'
            W "OAUTH_RECEIPT=$Log"
            exit 0
          }
        }
      }
    } catch {
      W "TOKEN_REFRESH=FAIL TYPE=$($_.Exception.GetType().Name)"
    }
  }
}

$listenerProbe = New-Object System.Net.Sockets.TcpListener([Net.IPAddress]::Loopback,0)
$listenerProbe.Start()
$port = ([Net.IPEndPoint]$listenerProbe.LocalEndpoint).Port
$listenerProbe.Stop()
$redirect = "http://127.0.0.1:$port/"

$regBody = @{
  client_name = "CentralDark-Unified-OneShot-$Profile"
  redirect_uris = @($redirect)
  token_endpoint_auth_method = 'none'
  grant_types = @('authorization_code','refresh_token')
  response_types = @('code')
} | ConvertTo-Json -Depth 6 -Compress
$reg = Invoke-RestMethod -Uri "$Base/register" -Method Post -ContentType 'application/json' -Body $regBody -TimeoutSec 20
if (-not $reg.client_id) { throw 'DCR_FAIL' }
$clientId = [string]$reg.client_id
W 'DCR=PASS'

$verifier = New-RandomUrl 48
$sha = [Security.Cryptography.SHA256]::Create().ComputeHash([Text.Encoding]::ASCII.GetBytes($verifier))
$challenge = B64Url $sha
$state = New-RandomUrl 24
$q = @{
  response_type='code'
  client_id=$clientId
  state=$state
  code_challenge=$challenge
  code_challenge_method='S256'
  redirect_uri=$redirect
  scope=$Scope
  resource=$Resource
}
$authorize = "$Base/authorize?" + (FormEncode $q)

$http = New-Object System.Net.HttpListener
$http.Prefixes.Add($redirect)
$http.Start()
try {
  W 'AUTHORIZE_BROWSER=OPENING'
  Start-Process $authorize
  $task = $http.GetContextAsync()
  if (-not $task.Wait(180000)) { throw 'AUTH_CALLBACK_TIMEOUT_180S' }
  $ctx = $task.Result
  $code = $ctx.Request.QueryString['code']
  $returnedState = $ctx.Request.QueryString['state']
  $oauthError = $ctx.Request.QueryString['error']
  if ($oauthError) { throw "OAUTH_ERROR=$oauthError" }
  if (-not $code) { throw 'AUTH_CALLBACK_WITHOUT_CODE' }
  if ($returnedState -ne $state) { throw 'OAUTH_STATE_MISMATCH' }

  $html = '<!doctype html><meta charset="utf-8"><title>CentralDark</title><body style="font-family:Segoe UI;background:#0f1116;color:#eee;padding:40px"><h2>CentralDark OAuth concluído ✅</h2><p>Pode fechar esta janela.</p></body>'
  $buf = [Text.Encoding]::UTF8.GetBytes($html)
  $ctx.Response.StatusCode = 200
  $ctx.Response.ContentType = 'text/html; charset=utf-8'
  $ctx.Response.ContentLength64 = $buf.Length
  $ctx.Response.OutputStream.Write($buf,0,$buf.Length)
  $ctx.Response.OutputStream.Close()
  W 'AUTHORIZE=PASS'
} finally {
  if ($http.IsListening) { $http.Stop() }
  $http.Close()
}

$tokenBody = FormEncode @{
  grant_type='authorization_code'
  code=$code
  redirect_uri=$redirect
  client_id=$clientId
  code_verifier=$verifier
  resource=$Resource
}
$tok = Invoke-RestMethod -Uri "$Base/token" -Method Post `
  -ContentType 'application/x-www-form-urlencoded' -Body $tokenBody -TimeoutSec 20
if (-not $tok.access_token) { throw 'TOKEN_FAIL' }
Save-Tokens $tok $clientId
W "TOKEN=PASS TYPE=$($tok.token_type) EXPIRES_IN=$($tok.expires_in)"
W 'TOKEN_STORE=DPAPI_CURRENT_USER'

if (Test-Token ([string]$tok.access_token)) {
  W 'MCP_AUTHENTICATED_E2E=PASS'
  W "OAUTH_RECEIPT=$Log"
  W 'OAUTH_FLOW=END'
  exit 0
}

W 'MCP_AUTHENTICATED_E2E=UNKNOWN'
W "OAUTH_RECEIPT=$Log"
exit 20
