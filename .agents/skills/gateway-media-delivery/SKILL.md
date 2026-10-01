---
name: gateway-media-delivery
description: "Hermes Gateway MEDIA: delivery failure diagnostics."
categories: [software-development]
---

# Gateway Media Delivery Troubleshooting

> Use when: `MEDIA:/path` fails to deliver, audio arrives as a file instead of a voice bubble, the bot silently drops an attachment, or the user reports "couldn't deliver the attachment" on any messaging platform.

## Diagnostic order (fastest signal first)

Work the chain from infrastructure → platform → file → format. Do NOT jump to "the file is wrong" before confirming the gateway can even attempt delivery.

### 1. Gateway alive?

```bash
hermes gateway status
```

If stopped: `hermes gateway start` (or `hermes gateway run` for foreground). **No gateway = no delivery**, period. The `MEDIA:` tag is resolved by the gateway process, not by the agent turn alone.

### 2. Platform credentials present?

Open `~/.hermes/.env` and confirm the platform token exists and is non-empty:

```bash
cat ~/.hermes/.env | grep -i TELEGRAM_BOT_TOKEN
cat ~/.hermes/.env | grep -i DISCORD_TOKEN
```

Tokens live in `.env`, never in `config.yaml`. If `hermes config set` was used for a known env-key name, it was routed to `.env` automatically — verify there, not in YAML.

### 3. Sender authorized?

For Telegram: `TELEGRAM_ALLOWED_USERS` must include the sender's numeric user ID (not username). Get the ID via [@userinfobot](https://t.me/userinfobot) or [@get_id_bot](https://t.me/get_id_bot).

For other platforms, check the analogous allowlist/env var (`DISCORD_ALLOWED_USERS`, etc.).

### 4. File actually at the path the gateway can see?

The `MEDIA:/absolute/path` must exist **on the host filesystem where the gateway runs**.

- **Native terminal backend:** path is host-visible by definition.
- **Docker backend:** the path must be inside a `docker_volumes` mount. A file written inside the container at `/workspace/x` is invisible to the host-side gateway even if the agent emitted `MEDIA:/workspace/x`.

```bash
ls -la /caminho/do/arquivo
file /caminho/do/arquivo   # confirm it is not empty/corrupt
```

### 5. Extension on the supported list?

| Category | Extensions |
|----------|-----------|
| Images | `png`, `jpg`, `jpeg`, `gif`, `webp`, `bmp`, `tiff`, `svg` |
| Audio | `mp3`, `wav`, `ogg`, `m4a`, `opus`, `flac`, `aac` |
| Video | `mp4`, `mov`, `webm`, `mkv`, `avi` |
| Documents | `pdf`, `txt`, `md`, `csv`, `json`, `xml`, `html`, `yaml`, `yml`, `log` |
| Office | `docx`, `xlsx`, `pptx`, `odt`, `ods`, `odp` |
| Archives | `zip`, `rar`, `7z`, `tar`, `gz`, `bz2` |
| Books/packages | `epub`, `apk`, `ipa` |

Anything off-list falls back to a link or plain-text indicator on most platforms — it is NOT a hard delivery failure, just a degraded one.

### 6. TTS format quirk (audio-only deliveries)

This is the most common "it delivers but not the way I expected" case.

**Edge TTS (default free provider)** outputs **MP3**. Telegram delivers MP3 as a **file attachment** (rectangular player), not a native voice bubble (round, inline-playable). To get the voice bubble, **ffmpeg must be installed** so the gateway can transcode MP3 → Opus.

```bash
# Ubuntu/Debian
sudo apt install ffmpeg

# macOS
brew install ffmpeg

# Verify
ffmpeg -version
```

Without ffmpeg, delivery still works — as a file, not a bubble. **This is not a failure to report up; it is a format downgrade.** Don't spend a turn chasing a non-bug.

**OpenAI TTS and ElevenLabs** produce Opus natively — no ffmpeg needed, voice bubbles work out of the box.

### 7. Platform-specific silent killers

**Telegram groups:** privacy mode is ON by default. The bot only sees `/commands`, replies to itself, and service messages. Fix: disable privacy via @BotFather (`/mybots → Bot Settings → Group Privacy → Turn off`) **and remove+re-add the bot to the group**, or promote the bot to group admin.

**Telegram webhook mode:** if `TELEGRAM_WEBHOOK_URL` is set, the gateway expects inbound HTTPS. A webhook that is not publicly reachable, lacks TLS, or has a wrong port silently drops updates. Test with `curl` from outside the host.

---

## Decision shortcuts

| Symptom | First check | Second check |
|---------|------------|--------------|
| "Couldn't deliver attachment" | gateway running? | file path host-visible? |
| Audio is a file, not a bubble | ffmpeg installed? (Edge TTS) | provider is OpenAI/ElevenLabs? (no ffmpeg needed) |
| Bot completely silent | bot token valid? | sender in allowlist? |
| Works in DM, dead in group | privacy mode? | bot is group admin? |
| Works locally, fails in Docker | `docker_volumes` includes the output path? | `MEDIA:` path is host-visible, not container-only? |

---

## Delivery monitoring (alert on failure, not silence)

When silent delivery failure is unacceptable, run a monitor that watches for failure signals and alerts rather than leaving the system hanging.

**Pattern:** poll gateway logs / delivery ledger / platform API → detect a delivery failure signature → trigger an audible alert + log the context.

The alert must carry **what failed**, not just "something failed": file path, platform, timestamp, and the last known gateway state. A bare bip with no context is noise; a bip with a log line the user can act on is a signal.

See `references/audio-alert-monitor.md` and `scripts/delivery-bip.c` for a starter Windows implementation.

---

## Pitfalls

- **Edge TTS without ffmpeg is not a bug.** MP3→Opus conversion is what produces a voice bubble. No ffmpeg = file attachment. Don't escalate this as a delivery failure.
- **Gateway down looks like a file problem.** Always confirm `hermes gateway status` before inspecting the file.
- **Container-only `MEDIA:` paths.** The gateway runs on the host; a path that only exists inside the terminal container cannot be read for delivery. Mount the output dir.
- **Group privacy mode caches per join.** Changing privacy in BotFather does not take effect until the bot is removed and re-added to the group. Re-adding is part of the fix, not optional.
- **Token in config.yaml instead of .env.** Known env-key names routed through `hermes config set` land in `.env`. Hand-editing `config.yaml` for a token will not work.
- **Bare alert with no context.** An audible bip that doesn't also log what failed forces the user to guess. Always pair the alert with a structured log line.

---

## References

- `references/audio-alert-monitor.md` — designing a delivery-failure alert that is actionable, not noisy
- `scripts/delivery-bip.c` — Windows C starter: watch a log path, detect a failure signature, play a bip via `PlaySound`/`Beep`, log context

## External docs

- [Hermes Telegram setup](https://hermes-agent.nousresearch.com/docs/user-guide/messaging/telegram) — bot token, allowlist, privacy mode, voice messages, webhook mode
- [Hermes Voice Mode](https://hermes-agent.nousresearch.com/docs/user-guide/features/voice-mode) — TTS provider comparison, ffmpeg requirement, voice bubble mechanics