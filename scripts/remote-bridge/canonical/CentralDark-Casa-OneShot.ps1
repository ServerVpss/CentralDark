# CentralDark Casa Commander - ONE SHOT installer for Windows PowerShell 5.1+.
# Uses fixed GitHub commit (PR #1945). Does not change main or overwrite the working repo.
# Windows: local MIT engine + Tailscale private bridge + one Task Scheduler owner.
# Running the script cannot automatically deploy or provision the VPS MCP.
[CmdletBinding()]
param(
    [string]$SourceCommit = '3ba0132186861bb4d81c133247d37bc16a7ca84b',
    [switch]$ShowPairingToken
)
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

$Repo = 'ServerVpss/CentralDark'
$InstallDir = Join-Path $env:LOCALAPPDATA 'CentralDark\Casa-Commander'
$SecretFile = Join-Path $InstallDir 'casa-bridge-token.dpapi'
$Launcher = Join-Path $InstallDir 'Launch-Casa-Commander.ps1'
$TaskName = 'CentralDark-Casa-Commander'

function Fail([string]$Code, [string]$Details = '') {
    throw ("{0}{1}" -f $Code, $(if ($Details) { ': ' + $Details } else { '' }))
}
function Require-Program([string]$Name, [string]$Missing) {
    $command = Get-Command $Name -ErrorAction SilentlyContinue
    if (-not $command) { Fail $Missing }
    return $command.Source
}
function GitBlobSha([byte[]]$Bytes) {
    $prefix = [Text.Encoding]::ASCII.GetBytes(('blob ' + $Bytes.Length + "`0"))
    $joined = New-Object byte[] ($prefix.Length + $Bytes.Length)
    [Array]::Copy($prefix, 0, $joined, 0, $prefix.Length)
    [Array]::Copy($Bytes, 0, $joined, $prefix.Length, $Bytes.Length)
    $sha = [Security.Cryptography.SHA1]::Create()
    try { return [BitConverter]::ToString($sha.ComputeHash($joined)).Replace('-', '').ToLowerInvariant() }
    finally { $sha.Dispose() }
}
function Fetch-File([string]$RemotePath, [string]$LocalName) {
    # gh handles GitHub authentication for the private repository; no PAT in the script.
    $endpoint = "repos/$Repo/contents/$RemotePath`?ref=$SourceCommit"
    $previousPreference = $ErrorActionPreference
    $ErrorActionPreference = 'Continue'
    try { $jsonLines = & $script:GitHubCli api $endpoint 2>$null; $fetchExit = $LASTEXITCODE }
    finally { $ErrorActionPreference = $previousPreference }
    if ($fetchExit -ne 0) { Fail 'GITHUB_SOURCE_FETCH_FAILED' $RemotePath }
    try { $item = ($jsonLines -join "`n") | ConvertFrom-Json }
    catch { Fail 'GITHUB_SOURCE_JSON_INVALID' $RemotePath }
    if ($item.encoding -ne 'base64' -or -not $item.content -or -not $item.sha) {
        Fail 'GITHUB_SOURCE_NOT_A_BLOB' $RemotePath
    }
    try { [byte[]]$bytes = [Convert]::FromBase64String(([string]$item.content -replace '\s', '')) }
    catch { Fail 'GITHUB_SOURCE_BASE64_INVALID' $RemotePath }
    $actualSha = GitBlobSha $bytes
    if ($actualSha -ne ([string]$item.sha).ToLowerInvariant()) {
        Fail 'GITHUB_SOURCE_SHA_MISMATCH' $RemotePath
    }
    $destination = Join-Path $InstallDir $LocalName
    $temp = $destination + '.download'
    [IO.File]::WriteAllBytes($temp, $bytes)
    Move-Item -LiteralPath $temp -Destination $destination -Force
    Write-Host ("SOURCE_OK {0} blob={1}" -f $LocalName, $actualSha)
}
function New-Token {
    [byte[]]$random = New-Object byte[] 48
    $rng = [Security.Cryptography.RandomNumberGenerator]::Create()
    try { $rng.GetBytes($random) } finally { $rng.Dispose() }
    return [Convert]::ToBase64String($random).TrimEnd('=').Replace('+', '-').Replace('/', '_')
}
function Store-Token([string]$Value) {
    # DPAPI bound to the current Windows user: no plaintext secret in scheduled task.
    $secure = ConvertTo-SecureString -String $Value -AsPlainText -Force
    $encrypted = ConvertFrom-SecureString -SecureString $secure
    [IO.File]::WriteAllText($SecretFile, $encrypted, [Text.Encoding]::ASCII)
}
function Read-Token {
    $encrypted = [IO.File]::ReadAllText($SecretFile, [Text.Encoding]::ASCII).Trim()
    $secure = ConvertTo-SecureString -String $encrypted
    $handle = [IntPtr]::Zero
    try {
        $handle = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
        return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($handle)
    }
    finally { if ($handle -ne [IntPtr]::Zero) { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($handle) } }
}

