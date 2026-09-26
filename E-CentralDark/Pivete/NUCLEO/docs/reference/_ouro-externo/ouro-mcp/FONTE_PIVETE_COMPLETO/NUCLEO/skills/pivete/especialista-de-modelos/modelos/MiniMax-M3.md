---
modelo: MiniMax-M3
provider: minimax
capability_tier: flagship
version_pagina: 0.1.0
data_criacao: 2026-08-07
ultima_atualizacao: 2026-08-07 14:30
status: trial_exhausted
aliases: M3
fontes_primarias:
  - url: https://api.minimax.io/v1/models (validado 07/08/2026)
  - url: https://platform.minimax.io/docs/api-reference/api-overview
score_capacidade:
  reasoning: 9
  coding: 9
  context: 10
  latency: 7
  cost: 9
---

# MiniMax-M3

## Status Real (07/08/2026)

| Campo | Valor |
|---|---|
| **Autenticação** | ✅ OK (chave aceita) |
| **Saldo** | 🔴 insufficient balance (status_code 1008) |
| **Listagem `/v1/models`** | ✅ 8 modelos disponíveis |
| **Chat `MiniMax-M3`** | 🔴 "Out of credits" |
| **Latência esperada** | 60 tps |
| **Contexto** | 1.000.000 tokens |

**Causa raiz:** Token Plan Trial esgotado. `MINIMAX_API_KEY` aceita, mas
chamadas de chat retornam `base_resp.status_code: 1008, status_msg: "insufficient balance"`.

**Veredito:** Autentica, não responde. Casa em modo "aguarda recarga".

---

## Identidade
- **provider:** MiniMax
- **capability_tier:** flagship
- **context_window:** 1.000.000 tokens (input+output)
- **modalities:** texto
- **aliases:** "M3"
- **release_note:** "Latest M-series language model for agentic reasoning, tool use, coding, and long-context tasks"

## Comportamento esperado (não validado em Casa)

> A ser preenchido quando o saldo permitir teste real. Fontes oficiais indicam:

- **Reasoning agentic.** Pensamento profundo, raciocínio multi-step.
- **Tool use maduro.** Combine com a stack do Hermes.
- **Long-context.** Janela 1M — vantagem real vs GPT-5.5 (1M, igual) e Gemini 2.5-flash (1M, igual).
- **Custo baixo.** Tier pay-as-you-go MiniMax é mais barato que OpenAI.

## Padrões de uso (Pivete — a ser preenchido)

> Bloco vazio. Não fabrico comportamento sem teste real.

## Como a Casa usa (estado atual)

- Chave salva: `MINIMAX_API_KEY` em `~/.hermes/profiles/pivete/.env`
- Backup do `.env` em `.env.bak-20260807-142440`
- **Router**: ⚪ (não ativo até saldo)

## Score por capacidade

| Capacidade | Nota |
|---|---:|
| reasoning | 9 |
| coding | 9 |
| context | 10 |
| latency | 7 (60 tps) |
| cost | 9 (cheap) |

**Quando o saldo voltar:** score alto para `agentic_long`, `review_planning`.

## O que falta para validar

1. **Saldo:** o Token Plan Trial da chave precisa recarga (pay-as-you-go ou upgrade).
2. **Prova real:** chamada `chatcompletion_v2` retornando `choices != null`.
3. **Latência medida:** tempo real vs 60 tps declarado.
4. **Custo medido:** $ por milhão tokens.

## Ação necessária (Pivete)

1. Acessar `platform.minimax.io` → Billing → Add credits (Pay-as-you-go).
2. OU upgrade Token Plan.
3. Avisar quando saldo voltar.
4. Router acorda. Skill `especialista-de-modelos` vira página v0.2.0.

## Ligações

- Router: `skills/pivete/especialista-de-modelos/router/capability-router.md`
- INDEX: `INDEX-MODELOS.md`
- Change log: `changelog/2026-08-07-criacao.md`
