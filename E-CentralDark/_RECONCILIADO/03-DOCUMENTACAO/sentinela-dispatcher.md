---
name: sentinela-dispatcher
description: Time de bots 24/7 — Sentinela detecta divergência e abre Issue com dedupe; Dispatcher roteia por label; cada bot tem escopo fixo com TTL 7d anti-loop. Supabase Bot integrado ao GitHub.
type: feature
---

## Quadro de bots

| Bot | Label | Escopo | Workflow |
|---|---|---|---|
| ChatGPT + MCP | `assign:chatgpt` | Orquestra, valida cadeia 7 passos, fecha Issue | manual |
| Codex | `assign:codex` | Revisão de código + PRs pequenos | `codex-validate.yml`, `pr-auto-review.yml` |
| Supabase Bot | `assign:supabase-bot` | Schema/RLS/migrations read-only | `supabase-bot.yml` |
| Lovable | `assign:lovable` | Frontend/UI/painel | sync nativo |
| Grok | `assign:grok` | VPS/PM2/SSH read-only | manual |
| Dependabot | — | Updates npm/actions | `dependabot.yml` |
| CodeQL | — | Segurança JS/TS | `codeql.yml` |
| **Sentinela** | — | Detecta divergência → abre Issue | `sentinela-divergencias.yml` (cron 6h) |
| **Dispatcher** | — | Roteia Issue ao bot dono | `dispatcher-bots.yml` (on label) |

## Regras invioláveis

1. **Anti-loop:** bot só age se a label `assign:<self>` estiver presente.
2. **TTL 7 dias:** Issue da sentinela sem PR/comentário em 7d → label `stale` (escalada por `sentinela-stale.yml`).
3. **Dedupe:** sentinela usa hash SHA1 dos 80 primeiros chars do título; não reabre Issue existente.
4. **Sensível bloqueado:** nenhum bot toca Docker, WuzAPI, WhatsApp, Caddy, banco real, secrets sem confirmação humana.
5. **Relatório obrigatório:** toda execução grava em `docs/RELATORIOS/<bot>/<data>.md`.
6. **Painel sempre vivo:** sentinela chama `atualizar-painel-vivo.mjs` no final pra registrar evento.

## Arquivos chave

- `scripts/sentinela/run.mjs` — motor (checa endpoints, CORS, workflows vermelhos 24h)
- `scripts/sentinela/stale.mjs` — escalada por TTL
- `scripts/validar-painel-vivo.mjs` — valida `painel-data.json` + endpoints `liveStatus[]`
- `CentralDark/apps/supabase-bot/src/index.mjs` — Supabase Bot
- `docs/BOTS/README.md` — matriz pública
- `docs/sentinela/last-snapshot.json` — snapshot da rodada anterior (commitado)
- `docs/sentinela/last-report.md` — último relatório

## Como adicionar um bot novo

1. Criar label `assign:<bot>` (sentinela cria automático).
2. Adicionar entrada em `docs/BOTS/README.md`.
3. Adicionar agent em `painel-data.json`.
4. Adicionar caso no `dispatcher-bots.yml` (briefing operacional).
5. Criar workflow do bot se for autônomo.
