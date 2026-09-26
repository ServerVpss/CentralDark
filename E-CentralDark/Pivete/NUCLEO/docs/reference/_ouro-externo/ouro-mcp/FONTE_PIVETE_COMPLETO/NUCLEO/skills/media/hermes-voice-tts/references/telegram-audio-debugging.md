# Telegram outbound audio debugging — route, filename, MIME

Use this when a valid local audio file reaches Telegram as the wrong bubble type, fails with a misleading policy error, or has a compound suffix such as `.ogg.bin`.

## Never infer the endpoint from the bytes or error text

Keep these facts separate:

1. **Content:** container/codec reported by `ffprobe`.
2. **Semantic intent:** whether `[[audio_as_voice]]` was present.
3. **Dispatcher key:** the final suffix from `Path.suffix` / `splitext`.
4. **Bot API method actually called:** `sendVoice`, `sendAudio`, or `sendDocument`.
5. **Multipart filename/MIME:** python-telegram-bot derives MIME from the filename.
6. **Telegram result:** success or sanitized API error.

`VOICE_MESSAGES_FORBIDDEN` does not, by itself, prove that Hermes called `sendVoice`. An untagged `.ogg` deliberately routes to `sendDocument`; Telegram can still classify an upload as audio/voice from `audio/ogg` or server-side content detection. Prove the method from code, a mock, or sanitized request logging before classifying the failure.

## Current outbound contract

| File / intent | Expected method |
|---|---|
| `.ogg` or `.opus` + `[[audio_as_voice]]` | `sendVoice` |
| `.ogg` or `.opus` without marker | `sendDocument` |
| `.mp3` or `.m4a` | `sendAudio` |
| unsupported/unknown final suffix | `sendDocument` |

The voice marker is semantic opt-in. Do not turn every OGG into a voice note merely because its bytes contain Opus.

## Compound-suffix trap

For `clip.ogg.bin`, the final suffix is `.bin`. Hermes therefore selects `sendDocument` even when `ffprobe` identifies OGG/Opus. python-telegram-bot infers multipart metadata from the filename:

- `clip.ogg` → usually `audio/ogg`;
- `clip.ogg.bin` → usually `application/octet-stream`.

Renaming can appear to "fix" delivery because it changes both dispatch classification and multipart MIME while leaving the bytes unchanged. This is a diagnostic clue, not a production format. Find who created the renamed copy before blaming TTS or Telegram.

### Proven producer pattern (pivete session evidence)

A historical `.ogg.bin` matched its source TTS `.ogg` byte-for-byte (same size + SHA-256) and was created by an explicit agent shell `cp source.ogg dest.ogg.bin` followed by `MEDIA:...ogg.bin`. That is **not** the adapter inventing a suffix, not Edge, and not Telegram. Forensic order:

1. Hash both files.
2. Compare mtimes (copy often lags the real TTS by minutes).
3. Search `state.db` / request dumps for `cp`/`copy`/`rename` and the basename.
4. Only then inspect download/cache code paths.

Do not “fix” production by manufacturing more `.bin` names. Do not re-send the diagnostic artifact as the mission conclusion.

## Falsification-first procedure

1. Locate the exact artifact and producer command/tool result.
2. Run `ffprobe` on the artifact regardless of extension.
3. Compare size, SHA-256, and bytes with the suspected source.
4. Read the original outbound message and record whether `[[audio_as_voice]]` is present.
5. Trace extraction to `(path, is_voice)`.
6. Record the final suffix and expected dispatch method.
7. Use a no-network mock to assert which bot method receives the file.
8. Inspect the effective filename/MIME (`telegram.InputFile`) separately.
9. Only then interpret the Telegram error.
10. Recheck mutable source files before citing line numbers; concurrent work may change them during an audit.

Run `scripts/probe_telegram_media_route.py PATH [--voice]` from the Hermes repository for a deterministic, no-network classification/MIME probe.

## Edge false-container trap

Edge TTS emits MP3 bytes regardless of the requested filename suffix. Asking Edge to save directly to `reply.ogg` can therefore produce this lie:

```text
suffix=.ogg
format=mp3
codec=mp3
```

For a native Telegram voice note, use a truthful staging path:

```text
Edge text → temporary .mp3 → ffmpeg/libopus → final .ogg → adapter.send_voice
```

Probe the file **inside the adapter-boundary test**, before cleanup or upload. A green result requires `.ogg`, `format_name=ogg`, `codec_name=opus`, positive duration, and a non-empty file. A mock that merely writes `b"fake ogg"` does not test this contract.

## Voice-privacy errors are non-retryable media policy

Telegram exposes more than one surface for the same restriction:

- legacy/library shape: `VOICE_MESSAGES_FORBIDDEN` / `Voice_messages_forbidden`;
- current raw Bot API shape: HTTP 400 `Bad Request: user restricted receiving of voice note messages`;
- chat metadata, when available: `getChat.has_restricted_voice_and_video_messages = true`.

When a proven `sendVoice` request hits one of these shapes:

1. Record TTS, conversion, upload, and Telegram policy as separate stages.
2. Make no second `sendVoice` attempt and mark the result `retryable=false`.
3. Do not fall through to a generic base-adapter notice; that masks the real cause and can duplicate text.
4. Emit one clear user notice per mission/chat, not one per response.
5. Use one MP3/`sendAudio` fallback only when the task and current Pivete preference permit it; label it as regular audio, not native voice.
6. Never send `sendVoice`, `sendAudio`, and `sendDocument` copies of the same conclusion.

A privacy refusal is not a TTS failure and cannot satisfy a `result.voice` gate.

## Minimal remediation order

1. **Fix the producer:** keep `.ogg` for an explicitly requested voice note; use a real `.mp3`/`.m4a` for a regular audio attachment. Never merely rename OGG bytes to `.mp3`.
2. **Preserve intent:** require `[[audio_as_voice]]` for OGG/Opus voice bubbles.
3. **If `sendDocument` must remain a document:** use Telegram's `disable_content_type_detection=True` in every document call path and preserve a truthful filename. Cover initial send and all retries.
4. **Only add content sniffing as defense in depth:** validate OGG magic/Opus metadata before recognizing a compound suffix; never trust an inner `.ogg` suffix alone.

A code change must cover both Telegram paths:

- live gateway adapter `send_document`;
- standalone `hermes send` document branch, including thread and caption retries.

## Regression cases

- Edge stage requested as `.mp3` → converted adapter-boundary file is real OGG/Opus;
- requesting `.ogg` directly from Edge is caught when `ffprobe` reports MP3 bytes;
- valid OGG + voice marker → `sendVoice`;
- valid OGG without marker → `sendDocument` with content detection disabled;
- MP3/M4A → `sendAudio`;
- `voice.ogg.bin` is not silently promoted solely from its inner suffix;
- invalid `voice.ogg.bin` remains a document;
- document retry preserves `disable_content_type_detection=True`;
- caption-parse retry repeats the original audio/voice/document branch instead of degrading audio to document;
- either privacy-error spelling → one `sendVoice` call, zero generic fallback calls, `retryable=false`;
- privacy refusal never produces a false `result.voice` success.

## Separate adjacent failures

- MEDIA safe-path rejection happens before Telegram upload and must be proven from path-filter logs.
- TTS generation success proves only that a file exists.
- Inbound Telegram STT routing is unrelated to outbound MEDIA dispatch.
- A valid local file, mock call, or zero exit code is not external delivery proof; require a sanitized success response or user-visible result when the task allows a real send.
