---
title: "2026 07 09 Gateway Centraldark Chave Propria"
date: 2026-08-27
tags: ["consciencia"]
updated: 2026-08-27
---

 # Ouro — Gateway CentralDark próprio (09/07/2026)

**api.centralldark.com** agora tem chave própria do Pivete e roteia via Abacus RouteLLM.

## Config final (VPS `arsenal-openai-adapter/ecosystem.config.cjs`)
- `ARSENAL_ADAPTER_KEY`: `cdk_live_...` (chave pessoal do Pivete, salva em Lovable secret `CENTRALDARK_GATEWAY_KEY`)
- `PROVIDER_BASE`: `https://routellm.abacus.ai/v1`
- `PROVIDER_KEY`: `$ABACUS_API_KEY` do `.env`

## Uso no Windows (Claude Desktop / qualquer cliente OpenAI-compat)
- URL base: `https://api.centralldark.com/v1`
- Auth: `Bearer cdk_live_...`
- Modelos: `arsenal-router`, `arsenal-parallel`, `arsenal-debate`

## Aprendizados
- `pm2 restart --update-env` NÃO recarrega env do ecosystem — precisa `pm2 delete` + `pm2 start ecosystem.config.cjs` + `pm2 save`.
- Endpoint Abacus RouteLLM correto: `https://routellm.abacus.ai/v1` (o `api.abacus.ai` devolve HTML da landing).
- `regras.json` precisa ser atualizada — modelos `google/gemini-3-flash-preview` não existem no RouteLLM (usar `gemini-2.5-flash`, `claude-3.5-sonnet`, etc).

## Pendências
- Ajustar `docs/CONSCIENCIA/ARSENAL/regras.json` para modelos válidos do RouteLLM Abacus.

---

## Conexões Rápidas

- [[00-LEIA-PRIMEIRO]] — portão de entrada
- [[MAPA-DO-CEREBRO]] — visão geral
- [[CONSCIENCIA]] — documento mestre
