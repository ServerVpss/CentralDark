# Mapa de provedores LLM — Casa pivete, 07/08/2026

> Snapshot do estado REAL dos provedores na Casa, verificado em `~/.hermes/profiles/pivete/.env` + `config.yaml` + log do gateway. **Atualizar este arquivo quando rodar o checklist de provedores novamente.**

## Tabela mestra

| Provider | Modelos | Estado 07/08 | Erro típico |
|---|---|---|---|
| `openai-codex` (oauth) | gpt-5.5, … | **❌ cota estourada** | `HTTP 429: usage limit` |
| `custom` (DarkAI Edge → Lovable) | 14 modelos (gpt-5.5, gemini-3-flash, 3.1-pro, 3.5-flash, 2.5-pro, 2.5-flash, 2.5-flash-lite, …) | **❌ TODOS 402 sem_creditos** | `HTTP 402: {"error":"sem_creditos"}` |
| `openrouter` (gpt-5.5, gemini-2.5-pro) | pagos | **❌ 402 saldo curto** | `HTTP 402: requires more credits, can only afford 7568` |
| `openrouter` (gemini-2.5-flash, gpt-4o-mini) | free / low-cost | **✅ OK** | responde "oi" |
| `openrouter` `:free` (llama-3.3-70b, qwen-2.5-72b) | free | **❌ 404 slug mudou** | `slug: meta-llama/llama-3.3-70b-instruct` (sem `:free`) |
| `minimax` (MiniMax) | MiniMax-M3 (1M ctx), M2.7, M2.5, etc. | **⚪ sem chave** | `No usable credentials found for provider 'minimax'` |

## Evidência de teste (capturada 07/08)

Cada modelo abaixo foi testado com `timeout 30 hermes --profile pivete chat -q "responda apenas: oi" -m <modelo> --provider <provider>`.

```
# OpenAI Codex (oauth)
gpt-5.5 --provider openai-codex  → HTTP 429 usage limit
   "API call failed after 3 retries: HTTP 429: The usage limit has been reached"

# DarkAI custom (todos 14 modelos caem igual)
gpt-5.5       --provider custom  → HTTP 402 sem_creditos
gemini-3.5-flash --provider custom → HTTP 402 sem_creditos
gemini-3-flash-preview --provider custom → HTTP 402 sem_creditos
gpt-5-nano    --provider custom  → HTTP 402 sem_creditos
   "Custom reported that billing, credits, or account entitlement is exhausted"

# OpenRouter (modelos pagos)
gpt-5.5 --provider openrouter → HTTP 402 (can only afford 7568 tokens)
gemini-2.5-pro --provider openrouter → HTTP 402 (can only afford 21587 tokens)

# OpenRouter (modelos free / low-cost — FUNCIONAM)
gemini-2.5-flash --provider openrouter → respondeu "oi" ✅
gpt-4o-mini --provider openrouter → respondeu "oi" ✅

# OpenRouter :free (slugs mudaram em jul/ago)
llama-3.3-70b:free --provider openrouter → HTTP 404; slug agora: llama-3.3-70b-instruct
qwen-2.5-72b:free --provider openrouter → HTTP 404; slug agora: qwen-2.5-72b-instruct
ministral-8b --provider openrouter → HTTP 404: No endpoints found

# MiniMax (sem chave)
MiniMax-M3 --provider minimax → "No usable credentials found for provider 'minimax'. Set MINIMAX_API_KEY."
```

## Default prático da Casa (07/08)

```
PRIMARY:    (caiu) — gpt-5.5 via openai-codex parou
FALLBACK 1: openrouter / google/gemini-2.5-flash  (✅ OK)
FALLBACK 2: openrouter / openai/gpt-4o-mini       (✅ OK)
FALLBACK 3: custom / google/gemini-3.5-flash      (❌ parou em 07/08)
FALLBACK 4: minimax (a configurar)                (⚪ aguardando chave Pivete)
```

**Tô respondendo do `gpt-4o-mini via OpenRouter` no momento desta captura.**

## Implicação direta

**Ao testar qualquer modelo, rodar primeiro um "responda apenas: oi" de baixo custo**. Não confiar em "tá configurado" como "tá funcionando". `hermes config get` diz o que está configurado, não o que está funcional.

## Checklist de diagnóstico (read-only)

```bash
# 1. configurado
hermes config get model.default --profile pivete
hermes config get model.provider --profile pivete
hermes config get fallback_providers --profile pivete

# 2. funcional (teste real, não chute)
timeout 30 hermes --profile pivete chat -q "responda apenas: oi" \
  -m "<modelo>" --provider <provider>
# Esperado: "oi" no output. Não esperado: 402/429/404.

# 3. ler log pra ver o que realmente respondeu
tail -50 /c/Users/danda/AppData/Local/hermes/profiles/pivete/logs/gateway-stdio.log \
  | grep -E "API call failed|model=|provider="
```

## Como usar este arquivo

Quando a sessão reabrir e o Pivete pedir "qual modelo tá funcionando", abrir esta tabela. Se o Pivete injetar nova chave MiniMax ou subir crédito em algum provider, **atualizar a tabela** e o `INDEX-MODELOS.md` da skill `especialista-de-modelos`.

## Ligações

- `SKILL.md` §11 — checklist original "Provider authentication failed".
- `hermes-pivete-local-ops` `references/openrouter-token-recovery.md` — Management Key vs API Key.
- `skills/pivete/especialista-de-modelos/INDEX-MODELOS.md` — tabela de modelos com página dedicada.
- `motor/03-memoria/memoria/HOJE.md` — entrada de 07/08 documenta a descoberta.
