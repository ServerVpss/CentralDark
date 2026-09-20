# MICRO-HANDOFF — MCP reutiliza segredo por arquivo, sem duplicação no PM2

Data: 2026-09-20
PR-mãe: #1562

```text
PM2_APP=CentralDark-MCP
PM2_SCRIPT=/usr/bin/bash
PM2_STATUS=online
PM2_COMMAND_SOURCES:
  /root/CentralDark/apps/modulos/mcp/.env
  /root/CentralDark/secrets/telegram-alerts.env

TELEGRAM_ALIAS:
  TELEGRAM_BOT_TOKEN <- existing TELEGRAM_BOT_TOKEN
                     <- SRVER1_BOT_TOKEN
                     <- GUARDA_TELEGRAM_BOT_TOKEN

PM2_STORED_TELEGRAM_ENV_NAMES=EMPTY
SECRET_LITERAL_IN_PM2_CONFIG=false
PM2_SAVE=PASS
HEALTH_DEEP=healthy/100
```

Conclusão: o processo resolve a credencial diretamente do owner de secrets em cada start. O valor não foi copiado para Git nem armazenado como env explícito do PM2.

`REUSE_BEFORE_CREATE=PASS`
`NO_SECRET_DUPLICATION=PASS`
`RESTART_SURVIVAL_BINDING=PASS`
