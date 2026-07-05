# 🔍 Hermes Log-Verificador

Agente da rede HERMES-CORE que **vigia 24h os logs PM2 de todos os processos** da VPS
e reage sozinho a padrões de erro. Plugado na mesma rede especialista do Hermes
(mesmo padrão dos agentes `Auto-Diagnostico` e `Deploy-Watcher`).

## O que ele faz

- **Escaneia** todos os processos PM2 a cada **60 segundos** (ignora `whatsapp-server` id 1).
- Para cada processo, lê `~/.pm2/logs/<nome>-error.log` e classifica em: `ok` / `aviso` / `erro`.
- **Detecta padrões** graves: `FATAL`, `unhandled rejection`, `uncaught exception`, `ENOSPC`,
  `EACCES`, `ECONNREFUSED`, `ETIMEDOUT`, `Segmentation fault`, `out of memory`,
  `permission denied`.
- **Detecta crash-loop**: processo `online` com uptime < 5min E restarts > 20.
- **Notifica só o que mudou** (não repete o mesmo alerta) — Card Hermes no admin.
- **Envia trecho suspeito pro DarkAI** (Gemini flash) e junta a análise no card.
- **Auto-restart inteligente**: em crash-loop ou `errored` roda `pm2 restart` **uma vez**,
  com **cooldown 30min** e **limite 3 restarts / 24h** por serviço. Passou disso, para
  e chama o Pivete.
- **Placar horário**: a cada 1h manda resumo completo (`✅ OK` / `⚠️ aviso` / `❌ erro`).
- **Recuperação**: quando serviço volta ao normal, manda `✅ voltou`.

## Arquivos

| Arquivo | Papel |
|---------|-------|
| `agent.mjs`   | Funções puras: `escanear()`, `autoRestart()`, `analisarComIA()`, `resumoHorario()`. Testável isolada. |
| `daemon.mjs`  | Loop PM2 que orquestra as funções acima. Notifica via `HERMES-CORE/utils/notify.mjs`. |
| `.estado.json`| Persistido pelo daemon (alertas ativos, timestamps) — sobrevive a restart. |

## Rede especialista

Convive com os outros agentes do HERMES-CORE sem sobrepor função:

| Agente | Função |
|--------|--------|
| `Auto-Diagnostico`  | pendências em `docs/PENDENCIAS.md` + `pm2 jlist` pontual |
| `Deploy-Watcher`    | git local vs `origin/main` + estado PM2 pós-deploy |
| **`Log-Verificador`** | **conteúdo dos logs 24h, padrões, auto-restart, análise IA** |
| `Executor`, `Critic`, `Knowledge-Collector` | núcleo de execução de missões |

## Registrar no PM2 (rodar 1x na VPS após sync)

```bash
pm2 start /root/CentralDark/apps/modulos/HERMES-CORE/agents/Log-Verificador/daemon.mjs \
  --name CentralDark-HermesVerificador --time
pm2 save
```

Não altera `ecosystem.config.cjs` (área protegida). Se der problema, remove com:
```bash
pm2 delete CentralDark-HermesVerificador && pm2 save
```

## Uso manual (CLI)

```bash
# Snapshot completo agora
node /root/CentralDark/apps/modulos/HERMES-CORE/agents/Log-Verificador/agent.mjs

# Só o placar
node .../agent.mjs resumo

# Forçar restart de um serviço (respeitando trava)
node .../agent.mjs restart CentralDark-EliteAnthropic
```

## Requisitos

- `DARKAI_URL` e `DARKAI_ANON_KEY` no `/root/CentralDark/.env` (opcional — sem eles,
  a análise IA é pulada, resto funciona normal).
- `HERMES-CORE/utils/notify.mjs` presente (fallback pra `console.log` se ausente).
