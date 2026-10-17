# CentralDark Casa — recover the EXISTING Screenpipe desktop, never a second recorder.
# Does not read/store browser tokens, cookies, tabs, audio or screen content.
# Interactive-user only. Install is opt-in; Status is read-only.
[CmdletBinding()]
param(
    [ValidateSet('Status', 'Install', 'Tick', 'Uninstall')]
    [string]$Mode = 'Status',
    [string]$ScreenpipeExe = ''
)
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$TaskName = 'CentralDark-Screenpipe-Continuity'
$HealthUrl = 'http://127.0.0.1:3030/health'
$BrowserUrl = 'http://127.0.0.1:3030/connections/browser/status'

function Get-HttpStatus([string]$Url) {
    try {
        $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 4 -ErrorAction Stop
        return [int]$response.StatusCode
    } catch {
        if ($null -ne $_.Exception.Response) {
            try { return [int]$_.Exception.Response.StatusCode } catch { }
        }
        return 0
    }
}
function Get-ScreenpipeProcess {
    @(Get-CimInstance Win32_Process -Filter "name = 'screenpipe-app.exe'" -ErrorAction SilentlyContinue |
        Where-Object { $_.ExecutablePath -and (Test-Path -LiteralPath $_.ExecutablePath -PathType Leaf) })
}
function Get-Listener {
    @(Get-NetTCPConnection -LocalPort 3030 -State Listen -ErrorAction SilentlyContinue)
}
function Assert-Executable([string]$Path) {
    if (-not $Path -or -not (Test-Path -LiteralPath $Path -PathType Leaf)) {
        throw 'SCREENPIPE_EXECUTABLE_NOT_FOUND; no installation or second recorder'
    }
    if ([IO.Path]::GetFileName($Path) -ine 'screenpipe-app.exe') {
        throw 'SCREENPIPE_OWNER_NOT_NATIVE_APP; refusing to launch another recorder'
    }
    return (Resolve-Path -LiteralPath $Path).ProviderPath
}
function Get-ExistingOwners {
    $found = [Collections.Generic.List[string]]::new()
    $tasks = @(Get-ScheduledTask -ErrorAction SilentlyContinue)
    foreach ($task in $tasks) {
        if ($task.TaskName -eq $TaskName) { continue }
        $actions = @($task.Actions | ForEach-Object { "$($_.Execute) $($_.Arguments)" }) -join ' '
        if ($task.TaskName -match '(?i)screenpipe|cadeia.free.watchdog' -or $actions -match '(?i)screenpipe|cadeia.free.watchdog') {
            $found.Add($task.TaskName)
        }
    }
    # An existing, separately owned Hermes watchdog is a hard gate against duplicate ownership.
    $legacy = Join-Path $env:USERPROFILE '.hermes\scripts\cadeia-free-watchdog.ps1'
    if (Test-Path -LiteralPath $legacy -PathType Leaf) {
        if (Select-String -LiteralPath $legacy -Pattern '(?i)screenpipe|3030' -Quiet -ErrorAction SilentlyContinue) {
            $found.Add('HERMES_CADEIA_FREE_WATCHDOG_FILE')
        }
    }
    @($found | Select-Object -Unique)
}
function Write-Result([string]$State, [string]$Action, [int]$Health, [int]$Browser) {
    $result = [ordered]@{
        schema = 'centraldark.screenpipe.continuity.v1'
        measured_at_utc = [DateTime]::UtcNow.ToString('o')
        runtime_host = 'CASA_WINDOWS'
        health_http = $Health
        browser_status_http = $Browser
        state = $State
        action = $Action
        browser_ws = 'UNKNOWN_UNTIL_WS_101_AND_HEARTBEAT'
        auth_preserved_locally = 'UNMODIFIED_BY_THIS_SCRIPT'
    }
    $json = $result | ConvertTo-Json -Compress
    if ($Mode -eq 'Tick') {
        $folder = Join-Path $env:LOCALAPPDATA 'CentralDark'
        New-Item -ItemType Directory -Path $folder -Force | Out-Null
        [IO.File]::WriteAllText((Join-Path $folder 'screenpipe-continuity.status.json'), $json,
            [Text.UTF8Encoding]::new($false))
    }
    Write-Output $json
}

if ($Mode -eq 'Uninstall') {
    $task = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
    if ($task) { Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false }
    Write-Output 'TASK_REMOVED_IF_PRESENT; Screenpipe desktop, tokens, native startup and other watchdogs untouched'
    exit 0
}

$health = Get-HttpStatus $HealthUrl
$browser = Get-HttpStatus $BrowserUrl
if ($Mode -eq 'Status') {
    $owners = @(Get-ExistingOwners)
    Write-Result $(if ($health -eq 200) { 'DAEMON_PASS' } else { 'DAEMON_UNHEALTHY' }) ('READ_ONLY; existing_owner_candidates=' + ($owners -join ',')) $health $browser
    exit 0
}

