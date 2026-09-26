# Verificação do Daemon Robusto (Auto-Destilador)

Este documento lista os pontos de verificação para garantir que o Auto-Destilador esteja operando conforme o padrão Daemon Robusto obrigatório.

## Checklist de Verificação

| Item | Como Verificar | Esperado |
|------|----------------|----------|
| **Signal Handlers** | Observe logs ao enviar SIGTERM/SIGINT (ex: `taskkill /PID <pid>` ou `Ctrl+C` no terminal). | Log de shutdown graceful, cleanup de PID file e state save. |
| **Health Check HTTP** | `curl -s http://127.0.0.1:8788/health` | JSON com `"proved": true`, detalhes incluindo `watcher_active: true`, timestamp ISO8601, sha256 dos detalhes. |
| **Auto‑Restart Watchdog** | Mate o processo observer (ex: terminando a thread) ou simule travamento. Após ~30s, o watchdog deve reiniciar o observer e logar "Observer reiniciado com sucesso". | Log de restart do observer, processo continua. |
| **PID File + atexit** | Verifique existência de `<NUCLEO>/auto-destilador.pid` contendo o PID atual. Ao encerrar o processo normalmente, o arquivo deve ser removido. | PID file presente enquanto rodando, ausente após saída limpa. |
| **Logging Persistente** | Confira `<NUCLEO>/auto-destilador.log` com entradas de timestamp, nível e mensagem. Também deve haver saída no stdout/stderr quando não em modo silencioso. | Logs crescentes com dados de uptime, processamento, eventos de watchdog. |
| **Auto‑Save State (60s)** | Observe `<NUCLEO>/auto-destilador-state.json` sendo atualizado a cada minuto com campos `running`, `uptime_seconds`, `processed_count`, `sha256` e `proved: true`. | Estado salvo com prova a cada intervalo. |
| **Watcher Ativo** | No health check, `details.watcher_active` deve ser `true`. Também pode-se checar se o processo tem threads watchdog ativas. | `true` enquanto monitorando caminhos. |

## Comandos de Verificação Rápida

```bash
# Health check
curl -s http://127.0.0.1:8788/health | jq .

# Verificar PID file
type E:\CentralDark\Pivete\NUCLEO\auto-destilador.pid

# Verificar log (últimas 10 linhas)
Get-Content -Tail 10 E:\CentralDark\Pivete\NUCLEO\auto-destilador.log

# Verificar state
type E:\CentralDark\Pivete\NUCLEO\auto-destilador-state.json | jq .
```

## Procedimento em Caso de Falha

Se algum item falhar, siga a ordem de remediação do skill:
1. **Override Flags** (ex: `--no-debounce`, `--sync-zip`) – sem mutação de config.
2. **Single Package Install** (reinstalar watchdog, pillow etc.) – preserva lock.
3. **Config Fix** na camada correta (profile > project > global).
4. **REBUILD** do venv (recria site‑packages).
5. **LOCKFILE REGENERATION** (último recurso antes de nuclear).
6. **NUCLEAR** (remove venv + lockfile) – apenas com causa provada + rollback.

> **Nota:** Nunca pule para etapas destrutivas sem prova de que as anteriores são insuficientes.

---
*Este documento é gerado a partir da lição aprendida em sessão 2026-08-26, onde o usuário exigiu a ativação do auto‑destilador e demais ações autônomas.*