if (-not $env:LOCALAPPDATA) { Fail 'WINDOWS_LOCALAPPDATA_MISSING' }
if ($env:OS -ne 'Windows_NT') { Fail 'WINDOWS_REQUIRED' }
if ($SourceCommit -notmatch '^[0-9a-f]{40}$') { Fail 'SOURCE_COMMIT_SHA_INVALID' }

$GitHubCli = Require-Program 'gh' 'GITHUB_CLI_NOT_FOUND'
$NodeExe = Require-Program 'node' 'NODEJS_NOT_FOUND'
$null = Require-Program 'npx.cmd' 'NPX_NOT_FOUND'
$TailscaleExe = Require-Program 'tailscale' 'TAILSCALE_NOT_FOUND'
$previousPreference = $ErrorActionPreference
$ErrorActionPreference = 'Continue'
try {
    $null = & $GitHubCli auth status 2>$null
    $ghAuthExit = $LASTEXITCODE
    $null = & $TailscaleExe status 2>$null
    $tailscaleStatusExit = $LASTEXITCODE
} finally { $ErrorActionPreference = $previousPreference }
if ($ghAuthExit -ne 0) { Fail 'GITHUB_NOT_AUTHENTICATED' }
if ($tailscaleStatusExit -ne 0) { Fail 'TAILSCALE_NOT_CONNECTED' }

New-Item -ItemType Directory -Path $InstallDir -Force | Out-Null
Write-Host 'CENTRALDARK_CASA_SOURCE: PR #1945, SHA fixado'
Fetch-File 'scripts/remote-bridge/CentralDark-Casa-Agent.mjs' 'CentralDark-Casa-Agent.mjs'
Fetch-File 'scripts/remote-bridge/CentralDark-Remote-Bridge.ps1' 'CentralDark-Remote-Bridge.ps1'
Fetch-File 'scripts/remote-bridge/CENTRALDARK-REMOTE-BRIDGE.config.json' 'CENTRALDARK-REMOTE-BRIDGE.config.json'
Fetch-File 'scripts/remote-bridge/CentralDark-Casa-Agent.test.mjs' 'CentralDark-Casa-Agent.test.mjs'

# Strictly expect a loopback-only Casa agent and a tailnet-only public transport.
$config = Get-Content -LiteralPath (Join-Path $InstallDir 'CENTRALDARK-REMOTE-BRIDGE.config.json') -Raw | ConvertFrom-Json
$route = @($config.tailscale.routes | Where-Object { $_.name -eq 'mcp-local' })
if ($route.Count -ne 1 -or $route[0].public_port -ne 9100 -or $route[0].target -ne '127.0.0.1:9101') {
    Fail 'CASA_ROUTE_CONFIG_MISMATCH'
}
if ($config.legacy_remote_enabled_by_default -ne $false) { Fail 'VENDOR_REMOTE_NOT_DISABLED' }

