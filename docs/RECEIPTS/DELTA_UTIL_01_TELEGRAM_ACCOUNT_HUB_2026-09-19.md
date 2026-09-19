# DELTA ÚTIL 01 — Telegram Account Hub

## Intenção

Levar ao @srver1bot a superfície de contas/autenticação já pertencente ao Hub CentralDark, sem criar segundo broker, segundo bot ou segundo cérebro.

## Owner reutilizado

- Telegram: apps/bot-telegram/unified-bot.cjs
- OAuth/credenciais: apps/modulos/oauth-broker/server.mjs
- Storage: oauth_providers + oauth_connections
- Adapter de projeção: apps/bot-telegram/services/account-hub.cjs

## Delta

1. Painel ganha o botão Contas & Auth.
2. Telegram consulta o OAuth Broker interno e mostra estado humano + termo técnico.
3. Lista múltiplas contas já registradas por provider.
4. Reusa o OAuth existente para GitHub, Notion, Drive e Gmail.
5. Testa conexões pelo endpoint já existente.
6. Material de autenticação não é projetado no Telegram.
7. Claude e Codex aparecem no mesmo Hub sem declarar OAuth inexistente.

## Limite honesto

- Claude failover automático e fallback Free: NOT_EXECUTED neste delta.
- Codex OAuth: UNKNOWN até medir o fluxo realmente suportado pelo runtime.
- Broker ativo em produção precisa ser medido no micro-deploy.

## Gates

- node --check apps/bot-telegram/unified-bot.cjs
- node --check apps/bot-telegram/services/account-hub.cjs
- node --test apps/bot-telegram/services/account-hub.test.mjs
- git diff --check
- UNKNOWN != PASS
- MERGED != DEPLOYED

## Promoção

PR_MOTHER=#1562
SUB-PR -> same-head gates -> squash main -> micro-deploy causal -> remedição.
