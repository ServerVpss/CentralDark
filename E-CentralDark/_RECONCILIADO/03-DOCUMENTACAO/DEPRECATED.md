# ⚠️ Pasta DEPRECATED — apps/bot

**Decisão registrada em 2026-06-10:** a pasta oficial do bot é `CentralDark/apps/bot/`.

Esta pasta `apps/bot/` continua aqui apenas por compatibilidade temporária com a VPS legada
em `/root/apps/bot/`. **Nenhuma feature nova deve ser adicionada aqui.**

## Por quê

- Estrutura nova oficial é `CentralDark/apps/` (registrada em `docs/CONSCIENCIA/04-ESTRUTURA-VPS.md`).
- Caddy em produção serve `bot.multizap.dev` a partir de `/root/CentralDark/apps/bot/dist`.
- Em 2026-06-10, esta pasta `apps/bot/` divergiu de `CentralDark/apps/bot/` e ficou com 199 arquivos
  exclusivos (incluindo chat ao vivo, LiveBotStatus, LiveMessagesPreview, useLiveMessages, apiBase,
  mockWhatsapp). A versão oficial foi atualizada para receber tudo isso.

## O que fazer

- **Para mexer no bot:** edite somente `CentralDark/apps/bot/`.
- **Para rodar local:** `cd CentralDark/apps/bot && npm install && npm run dev`.
- **Para deploy:** o build oficial é em `/root/CentralDark/apps/bot` na VPS.

## Quando esta pasta será removida

Depois que `/root/apps/bot` for migrado pra quarantine na VPS e o `bot.multizap.dev` rodar estável
em produção por pelo menos 7 dias servindo de `CentralDark/apps/bot/dist`.

Acompanhar pendência em `docs/PENDENCIAS.md`.

## Histórico

- **Relatório de migração:** `docs/RELATORIOS/2026-06-10-bot-duplicado-vps.md`
- **Regra registrada em:** `docs/CONSCIENCIA/12-PASTA-OFICIAL-BOT.md`
