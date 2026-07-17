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

- **`/v1/*`** — Council Arsenal (`arsenal-router|parallel|debate|hermes`) + passthrough **só Abacus**.  
  Catálogo default = curados Arsenal + modelos Abacus. **TokenRouter não entra aqui.**
- **`/providers/abacus/v1/*`** — só Abacus (`PROVIDER_BASE` / RouteLLM).
- **`/providers/tokenrouter/v1/*`** — só TokenRouter (`TOKENROUTER_*` em `secrets/.env`).

## Secrets (VPS, fora do Git)

```text
secrets/.env
  TOKENROUTER_API_KEY=...
  TOKENROUTER_BASE_URL=https://api.tokenrouter.com/v1
  TOKENROUTER_MODEL=deepseek/deepseek-v4-pro
```

O adapter lê o arquivo no boot (process env sobrescreve).  
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
