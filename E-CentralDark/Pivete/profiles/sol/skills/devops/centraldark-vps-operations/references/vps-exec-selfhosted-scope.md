# vps-exec-selfhosted.yml — escopo real (medido main)

UI: "VPS Deploy canônico (self-hosted)"
runs-on: [self-hosted, Linux]   # o runner É a VPS

## Gatilhos
- push em main, SÓ se mudou:
  - apps/modulos/mcp/**
  - apps/modulos/mapeamento/**
  - apps/modulos/HERMES-CORE/agents/Log-Verificador/**
  - scripts/vps/deploy-operational-guards.sh
  - .github/workflows/vps-exec-selfhosted.yml
  - scripts/webhook/github-webhook-deploy.mjs
- workflow_dispatch: (vazio — sem inputs)

## Jobs
1. deploy-mcp
   - Alvo PM2: CentralDark-MCP (PM2_APP=CentralDark-MCP)
   - Health: http://127.0.0.1:9100/health (service == mcp-centraldark)
   - Build isolado (worktree + npm ci + typecheck + test + build)
   - Promove só dist/ atômico (backup + swap), pm2 restart, health + audit + 5x estabilidade
   - Rollback automático se falhar após promover
2. deploy-operational-guards
   - Roda scripts/vps/deploy-operational-guards.sh
   - Alvo: mapa + CentralDark-HermesVerificador (PM2_APP=CentralDark-HermesVerificador)
   - Backup + restart + 5 amostras de estabilidade do mesmo PID

## O que NÃO faz
- NÃO deploy/restart do CentralDark-Hermes (core/orquestrador)
- NÃO sync full da VPS com main
- NÃO git reset --hard
- NÃO religa WebhookDeploy (porta :9300 propositalmente parada)

## Consequência (P1 Codex PR #1165)
Roteamento "deploy do Hermes principal" → este workflow = evidência sobre
outros alvos (MCP/Verificador), não sobre o core. MOTOR != ESTEIRA.
