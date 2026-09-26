---
modelo: gemini-2.5-flash
provider: openrouter
capability_tier: small
version_pagina: 0.1.0
data_criacao: 2026-08-07
ultima_atualizacao: 2026-08-07 14:30
status: online
aliases: ["gemini-flash", "flash-2.5"]
score_capacidade:
  reasoning: 7
  coding: 7
  context: 10
  latency: 9
  cost: 10
---

# Gemini 2.5 Flash (via OpenRouter)

## Status Real (07/08/2026)

| Campo | Valor |
|---|---|
| **Rota** | OpenRouter free tier |
| **Saldo** | ✅ free, sem cota |
| **Teste "oi"** | ✅ respondeu |
| **Latência** | ~1,5s pra "oi" |
| **Contexto** | 1.000.000 tokens |

**Veredito:** Equivalente a gpt-4o-mini, **mas com 1M de contexto**. Mesmo free,
mesma rota. **Grande trunfo.**

## Identidade
- **provider:** openrouter (free tier)
- **capability_tier:** small
- **context_window:** 1.000.000 tokens ⭐
- **modalities:** texto, visão (não testado em Casa)
- **aliases:** gemini-flash, flash-2.5

## Comportamento validado em Casa

- Resposta rápida (algumas chamadas em <2s).
- **Contexto 1M** — mesmo tier de GPT-5.5 e M3.
- Free tier do OpenRouter.
- Tá em uso AGORA como resposta padrão da sessão.

## Padrões de uso (Pivete)

> Bloco a ser preenchido com impressões reais.

**Quando usar (sugestão):**
- **Long-context**: arquivos inteiros, código grande, BASE completa.
- **Tarefa agentic leve**: lembra, procura, sumariza.
- **Visão multimodal** (REGRAS #18 já usa `gemini-3.5-flash` como Vision primário).
- **Substituto de `gpt-5.5`** quando o saldo OpenAI Codex acabar.

**Quando evitar:**
- Raciocínio de fronteira — score 7.
- Tarefa cara ($$$) — score 10 (free) é uma armadilha: OpenRouter free tem rate limit.

## Score por capacidade

| Capacidade | Nota |
|---|---:|
| reasoning | 7 |
| coding | 7 |
| context | 10 (1M) ⭐ |
| latency | 9 |
| cost | 10 (free) |

**Score dominante em:** `agentic_long` (cheap), `review_planning` (1M contexto),
`vision_ocr` (multimodal).

## Ligações

- Vision primário já mapeado: REGRAS #18.
- Router: `skills/pivete/especialista-de-modelos/router/capability-router.md`
- INDEX: `INDEX-MODELOS.md`
