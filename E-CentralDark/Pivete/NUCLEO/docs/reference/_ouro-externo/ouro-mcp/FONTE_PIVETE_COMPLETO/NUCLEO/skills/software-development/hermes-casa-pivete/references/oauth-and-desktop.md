# OAuth + desktop (casa / profile pivete)

## Do not

- Paste tokens/cookies/API keys into chat.
- Scrape ChatGPT Classic or browser session storage and inject into Hermes.
- Assume app login == Hermes provider credential.

## Observed layout (2026-07-18)

| Item | Fact |
|------|------|
| Global auth | `C:\Users\danda\AppData\Local\hermes\auth.json` — had **xai-oauth** (+ copilot pool) |
| Profile auth | `profiles\pivete\auth.json` may be **missing** (OAuth can live global) |
| Active model path | grok-4.5 / xai-oauth in pivete `config.yaml` |
| ChatGPT Classic | Store package `OpenAI.ChatGPT-Desktop_*` → `ChatGPT Classic.exe` |
| Chrome | Multiple windows/tabs (user’s browser, not Hermes browser tool) |

When summarizing auth: provider names, timestamps, token **lengths** only.

## Safe attach flows

1. **xAI/Grok** — already via OAuth device_code when present; refresh lives in auth.json.
2. **OpenAI/ChatGPT for Hermes** — `hermes --profile pivete auth add` or `hermes model` official OAuth (Codex/OpenAI), user completes browser login.
3. **API key** — profile `.env` only, never chat.

## Desktop visibility

- Window/process enumeration answers “is X open?”
- `computer_use` for real GUI capture/click (tool must be enabled; install via hermes computer-use if missing).
- `browser_*` = Hermes-controlled Chromium, **not** the user’s logged-in Chrome profile.

## User ask (session)

“ve se da pra pegar minha sessao oauth e coloca ela aqui” → refuse scrape; offer official auth paths; confirm xAI already present if so.
