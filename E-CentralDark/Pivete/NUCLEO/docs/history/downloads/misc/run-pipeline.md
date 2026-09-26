# OUTRO - run-pipeline.sh
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\squads\audio-reels\scripts\run-pipeline.sh
**SHA:** 80acf3d3b6359e97
**Timestamp:** 2026-08-28T02:19:09.039776
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- echo "  Run: mkdir -p ~/.config/aios && nano ~/.config/aios/credentials.yaml"

### Ouro Bruto (primeiros 5000 chars)
```
#!/bin/bash
# Audio Reels — Full Pipeline Orchestrator (v2.0.0)
# Usage: ./run-pipeline.sh <audio_file> [output_name] [--style STYLE]
#
# Requires:
#   - API keys in ~/.config/aios/credentials.yaml (google, freepik, elevenlabs)
#   - Character reference image at {output_dir}/assets/character-reference.png
#   - ffmpeg, python3, node.js 18+

SQUAD_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PROJECT_ROOT="$(cd "$SQUAD_DIR/../.." && pwd)"
SCRIPTS="$SQUAD_DIR/scripts"
REMOTION="$SQUAD_DIR/templates/remotion-reels"

AUDIO_FILE="$1"
SLUG="${2:-test}"
DATE=$(date +%Y-%m-%d)
WORK_DIR="$PROJECT_ROOT/outputs/audio-reels/${DATE}_${SLUG}"

if [ -z "$AUDIO_FILE" ]; then
    echo "Usage: $0 <audio_file> [output_name]"
    echo "Example: $0 /path/to/audio.ogg meu-reel"
    exit 1
fi

if [ ! -f "$AUDIO_FILE" ]; then
    echo "ERROR: Audio file not found: $AUDIO_FILE"
    exit 1
fi

# ── Pre-flight: Validate API Keys ──
echo "── Pre-flight: Checking API Keys ──"
CREDS="$HOME/.config/aios/credentials.yaml"
if [ ! -f "$CREDS" ]; then
    echo "ERROR: Credentials file not found: $CREDS"
    echo "  Run: mkdir -p ~/.config/aios && nano ~/.config/aios/credentials.yaml"
    exit 1
fi

GOOGLE_KEY=$(python3 -c "import yaml; c=yaml.safe_load(open('$CREDS')); print(c.get('google',{}).get('api_key',''))" 2>/dev/null)
FREEPIK_KEY=$(python3 -c "import yaml; c=yaml.safe_load(open('$CREDS')); print(c.get('freepik',{}).get('api_key',''))" 2>/dev/null)
ELEVENLABS_KEY=$(python3 -c "import yaml; c=yaml.safe_load(open('$CREDS')); print(c.get('elevenlabs',{}).get('api_key',''))" 2>/dev/null)

KEYS_OK=true
if [ -z "$GOOGLE_KEY" ]; then
    echo "  ✗ Google Gemini API key: MISSING"
    KEYS_OK=false
else
    echo "  ✓ Google Gemini API key: OK"
fi
if [ -z "$FREEPIK_KEY" ]; then
    echo "  ✗ Freepik (Kling AI) API key: MISSING"
    KEYS_OK=false
else
    echo "  ✓ Freepik (Kling AI) API key: OK"
fi
if [ -z "$ELEVENLABS_KEY" ]; then
    echo "  ✗ ElevenLabs API key: MISSING"
    KEYS_OK=false
else
    echo "  ✓ ElevenLabs API key: OK"
fi

if [ "$KEYS_OK" = false ]; then
    echo ""
    echo "ERROR: Missing API keys. Add them to: $CREDS"
    exit 1
fi
echo ""

echo "═══════════════════════════════════════════"
echo "  Audio Reels Pipeline v2.0"
echo "═══════════════════════════════════════════"
echo "  Audio: $AUDIO_FILE"
echo "  Output: $WORK_DIR"
echo "  Date: $DATE"
echo "═══════════════════════════════════════════"
echo ""

START_TIME=$(date +%s)

# Setup
mkdir -p "$WORK_DIR/assets/scenes" "$WORK_DIR/assets/sfx" "$WORK_DIR/assets/videos"

# ── Pre-flight: Validate Character Reference ──
CHAR_REF="$WORK_DIR/assets/character-reference.png"
if [ ! -f "$CHAR_REF" ]; then
    # Try JPG variant
    CHAR_REF_JPG="$WORK_DIR/assets/character-reference.jpg"
    if [ ! -f "$CHAR_REF_JPG" ]; then
        echo "═══════════════════════════════════════════"
        echo "  ⚠ CHARACTER REFERENCE REQUIRED"
        echo "═══════════════════════════════════════════"
        echo ""
        echo "  The pipeline requires a frontal photo of the"
        echo "  character to ensure visual consistency."
        echo ""
        echo "  Place it at:"
        echo "    $CHAR_REF"
        echo ""
        echo "  Requirements:"
        echo "    - PNG or JPG, min 512x512 px"
        echo "    - Frontal face/bust, neutral background"
        echo ""
        echo "═══════════════════════════════════════════"
        exit 1
    else
        CHAR_REF="$CHAR_REF_JPG"
    fi
fi
echo "[preflight] ✓ Character reference: $CHAR_REF"
echo ""

# Step 0: Convert audio to MP3
echo "── Step 0: Audio Conversion ──"
DURATION=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$AUDIO_FILE" 2>/dev/null)
echo "[convert] Duration: ${DURATION}s"

MP3_PATH="$WORK_DIR/original.mp3"
ffmpeg -y -i "$AUDIO_FILE" -vn -ac 1 -ar 16000 -b:a 64k "$MP3_PATH" 2>/dev/null
if [ ! -f "$MP3_PATH" ]; then
    echo "ERROR: Audio conversion failed"
    exit 1
fi
echo "[convert] ✓ Converted to MP3"
echo ""

# Step 1: Transcription (Gemini Flash)
echo "── Step 1: Transcription (Gemini Flash) ──"
TRANS_PATH="$WORK_DIR/transcription.json"
python3 "$SCRIPTS/transcribe.py" "$AUDIO_FILE" "$TRANS_PATH"
if [ $? -ne 0 ] || [ ! -f "$TRANS_PATH" ]; then
    echo "ERROR: Transcription failed"
    exit 1
fi
echo ""

# Step 2: Scene Analysis (Gemini Pro)
echo "── Step 2: Scene Analysis (Gemini Pro) ──"
SPEC_PATH="$WORK_DIR/spec.json"
python3 "$SCRIPTS/analyze-scenes.py" "$TRANS_PATH" "$SPEC_PATH" "$MP3_PATH"
if [ $? -ne 0 ] || [ ! -f "$SPEC_PATH" ]; then
    echo "ERROR: Scene analysis failed"
    exit 1
fi
echo ""

# Step 3a: Generate Images (parallel start)
echo "── Step 3a: Image Generation (Gemini 2.5 Flash) ──"
python3 "$SCRIPTS/generate-images.py" "$SPEC_PATH" "$WORK_DIR/assets/scenes"
if [ $? -ne 0 ]; then
    echo "ERROR: Image generation failed"
    exit 1
fi
echo ""

# Step 3b: Generate SFX
echo "── Step 3b: SFX Generation (ElevenLabs) ──"
python3 "$SCRIPTS/generate-sfx.py" "$SPEC_PATH" "$WORK_DIR/assets"
echo ""
```