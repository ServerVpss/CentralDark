<# 
.SYNOPSIS
    Fix Cyan Color Issue - Windows Terminal / PowerShell / VS Code
.DESCRIPTION
    Aplica configuracoes para reduzir/eliminar cyan excessivo no terminal.
    Rodar como Administrador para aplicar no Windows Terminal.
.NOTES
    Autor: Hermes Regenerative Runtime
    Data: 2026-08-22
#>

Write-Host "FIX CYAN COLOR - Windows Terminal / PowerShell / VS Code" -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Green

# 1. WINDOWS TERMINAL - Aplica colorScheme "Campbell" (menos cyan)
Write-Host "`n[1] Configurando Windows Terminal..." -ForegroundColor Cyan

$wtSettingsPath = "$env:LOCALAPPDATA\Packages\Microsoft.WindowsTerminal_8wekyb3d8bbwe\LocalState\settings.json"

if (Test-Path $wtSettingsPath) {
    $settings = Get-Content $wtSettingsPath -Raw | ConvertFrom-Json
    
    # Backup
    $backupPath = "$wtSettingsPath.backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
    Copy-Item $wtSettingsPath $backupPath -Force
    Write-Host "   Backup criado: $backupPath" -ForegroundColor Green
    
    # Aplica colorScheme Campbell nos defaults
    if ($null -eq $settings.profiles.defaults) {
        $settings.profiles.defaults = @{}
    }
    $settings.profiles.defaults.colorScheme = "Campbell"
    
    # Salva
    $settings | ConvertTo-Json -Depth 10 | Set-Content $wtSettingsPath -Encoding UTF8
    Write-Host "   Windows Terminal: colorScheme = 'Campbell' aplicado" -ForegroundColor Green
} else {
    Write-Host "   Windows Terminal nao encontrado em: $wtSettingsPath" -ForegroundColor Yellow
}

# 2. POWERSHELL - Remove cyan do prompt atual
Write-Host "`n[2] Configurando PowerShell atual..." -ForegroundColor Cyan

try {
    $Host.UI.RawUI.BackgroundColor = "Black"
    $Host.UI.RawUI.ForegroundColor = "White"
    Clear-Host
    Write-Host "   PowerShell: Background=Black, Foreground=White" -ForegroundColor Green
} catch {
    Write-Host "   Nao foi possivel alterar cores do PowerShell: $_" -ForegroundColor Yellow
}

# 3. VS CODE - Sugestao de settings.json
Write-Host "`n[3] VS Code - Adicione ao seu settings.json:" -ForegroundColor Cyan

$vscodeSettings = @"
{
    "workbench.colorTheme": "Default Dark+",
    "terminal.integrated.colorScheme": "Campbell",
    "editor.tokenColorCustomizations": {
        "textMateRules": [
            { "scope": "constant.language", "settings": { "foreground": "#666666" } }
        ]
    }
}
"@

Write-Host $vscodeSettings -ForegroundColor Gray
Write-Host "`n   Copie o acima para: Ctrl+Shift+P > 'Open User Settings (JSON)'" -ForegroundColor Yellow

# 4. Opcao Nuclear - Desabilita cores ANSI
Write-Host "`n[4] Opcao Nuclear - Desabilitar cores ANSI (TERM=dumb):" -ForegroundColor Cyan
Write-Host "   $env:TERM = 'dumb'  # Desabilita cores ANSI" -ForegroundColor Gray
Write-Host "   # Ou no perfil do PowerShell: $env:TERM = 'dumb'" -ForegroundColor Gray

# RESUMO
Write-Host "`n" + "="*60 -ForegroundColor Green
Write-Host "FIX CYAN CONCLUIDO" -ForegroundColor Green
Write-Host "="*60 -ForegroundColor Green
Write-Host ""
Write-Host "Windows Terminal: colorScheme = 'Campbell'" -ForegroundColor Green
Write-Host "PowerShell: Background=Black, Foreground=White" -ForegroundColor Green
Write-Host "VS Code: Copie as configuracoes acima para settings.json" -ForegroundColor Green
Write-Host ""
Write-Host "REINICIE O TERMINAL / VS CODE PARA APLICAR" -ForegroundColor Yellow
Write-Host ""
Write-Host "Se ainda tiver cyan forte:" -ForegroundColor Cyan
Write-Host "   1. Tema do monitor: reduza brilho/contraste" -ForegroundColor Gray
Write-Host "   2. Windows: Configuracoes > Sistema > Tela > Luz noturna (ativar)" -ForegroundColor Gray
Write-Host "   3. Driver de video: verifique calibracao de cores" -ForegroundColor Gray
Write-Host ""

Write-Host "Pressione ENTER para sair..." -ForegroundColor Cyan
Read-Host | Out-Null