if ($Mode -eq 'Install') {
    if ($health -ne 200) { throw 'INSTALL_REQUIRES_HEALTH_200_TO_IDENTIFY_EXISTING_NATIVE_APP' }
    $owners = @(Get-ExistingOwners)
    if ($owners.Count -gt 0) {
        Write-Result 'EXISTING_WATCHDOG_OWNER' ('NO_DUPLICATE_SCHEDULER; owners=' + ($owners -join ',')) $health $browser
        exit 2
    }
    $existing = @(Get-ScreenpipeProcess)
    if (-not $ScreenpipeExe) {
        if ($existing.Count -ne 1) { throw 'NATIVE_APP_PROCESS_NOT_UNIQUE; provide exact verified screenpipe-app.exe path' }
        $ScreenpipeExe = $existing[0].ExecutablePath
    }
    $exe = Assert-Executable $ScreenpipeExe
    $scriptFile = $PSCommandPath
    if (-not $scriptFile -or -not (Test-Path -LiteralPath $scriptFile -PathType Leaf)) {
        throw 'SCRIPT_MUST_EXIST_ON_DISK_BEFORE_TASK_INSTALL'
    }
    $shellExe = (Get-Process -Id $PID).Path
    $user = [Security.Principal.WindowsIdentity]::GetCurrent().Name
    $arguments = '-NoProfile -NonInteractive -WindowStyle Hidden -File "' + $scriptFile + '" -Mode Tick -ScreenpipeExe "' + $exe + '"'
    $action = New-ScheduledTaskAction -Execute $shellExe -Argument $arguments
    $logon = New-ScheduledTaskTrigger -AtLogOn -User $user
    $repeat = New-ScheduledTaskTrigger -Once -At ((Get-Date).AddMinutes(1)) -RepetitionInterval (New-TimeSpan -Minutes 5) -RepetitionDuration (New-TimeSpan -Days 3650)
    $principal = New-ScheduledTaskPrincipal -UserId $user -LogonType Interactive -RunLevel Limited
    $settings = New-ScheduledTaskSettingsSet -MultipleInstances IgnoreNew -StartWhenAvailable -ExecutionTimeLimit (New-TimeSpan -Minutes 2)
    Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger @($logon, $repeat) -Principal $principal -Settings $settings -Force | Out-Null
    $readback = Get-ScheduledTask -TaskName $TaskName -ErrorAction Stop
    if (-not $readback) { throw 'TASK_READBACK_FAILED' }
    Write-Result 'TASK_REGISTERED_NOT_REBOOT_PROVEN' 'INTERACTIVE_USER; 5_MIN_CHECK; NO_TOKENS_OR_REAUTH; NO_DUPLICATE_PROCESS' $health $browser
    exit 0
}

# Tick: recover daemon only. A disconnected browser remains AUTH_REQUIRED/UNKNOWN, never auto-approve.
if ($health -eq 200) {
    Write-Result 'DAEMON_PASS' 'NOOP_HEALTHY; NO_SECOND_RECORDER' $health $browser
    exit 0
}
$exe = Assert-Executable $ScreenpipeExe
$listener = @(Get-Listener)
if ($listener.Count -gt 0) {
    Write-Result 'PORT_3030_OCCUPIED_UNHEALTHY' 'NO_START; OWNER_MUST_BE_DIAGNOSED' $health $browser
    exit 3
}
# Recheck to avoid racing another owner or native auto-start.
Start-Sleep -Seconds 2
if ((Get-HttpStatus $HealthUrl) -eq 200 -or @(Get-Listener).Count -gt 0) {
    Write-Result 'RECOVERED_OR_PORT_OWNED_BY_ANOTHER' 'NO_START_AFTER_RECHECK' (Get-HttpStatus $HealthUrl) (Get-HttpStatus $BrowserUrl)
    exit 0
}
Start-Process -FilePath $exe | Out-Null
$healthy = $false
for ($i = 0; $i -lt 15; $i++) {
    Start-Sleep -Seconds 1
    if ((Get-HttpStatus $HealthUrl) -eq 200) { $healthy = $true; break }
}
$health = Get-HttpStatus $HealthUrl
$browser = Get-HttpStatus $BrowserUrl
Write-Result $(if ($healthy) { 'DAEMON_RECOVERED' } else { 'DAEMON_RECOVERY_UNPROVEN' }) 'NATIVE_APP_LAUNCHED_ONCE; BROWSER_AUTH_UNTOUCHED' $health $browser
if (-not $healthy) { exit 4 }
