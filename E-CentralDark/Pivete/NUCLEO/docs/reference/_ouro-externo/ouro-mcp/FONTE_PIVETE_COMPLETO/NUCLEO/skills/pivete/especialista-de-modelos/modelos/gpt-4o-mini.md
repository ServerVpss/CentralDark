---
modelo: gpt-4o-mini
provider: openrouter
capability_tier: small
version_pagina: 0.1.0
data_criacao: 2026-08-07
ultima_atualizacao: 2026-08-07 14:30
status: online
aliases: ["gpt-4o-mini", "4o-mini"]
score_capacidade:
  reasoning: 7
  coding: 7
  context: 4
  latency: 8
  cost: 10
---

# gpt-4o-mini (via OpenRouter)

## Status Real (07/08/2026)

| Campo | Valor |
|---|---|
| **Rota** | OpenRouter free tier |
| **Saldo** | ✅ free, sem cota |
| **Teste "oi"** | ✅ respondeu |
| **Latência** | ~1,5s pra "oi" |
| **Contexto** | 128k tokens |

**Veredito:** Pequeno, free, rápido. **Casa em guerra = arma confiável.**

## Identidade
- **provider:** openrouter (free tier)
- **capability_tier:** small
- **context_window:** 128k tokens
- **modalities:** texto
- **aliases:** gpt-4o-mini

## Comportamento validado em Casa

- Resposta rápida (algumas chamadas em <2s).
- Sem quota/credits. Free tier do OpenRouter.
- Chave válida: `OPENROUTER_API_KEY` em `.env`.
- Está em uso AGORA como resposta padrão da sessão.

## Padrões de uso (Pivete)

> Bloco a ser preenchido com impressões reais do Pivete.

**Quando usar (sugestão):**
- Tarefa simples: chat, lembrete, anotação.
- Ferramenta pequena: terminal, skill de formatação.
- Resposta rápida: confirmação, busca, link.

**Quando evitar:**
- Raciocínio profundo — vai pra `gpt-5.5` (se/quando saldo voltar) ou `MiniMax-M3`.
- Long-context — só 128k, não é 1M.
- Codificação pesada — score 7 é médio.

## Score por capacidade

| Capacidade | Nota |
|---|---:|
| reasoning | 7 |
| coding | 7 |
| context | 4 (128k) |
| latency | 8 |
| cost | 10 (free) |

**Score dominante em:** `search_quick`, `vision_ocr` (quando visão OK),
`coding_quick` barato.

## Ligações

- Router: `skills/pivete/especialista-de-modelos/router/capability-router.md`
- INDEX: `INDEX-MODELOS.md`
