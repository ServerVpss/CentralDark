# Orquestração e gateway (profile pivete)

Session-learned operating notes for multi-model house work and Telegram gateway ownership.

## Prove models with real calls

1. Inspect `hermes --profile pivete auth list` and `status --all` (presence only; no secrets).
2. For each candidate model, send a one-line completion and require HTTP 200 + expected reply text.
3. "Logged in" / "Connected" is **not** a test.
4. Capacity proof (e.g. PROVA-OI earlier the same day) ≠ live availability. Re-validate before promoting Claude to live orchestrator.

## Hierarchy (ChatGPT + Pivete — HARD)

```text
UI / model.default     = xai-oauth : grok-4.5     # TRAVADO — never set Opus/Sonnet as UI default
ORCHESTRATOR designated= Claude Opus if HTTP 200, else Sonnet if 200, else Grok 4.5
CRITIC / FALLBACK      = xai-oauth : grok-4.5
EXECUTOR (delegation)  = xai-oauth : grok-build-0.1
FAST                   = xai-oauth : grok-composer-2.5-fast
CODEX                  = openai-codex / gpt-5.6-* (reserve only; may 429)
MoA                    = critical decisions / Autolupa only (not every tool turn)
```

**Do not** put `model.default=claude-opus-*` to "make Claude orchestrator". That hijacks the Desktop UI. Claude orchestrates via OAuth calls / routing while UI stays Grok High unless Pivete orders otherwise.

Config knobs (via CLI; always re-read YAML after):

```text
model.default=grok-4.5
model.provider=xai-oauth
fallback_model.provider / fallback_model.model
delegation.provider=xai-oauth
delegation.model=grok-build-0.1
delegation.max_concurrent_children=3
delegation.max_spawn_depth=1
moa.default_preset = xai-critical
```

## Claude Code OAuth (not x-api-key)

- Token: `resolve_anthropic_token()` from `agent.anthropic_adapter` (`~/.claude/.credentials.json`). Prefix `sk-ant-oat…` = OAuth.
- Client: `build_anthropic_client(token)` → base must be `https://api.anthropic.com`.
- **HARD:** OAuth needs `Authorization: Bearer` + Claude Code UA/betas. `x-api-key: sk-ant-oat…` → **401**.
- Do **not** run `claude setup-token` if a minimal Messages call already returns 200.
- Never paste tokens in chat.

### Env traps

- `ANTHROPIC_BASE_URL=http://127.0.0.1:1337` (or any local proxy) silently breaks real Claude. Unset it. Prove `client.base_url`.
- Rate limit **429** ≠ dead auth. Document HTTP; keep UI on Grok; designate Claude only when live 200.

Recipes + NÚCLEO prova filenames: `references/claude-oauth-orchestration.md`.

## xAI token path

- Prefer profile `auth.json` → `providers.xai-oauth.tokens.access_token`.
- Do **not** require `XAI_API_KEY` in `.env` when OAuth is present.
- Never pair `grok-*` with `openai-codex` (HTTP 400).

## Config backup before orchestration edits

```text
src:  %LOCALAPPDATA%\hermes\profiles\pivete\config.yaml
dest: E:\CentralDark\Pivete\NUCLEO\motor\10-observabilidade\backups-config\config-pivete-<timestamp>.yaml
+ sidecar JSON with sha256 + bytes + purpose
```

## Gateway restart checklist

1. `gateway status` for pivete **and** default — only pivete may hold the house bot token.
2. Snapshot: PID, `state.db` size (optional short hash), telegram home chat.
3. `hermes --profile pivete gateway stop` → drained cleanly.
4. Start: native `HERMES_HOME=C:\Users\danda\AppData\Local\hermes\profiles\pivete` + `gateway run --replace`.
5. Prove: agent/gateway log `Connected to Telegram (polling mode)`, `set_my_commands OK`, real send/receive on chat `1901426549`.
6. If `api_server` loops without key → `platforms.api_server.enabled=false`.

## Telegram UI house defaults

```yaml
telegram:
  extra:
    language: pt-BR      # menu descriptions PT; command names stay EN
    card_style: true     # mono <pre> cards
    card_width: 52
    card_title: HERMES
```

After adapter changes: restart gateway, then verify Bot API `getMyCommands` sample + one rendered card message.

## Continuity missions

- Do not reopen green multi-phase gates (voice OGG/Opus, STT anti-.bin, cards, dedupe update_id, casa/curadoria/memória/FTS) when the order is continuity-only.
- Single append-only report: `E:\CentralDark\Pivete\NUCLEO\motor\10-observabilidade\REVISAO-TECNICA-DA-LUPA.md`
- No parallel `v2`/`final` reports.

## Forbidden

- grok-* model names on openai-codex base_url
- second gateway on same bot token
- wiping/migrating state.db to "fix" telegram
- MoA on every tool turn
- paid OpenRouter/Nous when user forbade them for the mission
- UI default flipped to Claude without explicit Pivete order

## Post-change verification (audio / STT / Telegram adapter)

After touching `tools/transcription_tools.py` or `plugins/platforms/telegram/adapter.py`:

```bash
# venv may lack pytest — install once if needed
./venv/Scripts/python.exe -m pip install pytest pytest-asyncio -q

HERMES_HOME=.../Temp/hermes-test-home PYTHONPATH=hermes-agent \
./venv/Scripts/python.exe -m pytest \
  tests/tools/test_transcription_tools.py \
  tests/tools/test_transcription.py \
  tests/tools/test_transcription_command_providers.py \
  tests/tools/test_transcription_plugin_dispatch.py \
  tests/tools/test_transcription_dotenv_fallback.py \
  tests/agent/test_transcription_registry.py \
  tests/gateway/test_telegram_audio_vs_voice.py \
  -q --tb=line -o addopts=
```

Expect ~259 passed. Do not claim GREEN without this (or equal) fresh run.

Also: `tests/gateway/test_restart_redelivery_dedup.py` (12 tests) for inbound `update_id` /restart dedupe.
