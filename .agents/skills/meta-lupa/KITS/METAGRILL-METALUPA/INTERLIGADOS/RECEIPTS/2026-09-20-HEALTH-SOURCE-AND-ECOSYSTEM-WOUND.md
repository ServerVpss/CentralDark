# MICRO-HANDOFF — fonte do health + ferida ecosystem

Data: 2026-09-20

## Health

`health-deep.js` mede Telegram somente por:
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_TOKEN`

O consumer Hub usa Supabase service role e seu health atualmente considera fresco/idle suficiente, mesmo quando `lastError` contém erro antigo. O estado observado `idle + lastError=403` pode representar erro histórico não limpo; precisa de prova temporal.

## Nova ferida estrutural

A `main` atual possui `ecosystem.config.cjs` contendo apenas `CentralDark-ScreenPipe`. O runtime, porém, ainda tem MCP/Hermes/Webhook/etc em PM2 porque o daemon persistiu configuração anterior.

```text
SOURCE_ECOSYSTEM_APP_COUNT≈1
LIVE_PM2_HAS_MCP_HERMES_WEBHOOK=true
SOURCE_RUNTIME_MANIFEST != LIVE_PROCESS_SET
```

Isso é dívida de reboot/restart: um `pm2 start ecosystem.config.cjs` futuro não representa o corpo vivo atual.

`SOURCE != RUNTIME`
`CURRENT_RUNTIME_SURVIVES_BY_PERSISTED_PM2_STATE=true`
`FIXED_POINT=false`

Próximo cursor: verificar histórico do ecosystem + origem real dos bindings Telegram/MCP, sem ler valores secretos.
