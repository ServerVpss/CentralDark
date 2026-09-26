# PADRÕES CANÔNICOS

## Extraídos da Sessão

| Padrão | Descrição | Status |
|--------|-----------|--------|
| PROFILE_TOP_LEVEL_MAP | Mapa do nível raiz do perfil | DEFINIDO |
| RESERVED_ENTRY_NUL_DIAGNOSTIC | Diagnóstico sem acessar NUL | 3 VERSÕES |
| BASH_MSYS_TO_SINGLE_POWERSHELL | Wrapper de transporte | VALIDADO |
| UIA_TEXTPATTERN_READ | Leitura de tela via UIAutomation | CANDIDATE |

---

## Definição: PROFILE_TOP_LEVEL_MAP

```
INPUT: Caminho do perfil
OUTPUT: TSV com Name, Length, LastWriteTime, Attributes
LIMITE: 100 entradas
SANITIZAÇÃO: Escape de tabs
```

---

## Definição: RESERVED_ENTRY_NUL_DIAGNOSTIC

```
OBJETIVO: Detectar entrada com nome reservado (NUL)
TÉCNICA: Enumerar sem Get-Item
META: Capturar Name, codepoints, tipo .NET
LIMITE: 180 linhas máximo
REQUISITO: Dispose determinístico
```

---

## Definição: BASH_MSYS_TO_SINGLE_POWERSHELL

```
PROBLEMA: PowerShell inline falha com tokenização
SOLUÇÃO: Um powershell.exe por chamada
MODO: -NoProfile -NonInteractive -Command "..."
PROIBIDO: heredoc, segundo shell, Python interno
```

---

## Quando Usar

| Situação | Padrão |
|----------|--------|
| Mapear perfil | PROFILE_TOP_LEVEL_MAP |
| Detectar NUL | RESERVED_ENTRY_NUL_DIAGNOSTIC |
| Comando Windows | BASH_MSYS_TO_SINGLE_POWERSHELL |
| Ler tela | UIA_TEXTPATTERN_READ |
