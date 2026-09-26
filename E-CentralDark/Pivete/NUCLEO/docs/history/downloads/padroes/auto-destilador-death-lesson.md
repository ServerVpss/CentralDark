# Auto-Destilador Death Lesson — Terminal Background Process Dies Silently

**Data:** 2026-08-23
**Descoberta:** O Auto-Destilador rodava em `background=true` sem `notify_on_complete=true`. Quando o usuário fechou o terminal/sessão, o processo morreu silenciosamente — sem crash log, sem Application Error no Windows Event Viewer, apenas parou de processar arquivos.

## Evidência
- Último CARVE às 02:15:31
- Nenhum novo CARVE após isso
- Processos MCP/BFF continuaram rodando (infra sobreviveu, coordenação morreu)
- Nenhum erro no Windows Event Viewer (Application/System logs limpos para Python)

## Causa Raiz
Background terminal session morreu → processo órfão morreu junto. O `background=true` sem `notify_on_complete=true` faz o processo depender da vida da sessão terminal.

## Correção Definitiva
Mover para Daemon Robusto completo com:
1. Signal handlers (SIGTERM, SIGINT, SIGHUP)
2. Health Check HTTP (`/health` com prova)
3. Auto-Restart Watchdog (loop 30s)
4. PID File + atexit cleanup
5. Logging Persistente (FileHandler + StreamHandler)
6. Auto-Save State a cada 60s com prova

## Regra
`background=true` SEMPRE com `notify_on_complete=true` OU usar Daemon Robusto completo.
Processo de longa duração NUNCA deve depender de sessão terminal.

---

## Lições Cristalizadas

1. **Background terminal session morre com a sessão** → `notify_on_complete=true` OBRIGATÓRIO
2. **Processo órfão sem sinal** → Signal handlers (SIGTERM/SIGINT) obrigatórios
3. **Sem log de morte** → Logging to file + pidfile obrigatório
4. **Auto-restart** → systemd / nssm / supervisor para produção

## Correção Aplicada no `auto_destilador.py`
- Signal handlers adicionados (SIGTERM/SIGINT)
- Logging to file + pidfile
- Graceful shutdown no observer

## Correção no Terminal Tool
```bash
# SEMPRE:
background=true, notify_on_complete=true
# NUNCA:
background=true sozinho
```