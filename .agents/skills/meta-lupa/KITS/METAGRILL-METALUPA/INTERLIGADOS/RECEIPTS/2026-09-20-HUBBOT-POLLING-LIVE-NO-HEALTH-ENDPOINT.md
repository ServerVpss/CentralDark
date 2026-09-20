# MICRO-HANDOFF — HubBot vivo em polling, health endpoint ausente por desenho

Data: 2026-09-20

```text
CentralDark-HubBot.status=online
CentralDark-HubBot.script=/root/CentralDark/apps/bot-telegram/unified-bot.cjs
CentralDark-HubBot.restarts=4
127.0.0.1:9500/bot/health=NO_RESPONSE
recent log="MODO POLLING ativo"
historical log also shows webhook mode and one EADDRINUSE fallback
```

O source atual só cria servidor `/bot/health` no modo webhook. Portanto, no modo polling, ausência da porta 9500 não significa bot morto.

Correção mínima:
1. oferecer health local também no polling;
2. health-deep medir o subsistema real;
3. limpar `lastError` do Hub consumer após poll posterior bem-sucedido.

`BOT_PROCESS_LIVE=PASS`
`BOT_EXTERNAL_MESSAGE_DELIVERY=UNPROVED`
`HEALTH_MEASUREMENT_GAP=PROVED`
