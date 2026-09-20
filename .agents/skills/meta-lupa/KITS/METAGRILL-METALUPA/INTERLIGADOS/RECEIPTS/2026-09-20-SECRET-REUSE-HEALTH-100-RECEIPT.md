# MICRO-HANDOFF — reuse-before-create do segredo Telegram

Data: 2026-09-20
PR-mãe: #1562

## Medição

```text
REQUEST=REUSE_BEFORE_CREATE
EXPECTED_HINT=/root/secrets
ACTUAL_OWNER=/root/CentralDark/secrets
CANONICAL_FILE=/root/CentralDark/secrets/telegram-alerts.env
SECRET_VALUE_EXPOSED=false

BEFORE:
  MCP /health/deep = degraded
  score = 89
  telegram_bot.ok = false
  hub_mission_consumer.lastError = HUB_POSTGREST_403 stale

ACTION:
  reuse existing secret file
  restart CentralDark-MCP with source-file binding
  pm2 save
  no new credential created

AFTER:
  MCP /health/deep = healthy
  score = 100
  telegram_bot.ok = true
  hub_mission_consumer.ok = true
  hub_mission_consumer.lastError = false
```

## Aprendizado

- `/root/secrets` não existe neste runtime; o owner real é `/root/CentralDark/secrets`.
- Falha de wrapper/quoting não é falha do alvo.
- Secret reuse deve apontar para o owner existente; não duplicar segredo em Git.
- Health checker deve conhecer todos os aliases canônicos do mesmo subsistema.

## Commits

```text
source health aliases = 0ca4d43883315a2ebc60a21368196bd4068bd68c
absorção drift material = 63c9178b0986df20d6d85d546ad1a67ff3e7dfd0
aprendizado canônico = 53d4d772bb9b1b03e6ed056743be4589a3b53626
```

`REUSE_BEFORE_CREATE=PASS`
`NEW_SECRET_CREATED=false`
`SECRET_LEAK=false`
`HEALTH_RUNTIME=100`
