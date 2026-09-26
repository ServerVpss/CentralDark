# CentralDark Omni Router — Test Results (2026-09-03)

## Resumo Executivo

O **CentralDark Omni Router** (porta 8099) está **rodando e funcional** no PID 17736 (python/uvicorn). Testado via `curl` direto.

| Engine | Status | Detalhes |
|--------|--------|----------|
| **nous** | ✅ FUNCIONA | 6 modelos gratuitos respondendo |
| **claude-code** | ⚠️ Configurado | Precisa `claude` CLI no PATH + env vars |
| **openai** | ❌ Não funcional | `OPENAI_API_KEY` não configurada |
| **hermes** | ❌ Não funcional | `HERMES_BASE_URL` não configurada |

---

## Modelos Nous Gratuitos Testados — TODOS OK

```bash
# Formato: nous/<model-id>
nous/upstage/solar-pro4:free         → 3871ms
nous/poolside/laguna-s-2.1:free      → OK
nous/poolside/laguna-xs-2.1:free     → OK
nous/stepfun/step-3.7-flash:free     → OK
nous/meituan/longcat-2.0:free        → 34ms (mais rápido)
nous/inclusionai/ling-3.0-flash-fin:free → OK
```

**Falhou:**
```bash
nous/tencent/hy3:free  → HTTP 404 "This model's free period has ended"
```

---

## Como Testar (Receita Reproduzível)

```bash
# Health check
curl -s http://127.0.0.1:8099/health

# Listar modelos
curl -s http://127.0.0.1:8099/v1/models

# Chat completion (modelo Nous gratuito)
curl -s -X POST http://127.0.0.1:8099/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"nous/meituan/longcat-2.0:free","messages":[{"role":"user","content":"Responda apenas: OK"}],"max_tokens":10}'
```

**Resposta esperada (sucesso):**
```json
{
  "id": "cd-xxx",
  "object": "chat.completion",
  "model": "nous/meituan/longcat-2.0:free",
  "choices": [{"index":0,"message":{"role":"assistant","content":"OK"},"finish_reason":"stop"}],
  "centraldark": {
    "engine": "nous",
    "resolved_model": "meituan/longcat-2.0:free",
    "duration_ms": 34,
    "fallback_used": false,
    "action_is_proof": false,
    "model_touch": {...}
  }
}
```

---

## Configuração Necessária para Ativar Outros Engines

O router lê **env vars em tempo de requisição** (não no startup). Para ativar:

| Engine | Variáveis | Exemplo |
|--------|-----------|---------|
| `openai` | `OPENAI_API_KEY`, `OPENAI_BASE_URL`, `OPENAI_MODEL` | `export OPENAI_API_KEY=sk-...` |
| `hermes` | `HERMES_BASE_URL`, `HERMES_AUTH_TOKEN`, `HERMES_MODEL` | `export HERMES_BASE_URL=http://localhost:8787` |
| `claude-code` | `CLAUDE_BIN`, `CLAUDE_CWD` | `export CLAUDE_BIN=/path/to/claude` |

**Importante:** O processo do router (PID 17736) herdou env do bash pai (PID 49712). Para mudar, **reiniciar o router com as env vars definidas** ou definir no systemd/service se houver.

---

## Localização do Código

```
E:/CentralDark/Pivete/CentralDark/apps/modulos/elite-gateway/scripts/centraldark_omni_router.py
```

**Endpoints:**
- `GET /health` — status dos engines
- `GET /v1/models` — lista modelos (formato OpenAI)
- `POST /v1/chat/completions` — chat completion (OpenAI-compatible)
- `GET /openapi.json` — spec OpenAPI

**Roteamento de modelo:** prefixo `engine/model` ou `engine:model`
- `auto` → usa `DEFAULT_ENGINE` (padrão: `claude-code`)
- `openai/gpt-5.6` → engine openai
- `nous/meituan/longcat-2.0:free` → engine nous
- `claude-code` → engine claude-code
- `hermes/hermes` → engine hermes

---

## Modelos Nous Disponíveis (Free Tier)

Da API `https://inference-api.nousresearch.com/v1/models` — modelos com `pricing.prompt == "0"` ou `:free` no ID:

```
inclusionai/ling-3.0-flash-fin:free
poolside/laguna-s-2.1:free
poolside/laguna-xs-2.1:free
stepfun/step-3.7-flash:free
upstage/solar-pro4:free
meituan/longcat-2.0:free
```

**Recomendação:** Usar `meituan/longcat-2.0:free` como default (mais rápido nos testes: 34ms).

---

## Lições para Próximas Sessões

1. **O router JÁ RODA** — não precisa subir de novo, só testar
2. **Env vars são lidas por requisição** — mudar env e reinvocar funciona (se o processo filho herdar)
3. **Nous é o engine mais confiável hoje** — tem token OAuth válido no auth.json, modelos free funcionam
4. **Claude Code CLI está instalado** (`claude` v2.1.251 em `/c/Users/danda/AppData/Roaming/npm/claude`) — engine `claude-code` deve funcionar se `CLAUDE_BIN` apontar pra lá
5. **OpenRouter sem créditos** — 402 payment required, não usar como fallback até recarregar
6. **Gemini (Google AI Studio) não tem key** — erro 400 INVALID_ARGUMENT, precisa `GEMINI_API_KEY` no env ou auth.json

---

## Próximos Passos Possíveis

- [ ] Definir `NOUS_MODEL=meituan/longcat-2.0:free` no env do router (ou no código)
- [ ] Configurar `OPENAI_API_KEY` para engine openai (OpenRouter, etc.)
- [ ] Configurar `HERMES_BASE_URL` para engine hermes (se houver endpoint local)
- [ ] Testar engine `claude-code` com `CLAUDE_BIN` correto
- [ ] Subir como systemd/service com env vars persistidas