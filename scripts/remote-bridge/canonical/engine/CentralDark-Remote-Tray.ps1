#requires -Version 7.0
[CmdletBinding()]
param(
    [string]$DeviceLabel = 'SEGREDO',
    [int]$RetrySeconds = 5,
    [int]$MaxRetrySeconds = 60,
    [switch]$NoGui
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Continue'
$ProgressPreference = 'SilentlyContinue'

$ScriptRoot = if ($PSScriptRoot) { $PSScriptRoot } else { Split-Path -Parent $MyInvocation.MyCommand.Path }
Import-Module (Join-Path $ScriptRoot 'CentralDark-Remote-Parser.psm1') -Force

if (-not $NoGui) {
    Add-Type -AssemblyName System.Windows.Forms
    Add-Type -AssemblyName System.Drawing
}

function Resolve-LocalRuntimeRoot {
    if ($env:CENTRALDARK_REMOTE_HOME -and -not [string]::IsNullOrWhiteSpace($env:CENTRALDARK_REMOTE_HOME)) {
        return [Environment]::ExpandEnvironmentVariables($env:CENTRALDARK_REMOTE_HOME)
    }
    return (Join-Path $env:LOCALAPPDATA 'CentralDark\Remote-Tray')
}

$RuntimeRoot = Resolve-LocalRuntimeRoot
$ReceiptDir = Join-Path $RuntimeRoot 'receipts'
$LogDir = Join-Path $RuntimeRoot 'logs'
$CacheDir = Join-Path $RuntimeRoot 'cache'
New-Item -ItemType Directory -Force -Path $RuntimeRoot,$ReceiptDir,$LogDir,$CacheDir | Out-Null

$Config = [ordered]@{
    DeviceLabel      = $DeviceLabel
    RuntimeRoot      = $RuntimeRoot
    ReceiptDir       = $ReceiptDir
    LogDir           = $LogDir
    CacheDir         = $CacheDir
    Package          = '@wonderwhy-er/desktop-commander@latest'
    McpEndpoint      = 'https://mcp.desktopcommander.app/mcp'
    VerifyUrl        = 'https://mcp.desktopcommander.app/device/verify'
    RetrySeconds     = [Math]::Max($RetrySeconds,3)
    MaxRetrySeconds  = [Math]::Max($MaxRetrySeconds,10)
    HeartbeatSeconds = 5
    StableAfterSec   = 45
}

$mutexName='Local\CentralDarkRemoteBridgeTray'
$createdNew=$false
$mutex=[Threading.Mutex]::new($true,$mutexName,[ref]$createdNew)
if(-not $createdNew){
    if (-not $NoGui) {[System.Windows.Forms.MessageBox]::Show('CentralDark Remote ja esta em execucao.','CentralDark Remote','OK','Information')|Out-Null}
    exit 2
}

$pwshCmd=Get-Command pwsh.exe -ErrorAction SilentlyContinue
if(-not $pwshCmd){$pwshCmd=Get-Command pwsh -ErrorAction SilentlyContinue}
$npxCmd=Get-Command npx.cmd -ErrorAction SilentlyContinue
if(-not $npxCmd){$npxCmd=Get-Command npx -ErrorAction SilentlyContinue}
if(-not $pwshCmd -or -not $npxCmd){
    if (-not $NoGui) {[System.Windows.Forms.MessageBox]::Show('PowerShell 7 e Node.js/npx sao obrigatorios.','CentralDark Remote','OK','Error')|Out-Null}
    exit 3
}

$session=Get-Date -Format 'yyyyMMdd-HHmmss'
$wrapperLog=Join-Path $LogDir "tray-$session.log"
$eventLedger=Join-Path $ReceiptDir "events-$session.jsonl"
$latestReceipt=Join-Path $ReceiptDir 'latest.json'

$State=[ordered]@{
    Phase='BOOT'
    Sensor='UNKNOWN'
    Attempt=0
    Delay=[int]$Config.RetrySeconds
    BridgeProcess=$null
    LastStart=$null
    LastExit=$null
    ReconnectAt=Get-Date
    CurrentLog=$null
    LastHeartbeat=$null
    VerificationUrl=$null
    UserCode=$null
    AuthOpenedFor=$null
    StaleSessionSeen=$false
    LocalMcpConnected=$false
    RemoteMcpConnected=$false
    AuthConfirmed=$false
    RemoteDeviceOnlineClaim=$false
    StopAsked=$false
    LastEventFingerprint=$null
}

function Write-CDLog([string]$Kind,[string]$Message){
    "[{0}] [{1}] {2}" -f [DateTimeOffset]::UtcNow.ToString('o'),$Kind,$Message | Add-Content -LiteralPath $wrapperLog -Encoding UTF8
}
function Write-JsonAtomic([string]$Path,$Value){
    if ([string]::IsNullOrWhiteSpace($Path)) { return }
    $parent = Split-Path -Parent $Path
    if (-not [string]::IsNullOrWhiteSpace($parent)) { New-Item -ItemType Directory -Force -Path $parent | Out-Null }
    $tmp="$Path.tmp"
    $Value|ConvertTo-Json -Depth 12|Set-Content -LiteralPath $tmp -Encoding UTF8
    Move-Item -LiteralPath $tmp -Destination $Path -Force
}
function Get-Fingerprint([string]$Text){
    $sha=[Security.Cryptography.SHA256]::Create()
    try { ([BitConverter]::ToString($sha.ComputeHash([Text.Encoding]::UTF8.GetBytes($Text)))).Replace('-','').ToLowerInvariant() }
    finally { $sha.Dispose() }
}
function Emit-Event([string]$Kind,[hashtable]$Data=@{}){
    $payload=[ordered]@{at=[DateTimeOffset]::UtcNow.ToString('o');kind=$Kind;phase=$State.Phase;sensor=$State.Sensor;data=$Data}
    $line=$payload|ConvertTo-Json -Compress -Depth 10
    $fp=Get-Fingerprint $line
    if($fp -ne $State.LastEventFingerprint){
        $State.LastEventFingerprint=$fp
        $line|Add-Content -LiteralPath $eventLedger -Encoding UTF8
    }
}
function Get-OwnedPid($Process){
    if(-not $Process){return $null}
    try{$Process.Refresh();if(-not $Process.HasExited){return $Process.Id}}catch{}
    return $null
}
function Save-Receipt{
    $bridgeProcId=Get-OwnedPid $State.BridgeProcess
    $payload=[ordered]@{
        schema='centraldark.remote-tray.fixedpoint.canonical'
        observed_at=[DateTimeOffset]::UtcNow.ToString('o')
        device=$Config.DeviceLabel
        phase=$State.Phase
        sensor=$State.Sensor
        bridge_pid=$bridgeProcId
        attempt=$State.Attempt
        retry_seconds=$State.Delay
        local_mcp_connected=$State.LocalMcpConnected
        remote_mcp_connected=$State.RemoteMcpConnected
        auth_confirmed=$State.AuthConfirmed
        remote_device_online_claim=$State.RemoteDeviceOnlineClaim
        verification_url=$State.VerificationUrl
        user_code=$State.UserCode
        auth_opened=[bool]$State.AuthOpenedFor
        stale_session_seen=[bool]$State.StaleSessionSeen
        current_log=$State.CurrentLog
        wrapper_log=$wrapperLog
        event_ledger=$eventLedger
        runtime_root=$Config.RuntimeRoot
        package=$Config.Package
        mcp_endpoint=$Config.McpEndpoint
        claim='PROCESS_ALIVE_IS_NOT_DEVICE_ONLINE'
        mutation=$false
    }
    Write-JsonAtomic $latestReceipt $payload
}
function Set-Phase([string]$Phase,[string]$Sensor='UNKNOWN',[string]$Tip=''){
    $State.Phase=$Phase;$State.Sensor=$Sensor
    if($script:statusItem){$script:statusItem.Text="Estado: $Phase"}
    if($script:tray){
        $txt="CentralDark Remote - $($Config.DeviceLabel) - $Phase"
        $script:tray.Text=$txt.Substring(0,[Math]::Min(63,$txt.Length))
        if($Tip){$script:tray.BalloonTipTitle='CentralDark Remote';$script:tray.BalloonTipText=$Tip}
    }
    Emit-Event 'STATE' @{phase=$Phase;sensor=$Sensor}
    Save-Receipt
}
function Copy-AuthCode{
    if($State.UserCode -and -not $NoGui){
        try{[System.Windows.Forms.Clipboard]::SetText([string]$State.UserCode)}catch{Write-CDLog 'AVISO' "Clipboard falhou: $($_.Exception.Message)"}
    }
}
function Open-Authorization{
    if(-not $State.VerificationUrl){$State.VerificationUrl=$Config.VerifyUrl}
    Copy-AuthCode
    try{Start-Process $State.VerificationUrl}catch{Write-CDLog 'ERRO' "Falha ao abrir autorizacao: $($_.Exception.Message)"}
}
function Show-Auth{
    if(-not $State.UserCode){return}
    $authKey="$($State.VerificationUrl)|$($State.UserCode)"
    if($State.AuthOpenedFor -eq $authKey){return}
    $State.AuthOpenedFor=$authKey
    if($script:verifyItem){$script:verifyItem.Enabled=$true}
    Copy-AuthCode
    Open-Authorization
    Emit-Event 'AUTH_OPENED' @{url=$State.VerificationUrl;code=$State.UserCode}
    if(-not $NoGui){
        $msg="Codigo copiado para a area de transferencia:`n`n$($State.UserCode)`n`nO navegador foi aberto automaticamente."
        [System.Windows.Forms.MessageBox]::Show($msg,'CentralDark Remote - Autorizacao','OK','Information')|Out-Null
    }
}
function Stop-Bridge{
    $ownedProcId=Get-OwnedPid $State.BridgeProcess
    if($ownedProcId){
        try{& taskkill.exe /PID $ownedProcId /T /F 2>$null|Out-Null}catch{try{Stop-Process -Id $ownedProcId -Force -ErrorAction SilentlyContinue}catch{}}
    }
    $State.BridgeProcess=$null
}
function Schedule-Reconnect([int]$ExitCode){
    $State.LastExit=$ExitCode
    $life=if($State.LastStart){((Get-Date)-$State.LastStart).TotalSeconds}else{0}
    if($life -ge $Config.StableAfterSec){$State.Delay=[int]$Config.RetrySeconds}else{$State.Delay=[Math]::Min($Config.MaxRetrySeconds,[Math]::Max($Config.RetrySeconds,$State.Delay*2))}
    $State.ReconnectAt=(Get-Date).AddSeconds($State.Delay)
    Set-Phase 'AGUARDANDO_RECONEXAO' 'UNKNOWN' "Nova tentativa em $($State.Delay)s."
}
function Start-Bridge{
    if($State.StopAsked){return}
    $State.Attempt++
    $State.LastStart=Get-Date
    $State.LastExit=$null
    $State.UserCode=$null
    $State.VerificationUrl=$null
    $State.AuthOpenedFor=$null
    $stamp=Get-Date -Format 'yyyyMMdd-HHmmss'
    $State.CurrentLog=Join-Path $LogDir "desktop-commander-$stamp.log"
    $escapedLog=$State.CurrentLog.Replace("'","''")
    $escapedNpx=$npxCmd.Source.Replace("'","''")
    $escapedRuntime=$Config.RuntimeRoot.Replace("'","''")
    $escapedPackage=$Config.Package.Replace("'","''")
    $child=@"
`$ErrorActionPreference='Continue'
Set-Location -LiteralPath '$escapedRuntime'
"[CENTRALDARK] REMOTE_MCP_CONNECT=$($Config.McpEndpoint)"|Add-Content -LiteralPath '$escapedLog' -Encoding UTF8
& '$escapedNpx' -y '$escapedPackage' remote *>> '$escapedLog'
`$rc=`$LASTEXITCODE
"[CENTRALDARK] REMOTE_MCP_EXIT=`$rc"|Add-Content -LiteralPath '$escapedLog' -Encoding UTF8
exit `$rc
"@
    $encoded=[Convert]::ToBase64String([Text.Encoding]::Unicode.GetBytes($child))
    try{
        $State.BridgeProcess=Start-Process -FilePath $pwshCmd.Source -ArgumentList @('-NoLogo','-NoProfile','-ExecutionPolicy','Bypass','-EncodedCommand',$encoded) -WindowStyle Hidden -PassThru
        Set-Phase 'CONECTANDO' 'UNKNOWN' 'Conectando Desktop Commander Remote...'
        Write-CDLog 'INFO' "Bridge iniciado PID=$($State.BridgeProcess.Id)"
    }catch{
        Write-CDLog 'ERRO' $_.Exception.Message
        Schedule-Reconnect 1
    }
}
function Apply-ParsedSignal($signal){
    if($signal.LocalMcpConnected){$State.LocalMcpConnected=$true}
    if($signal.RemoteMcpConnected){$State.RemoteMcpConnected=$true}
    if($signal.StaleRefreshToken -and -not $State.StaleSessionSeen){
        $State.StaleSessionSeen=$true
        Emit-Event 'STALE_SESSION' @{action='WAIT_FOR_FRESH_DEVICE_CODE'}
    }
    if($signal.VerificationUrl){$State.VerificationUrl=$signal.VerificationUrl}
    if($signal.UserCode -and $State.UserCode -ne $signal.UserCode){$State.UserCode=$signal.UserCode}
    if($signal.AuthSuccessful){$State.AuthConfirmed=$true}
    if($signal.DeviceOnlineClaim){$State.RemoteDeviceOnlineClaim=$true}
    if($signal.Faults.Count -gt 0){Emit-Event 'FAULTS' @{items=$signal.Faults}}

    switch($signal.Phase){
        'AUTH_REQUIRED' { Set-Phase 'LOGIN_NECESSARIO' 'CODIGO_PRONTO' 'Codigo de autorizacao recebido.'; Show-Auth }
        'AUTH_CONFIRMED' { Set-Phase 'LOGIN_CONFIRMADO' 'AUTH_OK' 'Autorizacao confirmada. Aguardando medicao externa.' }
        'REMOTE_DEVICE_ONLINE_CLAIM' { Set-Phase 'ONLINE_DECLARADO' 'REMOTE_CLI_CLAIM_ONLY' 'CLI declarou online. Confirmar por ferramenta externa.' }
        'STALE_SESSION' { Set-Phase 'SESSAO_ANTIGA' 'LOGIN_NECESSARIO' 'Sessao antiga invalida. Aguardando novo codigo.' }
        'REMOTE_MCP_CONNECTED' { Set-Phase 'REMOTE_MCP_CONECTADO' 'REMOTE_TRANSPORT_OK' }
        'LOCAL_MCP_CONNECTED' { Set-Phase 'MCP_LOCAL_CONECTADO' 'LOCAL_OK' }
        'LOCAL_MCP_FAILED' { Set-Phase 'MCP_LOCAL_FALHOU' 'FAIL' }
    }
}
function Read-BridgeSignals{
    if([string]::IsNullOrWhiteSpace($State.CurrentLog)){return}
    if(-not(Test-Path -LiteralPath $State.CurrentLog)){return}
    try{
        $text=(Get-Content -LiteralPath $State.CurrentLog -Tail 320 -ErrorAction SilentlyContinue)-join "`n"
        $signal=ConvertFrom-CentralDarkRemoteLog -Text $text
        Apply-ParsedSignal $signal
    }catch{Write-CDLog 'AVISO' "Parser: $($_.Exception.Message)"}
}
function Force-Reconnect{
    Stop-Bridge
    $State.Delay=[int]$Config.RetrySeconds
    $State.ReconnectAt=Get-Date
    Set-Phase 'RECONECTAR_AGORA' 'UNKNOWN'
}
function Show-Status{
    $bridgeProcId=Get-OwnedPid $State.BridgeProcess
    if(-not $bridgeProcId){$bridgeProcId='-'}
    $msg=@"
Dispositivo: $($Config.DeviceLabel)
Estado: $($State.Phase)
Sensor: $($State.Sensor)
PID ponte: $bridgeProcId
Tentativa: $($State.Attempt)
Codigo: $(if($State.UserCode){$State.UserCode}else{'-'})
Runtime: $($Config.RuntimeRoot)
Log: $($State.CurrentLog)
Receipt: $latestReceipt

PROCESSO_ATIVO != DEVICE_ONLINE
UNKNOWN != PASS
"@
    if (-not $NoGui) {[System.Windows.Forms.MessageBox]::Show($msg,'CentralDark Remote - Estado','OK','Information')|Out-Null}
    else { Write-Host $msg }
}

