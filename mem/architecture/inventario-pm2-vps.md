---
name: Inventário oficial PM2 da VPS CentralDark
description: Lista completa dos 14 processos PM2 ativos, históricos aposentados e ecosystem files. Fonte da verdade pra nunca mais perder processos.
type: architecture
---

# Inventário PM2 — VPS CentralDark (`/root/CentralDark`)

**Última auditoria:** 05/07/2026 · **Total ativo:** 14 processos · **Backup dump:** `/root/.pm2/dump.pm2.backup-20260705-132624`

## 🟢 Processos ATIVOS no dump (14) — nunca deletar sem ordem

| ID | Nome | Script |
|----|------|--------|
| 0 | CentralDark-ArtifactsCrafter | `apps/modulos/artifacts-builder/agents/crafter-wrapper.cjs` |
| 1 | CentralDark-ArtifactsBuilder | `apps/modulos/artifacts-builder/core/orchestrator.mjs` |
| 2 | CentralDark-ArsenalAdapter | `apps/modulos/arsenal-openai-adapter/server.mjs` |
| 3 | CentralDark-Hermes | `apps/modulos/HERMES-CORE/core/orchestrator.mjs` |
| 4 | CentralDark-GraphPanel | `apps/modulos/graph-panel/server.js` |
| 5 | CentralDark-GrafoVivo | `scripts/grafo-vivo/loop.mjs` |
| 6 | MCP-CentralDark | `apps/modulos/mcp/dist/index.js` (porta 9100) |
| 7 | CentralDark-HubBot | `apps/bot-telegram/unified-bot.cjs` (bot @srver1bot) |
| 8 | CentralDark-HermesThinker | `apps/modulos/hermes-thinker/src/index.mjs` |
| 10 | CentralDark-Memoria | `apps/modulos/memoria-api/index.mjs` |
| 12 | CentralDark-ArsenalProxy | `apps/modulos/proxy/start.sh` |
| 14 | CentralDark-EliteHTTP | Gateway público OpenAI-compat em `elite.centralldark.com` (ChatGPT Plus via Zendriver). ⚠️ **PENDENTE — evolução agendada, NÃO ressuscitar no chute.** Ver `docs/PENDENCIAS.md` #35. Código em `apps/modulos/elite-gateway/`. |
| 15 | CentralDark-PiveteSync | `apps/modulos/pivete-sync/pivete-sync.mjs` |
| 16 | CentralDark-OAuthBroker | `apps/modulos/oauth-broker/server.mjs` |

## 📜 Processos HISTÓRICOS (nos logs, aposentados — não perdidos)

Consolidados/desligados em fases anteriores. Logs preservados em `/root/.pm2/logs/`. Ressuscitar só com ordem:

- CentralDark-Zentinel, CentralDark-Respiracao, CentralDark-BotServer
- CentralDark-EliteWS, CentralDark-EliteAnthropicProxy, CentralDark-EliteAnthropic
- CentralDark-HermesVerificador, CentralDark-Hermes-New
- CentralDark-SyncDrive, CentralDark-SycDrive, CentralDark-TelegramMTProto
- CentralDark-WebhookDeploy, CentralDark-TelePainelDeploy, CentralDark-DEPLOY
- CentralDark-LovableProxy, CentralDark-RefreshIAs, CentralDark-EvolucaoIAs
- CentralDark-HubBroker, CentralDark-MCP (predecessor do atual)
- CloneDeck-CRM, CloneDeck-GitHub-Webhook, CloneDeck-Receiver, Install-Callback
- MultiZap-Gateway, MultiZap-GitHub-Webhook, MultiZap-TelegramBot
- ecosystem.hermes, elite-anthropic-proxy, elite-http-gateway, elite-ws-gateway
- github-webhook, monitor-tarefas, openai-http-gateway, telepainel-deploy
- wabot-bridge, webhook-bot, whatsapp-serve, whatsapp-server, zentinel-health

## 🧬 Ecosystem files (fontes de configuração)

- `/root/CentralDark/ecosystem.config.js` ← **principal**
- `/root/CentralDark/ecosystem.config.example.js`
- `/root/CentralDark/scripts/contas-admin/ecosystem.config.cjs`
- `/root/CentralDark/infra/guardiao/ecosystem.config.cjs`
- `/root/CentralDark/apps/modulos/lovable-proxy/ecosystem.config.cjs`
- `/root/CentralDark/apps/modulos/proxy/ecosystem.config.cjs`
- `/root/CentralDark/apps/modulos/graph-panel/ecosystem.config.cjs`
- `/root/CentralDark/apps/modulos/graph-panel/ecosystem.config.js`
- `/root/CentralDark/apps/modulos/pivete-sync/ecosystem.config.cjs`
- `/root/CentralDark/apps/modulos/arsenal-openai-adapter/ecosystem.config.cjs`

## 💾 Backups do dump PM2 (`/root/.pm2/`)

- `dump.pm2` (atual — 120KB, 14 processos)
- `dump.pm2.backup-20260705-132624` (backup manual pré-mudança MCP)
- `dump.pm2.bak` (backup automático)
- `dump.pm2.bak.1783261285` (05/07/2026 manhã)
- `dump.pm2.bak-url-2026-06-05-181254` (05/06/2026)

## 🚨 Regras absolutas

1. **Nunca** rodar `pm2 delete all`, `pm2 kill`, `pm2 reset` sem ordem explícita
2. **Antes de qualquer mudança em processo** → `cp /root/.pm2/dump.pm2 /root/.pm2/dump.pm2.backup-$(date +%Y%m%d-%H%M%S)`
3. **Ao adicionar processo novo** → sempre `pm2 save` + atualizar este inventário
4. **Ao remover processo** → registrar em "aposentados" acima com data e motivo
5. **MCP porta 9100** — se der EADDRINUSE, é race condition entre restarts, não zumbi externo
