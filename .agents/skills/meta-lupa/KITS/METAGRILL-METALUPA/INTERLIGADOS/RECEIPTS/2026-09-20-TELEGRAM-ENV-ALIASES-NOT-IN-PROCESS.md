# MICRO-HANDOFF — aliases de token Telegram não estão no ambiente dos processos

Data: 2026-09-20

Probe corrigido, lendo apenas NOMES de variáveis:

```text
CentralDark-HubBot: TELEGRAM_CHAT_ID
SRVER1_BOT_TOKEN: não apareceu em nenhum processo vivo
TELEGRAM_BOT_TOKEN: não apareceu em nenhum processo vivo
TELEGRAM_TOKEN: não apareceu
GUARDA_TELEGRAM_BOT_TOKEN: não apareceu
SECRET_VALUE_EXPOSED=false
```

Isso prova que o health baseado em `process.env` do MCP não pode representar sozinho a saúde real do Telegram. O HubBot pode carregar credencial por outra fonte ou operar via conector; isso ainda precisa de prova.

`TELEGRAM_ENV_BINDING_IN_PM2_PROCESSES=ABSENT`
`TELEGRAM_SUBSYSTEM_DOWN=NOT_PROVED`

Próximo cursor: medir o próprio HubBot (script/config/log/endpoint) e corrigir o health para medir realidade, não apenas variável local do MCP.
