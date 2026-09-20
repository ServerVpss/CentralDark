# MICRO-HANDOFF — health/deep 89, causa real

Data: 2026-09-20

Leitura completa de `http://127.0.0.1:9100/health/deep`:

```text
status=degraded
score=89
criticalFailures=[]
toolCount=116
telegram_bot.ok=false
telegram_bot.tokenPresente=false
github_api.ok=true
oauth.ok=true
sse.ok=true
disk_logs.ok=true
memoria.ok=true
loadavg.ok=true
hub_mission_consumer.ok=true
hub_mission_consumer.lastError=HUB_POSTGREST_403 permission denied for view hub_missions
```

Meta-Grill:

1. O desconto explícito do score é Telegram ausente no ambiente do MCP.
2. O consumer carrega erro PostgREST 403 apesar de `ok=true`; portanto seu verde precisa ser contraprova, não aceito nominalmente.
3. `criticalFailures=[]` não significa fixed point global.

`HEALTH_DEEP_SCORE_SOURCE=MEASURED`
`TELEGRAM_RUNTIME_BINDING_GAP=PROVED`
`HUB_CONSUMER_GREEN_CONSISTENCY=UNPROVED`

Próximo cursor: localizar somente nomes/fontes de configuração de Telegram e Hub no runtime/source, sem expor segredo, e corrigir o binding existente.
