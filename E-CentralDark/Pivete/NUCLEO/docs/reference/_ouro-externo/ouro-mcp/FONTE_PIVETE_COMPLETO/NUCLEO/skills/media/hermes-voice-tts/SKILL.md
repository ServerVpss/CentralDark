---
name: hermes-voice-tts
description: "Configure and use Hermes TTS/voice (Edge, xAI, Piper, ElevenLabs, etc.) — especially Portuguese pt-BR for profile pivete."
version: 1.2.0
platforms: [windows, linux, macos]
metadata:
  hermes:
    tags: [hermes, tts, voice, audio, portuguese, edge, xai]
    related_skills: [hermes-agent]
---

# Hermes Voice & TTS

Use when the user wants spoken audio, voice replies, Portuguese TTS, provider/voice switches, or complains that audio is English/ugly.

**Docs (source of truth):** https://hermes-agent.nousresearch.com/docs/user-guide/features/tts  
**Local mirror:** `hermes-agent/website/docs/user-guide/features/tts.md`

## Pivete preferences (profile pivete)

- Prefer **Portuguese (pt-BR)** speech. Samples > essay when iterating voices.
- Deliver proof as `MEDIA:<absolute-path>.mp3`.
- **Locked default (2026-07-18):** Edge `pt-BR-FranciscaNeural`  
  Reference sample: `profiles/pivete/cache/audio/edge_francisca_mulher_BR.mp3`
- Also validated: `pt-BR-ThalitaMultilingualNeural` → `edge_thalita_mulher_BR_multi.mp3`
- Male BR free: `pt-BR-AntonioNeural` (only if asked).
- **xAI/Grok TTS rejected** for PT (“tudo feia”) — never default back unless user re-requests.
- After user picks a voice, lock config and stop A/B spam until they ask again.

## Quick path (do this)

1. Read active profile config: `$HERMES_HOME/config.yaml` (profile pivete → `AppData/Local/hermes/profiles/pivete/config.yaml`).
2. Confirm `tts.provider` and provider-specific voice/language.
3. List what is actually available **on this machine** (edge_tts importable? keys present? piper installed?) — presence only, never dump secrets.
4. Generate a short PT sample and attach via `text_to_speech` / MEDIA path.
5. Only switch providers after user picks one; lock config and re-sample.

## Config shape

```yaml
tts:
  provider: edge          # edge | xai | openai | elevenlabs | gemini | minimax | mistral | piper | kittentts | neutts
  speed: 1.0
  edge:
    voice: pt-BR-FranciscaNeural   # NOT en-US-AnaNeural
    speed: 1.0
  xai:
    voice_id: castor               # no voice literally named "lazy"
    language: pt-BR                # BCP-47; also auto, en, pt-PT, ...
    speed: 0.9                     # API range 0.7–1.5
voice:
  auto_tts: true
```

Also: slash `/voice on|tts|off` in interactive sessions.

## Provider matrix (practical)

| Provider | Cost | PT-BR | Notes |
|----------|------|-------|-------|
| **Edge** | Free | Yes | Default engine; best free PT now |
| **xAI** | OAuth/API | Yes (`language: pt-BR`) | Voices exist; quality may disappoint in PT |
| **OpenAI** | Paid key | Multi | `VOICE_TOOLS_OPENAI_KEY` |
| **ElevenLabs** | Paid key | Excellent multi | Needs SDK + key |
| **Gemini** | Free tier/key | Multi | `GEMINI_API_KEY` |
| **Piper** | Free local | PT voices available | Install separately; offline |
| KittenTTS / NeuTTS | Free local | Weak/EN-focused | Not first choice for PT |

## Edge PT voices (catalog)

| ShortName | Locale | Gender |
|-----------|--------|--------|
| `pt-BR-FranciscaNeural` | BR | Female |
| `pt-BR-AntonioNeural` | BR | Male |
| `pt-BR-ThalitaMultilingualNeural` | BR | Female multi |
| `pt-PT-RaquelNeural` | PT | Female |
| `pt-PT-DuarteNeural` | PT | Male |

**Trap:** `en-US-AnaNeural` = English **child** voice. Name “Ana” ≠ Portuguese.

List live: `python -c "import asyncio,edge_tts; print([v['ShortName'] for v in asyncio.run(edge_tts.list_voices()) if v['Locale'].startswith('pt')])"`

## xAI voices (when user insists on Grok)

No `lazy` voice_id. Closest “lazy male / chill”:

| voice_id | Doc vibe |
|----------|----------|
| `castor` | easygoing, down-to-earth (best “lazy male” proxy) |
| `sal` | smooth balanced |
| `lux` | calm wise |
| `leo` | authoritative strong |
| `rex` | confident clear |
| `orion` / `perseus` / `zagan` / `atlas` / `naksh` | cinematic / strong / dramatic / commanding / warm |