if(-not $NoGui){
    $tray=[System.Windows.Forms.NotifyIcon]::new()
    $iconPath=Join-Path (Split-Path -Parent $ScriptRoot) 'assets\CentralDark-Remote-Tray.ico'
    if(Test-Path -LiteralPath $iconPath){try{$tray.Icon=[System.Drawing.Icon]::new($iconPath)}catch{$tray.Icon=[System.Drawing.SystemIcons]::Application}}else{$tray.Icon=[System.Drawing.SystemIcons]::Application}
    $tray.Text="CentralDark Remote - $DeviceLabel"
    $tray.Visible=$true
    $menu=[System.Windows.Forms.ContextMenuStrip]::new()
    $statusItem=[System.Windows.Forms.ToolStripMenuItem]::new('Estado: BOOT');$statusItem.Enabled=$false;[void]$menu.Items.Add($statusItem)
    [void]$menu.Items.Add([System.Windows.Forms.ToolStripSeparator]::new())
    $showItem=[System.Windows.Forms.ToolStripMenuItem]::new('Ver estado');$showItem.Add_Click({Show-Status});[void]$menu.Items.Add($showItem)
    $verifyItem=[System.Windows.Forms.ToolStripMenuItem]::new('Abrir login / copiar codigo');$verifyItem.Enabled=$true;$verifyItem.Add_Click({Copy-AuthCode;Open-Authorization});[void]$menu.Items.Add($verifyItem)
    $logItem=[System.Windows.Forms.ToolStripMenuItem]::new('Abrir log atual');$logItem.Add_Click({if(-not [string]::IsNullOrWhiteSpace($State.CurrentLog)){Start-Process notepad.exe $State.CurrentLog}});[void]$menu.Items.Add($logItem)
    $folderItem=[System.Windows.Forms.ToolStripMenuItem]::new('Abrir runtime local');$folderItem.Add_Click({Start-Process explorer.exe $Config.RuntimeRoot});[void]$menu.Items.Add($folderItem)
    $loginItem=[System.Windows.Forms.ToolStripMenuItem]::new('Forcar tela de login');$loginItem.Add_Click({Open-Authorization});[void]$menu.Items.Add($loginItem)
    $reconnectItem=[System.Windows.Forms.ToolStripMenuItem]::new('Reconectar agora');$reconnectItem.Add_Click({Force-Reconnect});[void]$menu.Items.Add($reconnectItem)
    [void]$menu.Items.Add([System.Windows.Forms.ToolStripSeparator]::new())
    $exitItem=[System.Windows.Forms.ToolStripMenuItem]::new('Sair');$exitItem.Add_Click({$State.StopAsked=$true;Stop-Bridge;$tray.Visible=$false;[System.Windows.Forms.Application]::Exit()});[void]$menu.Items.Add($exitItem)
    $tray.ContextMenuStrip=$menu
    $tray.Add_DoubleClick({Show-Status})
}

