# PT-BR + provider bank (Hermes TTS)

Session-proven notes for profile **pivete**. Prefer this over re-discovering catalogs.

## User verdicts (2026-07-18)

- Wanted audio in **Portuguese**.
- `en-US-AnaNeural` / English defaults → “tá inglês”.
- Tried **xAI** male set (castor, sal, lux, leo, rex, orion, perseus, zagan, atlas, naksh) with `language: pt-BR`, speed 0.9 → **“tudo feia”**.
- Listened Edge **Francisca** + **Thalita multi** as “mais reais”.
- **Locked:** Edge `pt-BR-FranciscaNeural` (sample `edge_francisca_mulher_BR.mp3`). User may change later.

## Edge (Microsoft) — free, ready when `edge_tts` importable

| ShortName | Locale | Gender | Sample name used |
|-----------|--------|--------|------------------|
| pt-BR-FranciscaNeural | pt-BR | Female | `edge_francisca_mulher_BR.mp3` (**locked**) |
| pt-BR-ThalitaMultilingualNeural | pt-BR | Female multi | `edge_thalita_mulher_BR_multi.mp3` |
| pt-BR-AntonioNeural | pt-BR | Male | on demand |
| pt-PT-RaquelNeural | pt-PT | Female | — |
| pt-PT-DuarteNeural | pt-PT | Male | — |

**Not Portuguese:** `en-US-AnaNeural` (Female, Child, English US).

Hermes docs often show `en-US-AriaNeural` — override for PT work.

## xAI / Grok TTS

- Hermes: `POST {base}/tts` with `{text, voice_id, language}`.
- Default voice_id: `eve`. Set **`language: pt-BR`** for Brazilian Portuguese.
- Speed: **0.7–1.5**.
- Auth: `XAI_API_KEY` **or** xAI OAuth (works without env key if OAuth present).
- No official voice named `lazy`. Closest chill/male proxy: **`castor`**.
- Other ids: carina, zagan, helix, orion, luna, iris, altair, zenith, perseus, helios, lux, kepler, rigel, cosmo, celeste, ursa, sirius, lumen, castor, naksh, atlas, ara, eve, leo, rex, sal.
- Batch dumps: `cache/audio/xai_<voice>_ptBR.mp3`.

If user rejects xAI quality → switch to Edge, don’t re-push Grok.

## Other providers

| Provider | Env / setup | Notes |
|----------|-------------|-------|
| OpenAI | `VOICE_TOOLS_OPENAI_KEY` | Paid |
| ElevenLabs | `ELEVENLABS_API_KEY` + package | Paid, high quality multi |
| Gemini | `GEMINI_API_KEY` | Free tier possible |
| MiniMax | `MINIMAX_API_KEY` | Paid |
| Mistral | `MISTRAL_API_KEY` | Voxtral TTS |
| Piper | `pip install piper-tts` | Free local; PT voices downloadable |
| KittenTTS / NeuTTS | local packages | Not first choice for PT |

## Config edit gotchas (Windows profile)

- Path: `C:\Users\danda\AppData\Local\hermes\profiles\pivete\config.yaml`
- `hermes config set` may normalize numbers (`1.0` → `1`) — match real text when patching.
- Agent file tools may **refuse** writes to Hermes `config.yaml`. CLI set **then verify**, or Python block rewrite.
- Always re-read YAML after change before claiming success.

## Sample dump path

`C:\Users\danda\AppData\Local\hermes\profiles\pivete\cache\audio\`

## Official docs

- Hermes Voice & TTS: https://hermes-agent.nousresearch.com/docs/user-guide/features/tts
- xAI TTS: https://docs.x.ai/developers/model-capabilities/audio/text-to-speech
- Microsoft speech language support: https://learn.microsoft.com/en-us/azure/ai-services/speech-service/language-support?tabs=tts
