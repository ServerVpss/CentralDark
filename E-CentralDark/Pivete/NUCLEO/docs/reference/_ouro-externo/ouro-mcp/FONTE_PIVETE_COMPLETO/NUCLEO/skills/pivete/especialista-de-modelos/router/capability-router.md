---
tipo: router_capacidade
proposito: "Tabela viva que decide QUAL modelo usar por CAPACIDADE, não por nome"
regra_de_ouro: "Hermes nunca pergunta 'qual modelo' — pergunta 'qual perfil de execução'"
autor: Hermes Pivete
data_criacao: 2026-08-07
ligacao: "estende `especialista-de-modelos` v0.1.0; conexto do Pivete 07/08"
---

# Router por Capacidade — Casa Primero

## Princípio (Pivete 07/08)

> **"O roteador não deveria conhecer provedores. Deveria conhecer apenas
> capacidades."**

> **"Não orquestrar modelos, mas capacidades."**

**Quem decide modelo?**

```yaml
tarefa:
  tipo: agentic   # ou coding, review, planning, vision, search
  contexto: 1M    # tamanho exigido
  velocidade: media
  custo: baixo
  latencia_max_ms: 5000
```

**Quem resolve qual modelo usar?**

O Router — uma tabela única viva em `router/capability-router.md` (este arquivo).
A IA **score** cada modelo contra o perfil e escolhe o melhor. **Não o humano.**

---

## Score por capacidade (universal)

Cada modelo recebe notas de **0 a 10** em:

| Capacidade | Significado |
|---|---|
| `reasoning` | raciocínio profundo, planejamento multi-step |
| `coding` | geração de código, refatoração, debugging |
| `context` | tamanho de janela útil (1M=10, 204k=6, 128k=4, 32k=2) |
| `latency` | tps (100=10, 60=7, 30=4) |
| `cost` | eficiência (free=10, cheap=9, medium=5, expensive=1) |

**Score final = média ponderada** dos 5, segundo o **perfil da tarefa**.

---

## Tabela viva — status REAL (07/08/2026 14:30)

> **Status reflete prova real.** Curva de validação: `✅ OK` / `🟡 trial_exhausted` /
> `🔴 quota_exceeded` / `⚪ não testado`. Nada de "online" por fé.

| id | provider | reasoning | coding | context | latency | cost | status | prova |
|---|---|---:|---:|---:|---:|---:|---|---|
| `gpt-5.5` | openai-codex | 10 | 10 | 10 (1M) | 6 | 1 | 🔴 | 429 today |
| `MiniMax-M3` | minimax | 9 | 9 | 10 (1M) | 7 | 9 | 🟡 | 4 chaves testadas, todas 1008 (07/08 14:35) |
| `MiniMax-M2.7-highspeed` | minimax | 8 | 8 | 6 (204k) | 10 (100tps) | 9 | 🟡 | idem |
| `MiniMax-M2.7` | minimax | 8 | 8 | 6 (204k) | 7 | 9 | 🟡 | idem |
| `gpt-4o-mini` | openrouter | 7 | 7 | 4 (128k) | 8 | 10 (free) | ✅ | "oi" respondeu |
| `gemini-2.5-flash` | openrouter | 7 | 7 | 10 (1M) | 9 | 10 (free) | ✅ | "oi" respondeu |
| `gpt-5-nano` | darkai | 6 | 6 | 8 | 9 | 8 | 🔴 | 402 sem_creditos |
| `gemini-2.5-pro` | openrouter | 9 | 8 | 9 | 7 | 4 | 🔴 | 402 sem saldo |
| `gpt-5.5` | darkai | 10 | 10 | 10 | 6 | 1 | 🔴 | 402 sem_creditos |

---

## Redundância operacional (chain de fallback)

> "Conta A → acabou → Conta B → acabou → Gemini → GPT → DarkAI"

**Estado atual (07/08/2026):**

```text
1. gpt-5.5 (openai-codex) ← principal CONFIGURADO, mas quota_exceeded
2. MiniMax-M3            ← trial_exhausted (chave ok, sem saldo)
3. MiniMax-M2.7-highspeed ← trial_exhausted (chave ok, sem saldo)
4. gpt-4o-mini (openrouter) ← FUNCIONA (free tier)
5. gemini-2.5-flash (openrouter) ← FUNCIONA (free tier)
```

**Por redundância, casa-resiliente:**

```text
Necessidade: "reasoning alto + 1M contexto"
↓
Router busca tabela:
  - gpt-5.5: reasoning=10, context=1M, status=🔴
  - MiniMax-M3: reasoning=9, context=1M, status=🟡
  - gemini-2.5-flash: reasoning=7, context=1M, status=✅
↓
Escolhe: gemini-2.5-flash (único online com 1M contexto)
```

**Inverso — "tarefa simples, rápida, free":**

```text
Necessidade: "highspeed + cheap"
↓
Router busca:
  - MiniMax-M2.7-highspeed: latency=10, cost=9, status=🟡
  - gpt-4o-mini: latency=8, cost=10, status=✅
↓
Escolhe: gpt-4o-mini (online + free)
```

---

## Pesos por perfil de tarefa

```yaml
perfis:
  agentic_long:
    pesos: { reasoning: 0.30, coding: 0.20, context: 0.30, latency: 0.05, cost: 0.15 }

  coding_quick:
    pesos: { reasoning: 0.20, coding: 0.40, context: 0.05, latency: 0.30, cost: 0.05 }

  review_planning:
    pesos: { reasoning: 0.40, coding: 0.15, context: 0.20, latency: 0.05, cost: 0.20 }

  vision_ocr:
    pesos: { reasoning: 0.10, coding: 0.05, context: 0.20, latency: 0.30, cost: 0.35 }

  search_quick:
    pesos: { reasoning: 0.05, coding: 0.05, context: 0.05, latency: 0.50, cost: 0.35 }
```

**Cálculo do score:**

```
score_perfil(m, p) = sum( m[c] * p.pesos[c] for c in capacidades )
```

Modelo com **maior score** vence, **se status != 🔴**.

---

## Casa primeiro, VPS depois

> **Mesma tabela, dois arquivos:**
> - `skills/pivete/especialista-de-modelos/router/capability-router.md` (este, Casa)
> - na VPS, cópia sincronizada (próxima missão, R4 — só com ordem).

---

## Aprendizado aplicado (Pivete 07/08)

✅ **Custo inteligente vs burro.** Cada chamada daqui deve render:
- aprender padrão novo
- construir skill viva
- comparar modelos
- testar arquitetura
- reduzir erro futuro

❌ **Nunca** sem repetir pergunta / rodar benchmark infinito / escrever por escrever.

---

## Changelog do router

- **07/08/2026 14:30 — v0.1.0:** tabela viva criada com 9 entradas, score por
  5 capacidades, 5 perfis de tarefa, redundância 5-camadas. Estado real
  provado por curl + 14 testes de chat.
