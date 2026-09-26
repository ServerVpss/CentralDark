# Telegram voice proof and inbound document-audio routing

Use this reference when a Telegram voice-note result conflicts with a screenshot, a filename, or a historical error.

## Outbound proof ladder

1. Generate provider output into a truthful staging suffix. Edge TTS emits MP3 bytes even if the requested path ends in `.ogg`; stage it as `.mp3`.
2. Convert with the existing provider-aware TTS tool, then inspect the returned path at the adapter boundary with `ffprobe`.
3. For native voice, require real OGG/Opus bytes, filename ending `.ogg`, and declared MIME `audio/ogg`.
4. Call exactly one `sendVoice` attempt. A native-voice pass requires all of:
   - HTTP success / `ok=true`;
   - `result.message_id` present;
   - `result.voice` present;
   - `result.audio` and `result.document` absent.
5. A screenshot showing Telegram's general voice setting, and even a nullable `getChat.has_restricted_voice_and_video_messages`, is not proof that this bot is in an exception. The real `sendVoice` receipt is authoritative.
6. On privacy refusal, recognize both the legacy `VOICE_MESSAGES_FORBIDDEN` form and current text such as `user restricted receiving of voice note messages`. Do not retry or fall through to a generic duplicate notice. Use one deduplicated warning/card; use MP3 `sendAudio` only when the current task explicitly permits fallback.

## `.ogg.bin` diagnosis

Separate two cases:

- **Historical/operator artifact:** a valid OGG may have been explicitly copied or renamed to `.ogg.bin`. Trace the producer command and hashes before blaming the adapter.
- **Inbound document bug:** a Telegram `document` can arrive with `file_name=voice.ogg.bin` and `mime_type=audio/ogg`. If the adapter calculates only the final suffix, it enters generic document handling, preserves `.bin`, and skips STT.

Also: MIME can **lie**. A fixture may set `mime_type=audio/ogg` while payload is ID3/MP3. Adapter must sniff magic **before** MIME→ext. Expected: `cache_audio_from_bytes(..., ext=".mp3")`, `media_types=["audio/mpeg"]`.

Priority: **magic → MIME audio/* → filename ext → default .ogg**. Route through the existing audio cache with a truthful extension, set the normalized MIME on the event, classify as audio. Never rename bytes without checking content.

## Inbound STT contract

Treat all of these as audio input:

- `message.voice`;
- `message.audio`;
- `message.document` with `audio/*` MIME.

The normal audio-file context note may remain, but ordinary audio must not be silently excluded from STT. Preserve `chat_id`, `message_id`, `reply_to_message_id`, caption, filename, and MIME so related text and audio remain in one conversation context. Test each Telegram media shape independently before claiming multimodal support.

### STT tool suffix gate

`tools/transcription_tools.py` rejects unsupported path suffixes before the provider. A path ending in `.bin` fails even when bytes are OggS/Opus.

Defense in depth:

```text
_sniff_audio_extension(path) → .ogg|.mp3|.flac|.wav|.m4a|None
_normalize_audio_path_for_stt → temp copy with true suffix when needed
transcribe_audio → normalize → validate → provider → finally unlink temp
```

Probe without hanging on cold `large-v3`:

```python
transcribe_audio(str(path), model="base")
```

## Minimal regression shape

A no-network adapter harness should construct a document named `voice.ogg.bin` with MIME `audio/ogg`, mock the existing download, and assert:

```text
cache_audio_from_bytes(..., ext=".ogg")
event.media_types == ["audio/ogg"]
event.message_type == MessageType.AUDIO
handle_message(event) called once
cached path does not end with .bin
```

A gateway regression should mock STT and assert `MessageType.AUDIO` invokes the same transcription enrichment used by `MessageType.VOICE`, while retaining the file-context note where appropriate.
