# Read Aloud and Telegram audio layer isolation

Use this reference when TTS generation succeeds but Read Aloud or Telegram delivery fails. Diagnose each layer independently; never treat one layer's success as end-to-end proof.

## Layer map

1. **Skill discovery** — Hermes found `SKILL.md`.
2. **Skill file read** — a specific linked file was opened.
3. **TTS synthesis** — provider returned an audio file.
4. **Container/codec validation** — `ffprobe` can decode the file and reports expected duration/rate/channels.
5. **Local playback** — the audio element starts and emits progress.
6. **Hermes media routing** — `MEDIA:<path>` passes path safety and chooses the intended adapter method.
7. **Platform acceptance** — Telegram returns success and a message ID.
8. **User-visible playback** — the delivered item actually appears and can be played.

Record which layer failed. Do not repair ACLs, codecs, provider config, or Telegram routing until the failing layer is identified.

## Canonical audio across Desktop and Telegram

When both surfaces must speak the same result, “same text passed twice” is not enough. Require one TTS job and one retained source:

```text
final response
→ one backend speech sanitizer
→ speech_text + hash
→ one profile-local TTS job + safe voice-config hash
→ retained canonical source bytes
├─ Desktop playback reads those bytes
└─ Telegram derives OGG/Opus or MP3 transport from those bytes
```

Rules:

- Use `turn_id` as correlation identity, but keep declared `mission_id` and runtime `session_id` separate.
- The Desktop renderer sends raw final text plus session/mission identity; it must not run a second speech sanitizer.
- The backend resolves the persisted result by raw-source hash and identity, then returns the retained source without deleting it.
- Telegram never calls TTS independently. It converts only the canonical source and deletes only the disposable transport derivative.
- Freeze provider, voice, model/language, and speed before synthesis; hash that safe snapshot. Never persist keys or tokens.
- Status telemetry is not audio. Do not speak mission-start/delegation/waiting events unless Desktop plays the identical script.
- If a canonical job fails, mark the affected surface degraded. Do not silently create a second voice/job as fallback.
- Verify `speech_text_sha256`, correlation ID, mission/profile, voice-config hash, source hash, typed Telegram receipt, actual Desktop `ended`, and compatible durations after codec conversion.
- Test fakes must create non-empty files when production checks path/bytes/hash/cleanup; a returned nonexistent filename is not a valid successful fixture.

For the complete implementation and restart/dedupe audit, use `hermes-casa-pivete/references/canonical-result-delivery-audit.md`.

## `PermissionError` while reading a skill

`skill_view(..., file_path="references/")` passes a directory where a file is required and can surface `PermissionError`/`EISDIR`. That is not proof that the skill ACL is broken.

Correct sequence:

1. Load the main skill without `file_path`.
2. Read the returned `linked_files` list.
3. Call `skill_view` again with a concrete file such as `references/telegram-audio-debugging.md`.
4. Check ACLs only if a concrete file also fails to open.

## Read Aloud: 15 seconds is a stall watchdog

In the Desktop playback path, the 15-second timer is a **no-progress watchdog**, not a maximum audio duration. Each `timeupdate` event rearms it. A 30-second speech file should play normally when progress events continue.

Separate three clocks:

- synthesis request timeout;
- delay before `play`/`playing`;
- playback stall timeout after progress stops.

Controlled probe:

1. Generate a PT-BR MP3 longer than 20 seconds using the active profile provider.
2. Validate duration and codec with `ffprobe`.
3. Start playback through a real Chromium/Electron audio element with a user gesture.
4. Record `play`, `playing`, `timeupdate`, `waiting`, `stalled`, `error`, and `ended` with timestamps/currentTime.
5. Require at least one `timeupdate` after 15 seconds and a final `ended` event with no error.

If that passes, synthesis, codec, and Chromium playback are healthy. A remaining Hermes Read Aloud failure is in the Desktop request/bridge/session path and must be reproduced in the actual app before changing TTS configuration or the 15-second constant.

## Telegram: voice message versus audio attachment

Telegram exposes different routes:

- OGG/Opus voice bubble → `sendVoice`;
- MP3 audio attachment → `sendAudio`.

`VOICE_MESSAGES_FORBIDDEN` from `sendVoice` does not prove `sendAudio` is forbidden. Use this ladder:

1. Generate and `ffprobe` the source.
2. Default to MP3 for Pivete unless a voice bubble was explicitly requested.
3. Send through the official profile path:
   `hermes --profile pivete send --to telegram --json "MEDIA:<absolute-mp3-path>"`.
4. Require `success: true` and retain `message_id`.
5. If an explicit OGG/Opus voice-bubble probe returns `VOICE_MESSAGES_FORBIDDEN`, retry once as MP3/`sendAudio`.
6. If MP3 succeeds, classify the policy as **voice-message forbidden, audio attachment allowed**. Keep MP3; do not fall back to `.ogg.bin`.
7. Use a document fallback only when both native routes fail, and report the degradation honestly.

A local file, adapter invocation, or zero exit code is not delivery proof. Require the sanitized Telegram result or user-visible message. Never print the bot token.

## Bundled Telegram plugin status

A bundled `kind: platform` adapter may appear “not enabled” in the generic plugin list while being available through lazy/deferred platform registration. Confirm the manifest kind, registry entry, gateway connection, `send --list telegram`, and a real send before changing plugin enablement.
