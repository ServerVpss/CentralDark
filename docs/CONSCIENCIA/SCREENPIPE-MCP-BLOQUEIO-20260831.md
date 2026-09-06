---
title: "Screenpipe MCP Bloqueio — 2026-08-31"
date: 2026-08-31
status: "BLOQUEADO"
owner: "SOL/Executor"
---

# Screenpipe MCP — Módulo Não Encontrado

## Diagnóstico

**Timestamp:** 2026-08-31T00:58:47Z
**Erro Exato:**
```
Cannot find module 'C:\Users\danda\AppData\Local\Temp\bunx-4230130355-screenpipe-mcp@latest\node_modules\screenpipe-mcp\dist\cli.js'
```

**Causa Raiz:**
- Bunx tenta instalar `screenpipe-mcp@latest` em temp dir
- Download/extração falha ou fica incompleto
- Cache do bunx fica corrompido
- Tentativa posterior encontra módulo faltando

**Prova:**
1. Screenpipe app (UI) instalado ✓ — `C:\Users\danda\AppData\Local\screenpipe\screenpipe-app.exe`
2. Bun executável presente ✓ — `C:\Users\danda\AppData\Local\screenpipe\bun.exe`
3. MCP screenpipe-mcp falha ✗ — módulo npm não resolvido
4. Limpar cache bunx exige `rm -rf ~/.bun/cache ~/.bunx` (bloqueado por permissions)

## Status

**BLOQUEADO**: MCP screenpipe-mcp não disponível como conector MCP.

## Workaround Ativo

### Opção 1: Screenpipe App Direto (Recomendado)
```bash
# Screenpipe UI já está rodando/disponível
"C:/Users/danda/AppData/Local/screenpipe/screenpipe-app.exe"

# CLI via ffmpeg/screenpipe binário:
"C:/Users/danda/AppData/Local/screenpipe/ffmpeg.exe"
"C:/Users/danda/AppData/Local/screenpipe/ffprobe.exe"
```

### Opção 2: Aguardar Fix de Bunx/NPM
- Atualizar bun para versão mais recente
- Purgar cache manualmente (não disponível em perms atuais)
- Reinstalar screenpipe-mcp manualmente

## Impacto

- **MCP Integration**: ✗ Não disponível
- **Screenpipe Functionality**: ✓ Disponível (UI/CLI)
- **Observabilidade**: Parcial (sem MCP de telemetria)
- **Recordings**: ✓ Funcional (app salva dados)

## Próximas Ações

1. ✓ Documentado bloqueio
2. ⏳ Investigar se MCP é crítico para missão ou decorativo
3. ⏳ Se crítico: escalar para limpeza manual de cache
4. ⏳ Se não crítico: usar screenpipe app direto

## Referências

- Screenpipe install: `C:\Users\danda\AppData\Local\screenpipe\`
- Bloqueio bunx cache: `C:\Users\danda\AppData\Local\Temp\bunx-*`
- Histórico erro: Logs 2026-08-31T00:58:47Z
