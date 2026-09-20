# MICRO-HANDOFF — health Telegram mede nomes incompletos

Data: 2026-09-20

Source canônico:

`apps/bot-telegram/unified-bot.cjs` resolve token por:

```text
SRVER1_BOT_TOKEN
→ TELEGRAM_BOT_TOKEN
→ GUARDA_TELEGRAM_BOT_TOKEN
```

Já `apps/modulos/mcp/src/health-deep.js` mede somente:

```text
TELEGRAM_BOT_TOKEN
TELEGRAM_TOKEN
```

Portanto `telegram_bot.ok=false` no health é candidato a falso-negativo do medidor.

`HEALTH_CHECK_TOKEN_ALIASES_INCOMPLETE=PROVED`
`BOT_RUNTIME_FAILURE=NOT_PROVED`

Próximo cursor: medir somente presença dos aliases canônicos nos processos vivos, sem valores; se `SRVER1_BOT_TOKEN` estiver no HubBot, corrigir health para refletir o subsistema real sem copiar segredo.
