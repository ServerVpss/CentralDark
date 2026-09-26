---
name: hermes-chatgpt-codex-auth
description: "Use when Pivete wants ChatGPT session from Chrome saved into Hermes as openai-codex provider (models/audio stack) without opening settings UI or pasting tokens in chat."
version: 1.0.0
author: Hermes Agent (profile pivete)
license: MIT
platforms: [windows]
metadata:
  hermes:
    tags: [hermes, chatgpt, openai-codex, oauth, chrome, pivete, auth]
    related_skills: [hermes-agent, hermes-voice-tts]
---

# Hermes — ChatGPT → openai-codex (casa / profile pivete)

## Overview

Pivete pays for ChatGPT and stays logged in **Google Chrome**. He does **not** want to open Hermes settings and click OAuth buttons. On his local PC, with explicit authorization, automate the **official OpenAI device-code** login using his Chrome profile, then save tokens into the Hermes profile auth store. **Never print access_token / refresh_token in chat.**

This is **not** cookie-scraping the chatgpt.com chat UI into a fake API key. Hermes provider id is **`openai-codex`** (Responses/Codex backend).

## When to Use

- "pega minha sessão ChatGPT do Chrome e põe no Hermes"
- "não quero abrir config / apertar botão OAuth"
- provider `openai-codex` missing/expired on profile **pivete**
- after user says **SALVA COMO SKILL** / **PERMITO** for auth work

**Don't use for:** stealing others' sessions; pasting secrets into chat; assuming website cookies alone = Codex OAuth; changing model provider without saying so.

## Hard rules (Pivete)

1. **Skill create/edit/delete** — only with explicit allow (`SALVA`, `PERMITO`, `sim` to a clear ask).
2. **Secrets** — never dump tokens/cookies/API keys in chat. Status only: lengths, provider id, base_url, RESOLVE_OK/FAIL.
3. **Casa first** — profile `pivete` paths under `AppData\Local\hermes\profiles\pivete\`.
4. Do not claim consciousness / do not claim to be Pivete.

## Paths (Windows)

| What | Path |
|------|------|
| Profile home | `C:\Users\danda\AppData\Local\hermes\profiles\pivete\` |
| Auth store | `...\profiles\pivete\auth.json` |
| Config | `...\profiles\pivete\config.yaml` |
| Chrome exe | `C:\Program Files\Google\Chrome\Application\chrome.exe` |
| ChatGPT Chrome profile (observed) | **Profile 2** (`sonasmarcas@...` / last_used) |
| Hermes agent code | `C:\Users\danda\AppData\Local\hermes\hermes-agent\` |
| Official provider | `openai-codex` → base `https://chatgpt.com/backend-api/codex` |
| Device page | `https://auth.openai.com/codex/device` |

Confirm Chrome profile via `User Data\Local State` → `profile.info_cache` / `last_used` if accounts change.

## Prerequisites

- Hermes installed; `HERMES_HOME` = pivete profile for CLI/scripts.
- Chrome installed; user logged into ChatGPT in the target profile.
- Network to `auth.openai.com`.
- Python can import `hermes_cli.auth` from hermes-agent tree.

## Procedure — device code (canonical)

**Done when:** `resolve_codex_runtime_credentials()` returns `provider=openai-codex`, non-empty api_key length, `source` hermes-auth-store/pool, **and** no token values were printed.

### 1) Set env

```text
HERMES_HOME=C:\Users\danda\AppData\Local\hermes\profiles\pivete
PYTHONPATH / sys.path → hermes-agent root
```

### 2) Request device code

POST `https://auth.openai.com/api/accounts/deviceauth/usercode`  
JSON: `{"client_id": <CODEX_OAUTH_CLIENT_ID from hermes_cli.auth>}`  

On HTTP 429: honor Retry-After / backoff (Hermes does this).

Response needs: `user_code` (9-char pair code), `device_auth_id`, `interval`.

### 3) Show pair code + open Chrome

- Print **only** the short pair code + URL (pairing code is short-lived, not API secret).
- Launch:
```text
chrome.exe --profile-directory="Profile 2" --new-window https://auth.openai.com/codex/device
```
- User types the 9-char code on the OpenAI page and authorizes (one-time human step OpenAI requires).

### 4) Poll until authorized

POST `https://auth.openai.com/api/accounts/deviceauth/token`  
JSON: `device_auth_id` + `user_code`  
- 403/404 = still waiting  
- 200 = JSON with `authorization_code` + `code_verifier` (and related fields)

### 5) Exchange tokens (do not log body)

