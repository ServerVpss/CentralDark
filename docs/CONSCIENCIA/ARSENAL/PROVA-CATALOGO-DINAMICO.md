# Prova — Catálogo Dinâmico /v1/models (161 modelos)

**Quando:** 2026-07-10  
**Gateway:** https://api.centralldark.com/v1/models  
**Commit anterior (placeholder):** 7bd192e — corrigido neste.

## Diagnóstico
Print do Claude Desktop mostrava HTTP 500 com `Invalid model: 'google/gemini-3-flash-preview'`. Causa dupla:
1. `regras.json` na VPS tinha prefixos `google/`, `openai/`, `anthropic/` — Abacus RouteLLM rejeita.
2. `/v1/models` retornava só 29 aliases hardcoded, escondendo os 138 modelos reais.

## Correção
- `regras.json`: `sed` removeu 7 prefixos.
- `server.mjs`: `fetchAbacusCatalog()` (cache 5min) + `stripProviderPrefix()` (defesa) + `/v1/models` faz merge dinâmico.

## Prova real
| Métrica | Antes | Depois |
|---|---|---|
| Modelos anunciados | 12–29 | **161** |
| `/v1/messages` claude-* | HTTP 500 | HTTP 200 |
| Prefixos em regras.json | 7 | 0 |

```
$ curl -s https://api.centralldark.com/v1/models | jq '.data | length'
161

$ curl -X POST .../v1/messages -d '{"model":"claude-3-5-sonnet-latest",...}'
→ HTTP 200 · content: "🎯 Router (gemini-3-flash-preview) PONG"
```

🟢 VPS provou primeiro · GitHub registra depois · aliases preservados · fallback silencioso.