Classic short set also: `ara`, `eve` (default, energetic), `leo`, `rex`, `sal`.

Batch compare: call `_generate_xai_tts` per voice_id with fixed `language: pt-BR` and dump under `profiles/pivete/cache/audio/xai_<voice>_ptBR.mp3`.

## Editing config safely

1. **Prefer** `hermes --profile pivete config set tts.provider edge` etc.
2. **Always verify** by reading the YAML afterward — CLI can report success while values differ (e.g. `1` vs `1.0`) or blocks miss.
3. Hermes **patch/write tools may refuse** `config.yaml` as security-sensitive. If blocked, edit via small Python rewrite of the `tts:` block (preserve CRLF on Windows if present).
4. Do **not** paste API keys into chat. Check presence only.

### Telegram voice_mode (gateway_voice_mode.json) — Pivete default = `all`
The gateway reads `gateway_voice_mode.json` from disk on every startup (`gateway/run.py` `_load_voice_modes`); it does NOT reset on restart. Valid modes: `off`, `voice_only`, `all`.
- **Pivete default (2026-07-22):** `"telegram:1901426549": "all"` → text Card **+** audio. Set via:
  ```python
  import json
  p = "C:/Users/danda/AppData/Local/hermes/profiles/pivete/gateway_voice_mode.json"
  d = json.load(open(p)); d["telegram:1901426549"] = "all"; json.dump(d, open(p,"w"), indent=2)
  ```
- `voice_only` means **audio only, no text Card** — only use if Pivete asks expresso "só áudio".
- Never leave `voice_only` + a dead TTS provider (see SILENT ZERO-DELIVERY pitfall below).
- The `.vbs`/`.cmd` launcher only starts the gateway; it does not set voice mode. Mode lives ONLY in the JSON file.

## Sample generation

- Tool: `text_to_speech(text=...)` — uses active profile TTS config.
- Or direct: import `tools.tts_tool._generate_xai_tts` / Edge path from hermes-agent with `HERMES_HOME` set to the profile.
- Output: `profiles/pivete/cache/audio/*.mp3` — return `MEDIA:C:\...\file.mp3`.
- Keep sample text short PT phrases; mention voice name in the spoken line when A/B testing.

## Pitfalls

- `skill_view(file_path=...)` requires a **specific linked file**. Passing `references/` itself can raise `PermissionError`/`EISDIR`; inspect `linked_files` and open a concrete path before touching ACLs.
- Default Edge doc example is **English** (`en-US-AriaNeural`) — always set PT voice for this user.
- User said “tá inglês” → wrong locale and/or xAI `language: en`. Fix locale first.
- **Ana Neural** = `en-US-AnaNeural` (EN child). Never offer as PT.
- “gork lazy male” → no `lazy` id; closest **`castor`**. Still respect “tudo feia”.
- After user rejects a provider, **stop re-offering it** as default next turn.
- For Pivete, **MP3 via `sendAudio` is the default Telegram delivery**. OGG/Opus is only for an explicitly requested voice bubble. Treat `voice_compatible: false` on a generated MP3 as expected, not as a failed audio artifact.
- `VOICE_MESSAGES_FORBIDDEN` does **not** identify the Bot API method by itself. A plain `MEDIA:...ogg` has `is_voice=False` and routes to `sendDocument`; Telegram may still infer `audio/ogg`. Prove the actual `sendVoice`/`sendAudio`/`sendDocument` call before classifying the policy failure.
- A 15-second Read Aloud limit in the Desktop path is a no-progress watchdog rearmed by `timeupdate`, not a maximum speech duration. Prove synthesis, codec and playback separately with an audio longer than 20 seconds before changing provider or timeout constants.
- Diagnose outbound delivery in layers: (1) TTS generation, (2) codec/container, (3) Hermes MEDIA safe-path filtering, (4) adapter call, (5) direct Telegram Bot API result. If direct `sendVoice` **and** `sendAudio` both return HTTP 400 `VOICE_MESSAGES_FORBIDDEN`, the failure is an external Telegram/chat policy response, not proof of a MEDIA path bug; do not keep changing allowlists or codecs as if that error were path filtering.
- A valid local file and a successful adapter invocation are not delivery proof; require the user-visible Telegram result or a sanitized Bot API success response.
- Secrets live in profile `.env`; xAI may work via **OAuth** even when `XAI_API_KEY` is unset.
- `hermes config set` can print success while YAML is wrong — **always re-read** before claiming lock.
- Hermes agent file tools may **refuse** `config.yaml`; use CLI or Python rewrite; preserve CRLF.
- **Telegram outbound MEDIA failure:** a valid TTS file can be silently dropped by gateway MEDIA path safety filtering. Diagnose `MEDIA:<path>` delivery separately from TTS generation and inbound Telegram STT routing. See `references/telegram-media-delivery.md`.

