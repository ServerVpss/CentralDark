---
title: "TESTE CODEX TRIGGER HANDLERS"
date: 2026-06-29
tags: ["consciencia"]
updated: 2026-06-29
---

# Teste controlado do gatilho Codex em handlers

## Objetivo

Criar um Pull Request seguro para observar se o `chatgpt-codex-connector` volta a gerar evento `reviewed` quando arquivos adjacentes ao PR #4 são alterados.

## Escopo

Arquivos tocados:

- `CentralDark/apps/mcp/src/tools/aprendizado.ts`
- `CentralDark/apps/mcp/src/tools/pendencias.ts`

A alteração nos handlers é apenas comentário interno, sem mudança de runtime.

## Critério de observação

O teste será considerado útil se for possível observar uma destas situações:

1. Codex comenta/revisa o PR e aparece evento `reviewed` no timeline.
2. Codex não comenta/revisa, indicando que o gatilho não depende apenas do caminho do arquivo.

## Segurança

Não altera comportamento de produção, não toca segredo real, não toca Docker, Caddy, WuzAPI, WhatsApp, CRM ou banco real.

---

## Conexões Rápidas

- [[00-LEIA-PRIMEIRO]] — portão de entrada
- [[MAPA-DO-CEREBRO]] — visão geral
- [[CONSCIENCIA]] — documento mestre
