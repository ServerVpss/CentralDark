# Telegram `/voice on` and TTS Verification

Use this reference when the user asks to test Hermes voice/TTS on Telegram.

## Claims to keep separate

- `VOICE_MODE`: gateway state says the chat is in voice mode.
- `AUDIO_FILE`: TTS produced a local audio file with bytes and a decodable duration.
- `TELEGRAM_DELIVERY`: the Telegram adapter sent it and the client/user received it.

A local `media_tag` or file path is not delivery proof.

## Windows Hermes Agent recipe

```bash
cd 'C:/Users/Administrador/AppData/Local/hermes/hermes-agent'

# Ensure Edge provider and TLS CA bundle are present in the Hermes Agent venv.
uv pip install --python '.venv/Scripts/python.exe' edge-tts certifi
'.venv/Scripts/python.exe' - <<'PY'
import certifi, os
print('CERTIFI='+certifi.where())
print('CERTIFI_EXISTS='+str(os.path.exists(certifi.where())))
PY

# Generate a measurable TTS file with an explicit provider.
out='C:/Users/Administrador/AppData/Local/hermes/cache/audio/voice-on-live-test.ogg'
rm -f "$out"
'.venv/Scripts/python.exe' - <<'PY'
import sys, os
sys.path.insert(0, r'C:/Users/Administrador/AppData/Local/hermes/hermes-agent')
from tools.tts_tool import text_to_speech_tool, check_tts_requirements, _load_tts_config
out=r'C:/Users/Administrador/AppData/Local/hermes/cache/audio/voice-on-live-test.ogg'
raw=text_to_speech_tool('Chefe, teste de TTS do Hermes em português.', output_path=out, provider='edge')
print('RAW='+raw[:500].replace('\n',' '))
print('CFG_PROVIDER='+str((_load_tts_config() or {}).get('provider')))
print('REQ='+str(check_tts_requirements()))
print('EXISTS='+str(os.path.exists(out)))
print('SIZE='+str(os.path.getsize(out) if os.path.exists(out) else -1))
PY
ffmpeg -hide_banner -i "$out" 2>&1 | sed -n '1,12p'

# Read voice-mode state.
sed -n '1,80p' 'C:/Users/Administrador/AppData/Local/hermes/gateway_voice_mode.json'
```

## Interpretation

- `RAW` includes `"success": true`, `EXISTS=True`, `SIZE>0`, and `ffmpeg` shows duration/audio stream: `AUDIO_FILE=PASS`.
- `gateway_voice_mode.json` contains `"telegram:<chat_id>": "all"`: `VOICE_MODE=ACTIVE_ALL` for that chat.
- `CFG_PROVIDER` can remain a different default provider and `REQ=False`; this means the default provider is not green, not that the explicit provider failed.
- `TELEGRAM_DELIVERY` remains `UNKNOWN` until the adapter send is observed or the user confirms the received voice/audio.

## Receipt format

```text
VOICE_MODE=ACTIVE_ALL|OFF|UNKNOWN
TTS_PROVIDER=edge|<provider>|UNKNOWN
AUDIO_FILE=PASS|FAIL
DURATION=<measured duration or UNKNOWN>
SIZE=<bytes or UNKNOWN>
DEFAULT_TTS_PROVIDER=GREEN|NOT_GREEN|UNKNOWN
TELEGRAM_DELIVERY=PASS|UNKNOWN|FAIL
FILE=<absolute path>
```
