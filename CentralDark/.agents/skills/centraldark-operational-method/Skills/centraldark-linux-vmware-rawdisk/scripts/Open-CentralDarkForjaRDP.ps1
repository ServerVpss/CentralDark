#Requires -Version 5.1
<#
.SYNOPSIS
  CentralDark | Entrar graficamente no openKylin VMware pelo SSH existente.
.DESCRIPTION
  Reutiliza o alias openkylin-vm, sem senha, sem VPN extra e sem expor a
  porta 3389 fora do Linux. Abre o XRDP pela conexao local 127.0.0.1:13390.
  Nao instala programas, nao reconfigura o SSH e nao altera discos/particoes.
  A senha do usuario Linux e solicitada diretamente na tela XRDP.
.EXAMPLE
  .\Open-CentralDarkForjaRDP.ps1 -CheckOnly
.EXAMPLE
  .\Open-CentralDarkForjaRDP.ps1
#>
[CmdletBinding()]
param([switch]$CheckOnly)
Set-StrictMode -Version Latest
$ErrorActionPreference='Stop'

$sshConfig='F:\CentralDark\.ssh\config_openkylin'
$sshAlias='openkylin-vm'
$bind='127.0.0.1'
$listenPort=13390
$dest='127.0.0.1:3389'
$rdpExe=Join-Path $env:windir 'System32\mstsc.exe'
function Write-Receipt([string]$Key,[string]$Value){
    Write-Output ('CENTRALDARK_FORJA_{0}={1}' -f $Key,$Value)
}
function Test-RdpHandshake {
    $client=New-Object System.Net.Sockets.TcpClient
    try{
        $client.ReceiveTimeout=4000
        $client.SendTimeout=4000
        $client.Connect($bind,$listenPort)
        $s=$client.GetStream()
        [byte[]]$req=3,0,0,19,14,224,0,0,0,0,0,1,0,8,0,3,0,0,0
        $s.Write($req,0,$req.Length)
        $rx=New-Object byte[] 64
        $n=$s.Read($rx,0,$rx.Length)
        return ($n -ge 7 -and $rx[0] -eq 3 -and $rx[1] -eq 0)
    }catch{
        return $false
    }finally{
        $client.Dispose()
    }
}
if(-not(Test-Path -LiteralPath $sshConfig -PathType Leaf)){throw 'SSH_CONFIG_NOT_FOUND'}
$ssh=(Get-Command ssh.exe -ErrorAction Stop).Source
if(-not(Test-Path -LiteralPath $rdpExe -PathType Leaf)){throw 'WINDOWS_RDP_CLIENT_NOT_FOUND'}
$ports=@(Get-NetTCPConnection -LocalPort $listenPort -ErrorAction SilentlyContinue |
    Where-Object { $_.LocalAddress -eq $bind })
if($ports.Count -gt 0){
    $pids=@($ports | Select-Object -ExpandProperty OwningProcess -Unique)
    foreach($pidTarget in $pids){
        $proc=Get-CimInstance Win32_Process -Filter ("ProcessId=" + $pidTarget)
        if(-not $proc -or $proc.Name -ine 'ssh.exe' -or
           $proc.CommandLine -notmatch 'openkylin-vm' -or
           $proc.CommandLine -notmatch '13390:127\.0\.0\.1:3389'){
            throw ('LOCAL_PORT_OWNED_BY_OTHER_PROCESS_PID='+$pidTarget)
        }
    }
    Write-Receipt 'TUNNEL' 'REUSED_EXISTING'
}elseif(-not $CheckOnly){
    $args='-N -T -o BatchMode=yes -o ExitOnForwardFailure=yes ' +
          '-o ServerAliveInterval=30 -o ServerAliveCountMax=3 ' +
          '-F "'+$sshConfig+'" -L 127.0.0.1:13390:127.0.0.1:3389 '+$sshAlias
    $proc=Start-Process -FilePath $ssh -ArgumentList $args -PassThru -WindowStyle Hidden
    Write-Receipt 'TUNNEL_NEW_PID' ([string]$proc.Id)
}
$pass=$false
for($i=0;$i -lt 12;$i++){
    if(Test-RdpHandshake){$pass=$true;break}
    if($CheckOnly){break}
    Start-Sleep -Seconds 1
}
if(-not $pass){
    Write-Receipt 'RDP_HANDSHAKE' 'FAIL_OR_NOT_RUNNING'
    if($CheckOnly){exit 2}
    throw 'SSH_TUNNEL_OR_XRDP_UNREACHABLE'
}
Write-Receipt 'RDP_HANDSHAKE' 'PASS'
Write-Receipt 'TARGET' ($bind+':'+$listenPort)
if($CheckOnly){Write-Receipt 'MODE' 'DIAGNOSTIC_ONLY';exit 0}
Start-Process -FilePath $rdpExe -ArgumentList ('/v:'+$bind+':'+$listenPort+' /w:1360 /h:768') | Out-Null
Write-Receipt 'GUI' 'OPENED'
Write-Receipt 'LOGIN' 'USER_MUST_ENTER_LINUX_PASSWORD_IN_RDP_WINDOW'
