# Google Generative API Inline Config Pattern (2026-09-07)

## Context
OpenRouter rate-limited (HTTP 429) and credit-exhausted (HTTP 402) for Google models (`google/gemma-*`, `google/gemini-*`). CHEFE provided valid Google Generative Language API key.

## Solution: Direct Google API Configuration (bypasses OpenRouter)

### 1. auth.json — credential_pool (inline key)
```json
"gemini": [{
  "id": "<uuid>",
  "label": "GOOGLE_API_KEY",
  "auth_type": "api_key",
  "priority": 0,
  "source": "inline:AQ.Ab8RN6JC3SjRG6vhiQrhA4dVzPl7C42RaE1_lXTISGusAoLFdA",
  "last_status": null,
  "base_url": "https://generativelanguage.googleapis.com/v1beta",
  "request_count": 0,
  "secret_fingerprint": "sha256:c7394e2849e79101"
}]
```
**Key point:** `source: "inline:<KEY>"` — NOT `env:GOOGLE_API_KEY`. Key stored in file, Hermes reads directly.

### 2. config.yaml — providers section
```yaml
gemini:
  name: Google Generative Language
  base_url: https://generativelanguage.googleapis.com/v1beta
  auth_section: gemini
  default_model: gemini-3.6-flash
```

### 3. Model Selection (CRITICAL)
| Model | Status |
|-------|--------|
| `gemini-2.0-flash` | ❌ 404 "This model is no longer available. Please update your code to use models/gemini-3.6-flash" |
| `gemini-3.6-flash` | ✅ 200 OK — tested and confirmed |

### 4. Validation Test
```bash
curl -s -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=<KEY>" \
  -H "Content-Type: application/json" \
  -d '{"contents":[{"role":"user","parts":[{"text":"teste"}]}]}'
# Expected: HTTP 200 + candidates[0].content.parts[0].text
```

### 5. Why This Matters
- OpenRouter 402/429 = provider quota, NOT app error
- Direct Google bypasses OpenRouter completely
- Inline key = no machine env var dependency
- Works on ANY Hermes surface (CLI, Desktop, WebUI, cron)

### 6. Session Evidence (2026-09-07)
- API key tested: HTTP 200 with `gemini-3.6-flash`
- Response: "CONFIGURACAO OK"
- auth.json patched: `source` changed from `env:GOOGLE_API_KEY` → `inline:<KEY>`
- config.yaml patched: `gemini` provider added
- Model confirmed: `gemini-3.6-flash` (NOT `gemini-2.0-flash`)

## Related Patterns
- `centraldark-vps-operations` → `references/desktop-ssh-compatibility-fix.md` (same session)
- `centraldark-operational-discipline` → `references/google-generative-api-inline-config.md` (this file)