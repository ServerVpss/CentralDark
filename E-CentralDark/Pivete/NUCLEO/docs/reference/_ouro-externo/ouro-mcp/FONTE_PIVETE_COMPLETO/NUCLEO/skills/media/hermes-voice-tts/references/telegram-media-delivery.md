# Telegram MEDIA audio delivery diagnosis

## Symptom

Telegram reports:

```text
Couldn't deliver the audio attachment.
```

The TTS engine can still have succeeded: a valid `.ogg`/Opus file exists, but the Hermes gateway may drop the `MEDIA:<path>` directive before calling Telegram.

## Relevant upstream reference

GitHub issue [#32644](https://github.com/NousResearch/hermes-agent/issues/32644): **Telegram MEDIA audio attachment can report success while delivering no attachment**.

The documented root cause is MEDIA path safety filtering, especially:

```text
Skipping unsafe MEDIA directive path outside allowed roots
```

The same file may work through a direct Telegram Bot API `sendVoice`/`sendAudio` call, proving that the audio file and Telegram API are not the root cause.

## Debug sequence

1. Confirm TTS actually produced a file.
2. Inspect the file type/codec and size; Telegram voice should be valid Ogg/Opus.
3. Confirm the gateway is running.
4. Inspect gateway logs for unsafe MEDIA-path filtering.
5. Compare the generated path with configured/approved media roots (`storage.safepath` / media allow directories).
6. Do not disable all path protection. Add the profile's durable audio directory to the approved roots or apply the upstream gateway fix.
7. Verify with a real Telegram send after restarting the gateway if the configuration changed.

## Distinguish from issue #24870

Issue #24870 concerns **incoming** Telegram payload routing (`message.voice` vs `message.audio` vs audio `message.document`) and STT. It does not explain an outbound `MEDIA:` attachment failure. Keep these flows separate:

```text
Telegram -> Hermes: inbound type routing / STT
Hermes -> Telegram: MEDIA path filtering / attachment delivery
```

## Session evidence

On profile `pivete`, Edge TTS generated a 66,712-byte Ogg/Opus mono 24 kHz file under the profile cache, while the Telegram attachment was not delivered. This pattern is consistent with #32644 and should be treated as a gateway MEDIA-path problem until logs prove otherwise.
