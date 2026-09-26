# WORKSPACE ANCHORING FIX — Session 2026-08-24

## PROBLEMA
VS Code/terminal nasceu em `C:\Users\danda` mas o projeto está em `E:\CentralDark\Pivete\CentralDark`. O agente compactou/operou fora da Casa.

## CAUSA RAIZ
Terminal CWD não ancorado no workspace root. `terminal.integrated.cwd` não configurado.

## SOLUÇÃO APLICADA

### 1. VS Code Workspace Settings (`.vscode/settings.json`)
```json
{
  "terminal.integrated.cwd": "${workspaceFolder}",
  "python.analysis.exclude": [
    "**/.git/**",
    "**/node_modules/**",
    "**/.venv/**",
    "**/venv/**",
    "**/__pycache__/**",
    "**/dist/**",
    "**/build/**",
    "**/coverage/**"
  ],
  "files.watcherExclude": {
    "**/.git/objects/**": true,
    "**/node_modules/**": true,
    "**/.venv/**": true,
    "**/dist/**": true,
    "**/build/**": true
  },
  "search.exclude": {
    "**/node_modules": true,
    "**/.venv": true,
    "**/dist": true,
    "**/build": true
  }
}
```

### 2. Workspace File (`CentralDark.code-workspace`)
Adicionadas mesmas exclusões no nível do workspace multi-root.

### 3. Git Safe Directory
```bash
git config --global --add safe.directory "E:/CentralDark/Pivete/CentralDark"
```

### 4. Verificação
```powershell
Get-Location
# Deve retornar: E:\CentralDark\Pivete\CentralDark
```

## REGRA
```
CASA = E:\CentralDark\Pivete\CentralDark
WORKSPACE = E:\CentralDark\Pivete\CentralDark
TERMINAL_CWD = E:\CentralDark\Pivete\CentralDark
C:\Users\danda = PERFIL DO WINDOWS, NÃO CASA
```

## VALIDAÇÃO
```bash
cd /e/CentralDark/Pivete/CentralDark && git status --short --branch
# Deve mostrar branch correta e status limpo
```