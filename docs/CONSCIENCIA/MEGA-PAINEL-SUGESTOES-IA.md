---
title: "MEGA PAINEL SUGESTOES IA"
date: 2026-06-29
tags: ["consciencia"]
updated: 2026-06-29
---

# Mega Painel · Sugestões IA/Codex

## Objetivo

Criar um setor no Mega Painel para sugestões da IA/Codex.

O Codex continua como agente principal quando disponível. Este setor apenas organiza sugestões, textos copiáveis e instruções para o usuário.

## Campo de dados

O painel passa a usar a chave:

```json
"aiSuggestions": []
```

Cada item pode conter:

- `id`
- `title`
- `origin`
- `priority`
- `status`
- `relatedIssue`
- `relatedPr`
- `needsConfirmation`
- `summary`
- `copyText`
- `instruction`

## Uso

O usuário deve conseguir ver sugestões no Mega Painel e copiar um texto pronto para mandar ao ChatGPT ou seguir como instrução operacional.

## Segurança

Não colocar segredo real, tokens, sessões, chaves, valores privados ou caminhos sensíveis nas sugestões.

---

## Conexões Rápidas

- [[00-LEIA-PRIMEIRO]] — portão de entrada
- [[MAPA-DO-CEREBRO]] — visão geral
- [[CONSCIENCIA]] — documento mestre
