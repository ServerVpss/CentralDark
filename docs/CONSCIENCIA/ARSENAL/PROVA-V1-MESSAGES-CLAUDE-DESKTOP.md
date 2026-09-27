---
title: "PROVA V1 MESSAGES CLAUDE DESKTOP"
date: 2026-08-27
tags: ["consciencia"]
updated: 2026-08-27
---

# Prova — /v1/messages + Catálogo Expandido (Claude Desktop)

**Quando:** 2026-07-10 · **Autor:** Pivete + IA
**Módulo:** `apps/modulos/arsenal-openai-adapter/server.mjs`
**PM2:** `CentralDark-ArsenalAdapter` (id 25) — reload ✓

## Problema
Claude Desktop mostrava "Gateway rejected model" em `https://api.centralldark.com/v1/messages` → 404. O adapter só expunha `/v1/chat/completions` (OpenAI-style), mas o Claude Desktop, ao ver ids `claude-*`, chama a rota Anthropic-style `/v1/messages`.

## Solução
1. **Rota nova `/v1/messages`** — proxy Anthropic-compat que converte payload Anthropic → OpenAI internamente, roteia pro Arsenal Council, e devolve resposta no formato `{id, type:"message", role:"assistant", content:[{type:"text",text}], stop_reason:"end_turn", usage}`.
2. **Catálogo expandido de aliases** — 25 modelos "fantasma" (Claude 3/3.5/3.7/4, GPT-4o/4/5, Gemini 1.5/2.5, o1) mapeando internamente para `arsenal-router|parallel|debate`. Total no `/v1/models`: **29 modelos**.
3. **Descoberta dinâmica** — `DISCOVERY_MODELS` gerado a partir de `MODEL_ALIASES` (owner deduzido pelo prefixo).

## Prova
```
GET  https://api.centralldark.com/v1/models         → 200 · total: 29
POST http://127.0.0.1:8090/v1/messages
     {"model":"claude-3-5-sonnet-latest",...}       → 200 · "PONG"
```

## Ganho
Claude Desktop, Zed, Cursor e qualquer cliente Anthropic-native passam a enxergar e usar o gateway CentralDark sem erro 404. Mantém compatibilidade OpenAI (Open WebUI, LibreChat) intacta.

---

## Conexões Rápidas

- [[00-LEIA-PRIMEIRO]] — portão de entrada
- [[MAPA-DO-CEREBRO]] — visão geral
- [[CONSCIENCIA]] — documento mestre
