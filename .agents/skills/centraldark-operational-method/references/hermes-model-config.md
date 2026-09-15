# Hermes Model Configuration in CentralDark

CentralDark runs Hermes Agent with specific model/provider configurations. This reference captures the validated working configurations and provider-specific requirements discovered during operations.

## GPT-OSS-120B Availability (Discovered 2026-09-11)

| Provider | Model ID | Available | Requirements | Notes |
|----------|----------|-----------|--------------|-------|
| **Cerebras** | `cerebras/gpt-oss-120b` | ✅ YES | `CEREBRAS_API_KEY` | Full 120B, reasoning, tools support |
| **IONOS** | `ionos/openai/gpt-oss-120b` | ✅ YES | `IONOS_API_KEY` | 120B, cheap, 128K context |
| **LMStudio** | `openai/gpt-oss-20b` | ✅ YES | Local server on `127.0.0.1:1234` | Only 20B variant, needs GPU |
| **OpenRouter** | — | ❌ NO | `OPENROUTER_API_KEY` | Not in allowed models list |
| **Supabase ai-proxy** | — | ❌ NO | `DARKAI_ANON_KEY` | Only Google Gemini models |

## Working Endpoints in CentralDark

### 1. Supabase ai-proxy (Validated Working)
- **URL**: `https://lyoigsqluyktoclwdaft.supabase.co/functions/v1/ai-proxy`
- **Auth**: `Authorization: Bearer <DARKAI_ANON_KEY>`
- **Models**: `google/gemini-3-flash-preview`, `google/gemini-2.0-flash`, `google/gemini-2.5-pro`
- **Format**: `{"prompt": "...", "model": "..."}`

### 2. CentralDark Omni Router (Port 8099)
- **Process**: `centraldark_omni_router.py` (Python FastAPI)
- **Providers**: antigravity, nous, hermes, google, claude-code, xai, abacus, openai
- **Default engine**: `antigravity` (Gemini flash_lite)
- **Config via env**: `CENTRALDARK_DEFAULT_ENGINE`, `CENTRALDARK_FALLBACK_CHAIN`

### 3. Lovable Proxy (Port 3102) - TTS Bridge
- **Process**: `lovable-proxy/index.mjs` (Node.js)
- **Upstream**: `https://ai.gateway.lovable.dev/v1`
- **Routes**: `/lovable/v1/*` and `/v1/audio/speech`
- **Auth**: `LOVABLE_API_KEY` (must be raw key, not encrypted)
- **Status**: Started but key validation failing (401 decrypt error)

### 4. Arsenal Adapter (Port 8090)
- **Process**: `arsenal-openai-adapter/server.mjs`
- **Provider**: `https://routellm.abacus.ai/v1`
- **Models**: `arsenal-router`, `arsenal-parallel`, `arsenal-debate`, `arsenal-hermes`
- **Missing**: `/v1/audio/speech` handler (returns 404)

## Required API Keys for GPT-OSS-120B

Add to `/root/.hermes/.env`:
```bash
# For Cerebras
CEREBRAS_API_KEY=your_key_here

# For IONOS
IONOS_API_KEY=your_key_here
```

## Hermes Config Template for GPT-OSS-120B

```yaml
model:
  default: gpt-oss-120b
  provider: openrouter  # WON'T WORK - OpenRouter doesn't serve this model
  base_url: https://openrouter.ai/api/v1
```

**Correct approach**: Use custom provider config:
```yaml
model:
  default: cerebras/gpt-oss-120b  # or ionos/openai/gpt-oss-120b
  provider: custom
  base_url: https://api.cerebras.ai/v1  # or https://api.ionos.ai/v1
  api_key: ${CEREBRAS_API_KEY}  # or ${IONOS_API_KEY}
```

## Known Issues

1. **DARKAI_URL dead**: `kagejpghnwdfymddwxuf.supabase.co` → NXDOMAIN (DNS doesn't resolve)
2. **LOVABLE_API_KEY encrypted**: Key in secrets appears base64/encoded, Lovable gateway rejects with "key could not be decrypted"
3. **No TTS endpoint**: Arsenal Adapter missing `/v1/audio/speech`, Lovable Proxy key invalid
4. **Hermes config mismatch**: Current config points to OpenRouter for gpt-oss-120b which doesn't exist there

## Quick Switch Commands

```bash
# Use working Gemini via ai-proxy (no key needed)
hermes config set model.default google/gemini-3-flash-preview
hermes config set model.provider custom
hermes config set model.base_url https://lyoigsqluyktoclwdaft.supabase.co/functions/v1/ai-proxy

# Use Cerebras GPT-OSS-120B (needs CEREBRAS_API_KEY)
hermes config set model.default cerebras/gpt-oss-120b
hermes config set model.provider custom
hermes config set model.base_url https://api.cerebras.ai/v1
hermes config set model.api_key "${CEREBRAS_API_KEY}"
```

## Validation Checklist

- [ ] API key present in `/root/.hermes/.env` or PM2 env
- [ ] `hermes doctor` passes
- [ ] `darkai chat -q "test"` returns response
- [ ] `/health` endpoints return `proved: true` structure
- [ ] Model appears in `/v1/models` list
