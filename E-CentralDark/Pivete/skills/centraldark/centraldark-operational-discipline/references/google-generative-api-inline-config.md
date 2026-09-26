# Google Generative API Inline Config

**Origin:** Session 2026-09-07 — Google API key verified working, OpenRouter 402/429  
**Context:** CHEFE provided API key, tested direct against Google Generative Language API

## Problem

OpenRouter free tier exhausted (HTTP 402: "you only afford 1574 tokens") and Google models via OpenRouter rate-limited (HTTP 429). Desktop app failing because all AI calls route through OpenRouter.

## Solution: Direct Google Generative API

### 1. Test the Key First
```bash
# Test with old model (returns 404 with migration guidance)
curl -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=<KEY>" \
  -H "Content-Type: application/json" \
  -d '{"contents":[{"parts":[{"text":"test"}]}]}'

# Response: 404 "This model models/gemini-2.0-flash is no longer available. Please update your code to use models/gemini-3.6-flash"
```

### 2. Use Correct Model
```bash
# Test with current model (gemini-3.6-flash)
curl -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=<KEY>" \
  -H "Content-Type: application/json" \
  -d '{"contents":[{"role":"user","parts":[{"text":"teste"}]}]}'

# Response: HTTP 200 + candidates[0].content.parts[0].text
```

### 3. Configure in Hermes

**auth.json** — credential_pool.gemini with `source: "inline:<KEY>"`:
```json
"gemini": [{
  "id": "867f12",
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

**config.yaml** — providers.gemini:
```yaml
gemini:
  name: Google Generative Language
  base_url: https://generativelanguage.googleapis.com/v1beta
  auth_section: gemini
  default_model: gemini-3.6-flash
```

### 4. Verify in Hermes Doctor
```bash
hermes doctor --fix
# Should show: ✓ gemini (API Connectivity)
```

## Key Points

| Aspect | Detail |
|--------|--------|
| **Auth method** | `inline:` in auth.json — no env var dependency |
| **Base URL** | `https://generativelanguage.googleapis.com/v1beta` |
| **Working model** | `gemini-3.6-flash` (not 2.0-flash) |
| **OpenRouter** | Unchanged — remains for other models |
| **Fallback** | OpenRouter still configured for gemma/gemini free models |
| **Surfaces** | Works on CLI, Desktop, WebUI, cron, all Hermes surfaces |

## Why Inline vs Env

| Inline | Env |
|--------|-----|
| Persists in auth.json | Requires shell env var |
| Works across machines/sessions | Machine-specific |
| Survives Hermes reinstall | Lost on env reset |
| Visible to doctor/connectivity check | Invisible to tooling |

## Model Migration Note

Google deprecated `gemini-2.0-flash` → migrate to `gemini-3.6-flash`. The API returns explicit migration guidance in the 404 error:
```
"This model models/gemini-2.0-flash is no longer available. Please update your code to use models/gemini-3.6-flash for the latest features and improvements. We recommend you to use the Interactions API."
```

## Related

- `centraldark-vps-git-operations/references/desktop-ssh-compatibility-verification.md` — VPS Hermes update protocol
- `centraldark-operational-discipline/references/fixed-point-shared-pattern.md` — Fixed point criteria