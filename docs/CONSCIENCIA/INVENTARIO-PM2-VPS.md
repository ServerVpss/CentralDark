---
title: "INVENTARIO PM2 VPS"
date: 2026-07-05
tags: ["consciencia"]
updated: 2026-07-05
---

# 🔒 Inventário Oficial PM2 — VPS CentralDark

> **Fonte da verdade** dos processos PM2 da VPS `/root/CentralDark/`. Este documento é atualizado a cada auditoria. Qualquer IA que abrir o repo deve ler antes de mexer em processo.

**Última auditoria:** 05/07/2026 13:26 BRT
**Total ativo:** 14 processos
**Backup do dump:** `/root/.pm2/dump.pm2.backup-20260705-132624` (120KB, íntegro)

---

## 🟢 Processos ATIVOS no dump (14)

Todos gerenciados via PM2, `pm2 save` obrigatório após mudança:

| ID | Nome | Script | Notas |
|----|------|--------|-------|
| 0 | `CentralDark-ArtifactsCrafter` | `apps/modulos/artifacts-builder/agents/crafter-wrapper.cjs` | 🔒 protegido |
| 1 | `CentralDark-ArtifactsBuilder` | `apps/modulos/artifacts-builder/core/orchestrator.mjs` | 🔒 protegido |
| 2 | `CentralDark-ArsenalAdapter` | `apps/modulos/arsenal-openai-adapter/server.mjs` | 🔒 protegido |
| 3 | `CentralDark-Hermes` | `apps/modulos/HERMES-CORE/core/orchestrator.mjs` | 🔒 protegido |
| 4 | `CentralDark-GraphPanel` | `apps/modulos/graph-panel/server.js` | 🔒 protegido |
| 5 | `CentralDark-GrafoVivo` | `scripts/grafo-vivo/loop.mjs` | — |
| 6 | `MCP-CentralDark` | `apps/modulos/mcp/dist/index.js` | Porta 9100 · domínio `mcp.centralldark.com` |
| 7 | `CentralDark-HubBot` | `apps/bot-telegram/unified-bot.cjs` | 🔒 Bot @srver1bot |
| 8 | `CentralDark-HermesThinker` | `apps/modulos/hermes-thinker/src/index.mjs` | — |
| 10 | `CentralDark-Memoria` | `apps/modulos/memoria-api/index.mjs` | 🔒 protegido |
| 12 | `CentralDark-ArsenalProxy` | `apps/modulos/proxy/start.sh` | 🔒 protegido |
| 14 | `CentralDark-EliteHTTP` | `apps/modulos/elite-anthropic-proxy/start-fallback.sh` | 🔒 protegido · ⚠️ errored |
| 15 | `CentralDark-PiveteSync` | `apps/modulos/pivete-sync/pivete-sync.mjs` | 🔒 protegido |
| 16 | `CentralDark-OAuthBroker` | `apps/modulos/oauth-broker/server.mjs` | 🔒 protegido |

---

## 📜 Processos HISTÓRICOS (aposentados, não perdidos)

Os logs continuam em `/root/.pm2/logs/`. Ressuscitar apenas com autorização explícita do Pivete:

**Fase Elite/Zentinel (consolidados no Arsenal):**
- `CentralDark-Zentinel` · `CentralDark-EliteWS` · `CentralDark-EliteAnthropicProxy` · `CentralDark-EliteAnthropic`

**Fase Hermes (consolidados no HERMES-CORE):**
- `CentralDark-Respiracao` · `CentralDark-HermesVerificador` · `CentralDark-Hermes-New`

**Deploy/Webhooks (consolidados no webhook único):**
- `CentralDark-WebhookDeploy` · `CentralDark-TelePainelDeploy` · `CentralDark-DEPLOY` · `github-webhook` · `webhook-bot` · `telepainel-deploy`

**Sincronizadores antigos:**
- `CentralDark-SyncDrive` · `CentralDark-SycDrive` · `CentralDark-TelegramMTProto` · `CentralDark-RefreshIAs` · `CentralDark-EvolucaoIAs`

**Proxies e brokers antigos:**
- `CentralDark-LovableProxy` · `CentralDark-HubBroker` · `CentralDark-BotServer` · `CentralDark-MCP` (predecessor do atual)

**Projetos externos aposentados:**
- `CloneDeck-CRM` · `CloneDeck-GitHub-Webhook` · `CloneDeck-Receiver` · `Install-Callback`
- `MultiZap-Gateway` · `MultiZap-GitHub-Webhook` · `MultiZap-TelegramBot`
- `elite-anthropic-proxy` · `elite-http-gateway` · `elite-ws-gateway` · `openai-http-gateway`
- `wabot-bridge` · `whatsapp-serve` · `whatsapp-server` · `zentinel-health`
- `monitor-tarefas` · `ecosystem.hermes`

---

## 🧬 Ecosystem files no repo

- `/root/CentralDark/ecosystem.config.js` ← **PRINCIPAL** (deve conter os 14 ativos)
- `/root/CentralDark/ecosystem.config.example.js` (template)
- `/root/CentralDark/scripts/contas-admin/ecosystem.config.cjs`
- `/root/CentralDark/infra/guardiao/ecosystem.config.cjs`
- `/root/CentralDark/apps/modulos/lovable-proxy/ecosystem.config.cjs`
- `/root/CentralDark/apps/modulos/proxy/ecosystem.config.cjs`
- `/root/CentralDark/apps/modulos/graph-panel/ecosystem.config.{cjs,js}`
- `/root/CentralDark/apps/modulos/pivete-sync/ecosystem.config.cjs`
- `/root/CentralDark/apps/modulos/arsenal-openai-adapter/ecosystem.config.cjs`

---

## 💾 Backups do dump PM2

| Arquivo | Tamanho | Data |
|---------|---------|------|
| `dump.pm2` | 120KB | atual |
| `dump.pm2.backup-20260705-132624` | 120KB | 05/07/2026 13:26 — pré-fix MCP |
| `dump.pm2.bak` | 116KB | 05/07/2026 13:22 |
| `dump.pm2.bak.1783261285` | 110KB | 05/07/2026 manhã |
| `dump.pm2.bak-url-2026-06-05-181254` | 101KB | 05/06/2026 |

---

## 🚨 Regras Absolutas (aplicam a QUALQUER IA)

1. **PROIBIDO** `pm2 delete all` · `pm2 kill` · `pm2 reset` sem ordem explícita
2. **Antes de mexer em processo** → backup obrigatório:
   ```bash
   cp /root/.pm2/dump.pm2 /root/.pm2/dump.pm2.backup-$(date +%Y%m%d-%H%M%S)
   ```
3. **Ao criar/remover processo** → `pm2 save` + atualizar este inventário no mesmo commit
4. **EADDRINUSE porta 9100** = race condition entre restarts do MCP, NÃO é zumbi externo
5. **Envs do MCP** (`CENTRALDARK_ADMIN_KEY`, `MCP_SESSION_SECRET`, `GITHUB_CLIENT_ID`, `GITHUB_OAUTH_CALLBACK`) devem estar no `ecosystem.config.js` — nunca só no shell

---

## Conexões Rápidas

- [[00-LEIA-PRIMEIRO]] — portão de entrada
- [[MAPA-DO-CEREBRO]] — visão geral
- [[CONSCIENCIA]] — documento mestre
