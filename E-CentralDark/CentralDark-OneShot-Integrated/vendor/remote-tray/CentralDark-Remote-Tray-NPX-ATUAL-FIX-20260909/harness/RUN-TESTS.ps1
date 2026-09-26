$ErrorActionPreference='Stop'
$Root=(Resolve-Path (Join-Path $PSScriptRoot '..')).Path
Import-Module (Join-Path $Root 'engine\CentralDark-Remote-Parser.psm1') -Force
$fail=0
function Assert-True([string]$Name,[bool]$Cond){
    if($Cond){Write-Host "[PASS] $Name"}else{Write-Host "[FAIL] $Name";$script:fail++}
}
function Parse-Fixture([string]$Name){
    $path=Join-Path $PSScriptRoot "fixtures\$Name"
    ConvertFrom-CentralDarkRemoteLog -Text (Get-Content -Raw -LiteralPath $path)
}
$a=Parse-Fixture 'auth-code-base-url.log'
Assert-True 'auth: local MCP' $a.LocalMcpConnected
Assert-True 'auth: remote MCP' $a.RemoteMcpConnected
Assert-True 'auth: url /device/verify' ($a.VerificationUrl -eq 'https://mcp.desktopcommander.app/device/verify')
Assert-True 'auth: code captured' ($a.UserCode -eq 'WCWQ-HT4D')
Assert-True 'auth: phase AUTH_REQUIRED' ($a.Phase -eq 'AUTH_REQUIRED')
$s=Parse-Fixture 'stale-refresh-token.log'
Assert-True 'stale: detected' $s.StaleRefreshToken
Assert-True 'stale: phase' ($s.Phase -eq 'STALE_SESSION')
$o=Parse-Fixture 'authorized-online-claim.log'
Assert-True 'online: auth success' $o.AuthSuccessful
Assert-True 'online: cli online claim only' ($o.Phase -eq 'REMOTE_DEVICE_ONLINE_CLAIM')
$f=Parse-Fixture 'local-mcp-failed.log'
Assert-True 'fail: startup failed' $f.StartupFailed
Assert-True 'fail: nonzero exit fault' ($f.Faults -contains 'REMOTE_PROCESS_EXIT_NONZERO')
$engine=Get-Content -Raw -LiteralPath (Join-Path $Root 'engine\CentralDark-Remote-Tray.ps1')
Assert-True 'static: no readonly $pid assignment' (-not ($engine -match '(?im)^\s*\$pid\s*='))
Assert-True 'static: empty path guard' ($engine -match 'IsNullOrWhiteSpace\(\$State\.CurrentLog\)')
Assert-True 'static: localappdata runtime' ($engine -match 'LOCALAPPDATA')
Assert-True 'static: supervisor containment' ($engine -match 'SUPERVISOR_CONTAINED')
Assert-True 'exe: exists' (Test-Path (Join-Path $Root 'CentralDark-Remote-Tray.exe'))
if(Test-Path (Join-Path $Root 'CentralDark-Remote-Tray.exe')){
    $bytes=[IO.File]::ReadAllBytes((Join-Path $Root 'CentralDark-Remote-Tray.exe'))
    Assert-True 'exe: PE MZ header' ($bytes[0] -eq 0x4D -and $bytes[1] -eq 0x5A)
}
if($fail -gt 0){throw "TESTS_FAILED=$fail"}
Write-Host 'TESTS=PASS'
