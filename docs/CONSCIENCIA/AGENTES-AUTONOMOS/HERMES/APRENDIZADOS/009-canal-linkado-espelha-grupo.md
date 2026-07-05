---
title: "009 Canal Linkado Espelha Grupo"
date: 2026-07-05
tags: ["consciencia"]
updated: 2026-07-05
---

# APR-009 — Canal do Telegram com grupo linkado espelha posts automaticamente

**Data:** 03/07/2026
**Categoria:** regra

## Contexto
Pivete confirmou que o bot `@srver1bot` só precisa postar em 3 IDs: canal `-1003669176367`, grupo `-5365750004` e admin `1901426549`. Detalhe importante: **posts no canal já aparecem no grupo automaticamente**, porque o grupo está vinculado ao canal como "grupo de discussão".

## Aprendizado
No Telegram, quando um canal tem um grupo de discussão vinculado (config nativa do app), cada post do canal aparece no grupo com botão "Comentar" — sem código, sem forward manual.

Consequência para o Hermes:
- **Anúncio público** = 1 único `sendMessage` no canal `-1003669176367`. Fim.
- Postar a mesma coisa no grupo depois = duplicação/spam.
- Grupo só recebe post direto no caso especial de **debate multi-IA** (AULA-013), onde cada IA precisa mandar sua própria mensagem.

## Regra prática que ficou
> Se é anúncio público, mira o canal. Se é debate entre IAs, mira o grupo. Nunca os dois pro mesmo assunto.

## Fallback se o link quebrar
1. APR novo com sintoma.
2. Aviso `⚠️ link canal↔grupo quebrado` direto no grupo.
3. `pendencias_add` alta pro Pivete reconfigurar no Telegram nativo.

## Referências
- AULA-016 (foco 3 IDs)
- `HERMES/ROTAS-FIXAS/mapa-telegram.md`
- `HERMES/ROTAS-FIXAS/notificacao-telegram.md`
