# Bolt Provider Settings System — Session 2026-09-05

## Descoberta
O Bolt app (`apps/modulos/Bolt/source/`) tem um sistema completo de configuração de providers que:
- Persiste em `localStorage` (provider settings + auto-enabled tracking)
- Auto-detecta providers configurados via **server-side env vars** (endpoint `/api/configured-providers`)
- Separa **Cloud Providers** (OpenAI, Anthropic, Google, OpenRouter, Abacus, etc.) de **Local Providers** (Ollama, LMStudio, OpenAILike)
- Usa cookies para API keys do lado do cliente (não expostas no server)
- Tem UI de settings com tabs: Cloud / Local

## Arquivos-Chave

| Arquivo | Função |
|---|---|
| `app/lib/stores/settings.ts` | Store principal (nanostores + zustand) — providersStore, auto-enable, localStorage sync |
| `app/routes/api.configured-providers.ts` | Loader server-side: detecta env vars válidas (baseUrl + apiToken) e retorna configured providers |
| `app/routes/api.models.ts` | Loader: busca models dinâmicos de cada provider (usa cookies + serverEnv) |
| `app/components/@settings/tabs/providers/cloud/CloudProvidersTab.tsx` | UI cloud providers (toggle, baseUrl editável) |
| `app/components/@settings/tabs/providers/local/LocalProvidersTab.tsx` | UI local providers (Ollama/LMStudio/OpenAILike + model management) |
| `app/utils/constants.ts` | `PROVIDER_LIST` = `llmManager.getAllProviders()` (filtrado por `CENTRALDARK_ONE_ROUTER`) |
| `app/lib/modules/llm/providers/openai-like.ts` | Provider genérico OpenAI-compatível (baseUrl + apiKey + models env fallback) |

## Fluxo de Auto-Enable

1. Browser carrega → `settings.ts` lê `localStorage` (`provider_settings`, `auto_enabled_providers`)
2. `autoEnableConfiguredProviders()` faz `fetch('/api/configured-providers')`
3. Server (`api.configured-providers.ts`) verifica `import.meta.env` + `process.env` para cada provider
4. Se env var válida (não placeholder, URL http, key >10 chars) → `isConfigured: true, configMethod: 'environment'`
5. Client auto-enable se: provider enabled=false E (sem user settings OU wasAutoEnabled)
6. Salva no `localStorage` e atualiza store

## Variáveis de Ambiente por Provider (detectadas no server)

```typescript
// Em openai-like.ts e base-provider.ts
config = {
  baseUrlKey: 'OPENAI_LIKE_API_BASE_URL',  // ou provider-specific
  apiTokenKey: 'OPENAI_LIKE_API_KEY',
  modelsKey: 'OPENAI_LIKE_API_MODELS',     // fallback: "path/model:limit;path/model2:limit"
}
```

Exemplos reais no código:
- `OPENAI_LIKE_API_BASE_URL` / `OPENAI_LIKE_API_KEY` / `OPENAI_LIKE_API_MODELS`
- `OLLAMA_API_URL` (hardcoded `http://127.0.0.1:11434`)
- `LMStudio` baseUrl default `http://127.0.0.1:1234`

## Integração com Omni Router

O **Omni Router** (`centraldark_omni_router.py`) é o `CENTRAL_PROVIDER = 'OpenAILike'` no Bolt.

Quando `CENTRALDARK_ONE_ROUTER=true` (default):
- `LLMManager` registra **apenas** o provider `OpenAILike`
- Todos os models vêm do `/models` do omni router (porta 8099)
- O Bolt usa `OpenAILike` como gateway único para todos os engines

Quando `CENTRALDARK_ONE_ROUTER=false`:
- Registra todos os providers do registry (Anthropic, OpenAI, Google, OpenRouter, Abacus, etc.)
- Cada um faz chamada direta à sua API

## Lição Operacional

> **O SITE JÁ TEM UI DE ADMIN PARA KEYS** — não precisa criar installer/onboarding.
> 
> O Bolt já expõe `/settings` → Providers → Cloud/Local tabs onde o usuário:
> 1. Vê quais providers têm env var no server (auto-detectado)
> 2. Pode editar baseUrl (para OpenAILike/OpenRouter/URL_CONFIGURABLE_PROVIDERS)
> 3. Cola API key no cliente (fica em cookie, não no server)
> 4. Toggle enable/disable por provider
> 5. Para local providers: gerencia models (pull/delete Ollama, refresh LMStudio)
>
> **Gap real:** o omni router local (8099) não tem as env vars injetadas no processo. O Bolt rodando no VPS já tem (via Cloudflare Workers env). Local precisa de `.env` no processo do router.

## Comando para Subir Bolt Local (Dev)

```bash
cd E:/CentralDark/workspace/apps/modulos/Bolt/source
npm run dev
# Vite + Remix dev server, porta 5173 default
# Precisa das env vars do Cloudflare Workers (wrangler dev ou .dev.vars)
```

## Referência Cruzada
- `references/omni-router-arsenal-configuration.md` — configuração do router backend
- `centraldark-vps-operations` — VPS já tem site rodando com 200+ models via Abacus