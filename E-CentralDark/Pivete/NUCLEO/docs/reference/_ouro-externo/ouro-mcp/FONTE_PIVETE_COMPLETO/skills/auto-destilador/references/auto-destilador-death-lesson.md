# Auto-Destilador Death Lesson — Terminal Background Process Dies Silently

## Descoberta
**Data:** 2026-08-23
**Problema:** O Auto-Destilador rodava em `background=true` sem `notify_on_complete=true`. Quando o usuário fechou o terminal/sessão, o processo morreu silenciosamente — sem crash log, sem Application Error no Windows Event Viewer, apenas parou de processar arquivos.

## Evidência
- Último CARVE às 02:15:31
- Nenhum novo CARVE após isso
- Processos MCP/BFF continuaram rodando (infra sobreviveu, coordenação morreu)
- Nenhum Python crash no Windows Event Log
- Processo simplesmente sumiu

## Causa Raiz
```
AUTO-DESTILADOR RODAVA EM BACKGROUND TERMINAL SESSION
         ↓
VOCÊ FECHOU O TERMINAL / SESSÃO / JANELA
         ↓
BACKGROUND PROCESS MORREU JUNTO (orphaned)
         ↓
ÚLTIMO CARVE ÀS 02:15:31 = ÚLTIMO ARQUIVO PROCESSADO
         ↓
PROCESSO MORREU SEM CRASH, SEM LOG, SEM ERRO
```

## Correção Definitiva
Mover para **Daemon Robusto** (Liçao 26 — Padrão Obrigatório) com:
1. Signal handlers (SIGTERM/SIGINT/SIGHUP)
2. Health check HTTP (porta 8788)
3. Auto-restart observer watchdog (30s)
4. PID file management + atexit cleanup
5. Logging persistente (arquivo + stdout)
6. Auto-save state a cada 60s com prova

## Regra
`background=true` SEMPRE com `notify_on_complete=true` OU usar Daemon Robusto completo. Processo de longa duração NUNCA deve depender de sessão terminal.

## Evidência da Correção
- Daemon rodando com PID 38188
- Health check porta 8788 retornando `proved: true`
- Auto-restart observer watchdog ativo (30s)
- PID file gerenciado
- Logging persistente (arquivo + stdout)
- Auto-save state a cada 60s com SHA256 + timestamp ISO8601
- CARVE entries continuando a ser gerados