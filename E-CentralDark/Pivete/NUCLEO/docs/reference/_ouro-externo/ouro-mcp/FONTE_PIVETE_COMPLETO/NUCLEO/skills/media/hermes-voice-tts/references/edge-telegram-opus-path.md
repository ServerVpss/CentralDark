# Edge → Telegram OGG/Opus path (pivete)

## Truthful staging

Edge TTS always writes **MP3 bytes**. Requesting a `.ogg` filename from Edge produces a lying suffix (MP3 content, `.ogg` name).

Correct pipeline for native Telegram voice bubbles:

```text
spoken_script
→ Edge TTS → real .mp3 path
→ ffmpeg libopus → real .ogg (OggS + codec opus)
→ adapter sendVoice (multipart field voice)
→ Bot API result.voice { mime_type, duration, file_id }
```

## When conversion runs

`tools/tts_tool.py` converts MP3→OGG only if the session platform is Telegram (`get_session_env("HERMES_SESSION_PLATFORM") == "telegram"`).

- Gateway auto-voice (`gateway/run.py` `_send_voice_reply`) stages `.mp3` and relies on that conversion.
- Direct/CLI probes must set `HERMES_SESSION_PLATFORM=telegram` or you get honest MP3 + `sendAudio`, not `sendVoice`.

## Proof checklist

1. `ffprobe`: format_name=ogg, codec_name=opus (or mp3 for sendAudio path).
2. Filename has **no** trailing `.bin`.
3. Bot API JSON includes `result.voice` for sendVoice (not only `result.audio` / `result.document`).
4. Optional: `reply_to_message_id` binds voice to the same chat thread.

## `.ogg.bin` evidence files

House cache may contain `*.ogg.bin` that are **valid OggS** copies (same SHA as a sibling `.ogg`). Treat as:

- diagnostic/legacy **name**, not a broken codec;
- do not delete without Pivete order;
- inbound: magic/MIME outrank misleading final suffix; STT layer also normalizes `.bin` paths;
- outbound: never ship `.bin` as the voice filename;
- optional sidecar: `cache/audio/ORIGEM-ogg.bin.txt` (byte identity + non-pipeline origin).

## Pivete default vs voice test

- Default delivery preference: **MP3 + sendAudio** for ordinary analysis audio.
- Native voice bubble (OGG/Opus + sendVoice): only when the mission/task explicitly requires it (auto-TTS voice replies on Telegram are that case).
