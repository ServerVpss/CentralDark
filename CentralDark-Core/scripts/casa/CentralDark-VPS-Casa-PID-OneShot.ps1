# CENTRALDARK | VPS -> Casa via OpenSSH | one-shot de PIDs (somente leitura).
# Owner: scripts/casa/ | reutiliza os SSH, Tailscale e chaves ja existentes.
# Nao instala, nao gera credenciais, nao altera sshd/firewall e nao toca em processos.
[CmdletBinding()]
param()
Set-StrictMode -Version 2.0
$ErrorActionPreference = 'Stop'

$VpsAlias = 'segredo-vpss'
$CasaIp = '100.123.93.25'
$VpsIp = '100.90.199.124'
$ExistingIdentity = '/root/.ssh/segredo_vps_ed25519'
$ExpectedIdentityFingerprint = 'SHA256:UYVhuwigeIYOgnezudoEURf6BCXYz9CNajgmOO9MKEk'
$Target = 'Administrador@' + $CasaIp

function Fail([string]$Code) {
    Write-Output ('VPS_TO_CASA_PID=FAIL CODE=' + $Code)
    exit 1
}

$ssh = Get-Command ssh.exe -CommandType Application -ErrorAction SilentlyContinue
if (-not $ssh) { Fail 'WINDOWS_SSH_CLIENT_NOT_FOUND' }
$Hop = @(
    '-o','BatchMode=yes',
    '-o','StrictHostKeyChecking=yes',
    '-o','ConnectTimeout=10',
    $VpsAlias
)

function Read-FromVps([string]$Command, [string]$Code) {
    $previous = $ErrorActionPreference
    $ErrorActionPreference = 'Continue'
    try {
        $result = @( & $script:ssh.Source @script:Hop $Command 2>&1 | ForEach-Object { [string] $_ } )
        $exitCode = $LASTEXITCODE
    } finally {
        $ErrorActionPreference = $previous
    }
    if ($exitCode -ne 0) {
        Write-Output ('DIAGNOSTIC=' + ($result | Select-Object -Last 2 | Out-String).Trim())
        Fail $Code
    }
    return $result
}

$vpsAddress = @(Read-FromVps 'tailscale ip -4' 'VPS_TAILSCALE_CHECK_FAILED')
if (($vpsAddress -join [Environment]::NewLine) -notmatch [regex]::Escape($VpsIp)) { Fail 'UNEXPECTED_VPS_TAILSCALE_IP' }
Write-Output ('VPS_TAILSCALE=PASS VPS=' + $VpsIp)

$pubPath = $ExistingIdentity + '.pub'
$pubCheck = @(Read-FromVps ('ssh-keygen -lf ' + $pubPath + ' -E sha256') 'VPS_PUBLIC_KEY_FINGERPRINT_FAILED')
if (($pubCheck -join [Environment]::NewLine) -notmatch [regex]::Escape($ExpectedIdentityFingerprint)) { Fail 'VPS_PUBLIC_IDENTITY_MISMATCH' }
Write-Output ('REUSED_KEY=PASS PATH=' + $ExistingIdentity)

# Executa comandos no Windows por meio do SSH existente na VPS.
# -i impede o cliente Linux de escolher uma chave diferente.
$Reverse = 'ssh -i ' + $ExistingIdentity +
    ' -o IdentitiesOnly=yes -o BatchMode=yes -o NumberOfPasswordPrompts=0' +
    ' -o PreferredAuthentications=publickey -o PasswordAuthentication=no' +
    ' -o StrictHostKeyChecking=yes -o HostKeyAlgorithms=ssh-ed25519' +
    ' -o ConnectTimeout=8 ' + $Target + ' '

$principalLines = @(Read-FromVps ($Reverse + 'whoami') 'REVERSE_SSH_AUTH_FAILED')
$principal = (($principalLines | Where-Object { $_ -match 'segredo\\administrador' } | Select-Object -Last 1) -join '').Trim()
if ($principal -notmatch '^segredo\\administrador$') { Fail 'REVERSE_SSH_WRONG_PRINCIPAL' }
Write-Output ('VPS_TO_CASA_SSH_AUTH=PASS USER=' + $principal)

$processLines = @(Read-FromVps ($Reverse + 'Get-Process') 'REVERSE_PIDS_READ_FAILED')
if (($processLines -join [Environment]::NewLine) -notmatch '\bProcessName\b') { Fail 'PROCESS_HEADER_MISSING' }
$rows = @($processLines | Where-Object { $_ -match '^\s*\d+\s+\d+' })
if ($rows.Count -lt 1) { Fail 'NO_PROCESS_ROWS' }
Write-Output 'PID_SAMPLE_BEGIN'
$rows | Select-Object -First 10 | ForEach-Object { Write-Output $_ }
Write-Output 'PID_SAMPLE_END'
Write-Output ('VPS_TO_CASA_PID=PASS COUNT=' + $rows.Count)