& $NodeExe --check (Join-Path $InstallDir 'CentralDark-Casa-Agent.mjs')
if ($LASTEXITCODE -ne 0) { Fail 'CASA_AGENT_SYNTAX_FAILED' }
& $NodeExe --test (Join-Path $InstallDir 'CentralDark-Casa-Agent.test.mjs')
if ($LASTEXITCODE -ne 0) { Fail 'CASA_AGENT_NEGATIVE_TEST_FAILED' }

$generated = $false
if ($env:CENTRALDARK_CASA_BRIDGE_TOKEN) {
    $token = [string]$env:CENTRALDARK_CASA_BRIDGE_TOKEN
    if ($token.Length -lt 24) { Fail 'CASA_BRIDGE_TOKEN_TOO_SHORT' }
    Store-Token $token
}
elseif (Test-Path -LiteralPath $SecretFile) {
    try { $token = Read-Token }
    catch { Fail 'CASA_BRIDGE_DPAPI_READ_FAILED' $_.Exception.Message }
    if ($token.Length -lt 24) { Fail 'CASA_BRIDGE_SAVED_TOKEN_TOO_SHORT' }
}
else {
    $token = New-Token
    Store-Token $token
    $generated = $true
}

# Reuse the existing Bridge; launcher only loads the DPAPI secret in this user session.
# It does not launch a parallel daemon or use the vendor's remote service.
$launcherText = @'
param()
$ErrorActionPreference = 'Stop'
$homePath = Join-Path $env:LOCALAPPDATA 'CentralDark\Casa-Commander'
$secret = Join-Path $homePath 'casa-bridge-token.dpapi'
if (-not (Test-Path -LiteralPath $secret)) { throw 'CASA_BRIDGE_DPAPI_SECRET_NOT_FOUND' }
$encrypted = [IO.File]::ReadAllText($secret, [Text.Encoding]::ASCII).Trim()
$secure = ConvertTo-SecureString -String $encrypted
$ptr = [IntPtr]::Zero
try {
    $ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
    $env:CENTRALDARK_CASA_BRIDGE_TOKEN = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr)
} finally {
    if ($ptr -ne [IntPtr]::Zero) { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr) }
}
& (Join-Path $homePath 'CentralDark-Remote-Bridge.ps1')
if ($LASTEXITCODE -and $LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
'@
[IO.File]::WriteAllText($Launcher, $launcherText, [Text.Encoding]::ASCII)

$existingTask = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
if ($existingTask) {
    # Reuse only the exact canonical launcher already installed for this task name.
    # Do not infer ownership from a broad product-name substring.
    $expectedExistingLauncher = [IO.Path]::GetFullPath((Join-Path $env:LOCALAPPDATA 'CentralDark\Casa-Commander\Launch-Casa-Commander.ps1'))
    $actions = @($existingTask.Actions)
    $ownedByCanonicalLauncher = $false
    if ($actions.Count -eq 1) {
        $existingAction = $actions[0]
        $executeName = [IO.Path]::GetFileName([string]$existingAction.Execute)
        $arguments = [string]$existingAction.Arguments
        $expectedArguments = '-NoProfile -NonInteractive -ExecutionPolicy Bypass -File "' + $expectedExistingLauncher + '"'
        $ownedByCanonicalLauncher = ($executeName -ieq 'powershell.exe' -and $arguments -ieq $expectedArguments)
    }
    if (-not $ownedByCanonicalLauncher) {
        Fail 'TASK_NAME_OWNED_BY_DIFFERENT_PROGRAM' $TaskName
    }
}
$psExe = (Get-Command 'powershell.exe' -ErrorAction Stop).Source
$arg = '-NoProfile -NonInteractive -ExecutionPolicy Bypass -File "' + $Launcher + '"'
$action = New-ScheduledTaskAction -Execute $psExe -Argument $arg -WorkingDirectory $InstallDir
$user = [Security.Principal.WindowsIdentity]::GetCurrent().Name
$logon = New-ScheduledTaskTrigger -AtLogOn -User $user
$repeat = New-ScheduledTaskTrigger -Once -At ((Get-Date).AddMinutes(1)) -RepetitionInterval (New-TimeSpan -Minutes 5) -RepetitionDuration (New-TimeSpan -Days 3650)
$principal = New-ScheduledTaskPrincipal -UserId $user -LogonType Interactive -RunLevel Limited
$settings = New-ScheduledTaskSettingsSet -MultipleInstances IgnoreNew -StartWhenAvailable -ExecutionTimeLimit (New-TimeSpan -Minutes 2)
Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger @($logon,$repeat) -Principal $principal -Settings $settings -Force | Out-Null
if (-not (Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue)) {
    Fail 'CASA_AUTOSTART_TASK_READBACK_FAILED'
}
Write-Host 'CASA_AUTOSTART_TASK=REGISTERED'

# First launch in this Windows user session.
& $Launcher
$health = $null
try {
    $health = Invoke-RestMethod -Uri 'http://127.0.0.1:9101/health' -TimeoutSec 5 -ErrorAction Stop
}
catch { Fail 'CASA_LOCAL_HEALTH_FAILED' $_.Exception.Message }
if ($health.name -ne 'CentralDark Casa Commander' -or $health.ok -ne $true) {
    Fail 'CASA_LOCAL_HEALTH_IDENTITY_INVALID'
}
Write-Host 'CASA_LOCAL_HEALTH=PASS'

# A health check alone is not the local file capability proof.
$body = @{name='list_directory';arguments=@{path=$env:LOCALAPPDATA}} | ConvertTo-Json -Compress -Depth 5
try {
    $readback = Invoke-RestMethod -Uri 'http://127.0.0.1:9101/tool' -Method Post `
        -Headers @{Authorization=('Bearer ' + $token)} -ContentType 'application/json' `
        -Body $body -TimeoutSec 120 -ErrorAction Stop
    if ($readback.ok -eq $true) {
        Write-Host 'CASA_LOCAL_LIST_DIRECTORY=PASS'
    } else {
        Write-Host 'CASA_LOCAL_LIST_DIRECTORY=FAILED'
        Write-Host ("CASA_LOCAL_LIST_DIRECTORY_ERROR={0}" -f (($readback | ConvertTo-Json -Compress -Depth 4)))
    }
}
catch {
    Write-Host 'CASA_LOCAL_LIST_DIRECTORY=FAILED'
    Write-Host ('CASA_LOCAL_LIST_DIRECTORY_ERROR=' + $_.Exception.Message)
}

# Never claim VPS deployment or end-to-end authorization from a local test.
Write-Host ('CASA_ONE_SHOT_INSTALL_DIR=' + $InstallDir)
Write-Host 'CASA_TASK_RECONCILE=ON_LOGON_AND_EVERY_5_MIN'
if ($generated) {
    Write-Host 'CASA_TOKEN=GENERATED_AND_STORED_DPAPI_CURRENT_USER'
    Write-Host 'VPS_PAIRING=REQUIRED_SAME_CENTRALDARK_CASA_BRIDGE_TOKEN'
} else {
    Write-Host 'CASA_TOKEN=REUSED_AND_STORED_DPAPI_CURRENT_USER'
    Write-Host 'VPS_PAIRING=REQUIRES_SAME_TOKEN_ALREADY_IN_VPS_MCP'
}
if ($ShowPairingToken) {
    Write-Host 'WARNING: PRIVATE PAIRING TOKEN APPEARS ON THIS WINDOWS CONSOLE ONLY; DO NOT SHARE IT IN CHAT OR GIT.'
    Write-Host ('CASA_PAIRING_TOKEN=' + $token)
}
Write-Host 'VPS_MCP_DEPLOY=NOT_PERFORMED'
Write-Host 'CASA_REMOTE_READ_F_WORKTREES=NOT_YET_PROVED'
