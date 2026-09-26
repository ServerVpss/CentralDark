Set-StrictMode -Version Latest

function ConvertFrom-CentralDarkRemoteLog {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)][AllowEmptyString()][string]$Text
    )

    $normalized = if ($null -eq $Text) { '' } else { [string]$Text }

    $result = [ordered]@{
        LocalMcpConnected  = $false
        RemoteMcpConnected = $false
        AuthFlowStarted    = $false
        VerificationUrl    = $null
        UserCode           = $null
        StaleRefreshToken  = $false
        AuthSuccessful     = $false
        DeviceOnlineClaim  = $false
        StartupFailed      = $false
        ExitCode           = $null
        Phase              = 'UNKNOWN'
        Sensor             = 'UNKNOWN'
        Faults             = @()
    }

    if ([string]::IsNullOrWhiteSpace($normalized)) {
        $result.Phase = 'NO_LOG_SIGNAL'
        return [pscustomobject]$result
    }

    $result.LocalMcpConnected = $normalized -match 'Connected to Desktop Commander MCP'
    $result.RemoteMcpConnected = $normalized -match 'Connected to Remote MCP'
    $result.AuthFlowStarted = $normalized -match 'Starting device authorization flow|Please complete authentication|Requesting device code'
    $result.StaleRefreshToken = $normalized -match 'Invalid Refresh Token:\s*Already Used|Persisted session invalid'
    $result.AuthSuccessful = $normalized -match 'Authorization successful|Device ID authenticated|Device verified|This device is now authorized'
    $result.DeviceOnlineClaim = $normalized -match 'Device marked as online|visible as online|Device ready:'
    $result.StartupFailed = $normalized -match 'Device startup failed|Failed to connect to Desktop Commander MCP|Unexpected end of JSON input'

    $urlMatch = [regex]::Match(
        $normalized,
        'https://mcp\.desktopcommander\.app/(?:device/verify|verify-device\?[^\s"''<>]+)',
        [Text.RegularExpressions.RegexOptions]::IgnoreCase
    )
    if ($urlMatch.Success) {
        $result.VerificationUrl = $urlMatch.Value.Trim()
    } elseif ($result.AuthFlowStarted) {
        $result.VerificationUrl = 'https://mcp.desktopcommander.app/device/verify'
    }

    $codeMatch = [regex]::Match(
        $normalized,
        '(?im)(?:Enter this code when prompted:|user[_ -]?code\s*[=:]?)[\s\r\n]*([A-Z0-9]{4}-[A-Z0-9]{4})'
    )
    if (-not $codeMatch.Success) {
        $codeMatch = [regex]::Match($normalized, '\b([A-Z0-9]{4}-[A-Z0-9]{4})\b')
    }
    if ($codeMatch.Success) {
        $result.UserCode = $codeMatch.Groups[1].Value.ToUpperInvariant()
    }

    $exitMatch = [regex]::Match($normalized, 'REMOTE_MCP_EXIT\s*=\s*(-?\d+)')
    if ($exitMatch.Success) {
        $result.ExitCode = [int]$exitMatch.Groups[1].Value
    }

    if ($result.StartupFailed) { $result.Faults += 'LOCAL_DESKTOP_MCP_STARTUP_FAILED' }
    if ($result.StaleRefreshToken) { $result.Faults += 'STALE_REFRESH_TOKEN' }
    if ($result.ExitCode -ne $null -and $result.ExitCode -ne 0) { $result.Faults += 'REMOTE_PROCESS_EXIT_NONZERO' }

    if ($result.DeviceOnlineClaim) {
        $result.Phase = 'REMOTE_DEVICE_ONLINE_CLAIM'
        $result.Sensor = 'REMOTE_CLI_CLAIM_ONLY'
    } elseif ($result.AuthSuccessful) {
        $result.Phase = 'AUTH_CONFIRMED'
        $result.Sensor = 'AUTH_OK'
    } elseif ($result.UserCode) {
        $result.Phase = 'AUTH_REQUIRED'
        $result.Sensor = 'AUTH_CODE_READY'
    } elseif ($result.StaleRefreshToken) {
        $result.Phase = 'STALE_SESSION'
        $result.Sensor = 'AUTH_REQUIRED'
    } elseif ($result.RemoteMcpConnected) {
        $result.Phase = 'REMOTE_MCP_CONNECTED'
        $result.Sensor = 'REMOTE_TRANSPORT_OK'
    } elseif ($result.LocalMcpConnected) {
        $result.Phase = 'LOCAL_MCP_CONNECTED'
        $result.Sensor = 'LOCAL_OK'
    } elseif ($result.StartupFailed) {
        $result.Phase = 'LOCAL_MCP_FAILED'
        $result.Sensor = 'FAIL'
    }

    return [pscustomobject]$result
}

Export-ModuleMember -Function ConvertFrom-CentralDarkRemoteLog
