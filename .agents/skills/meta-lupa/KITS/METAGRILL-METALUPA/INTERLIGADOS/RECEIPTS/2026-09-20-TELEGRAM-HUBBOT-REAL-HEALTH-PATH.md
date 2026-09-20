# MICRO-HANDOFF — caminho real de saúde do HubBot

Data: 2026-09-20

Source canônico do HubBot provou:

```text
loads /root/CentralDark/secrets/telegram-alerts.env
TOKEN = SRVER1_BOT_TOKEN || TELEGRAM_BOT_TOKEN || GUARDA_TELEGRAM_BOT_TOKEN
webhook default port = 9500
GET /bot/health => {ok:true, mode:webhook, bot:@srver1bot}
fallback = polling
```

Isso explica por que `/proc/<pid>/environ` pode não refletir a credencial carregada pelo próprio Node após iniciar.

`MCP_LOCAL_ENV_CHECK != TELEGRAM_SUBSYSTEM_HEALTH`

Próximo cursor: testar 9500/bot/health e logs/mode do HubBot. Se vivo, corrigir health-deep para usar evidência de subsistema em vez de falso-negativo local.
