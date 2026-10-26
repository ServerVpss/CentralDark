# CENTRALDARK — Ativar SSH Server da Casa Windows
# Somente inicia o servico existente. Nao instala, nao abre firewall, nao altera inicializacao.
$ErrorActionPreference = 'Stop'

function Escrever-Estado([string]$Mensagem) {
    Write-Host "[CENTRALDARK] $Mensagem"
}

try {
    $identidade = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($identidade)
    $administrador = $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

    if (-not $administrador) {
        Escrever-Estado 'Solicitando permissao de administrador para iniciar sshd...'
        $caminho = $PSCommandPath
        if ([string]::IsNullOrWhiteSpace($caminho)) {
            throw 'Salve este arquivo como .ps1 antes de executar.'
        }
        $argsElevados = '-NoProfile -ExecutionPolicy Bypass -File "' + $caminho.Replace('"', '""') + '"'
        $elevado = Start-Process -FilePath 'powershell.exe' -Verb RunAs -ArgumentList $argsElevados -Wait -PassThru
        exit $elevado.ExitCode
    }

    $servico = Get-Service -Name 'sshd' -ErrorAction SilentlyContinue
    if ($null -eq $servico) {
        Escrever-Estado 'BLOQUEADO: servico sshd nao instalado no Windows. Nada foi alterado.'
        exit 2
    }

    if ($servico.Status -ne 'Running') {
        Escrever-Estado 'Iniciando sshd...'
        Start-Service -Name 'sshd'
        $servico = Get-Service -Name 'sshd'
        $servico.WaitForStatus('Running', [TimeSpan]::FromSeconds(15))
    }

    $servico = Get-Service -Name 'sshd'
    if ($servico.Status -ne 'Running') {
        throw "sshd nao entrou em Running. Estado: $($servico.Status)"
    }
    Escrever-Estado 'OK: sshd esta RUNNING.'

    # Teste local: nao faz liberacao no firewall nem teste de acesso externo.
    try {
        $escuta = @(Get-NetTCPConnection -LocalPort 22 -State Listen -ErrorAction SilentlyContinue)
        if ($escuta.Count -gt 0) {
            Escrever-Estado 'OK: porta TCP 22 em LISTEN local.'
        } else {
            Escrever-Estado 'ATENCAO: sshd ativo, mas nao detectei LISTEN na porta 22. Conferir a configuracao do sshd.'
        }
    } catch {
        Escrever-Estado "Porta 22 nao verificada: $($_.Exception.Message)"
    }
    Escrever-Estado 'Firewall, Tailscale, chaves e inicializacao automatica nao foram alterados.'
    exit 0
} catch {
    Write-Host "[CENTRALDARK] ERRO: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
