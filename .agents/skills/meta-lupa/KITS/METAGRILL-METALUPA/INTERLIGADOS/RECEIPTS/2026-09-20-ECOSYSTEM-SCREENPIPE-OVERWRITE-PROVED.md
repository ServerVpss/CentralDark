# MICRO-HANDOFF — ecosystem PM2 sobrescrito por ScreenPipe

Data: 2026-09-20

Histórico provado:

```text
06d6fe52... ecosystem.config.cjs ≈ 95 KB / corpo PM2 amplo
1620b646... ecosystem.config.cjs = "<PLACEHOLDER_ECO>"
006f7198... ecosystem.config.cjs = 628 bytes / somente CentralDark-ScreenPipe
main atual mantém a forma somente ScreenPipe
```

Enquanto isso, PM2 vivo ainda possui MCP, Hermes, WebhookDeploy e outros processos. Portanto:

`SOURCE_ECOSYSTEM_REGRESSION=PROVED`
`LIVE_PM2_PERSISTED_STATE_SURVIVED=true`
`REBOOT_RECONSTRUCTION=UNSAFE_OR_INCOMPLETE`

A recuperação não pode copiar cegamente 95 KB antigos sem verificar segredo/config obsoleta.

Próximo cursor: inspecionar apenas estrutura e presença de fallbacks sensíveis no ancestral amplo; reconstruir/reconciliar sem expor valor.
