# Claude Code Windows Pitfall — bloco Python no prompt causa loop

**Data:** 06/08/2026
**Sessão:** Pivete — teste dos 8 `reconcile_result()`
**Modelo:** deepseek/deepseek-v4-pro via Nous Portal

## O erro

`claude -p` com prompt contendo bloco de código Python multilinha é interpretado como Python interativo pelo MSYS/bash do Windows, causando loop infinito:

```
OSError: [WinError 123] A sintaxe do nome do arquivo...
OSError: [WinError 6] Identificador inválido
→ repete até timeout (120s)
```

O output atingiu **96,7 MB** antes do timeout. O erro não é do Claude — é do shell Windows interpretando o heredoc/Python inline como REPL.

## A correção

**NUNCA** embutir código Python dentro da string do prompt do `claude -p`.

**SEMPRE:**
1. Gravar o código em arquivo primeiro (ex. `/tmp/test_reconcile.py`)
2. Delegar SÓ execução: `claude -p "Run python /tmp/test_reconcile.py and report results" --allowedTools "Bash" --max-turns 3`

## Padrão universal

```
write_file → delegar execução → NUNCA embutir código no prompt
```

Aplicável a: `claude -p`, `codex`, `opencode`, qualquer CLI que aceite prompt com argumento string.