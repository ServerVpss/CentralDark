---
title: "APRENDIZADO 99 Bot Server Consolidacao"
date: 2026-06-29
tags: ["consciencia"]
updated: 2026-06-29
---

# Aprendizado #99 — Consolidação bot-server + Lote 2 WhatsApp

**Data:** 2026-06-09 BRT  
**Origem:** review do Codex flagrou duplicação · auditoria read-only do `listChats`

## Lição inquebrável

O pacote oficial do servidor de bots é **`CentralDark/apps/bot-server/`** (`@centraldark/bot-server`). NUNCA criar `apps/bot-server/` na raiz do repo — gera duplicata órfã que o Codex (que constrói api/middlewares/routes ali) não enxerga, e o adaptador fica invisível pra implementação operacional.

## Erro cometido (corrigido no mesmo turno)

1. **Lote 1 (manhã 09/06)** — criei adaptador `wuzapi-readonly-*.ts` em `apps/bot-server/src/gateways/whatsapp/` (raiz), ignorando que o Codex já tinha base operacional em `CentralDark/apps/bot-server/`.
2. **Lote 2 (tarde 09/06)** — adicionei run-once `audit-list-chats-endpoint.mjs` no mesmo lugar errado.
3. **Review do Codex (13:50)** apontou: catálogo de rotas órfão, fora do pacote que tests/exports importam.
4. **Correção (14:00):** `mv` de tudo pra `CentralDark/apps/bot-server/`, casca `apps/bot-server/` removida, package.json renomeado pra `@centraldark/bot-server` (oficial único), validador `npm run validate:whatsapp` passou no destino consolidado.

## Achado técnico do Lote 2

WuzAPI (`asternic/wuzapi:latest`) NÃO tem endpoint nativo `listChats`. Auditoria read-only contra `127.0.0.1:8081`:
- 9 candidatos testados (`/chat/list`, `/chats`, `/chat`, `/chats/list`, `/session/chats`, `/user/chats`, `/conversation/list`, `/chat/all`, `/chats/all`) → 9/9 = HTTP 404.
- Inspeção do `/api/spec.yml` (102KB, 60+ paths) confirmou:

| Conceito CentralDark | Endpoint WuzAPI real | Método |
|---|---|---|
| chats 1:1 (contatos) | `/user/contacts` | GET |
| chats em grupo | `/group/list` | GET |
| histórico de mensagens | `/chat/history` | GET |

`wuzapi-readonly-audit.ts` agora aponta `listChats` → `/user/contacts`. Service de domínio (Lote 3) vai combinar `/user/contacts` + `/group/list` em `CentralDarkChatSummary[]`.

## Garantias de segurança aplicadas

- Token (`WUZAPI_ADMIN_TOKEN`) nunca saiu da VPS.
- Run-once espelha `WRITE_FRAGMENTS` do adaptador oficial — nenhum POST/DELETE pôde passar.
- Container Docker/WuzAPI, Caddy, sessão WhatsApp e banco real intactos.
- Payload nunca foi impresso bruto — só `status`, `bytes`, `shape`, `count`.

## Artefatos

- Relatório VPS: `/root/CentralDark/revisoes/20260609-135511-listchats-audit/relatorio.json`
- Doc do lote: `docs/WHATSAPP-API/LOTE-2-listChats.md`
- Adaptador: `CentralDark/apps/bot-server/src/gateways/whatsapp/wuzapi-readonly-*.ts`
- Run-once: `CentralDark/apps/bot-server/scripts/run-once/audit-list-chats-endpoint.mjs`
- Memória: `mem://aprendizados/lote-2-bot-server-consolidacao`