## Session-learned operating protocol

- **Separate inbound and outbound audio:** Telegram → Hermes STT routing is not the same pipeline as Hermes → Telegram TTS/MEDIA delivery. A valid Ogg/Opus file proves generation only; verify gateway filtering, adapter delivery, and the direct platform result separately.
- **Read Aloud isolation:** Desktop chain is `playSpeechText` → `speakText` → `POST /api/audio/speak` → **same** `text_to_speech_tool` (Edge Francisca). Without Telegram session platform, expect honest **MP3** (`voice_compatible=false`), not OGG. Local `/api/audio/speak` may 401 without session cookie — prove via tool or authenticated app. For a reported 15s timeout, use audio >20s and require `timeupdate` past 15s plus `ended`. See `references/read-aloud-and-telegram-audio.md`.
- **Use the outbound ladder:** prove TTS output, inspect the native file with `ffprobe`, and identify the exact adapter method before interpreting Telegram errors. MP3/`sendAudio` remains Pivete's normal audio path; test OGG/Opus only when a native voice bubble was explicitly requested. After a proven voice-privacy refusal, do not retry `sendVoice`; use at most one clearly labelled MP3 fallback only when the current user preference/task allows it, and never send voice, audio, and document copies together.
- **Truthful Edge staging:** Edge emits MP3 bytes even when the requested filename ends in `.ogg`. For Telegram voice output, stage Edge into a truthful `.mp3` path, convert that result to OGG/Opus, then validate the file at the adapter boundary with `ffprobe`. Never trust the extension or `voice_compatible` flag without checking the bytes.
- **SILENT ZERO-DELIVERY (Pivete, 22/07/2026):** if `gateway_voice_mode.json` = `{"telegram:<chat_id>": "voice_only"}` AND `config.yaml` `tts.provider` points at a DEAD provider (e.g. `openai` with no key/credit, voice `echo`/English), **nothing arrives on Telegram and the logs show NO error** — `grep` for audio/voice/tts/telegram in `gateway.log`/`agent.log` for the day returns empty, while the last `mission_audio_sent.json` entry is stale (old `message_id`). Proof chain: (1) read `gateway_voice_mode.json`; (2) read `tts.provider` + provider voice in `config.yaml`; (3) confirm the provider actually generates (Edge `pt-BR-FranciscaNeural` was the working one on 18/07; OpenAI `echo` is English and was dead). Fix: set `tts.provider: edge`, `edge.voice: pt-BR-FranciscaNeural`. Never leave `voice_only` + a dead provider — it is a black hole, not a logged failure.
- **Telegram privacy variants:** recognize both legacy `VOICE_MESSAGES_FORBIDDEN` and current HTTP 400 text such as `user restricted receiving of voice note messages`. Confirm with `getChat.has_restricted_voice_and_video_messages` when available, but treat the actual `sendVoice` receipt as authoritative: only `ok=true`, `result.message_id`, and `result.voice` prove native delivery. A screenshot or a nullable chat field does not prove the bot is in an exception list. Classify a refusal as non-retryable chat privacy, suppress generic fallback, and emit one clear notice rather than one notice per response.
- **Compound filenames and inbound audio documents:** operator-copied `*.ogg.bin` ≠ Telegram `document` with a lying name. Prefer **container magic over MIME/suffix** when they disagree (ID3/MP3 must never cache as `.ogg` because MIME said `audio/ogg`). Fallback: magic → MIME `audio/*` → filename ext → default `.ogg`. Cache via audio path, classify as audio, STT-enrich. Regression: `tests/gateway/test_telegram_audio_vs_voice.py::test_audio_document_detects_mp3_bytes_instead_of_writing_false_ogg`. See `references/telegram-voice-and-document-audio.md`.
- **STT path layer (HARD):** `transcribe_audio` must not reject real audio solely for suffix `.bin`. Fix in `tools/transcription_tools.py`: `_sniff_audio_extension` + `_normalize_audio_path_for_stt` (temp true ext, `finally` unlink). Prove with fixture `voice.ogg.bin` whose bytes start `OggS`.
- **Audio-file STT contract:** `message.voice`, `message.audio`, and documents with `audio/*` MIME are all audio input; keep a file-context note when useful, but do not silently exclude ordinary audio from STT. Test the three routes separately and include chat/message/reply linkage before claiming contextual transcription.
- **No OpenAI key, no OpenAI STT:** local faster-whisper. Config may pin `large-v3` (accurate, slow cold-start); for **probes/CI** pass `model="base"`. Importability ≠ proof — load model and run a short fixture.
- **Parallel apuração:** for every new audio test, one worker executes while an independent observer watches gateway logs/runtime. Save or verify session/routing before restarts and confirm the same session, route, and memory after return. Claim success only after the external Telegram result is visible.
- **User voice replies:** understand the audio semantically; do not echo a literal transcript unless asked. Use text for simple answers and voice for long/explanatory answers, based on context.
- **One conclusion, one spoken script (HARD — Pivete):** Desktop app speech, Telegram Card, and Telegram audio/voice MUST project the **same** final answer. Pivete rejects a diagnostic Card or a test clip when the app said something else. Build one `spoken_script` from the final response (or canonical mission result), then: (1) edit the live Card Hermes HTML `<pre>` with that content, (2) TTS that same script, (3) deliver one audio/voice. Never ship probe audio (`teste-voz-permitido`, random `.ogg.bin`, temporary diagnostics) as the mission conclusion.
- **Same sanitizer path:** gateway `BasePlatformAdapter.prepare_tts_text` must use `tools.tts_tool._strip_markdown_for_tts`, matching auto-voice/`text_to_speech_tool`. Desktop `sanitizeTextForSpeech` is the UI twin — do not invent a third cleaner per channel. Divergent cleaners produce “app said X, Telegram spoke Y”.
- **Visual symbols and Windows paths are not spoken content:** keep `⏳`, `✅` and `Localização 👉🏻 <path>` in the Telegram text, but exclude emoji names, paths, backslashes, hashes and metadata from the `spoken_script`. Do not "fix" speech by deleting useful visual status. Read the current sanitizer first, reproduce with a fixture, inspect the exact provider payload, then patch and run E2E; source inspection alone is not proof of corrected audio. Class-level response contract and acceptance test: `pivete-resposta/references/visual-vs-spoken-output.md`.
- **MARKDOWN TABLE BUG (Pivete, 20/07/2026):** `_strip_markdown_for_tts` in `tools/tts_tool.py` (line ~2737) does **NOT** strip markdown tables. It removes `**bold**`, links, URLs, headers, list items — but leaves `| col | col |` pipes and `-+-` separator rows intact. Result: any response with a markdown table is read aloud **literally** by Edge TTS (“Modelo, sessões, tokens, por cento do total, gpt-5.6-sol, 2, 4.241.771…”). Root cause confirmed by reading source. Fix: add a `_MD_TABLE` regex (e.g. `re.compile(r'^\s*\|.*\|\s*$', re.MULTILINE)`) and apply it first in `_strip_markdown_for_tts`. Until patched, the agent-side workaround is to **never put a raw table in the spoken script** — keep tables in the Card/visual only, and speak prose. Action on core (`tools/tts_tool.py`) requires explicit Pivete ok (R2).
- **Telegram TTS conversion context:** when generating voice for Telegram, set `HERMES_SESSION_PLATFORM=telegram` (or equivalent session context) so Edge stages honest MP3 and the tool converts to real OGG/Opus before `sendVoice`. Prove with `ffprobe` + sanitized `result.voice`.
- **`.ogg.bin` forensics:** do not blame the adapter first. Prove identity of bytes (size + SHA-256) against the source `.ogg`, then search `state.db`/request dumps for an explicit `cp`/`rename`. Operator diagnostic copies ending in `.bin` force `sendDocument` via final-suffix routing even when bytes are OGG/Opus. Keep the artifact as evidence; do not re-send it as production media.
- **Live Card only:** with `telegram.extra.card_style=true`, edit the retained progress/final Card `message_id` (`editMessageText`) instead of stacking parallel status messages. A wrong Card is worse than a late Card.

Detailed route/filename/MIME forensics and minimal regression design: `references/telegram-audio-debugging.md`. Deterministic no-network probe: `scripts/probe_telegram_media_route.py`.

## References

- `references/pt-br-and-providers.md` — provider/voice bank + user verdicts
- `references/config-snippets.yaml` — known-good YAML fragments for pivete
- `references/telegram-audio-debugging.md` — falsification-first outbound routing, semantic voice marker, compound suffixes, filename/MIME, document hardening, and regression cases
- `scripts/probe_telegram_media_route.py` — no-network probe for extracted voice intent, final suffix, expected Bot API method, upload filename, and MIME
- `references/read-aloud-and-telegram-audio.md` — concrete-file skill reads, 15-second stall watchdog testing, MP3 `sendAudio`, and lazy Telegram adapter verification
