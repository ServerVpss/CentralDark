param(
    [string]$RuntimeRoot = "$env:LOCALAPPDATA\CentralDark\Remote-Tray"
)

$ErrorActionPreference = "Stop"
$LoginUrl = "https://mcp.desktopcommander.app/device/verify"
$Receipt = Join-Path $RuntimeRoot "receipts\latest.json"
$Canonical = Join-Path $PSScriptRoot "REMOTE-TRAY-STATUS-CANONICO.md"

function Header {
    Clear-Host
    Write-Host "╔══════════════════════════════════════════════╗"
    Write-Host "║ CENTRALDARK REMOTE TRAY · MENU OPERACIONAL  ║"
    Write-Host "╚══════════════════════════════════════════════╝"
    Write-Host ""
    Write-Host "Runtime: $RuntimeRoot"
    Write-Host ""
}

function Confirm-Critical([string]$Message) {
    Write-Host ""
    $c = Read-Host "[!] $Message - digite ! para confirmar"
    return ($c -eq "!")
}

function Latest-Log {
    $dirs = @(
        (Join-Path $RuntimeRoot "logs"),
        (Join-Path $RuntimeRoot "receipts"),
        $RuntimeRoot
    ) | Where-Object { Test-Path $_ }

    $logs = foreach ($d in $dirs) {
        Get-ChildItem -LiteralPath $d -File -ErrorAction SilentlyContinue |
            Where-Object { $_.Extension -in ".log",".txt" }
    }

    return $logs | Sort-Object LastWriteTime -Descending | Select-Object -First 1
}

function Show-State {
    Header
    Write-Host "STATUS"
    Write-Host "------"
    Write-Host ("Runtime existe : " + (Test-Path $RuntimeRoot))
    Write-Host ("Receipt existe : " + (Test-Path $Receipt))

    $log = Latest-Log
    if ($log) {
        Write-Host ("Log mais novo  : " + $log.FullName)
        Write-Host ("Atualizado     : " + $log.LastWriteTime)
    } else {
        Write-Host "Log mais novo  : UNKNOWN"
    }

    if (Test-Path $Receipt) {
        try {
            $r = Get-Content -Raw -LiteralPath $Receipt | ConvertFrom-Json
            Write-Host ("Veredito       : " + $r.summary.verdict)
            Write-Host ("Wrapper        : " + $r.runtime.wrapper_state)
            Write-Host ("Sensor         : " + $r.runtime.sensor_state)
            Write-Host ("Online provado : " + $r.runtime.online_proved)
        } catch {
            Write-Host "Receipt inválido: QUEBRADO"
        }
    }

    Write-Host ""
    Write-Host "PROCESSO_ATIVO != DEVICE_ONLINE"
    Write-Host "UNKNOWN != PASS"
    Read-Host "Enter para voltar" | Out-Null
}

function Copy-DeviceCode {
    $log = Latest-Log
    if (-not $log) {
        Write-Host "Nenhum log encontrado."
        return
    }

    $text = Get-Content -Raw -LiteralPath $log.FullName
    $m = [regex]::Match($text, '\b[A-Z0-9]{4}-[A-Z0-9]{4}\b')
    if ($m.Success) {
        Set-Clipboard $m.Value
        Write-Host "Código copiado: $($m.Value)"
    } else {
        Write-Host "Código não encontrado. Estado: EVIDENCIA_FALTANTE"
    }
}

function Reconnect-Remote {
    if (-not (Confirm-Critical "Reconectar Remote")) { return }

    $existing = Get-CimInstance Win32_Process -ErrorAction SilentlyContinue |
        Where-Object {
            $_.CommandLine -match 'desktop-commander' -and
            $_.CommandLine -match '\bremote\b'
        }

    if ($existing) {
        Write-Host "Remote já possui processo ativo. Não foi criado concorrente."
        Write-Host "ONE_REMOTE_PROCESS_PER_PROFILE=true"
        return
    }

    $npx = (Get-Command npx.cmd -ErrorAction SilentlyContinue).Source
    if (-not $npx) { $npx = (Get-Command npx -ErrorAction SilentlyContinue).Source }
    if (-not $npx) {
        Write-Host "npx não encontrado. QUEBRADO."
        return
    }

    New-Item -ItemType Directory -Force -Path (Join-Path $RuntimeRoot "logs") | Out-Null
    $stamp = Get-Date -Format "yyyyMMdd-HHmmss"
    $logPath = Join-Path $RuntimeRoot "logs\desktop-commander-$stamp.log"

    $cmd = "`"$npx`" --yes @wonderwhy-er/desktop-commander@latest remote *> `"$logPath`""
    Start-Process powershell.exe -ArgumentList "-NoProfile","-WindowStyle","Hidden","-Command",$cmd
    Write-Host "Remote iniciado sob supervisão local."
    Write-Host "LOG=$logPath"
}

while ($true) {
    Header
    Write-Host "[1] Estado geral"
    Write-Host "[2] Abrir login Remote"
    Write-Host "[3] Copiar código Remote"
    Write-Host "[4] Abrir log atual"
    Write-Host "[5] Abrir receipt JSON"
    Write-Host "[6] Reconectar Remote"
    Write-Host "[7] Rodar testes do pacote"
    Write-Host "[8] Abrir runtime local"
    Write-Host "[9] Ver contrato canônico"
    Write-Host "[0] Sair"
    Write-Host ""
    $op = Read-Host "Escolha"

    switch ($op) {
        "1" { Show-State }
        "2" { Start-Process $LoginUrl }
        "3" { Copy-DeviceCode; Read-Host "Enter para voltar" | Out-Null }
        "4" {
            $log = Latest-Log
            if ($log) { Start-Process notepad.exe $log.FullName }
            else { Write-Host "Nenhum log encontrado."; Start-Sleep 2 }
        }
        "5" {
            if (Test-Path $Receipt) { Start-Process notepad.exe $Receipt }
            else { Write-Host "Receipt ainda não existe."; Start-Sleep 2 }
        }
        "6" { Reconnect-Remote; Read-Host "Enter para voltar" | Out-Null }
        "7" {
            $test = Join-Path $PSScriptRoot "harness\RUN-TESTS.ps1"
            if (Test-Path $test) { & $test }
            else { Write-Host "Harness não veio neste pacote de contrato." }
            Read-Host "Enter para voltar" | Out-Null
        }
        "8" {
            New-Item -ItemType Directory -Force -Path $RuntimeRoot | Out-Null
            Start-Process explorer.exe $RuntimeRoot
        }
        "9" {
            if (Test-Path $Canonical) { Start-Process notepad.exe $Canonical }
        }
        "0" { break }
        default { Write-Host "Opção inválida."; Start-Sleep 1 }
    }
}
