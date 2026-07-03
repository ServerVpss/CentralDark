---
title: "2026 07 03 Sessao Hermes Webhook"
date: 2026-07-03
tags: ["consciencia"]
updated: 2026-07-03
---

# Relatório da Sessão — 03/07/2026
## Hermes + Webhook + Elite Anthropic

> Tudo que foi feito hoje, onde cada peça vive, e o que tá disponível ou não.
> Leitura pra você bater o olho e saber o estado real do CentralDark.

---

## 🅰️ O que foi feito na VPS

| Ação | Caminho | Estado |
|---|---|---|
| Restaurar `ELITE_ANTHROPIC_TOKEN` no ambiente do Hermes | `/root/CentralDark/.env` (linha nova) | ✅ Feito |
| Restaurar `DARKAI_ANON_KEY` no ambiente do Hermes | `/root/CentralDark/.env` (linha nova) | ✅ Feito |
| Backup do `.env` antes de escrever | `/root/CentralDark/.env.bak-<timestamp>` | ✅ Salvo |
| Backup do config antigo com secrets | `/root/CentralDark-Hermes.config.cjs.BACKUP-SECRETS` | ✅ Preservado (fonte de restauração) |
| Config sanitizado (sem secrets) | `/root/CentralDark/apps/hermes-vivo/CentralDark-Hermes.config.cjs` | ✅ Limpo |
| `chmod 600` no `.env` | permissão restrita | ✅ |
| `.env` adicionado ao `.gitignore` | `/root/CentralDark/.gitignore` | ✅ |
| `pm2 restart CentralDark-Hermes --update-env` | processo PM2 id 64 | ✅ Online, secrets confirmados em `/proc/PID/environ` |
| `pm2 save` | dump PM2 atualizado | ✅ |
| Descartar stash transitório do painel | `stash@{0} auto-stash-before-deploy-...` (só timestamps auto-gerados) | ✅ Descartado sem perda |
| Sincronizar VPS com `main` (README + plano-visual.png) | `git merge --ff-only origin/main` | ✅ |

---

## 🅱️ O que foi feito no GitHub (via Lovable)

| Commit | Arquivo | Motivo |
|---|---|---|
| Upload dos operacionais do Hermes | `apps/hermes-vivo/daemon.mjs` | Estava só na VPS, subiu como fonte da verdade |
| " | `apps/hermes-vivo/executor.mjs` | Idem |
| " | `apps/hermes-vivo/notify.mjs` | Idem |
| Sanitização | `apps/hermes-vivo/CentralDark-Hermes.config.cjs` | Removidos tokens hardcoded |
| Registro de sessão | `docs/CONSCIENCIA/ARSENAL/hermes-vivo/README.md` + `plano-visual.png` | Documentação viva |

**Sincronia 4-Point atual:** Lovable ↔ GitHub ↔ VPS ↔ Cérebro Vivo — todos batendo o mesmo commit.

---

## 🅲 Modelos de IA — inventário completo dos 3 gateways Elite

### Elite Anthropic Proxy (Claude real)
**Onde vive:** PM2 `CentralDark-EliteAnthropic` · `/root/CentralDark/apps/modulos/elite-anthropic-proxy/` · domínio `api.centralldark.com`

| ID (uso na API) | Modelo | Contexto | Uso ideal | Status |
|---|---|---|---|---|
| `sonnet-4.6` | Claude Sonnet 4.6 | padrão (~200k) | Equilíbrio custo/qualidade — decisor padrão do Hermes | ✅ Disponível |
| `sonnet-4.6[1m]` | Claude Sonnet 4.6 | 1 milhão de tokens | Textos gigantes de uma tacada | ✅ Disponível |
| `opus-4.8` | Claude Opus 4.8 | padrão | Raciocínio pesado, análise crítica | ✅ Disponível |
| `opus-4.8[1m]` | Claude Opus 4.8 | 1M tokens | Opus + contexto gigante (caro) | ✅ Disponível |
| `haiku-4.6` | Claude Haiku 4.6 | padrão | Rápido/barato — tarefas volumosas | ✅ Disponível |
| `haiku-4.6[1m]` | Claude Haiku 4.6 | 1M tokens | Haiku + contexto gigante | ✅ Disponível |

### Elite HTTP Gateway (ChatGPT via Zendriver)
**Onde vive:** PM2 `CentralDark-EliteHTTP` (id 51) · `localhost:8080` · Bearer token fixo

| ID | Modelo | Status |
|---|---|---|
| `gpt-4o` | GPT-4o (via sessão navegador headless) | ⚠️ Parcial — expõe `/v1/models`, mas o Fabler retornou HTTP 500 hoje ("Failed to connect to browser" — Playwright sem sandbox rodando como root) |

### Elite WS Gateway
**Onde vive:** PM2 `CentralDark-EliteWS` (id 50)

| ID | Status |
|---|---|
| Fallback WebSocket do EliteHTTP | ✅ Online (não testado hoje — vai como plano C no fallback do Hermes) |

### Modelos via `darkai` CLI (ai-proxy Lovable Cloud)
**Onde vive:** edge function `ai-proxy` no projeto Lovable atual · chave única `DARKAI_ANON_KEY`

| ID | Status observado hoje |
|---|---|
| `google/gemini-3-flash-preview` | ❌ Falhou 15s no Hermes (log 03:52) |
| `google/gemini-2.5-pro` | ❌ Timeout 30s no Hermes (log 03:53) |
| `openai/gpt-5-mini` | ❌ Timeout 45s no Hermes (log 03:54) |
| Fallback → Elite Anthropic `claude-sonnet-4-5` | ✅ Respondeu em 1.792ms |

> A cadeia de fallback do Hermes tá funcionando exatamente como projetada: quando gemini/gpt caem, cai no Elite Anthropic e resolve.

---

## 🅳 Webhook Deploy + Caddy

| Peça | Onde | Status |
|---|---|---|
| `CentralDark-WebhookDeploy` (PM2 id 5) | escutando `127.0.0.1:9300` | ✅ Online |
| Rota Caddy | `/etc/caddy/deploy-centraldark.Caddyfile` — `deploy.centralldark.com/webhook → 127.0.0.1:9300` | ✅ Correta (não precisou fix) |
| Teste externo ponta-a-ponta | `POST https://deploy.centralldark.com/webhook` | ✅ 200 OK + log "gatilho do GitHub recebido" |
| Deploy automático | git reset --hard origin/main via webhook | ✅ Testado com push manual — funcionou |

**Causa da pausa de 28/06:** GitHub parou de disparar deliveries após conflito de merge na VPS travar o pull. Com a árvore limpa agora, próximo push já cai automático.

---

## 🅴 Pontas soltas

✅ Nada crítico aberto.

⚠️ Só observações:
- **Fabler (Elite Gateway ChatGPT):** derrubado por erro Playwright/sandbox como root. Não afeta operação — o fallback Anthropic assumiu. Corrigir quando for atacar essa frente.
- **Modelos `darkai` (Gemini/GPT via ai-proxy):** falhando com timeout hoje. Vale investigar edge function `ai-proxy` no Lovable Cloud numa próxima sessão.

---

*Gerado em 03/07/2026 · CentralDark Consciência Viva · Sincronia 4-Point ativa*
