param(
    [string]$RuntimeRoot = "$env:LOCALAPPDATA\CentralDark\Remote-Tray",
    [string]$BaseUrl = "https://mcp.centralldark.com",
    [string]$Resource = "https://mcp.centralldark.com/admin/mcp",
    [switch]$ForceInteractive
)

$ErrorActionPreference = "Stop"
$AuthDir = Join-Path $RuntimeRoot "oauth"
$SessionPath = Join-Path $AuthDir "centraldark-oauth-session.json"
New-Item -ItemType Directory -Force -Path $AuthDir | Out-Null

function ConvertTo-Base64Url([byte[]]$Bytes) {
    [Convert]::ToBase64String($Bytes).TrimEnd('=').Replace('+','-').Replace('/','_')
}
function New-RandomBase64Url([int]$Count = 32) {
    $bytes = New-Object byte[] $Count
    [Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
    ConvertTo-Base64Url $bytes
}
function Protect-Value([string]$Value) {
    ConvertTo-SecureString $Value -AsPlainText -Force | ConvertFrom-SecureString
}
function Unprotect-Value([string]$Value) {
    $s = ConvertTo-SecureString $Value
    (New-Object System.Management.Automation.PSCredential('x',$s)).GetNetworkCredential().Password
}
function Save-Session($ClientId, $Token) {
    $payload = [ordered]@{
        schema = 'centraldark.remote-tray.oauth-session.v1'
        client_id = $ClientId
        scope = $Token.scope
        access_token_protected = Protect-Value ([string]$Token.access_token)
        refresh_token_protected = Protect-Value ([string]$Token.refresh_token)
        expires_at = (Get-Date).ToUniversalTime().AddSeconds([int]$Token.expires_in).ToString('o')
        updated_at = (Get-Date).ToUniversalTime().ToString('o')
    }
    $payload | ConvertTo-Json | Set-Content -LiteralPath $SessionPath -Encoding UTF8
}
function Try-RefreshSession {
    if ($ForceInteractive -or -not (Test-Path $SessionPath)) { return $false }
    try {
        $s = Get-Content -Raw -LiteralPath $SessionPath | ConvertFrom-Json
        $refresh = Unprotect-Value ([string]$s.refresh_token_protected)
        $body = @{
            grant_type = 'refresh_token'
            refresh_token = $refresh
            client_id = [string]$s.client_id
        }
        $tok = Invoke-RestMethod -Method Post -Uri "$BaseUrl/token" -Body $body -TimeoutSec 15
        if (-not $tok.access_token) { return $false }
        Save-Session ([string]$s.client_id) $tok
        Write-Output 'CENTRALDARK_TRAY_AUTH=REUSED_REFRESH'
        return $true
    } catch { return $false }
}
if (Try-RefreshSession) { return }

$listener = [Net.Sockets.TcpListener]::new([Net.IPAddress]::Loopback,0)
$listener.Start()
$port = ([Net.IPEndPoint]$listener.LocalEndpoint).Port
$listener.Stop()
$redirectUri = "http://127.0.0.1:$port/"

$registerBody = @{
    client_name = 'CentralDark Remote Tray'
    redirect_uris = @($redirectUri)
    grant_types = @('authorization_code','refresh_token')
    response_types = @('code')
    token_endpoint_auth_method = 'none'
} | ConvertTo-Json
$client = Invoke-RestMethod -Method Post -Uri "$BaseUrl/register" -ContentType 'application/json' -Body $registerBody -TimeoutSec 15
if (-not $client.client_id) { throw 'DCR client_id ausente' }

$verifier = New-RandomBase64Url 48
$sha = [Security.Cryptography.SHA256]::Create().ComputeHash([Text.Encoding]::ASCII.GetBytes($verifier))
$challenge = ConvertTo-Base64Url $sha
$state = New-RandomBase64Url 24

$query = [Web.HttpUtility]::ParseQueryString('')
$query['resource'] = $Resource
$query['redirect_uri'] = $redirectUri
$query['state'] = $state
$query['code_challenge_method'] = 'S256'
$query['client_id'] = [string]$client.client_id
$query['response_type'] = 'code'
$query['scope'] = 'admin'
$query['code_challenge'] = $challenge
$authorizeUrl = "$BaseUrl/authorize?$($query.ToString())"

$http = New-Object Net.HttpListener
$http.Prefixes.Add($redirectUri)
$http.Start()
Write-Output 'CENTRALDARK_TRAY_AUTH=INTERACTIVE_REQUIRED'
Start-Process $authorizeUrl
$async = $http.BeginGetContext($null,$null)
if (-not $async.AsyncWaitHandle.WaitOne(180000)) {
    $http.Stop()
    throw 'OAuth callback timeout'
}
$ctx = $http.EndGetContext($async)
$code = [string]$ctx.Request.QueryString['code']
$callbackState = [string]$ctx.Request.QueryString['state']
$err = [string]$ctx.Request.QueryString['error']
$html = if ($code -and $callbackState -eq $state) {
    '<html><body><h2>CentralDark autorizado.</h2><p>Pode fechar esta aba.</p></body></html>'
} else {
    '<html><body><h2>Falha na autorizacao CentralDark.</h2><p>Volte ao Tray.</p></body></html>'
}
$bytes = [Text.Encoding]::UTF8.GetBytes($html)
$ctx.Response.ContentType = 'text/html; charset=utf-8'
$ctx.Response.ContentLength64 = $bytes.Length
$ctx.Response.OutputStream.Write($bytes,0,$bytes.Length)
$ctx.Response.Close(); $http.Stop()
if ($err) { throw "OAuth error: $err" }
if (-not $code -or $callbackState -ne $state) { throw 'OAuth callback invalido' }

$tokenBody = @{
    grant_type = 'authorization_code'
    code = $code
    code_verifier = $verifier
    client_id = [string]$client.client_id
    redirect_uri = $redirectUri
}
$tok = Invoke-RestMethod -Method Post -Uri "$BaseUrl/token" -Body $tokenBody -TimeoutSec 15
if (-not $tok.access_token -or -not $tok.refresh_token) { throw 'OAuth token pair ausente' }
Save-Session ([string]$client.client_id) $tok

$headers = @{
    Authorization = "Bearer $($tok.access_token)"
    Accept = 'application/json, text/event-stream'
    'MCP-Protocol-Version' = '2025-06-18'
}
$initBody = @{
    jsonrpc='2.0'; id=1; method='initialize'
    params=@{ protocolVersion='2025-06-18'; capabilities=@{}; clientInfo=@{name='CentralDark Remote Tray';version='1.0'} }
} | ConvertTo-Json -Depth 6
$probe = Invoke-WebRequest -Method Post -Uri "$BaseUrl/admin/mcp" -Headers $headers -ContentType 'application/json' -Body $initBody -UseBasicParsing -TimeoutSec 15
if ($probe.StatusCode -ne 200) { throw "Admin MCP probe HTTP $($probe.StatusCode)" }
Write-Output 'CENTRALDARK_TRAY_AUTH=PASS'
Write-Output 'CENTRALDARK_ADMIN_MCP=PASS'
Write-Output 'TOKEN_PRINTED=false'
