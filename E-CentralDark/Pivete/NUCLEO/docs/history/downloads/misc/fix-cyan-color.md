# Fix Cyan Color — Terminal/Editor Config (2026-08-22)

## Problema

Cyan excessivo no terminal/editor causando fadiga visual ("parecendo que tem grau").

## Causa

Tema do terminal/editor (Windows Terminal, VS Code, PowerShell) com cyan agressivo — **não é vírus, não é arquivo, é configuração de cor**.

## Solução Aplicada

### Windows Terminal
- Color scheme → **Campbell** (menos cyan)
- Via `settings.json` → `profiles.defaults.colorScheme: "Campbell"`

### PowerShell
```powershell
$Host.UI.RawUI.BackgroundColor = "Black"
$Host.UI.RawUI.ForegroundColor = "White"
```

### VS Code
```json
{
    "workbench.colorTheme": "Default Dark+",
    "terminal.integrated.colorScheme": "Campbell",
    "editor.tokenColorCustomizations": {
        "textMateRules": [
            { "scope": "constant.language", "settings": { "foreground": "#666666" } }
        ]
    }
}
```

### PowerShell — Opção Nuclear
```powershell
$env:TERM = "dumb"  # Desabilita cores ANSI completamente
```

### Script Automatizado
Script `fix-cyan-color.ps1` em `hermes-runtime-hooks/` — aplica tudo automaticamente.

## Regra

**Cyan forte = configuração de tema, não arquivo, não vírus. Ajuste no tema/terminal, não no código.**