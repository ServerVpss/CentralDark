# MICRO-HANDOFF — Telegram/Hub health corrigidos atomicamente

Data: 2026-09-20

Commit único na main:

```text
MAIN_COMMIT=0ca4d43883315a2ebc60a21368196bd4068bd68c
FILES=5
```

Alterações:
- `apps/bot-telegram/unified-bot.cjs`
  - registra último sucesso/erro Telegram;
  - expõe `/bot/health` também em polling;
  - health polling usa frescor de 90s.
- `apps/modulos/mcp/src|dist/health-deep.js`
  - mede o endpoint real do HubBot;
  - aliases de token canônicos viram apenas fallback local.
- `apps/modulos/mcp/src|dist/hub-mission-consumer.js`
  - poll bem-sucedido limpa `lastError` stale mesmo quando não há missão.

`SOURCE_AND_DIST_SAME_COMMIT=true`
`SECRET_VALUE_COPIED=false`
`RUNTIME_RESULT=UNKNOWN_UNTIL_DEPLOY`

Próximo cursor: sintaxe/teste no SHA exato → transferir SHA ao checkout VPS → restart HubBot/MCP → health/deep + counterproof.
