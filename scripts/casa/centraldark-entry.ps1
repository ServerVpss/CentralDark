# CentralDark Casa/VS Code — adaptador da entrada !CENTRALDARK.
# Reutiliza o alias SSH autorizado Segredo-VPS. O estado da missão fica na VPS.
# Sem credenciais no script; sem checkpoint/memória paralela no Windows.
[CmdletBinding()]
param(
    [ValidateSet('status','continue','prompt')]
    [string]$Action = 'status'
)
$ErrorActionPreference = 'Stop'
$ssh = Get-Command ssh -ErrorAction SilentlyContinue
if (-not $ssh) {
    Write-Output '{"ok":false,"state":"SSH_NOT_AVAILABLE_ON_CASA"}'
    exit 4
}
$remote = '/root/.hermes/centraldark/bin/centraldark-entry.py'
$actionArgs = switch ($Action) {
    'continue' { '--continue' }
    'prompt' { '' }
    default { '--status' }
}
$argumentos = @('-o','BatchMode=yes','-o','ConnectTimeout=5','-o','StrictHostKeyChecking=yes','Segredo-VPS',
    ('python3 ' + $remote + $(if ($actionArgs) { ' ' + $actionArgs } else { '' })))
try {
    $result = & $ssh.Source @argumentos 2>&1
    $exitCode = $LASTEXITCODE
    if ($exitCode -ne 0) {
        Write-Output '{"ok":false,"state":"VPS_PRIVATE_ROUTE_UNREACHABLE"}'
        exit 4
    }
    foreach ($line in $result) { Write-Output $line }
}
catch {
    Write-Output '{"ok":false,"state":"VPS_PRIVATE_ROUTE_UNREACHABLE"}'
    exit 4
}
