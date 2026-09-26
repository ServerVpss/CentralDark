# Telegram report + audio delivery recipe

Use this when Pivete wants a local Hermes analysis mirrored to the configured Telegram home channel, including a readable summary, complete report, or audio.

## Preconditions

- Profile is `pivete`.
- Discover the configured target; do not guess chat IDs or paste credentials.
- Sanitize reports: no tokens, passwords, credential-bearing URLs, private camera streams, or unnecessary network identifiers.

## Canonical mission result

Build the conclusion once, then render channels from it. A practical in-memory shape is:

```python
mission_result = {
    "mission_id": "stable-id",
    "state": "CONDICIONADA",
    "title": "...",
    "summary": "...",
    "work_executed": ["..."],
    "evidence": ["..."],
    "pending": "...",
    "next_step": "...",
    "report_path": r"C:\path\report.md",
    "spoken_script": "...",
    "started_at": "ISO-8601",
    "finished_at": "ISO-8601",
}
```

This is a contract, not permission to add a database. Reuse existing mission/gateway/session state. The app, Card, Read Aloud, Telegram audio, and report must agree on the same state, evidence, pending item, and verdict.

### HARD user rule (Pivete)

> The same audios that play in the Desktop app must arrive on Telegram, always with the correct Card.

If app and Telegram diverged: stop more media, rebuild from the canonical text, `editMessageText` the live Card, then send one audio from that same `spoken_script`. Never ship diagnostic Cards or probe clips as the conclusion.

## One live Card and final dedup

- Render the house Card as HTML with all ordinary content inside one `<pre>...</pre>`; escape `&`, `<`, and `>` before interpolation. Prefer adapter `_telegram_card_chunks` / `card_style` when enabled.
- Send an initial Card only when useful. Retain its `message_id` and edit it for meaningful progress changes instead of creating a trail of status messages.
- Before final delivery, compare `(mission_id, event, state, content_hash, destination)`. If the same tuple already has a delivery handle, do not resend after a retry or gateway restart.
- Final output is one Card, one canonical report only when relevant, and one final audio/voice message. The app response is not a separately authored conclusion.
- Use `result.voice`, `result.audio`, or `result.document` from the sanitized Bot API response to classify the delivered object; a successful HTTP call without the expected object does not pass the intended media gate.
- Speech cleanup: shared `_strip_markdown_for_tts` / Desktop `sanitizeTextForSpeech` twin — not a crude per-channel regex.

## Report delivery

```bash
hermes --profile pivete send --list telegram
hermes --profile pivete send --to telegram \
  --subject 'Hermes — relatório' \
  'Resumo curto e legível...'
hermes --profile pivete send --to telegram \
  'MEDIA:C:/absolute/path/to/report.md' --json
```

Use short text for immediate reading and attach a long report as a document. Require `success: true` and retain `message_id`; a local artifact or exit code alone is not delivery proof.

## Audio contract

Pivete's default is **a real MP3 via `sendAudio`**. Use OGG/Opus only for an explicitly requested Telegram voice bubble.

Validate the source first:

```bash
ffprobe -v error \
  -show_entries format=format_name,duration,size,bit_rate \
  -show_entries stream=codec_name,codec_type,sample_rate,channels \
  -of json C:/absolute/path/to/audio.mp3
```

Send MP3 through the normal media route:

```bash
hermes --profile pivete send --to telegram --json \
  'MEDIA:C:/absolute/path/to/audio.mp3'
```

A valid receipt includes `success: true`, `platform: telegram`, and `message_id`.

## Explicit voice-bubble probe

A voice bubble requires both OGG/Opus and semantic opt-in:

```text
[[audio_as_voice]]
MEDIA:C:/absolute/path/to/voice.ogg
```

A plain `MEDIA:...voice.ogg` has no voice intent and routes to `sendDocument`, not `sendVoice`. Therefore an error string such as `VOICE_MESSAGES_FORBIDDEN` is not enough to identify the endpoint: prove the actual Bot API method from code/logs/mocks before saying that native voice was refused.

If a proven `sendVoice` call is refused, recognize both the legacy token and the current Bot API wording:

```text
VOICE_MESSAGES_FORBIDDEN
Bad Request: user restricted receiving of voice note messages
```

When available, confirm the policy with:

```text
getChat.has_restricted_voice_and_video_messages = true
```

Classify it as a non-retryable privacy restriction, not a TTS/conversion failure. Do not call `sendVoice` again, do not fall through to a generic adapter notice, and do not manufacture `.ogg.bin`. Send one clear notice for the mission/chat. If the current task and Pivete preference allow fallback, try one real MP3 via `sendAudio` and label it as regular audio:

- MP3 succeeds → native voice is blocked; ordinary audio is available.
- MP3 also fails → report both proven route failures before considering a document.

Do not send `sendVoice`, `sendAudio`, and `sendDocument` variants simultaneously.

## `.ogg.bin` is a diagnostic hack, not a format

For `clip.ogg.bin`, Hermes sees the final suffix `.bin` and selects `sendDocument`. python-telegram-bot typically derives `application/octet-stream` from that filename even though the bytes may still be OGG/Opus. This can change Telegram's behavior without changing the audio.

Do not manufacture or preserve `.ogg.bin` as the solution. Trace the producer/copy command, keep truthful extensions, and use MP3 for audio or tagged OGG for voice. If product code must force a document, prefer Telegram's `disable_content_type_detection=True` while preserving a truthful filename.

## Verification checklist

- [ ] One canonical mission result feeds app, Card, spoken script, media, and report.
- [ ] One progress Card is edited in place; final `(mission_id, event, state, content_hash, destination)` is deduplicated.
- [ ] Target discovered with `send --list`; no guessed credentials.
- [ ] Summary/report receipt has `success: true` and `message_id`.
- [ ] Codec/container verified independently of extension at the adapter boundary.
- [ ] MP3/`sendAudio` used by default for Pivete unless native voice was explicitly required.
- [ ] OGG/Opus voice probe contains `[[audio_as_voice]]`.
- [ ] Actual `sendVoice`/`sendAudio`/`sendDocument` method was proven before interpreting errors.
- [ ] Returned `voice`/`audio`/`document` object matches the claimed delivery type.
- [ ] Voice privacy is confirmed from sanitized API/chat evidence, is non-retryable, and produces one notice.
- [ ] Filename and MIME were checked when renaming changes behavior.
- [ ] No `.ogg.bin` workaround was retained as a canonical artifact.
- [ ] Spoken audio preserves the text/card/report verdict, failures, numbers, and pending item.
- [ ] Exactly one final audio/voice message is associated with the conclusion.
