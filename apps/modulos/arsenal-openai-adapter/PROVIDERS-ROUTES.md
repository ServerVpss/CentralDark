# Rotas por provedor — Gateway `api.centralldark.com`

> Atualizado: 2026-07-17 · Arsenal Adapter (PM2 `CentralDark-ArsenalAdapter` :8090)  
> Regra: **cada provedor na sua rota**. Não misturar catálogo nem keys.

## Mapa

| Provedor | Base | Models | Chat |
|----------|------|--------|------|
| **Arsenal** (default) | `/v1` | `GET /v1/models` | `POST /v1/chat/completions` |
| **Abacus** RouteLLM | `/providers/abacus/v1` | `GET /providers/abacus/v1/models` | `POST /providers/abacus/v1/chat/completions` |
| **TokenRouter** | `/providers/tokenrouter/v1` | `GET /providers/tokenrouter/v1/models` | `POST /providers/tokenrouter/v1/chat/completions` |

Aliases curtos TokenRouter: `/tokenrouter/v1/models` e `/tokenrouter/v1/chat/completions`.  
Aliases curtos Abacus: `/abacus/v1/models` e `/abacus/v1/chat/completions`.

Índice: `GET /providers` ou `GET /v1/providers`.

## O que cada um faz

- **`/v1/*`** — **sistema central** (Council + passthrough) com **FALLBACK automático**:  
  `abacus → tokenrouter` (default model TR se o modelo pedido não existir no TR).  
  Catálogo GET ainda lista Arsenal + Abacus (TR fica na rota própria).  
  Headers de prova: `X-CentralDark-Upstream`, `X-CentralDark-Route`. Body: `centraldark.upstream`.
- **`/providers/abacus/v1/*`** — Abacus **puro** (sem fallback) — diagnóstico/manutenção.
- **`/providers/tokenrouter/v1/*`** — TokenRouter **puro** (sem fallback) — diagnóstico/manutenção.

### Fallback (sempre no `/v1`)

```text
pedido /v1/chat  ou  arsenal-*
       │
       ▼
   Abacus RouteLLM
       │ falha (crédito, 5xx, vazio…)
       ▼
   TokenRouter (modelo pedido se tiver acesso, senão TOKENROUTER_MODEL)
       │ falha
       ▼
   erro estruturado: "fallback esgotado..."
```

Desligar: `FALLBACK_ENABLED=false` no env do PM2.

## Credenciais (VPS, fora do Git)

O processo recebe estas variáveis pelo ambiente seguro do serviço:

```text
TOKENROUTER_API_KEY=<REDACTED>
TOKENROUTER_BASE_URL=https://api.tokenrouter.com/v1
TOKENROUTER_MODEL=deepseek/deepseek-v4-pro
```

O adapter não lê arquivo de credenciais; o runtime deve injetar as variáveis no processo.  
Chat exige auth (Bearer / x-api-key do adapter). Models/health/providers são públicos.

## Smoke (local)

```bash
curl -s http://127.0.0.1:8090/providers | jq .
curl -s http://127.0.0.1:8090/providers/tokenrouter/v1/models | jq .
curl -s http://127.0.0.1:8090/providers/abacus/v1/models | jq '.data|length'
# chat TR (com key do adapter):
curl -s http://127.0.0.1:8090/providers/tokenrouter/v1/chat/completions \
  -H "Authorization: Bearer $ARSENAL_ADAPTER_KEY" -H 'Content-Type: application/json' \
  -d '{"model":"deepseek/deepseek-v4-pro","messages":[{"role":"user","content":"Say PONG"}],"max_tokens":256}'
```

## GitHub Actions (revisores)

Para Multi-IA sem key nativa de Sonnet, apontar pr-agent para:

```text
OPENAI__API_BASE=https://api.centralldark.com/providers/tokenrouter/v1
OPENAI__KEY=<chave do gateway CentralDark>
CONFIG__MODEL=openai/deepseek/deepseek-v4-pro
```

(ou manter Abacus em `/providers/abacus/v1` se houver crédito).

## Não fazer

- Colocar key do TokenRouter no client final — client usa **só** a key do CentralDark.
- Misturar modelos TR no `/v1/models` sem decisão explícita do Pivete.
- Trocar `PROVIDER_BASE` global só pra TR (quebra o Council/Abacus).