$timer=[System.Windows.Forms.Timer]::new();$timer.Interval=1000
$timer.Add_Tick({
    try{
        if($State.StopAsked){return}
        Read-BridgeSignals
        if($State.BridgeProcess){
            try{$State.BridgeProcess.Refresh()}catch{}
            if($State.BridgeProcess.HasExited){$rc=$State.BridgeProcess.ExitCode;$State.BridgeProcess=$null;Schedule-Reconnect $rc}
            elseif($State.LastStart -and ((Get-Date)-$State.LastStart).TotalSeconds -ge $Config.StableAfterSec){$State.Delay=[int]$Config.RetrySeconds}
        }
        if(-not $State.BridgeProcess -and (Get-Date) -ge $State.ReconnectAt){Start-Bridge}
        $now=Get-Date
        if(-not $State.LastHeartbeat -or (($now-$State.LastHeartbeat).TotalSeconds -ge $Config.HeartbeatSeconds)){$State.LastHeartbeat=$now;Save-Receipt}
    }catch{
        Write-CDLog 'ERRO' "SUPERVISOR_CONTAINED=$($_.Exception.Message)"
        Emit-Event 'SUPERVISOR_EXCEPTION' @{message=$_.Exception.Message}
        if(-not $State.BridgeProcess){$State.ReconnectAt=Get-Date}
    }
})
$timer.Start()
Write-CDLog 'INFO' "RUNTIME_ROOT=$RuntimeRoot"
Write-CDLog 'INFO' "NPX=$($npxCmd.Source)"
Set-Phase 'INICIO' 'UNKNOWN'
Start-Bridge
try{[System.Windows.Forms.Application]::Run()}finally{
    $State.StopAsked=$true
    try{$timer.Stop();$timer.Dispose()}catch{}
    try{Stop-Bridge}catch{}
    try{if($tray){$tray.Visible=$false;$tray.Dispose()}}catch{}
    try{Save-Receipt}catch{}
    try{$mutex.ReleaseMutex()|Out-Null}catch{}
    try{$mutex.Dispose()}catch{}
}