POST `CODEX_OAUTH_TOKEN_URL` (`https://auth.openai.com/oauth/token`) form:
- grant_type=authorization_code
- code=authorization_code
- redirect_uri=`https://auth.openai.com/deviceauth/callback`
- client_id=CODEX_OAUTH_CLIENT_ID
- code_verifier=from poll

### 6) Persist via Hermes APIs

```python
from hermes_cli.auth import (
    _save_codex_tokens,
    _update_config_for_provider,
    resolve_codex_runtime_credentials,
    DEFAULT_CODEX_BASE_URL,
)
_save_codex_tokens({"access_token": access, "refresh_token": refresh}, last_refresh_iso_z)
_update_config_for_provider("openai-codex", DEFAULT_CODEX_BASE_URL)
creds = resolve_codex_runtime_credentials()  # print provider/base/key_len/source only
```

Prefer Hermes helpers over hand-editing auth.json (pool + singleton stay consistent).

### 7) Reference script (local temp pattern)

A working one-shot used on 2026-07-18:

`%TEMP%\hermes_codex_device_now.py`

Re-create from this skill if missing; run background with long timeout; notify user of **PAIR_CODE** immediately from early stdout.

**Completion:** status line `SAVED` + `RESOLVE_OK` + exit 0.

## What failed / do not do

| Approach | Why not |
|----------|---------|
| Paste browser callback URL `code=` alone | Needs matching **code_verifier** from same login; browser PKCE half-state ≠ Hermes poll |
| Copy Chrome Cookies while Chrome open (Profile 2) | Sharing violation (WinError 32); cookies ≠ Codex OAuth client tokens |
| Dump tokens in chat | Forbidden by house rules |
| Assume ChatGPT Classic.exe session = Hermes provider | Different client; use device code + Chrome web login |
| `~/.codex/auth.json` import | Often missing; Hermes can import if present via `_import_codex_cli_tokens` |

## Related stack on this machine (context)

| Provider | Role | Notes |
|----------|------|--------|
| **openai-codex** | ChatGPT account models (Codex backend) | This skill |
| **xai-oauth** | Grok models + optional xAI TTS | Already used; separate store |
| **Edge TTS** `pt-BR-FranciscaNeural` | Default spoken voice (Pivete locked) | See `hermes-voice-tts` if present |
| xAI voices | Rejected as default for PT ("tudo feia") | Only if user asks again |

Do **not** flip `model.provider` to openai-codex silently if user only asked to *save session*. Saving auth ≠ switching default brain unless they say so. `_update_config_for_provider` may set provider — tell the user if config provider changed.

## Model arsenal and memory follow-up

After successful auth, do not stop at “login OK”. The account session enables the `openai-codex` model family, while xAI/Copilot/other catalog entries remain separate providers. Inspect `provider_models_cache.json` and `cache/model_catalog.json` when the user mentions the model picker or a “mega arsenal”; report provider/model discovery separately from credentials. A cache entry proves discovery, not that the provider is logged in or that the model is currently selected.

Keep three states separate in the report:

- **Current runtime:** provider/model reported by active session metadata.
- **Persisted default:** `config.yaml` `model.default` and `model.provider`; it may be stale or inconsistent after a provider switch.
- **Credential resolution:** `resolve_codex_runtime_credentials()` / auth status, with lengths and source only.

If the user asks whether Hermes is “learning”, verify built-in memory status and `memories/USER.md`. Explain that memories persist facts/preferences and skills persist procedures; neither changes model weights. Do not create a skill from a correction unless the user explicitly orders a skill-library update (a direct curator/library-maintenance request is authorization for that pass).


- [ ] `profiles\pivete\auth.json` exists; openai-codex entries present (inspect keys only)
- [ ] `resolve_codex_runtime_credentials()` → provider openai-codex, key_len > 0
- [ ] No access_token/refresh_token appeared in chat
- [ ] User informed: login OK + what it enables
- [ ] If config provider changed, say so explicitly
- [ ] Pair code flow documented if human step was required

## Common Pitfalls

1. **Interrupted poll** — device_auth_id lost; must start a **new** usercode (old pair code dies).
2. **Rate limit 429** — wait; do not hammer usercode endpoint.
3. **Wrong Chrome profile** — login page shows wrong Google account; re-check Local State last_used.
4. **Confusing TTS with Codex** — Codex OAuth is for **models**; Francisca Edge is separate TTS default.
5. **Creating skills unprompted** — Pivete requires ask-first except when he orders `SALVA COMO SKILL` / PERMITO.

## One-shot user lines

- "loga o ChatGPT no Hermes" → run this skill procedure  
- "salva como skill" → only after explicit order (this file is the result of that order for this flow)
