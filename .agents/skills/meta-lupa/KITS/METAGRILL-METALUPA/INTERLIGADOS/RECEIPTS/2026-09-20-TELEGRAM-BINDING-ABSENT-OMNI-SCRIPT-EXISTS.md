# MICRO-HANDOFF — Telegram binding ausente / Omni source executável

Data: 2026-09-20

Medição por NOMES de variáveis, sem valores:

```text
CentralDark-HubBot: TELEGRAM_CHAT_ID presente
CentralDark-MCP: TELEGRAM_BOT_TOKEN/TELEGRAM_TOKEN ausentes
CentralDark-WebhookDeploy: Hub/Supabase bindings presentes
CentralDark-MCP: Hub/Supabase bindings presentes
SECRET_VALUE_EXPOSED=false
```

O script Omni existe e responde CLI:

```text
apps/modulos/elite-gateway/scripts/centraldark_omni_router.py
--self-test
--host
--port
```

Porta 8099 continua sem listener na última medição.

Interpretação:
- health/deep está correto ao marcar Telegram do MCP como ausente;
- existência de `TELEGRAM_CHAT_ID` no HubBot não prova token do bot;
- Omni source executável != Omni runtime vivo.

Próximo cursor: localizar contrato/startup canônico de Telegram e Omni no source; não fabricar segredo nem processo paralelo.
