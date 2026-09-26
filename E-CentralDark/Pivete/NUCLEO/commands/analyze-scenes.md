# COMANDO - analyze-scenes.py
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\squads\audio-reels\scripts\analyze-scenes.py
**SHA:** 0f177ff7c610e15e
**Timestamp:** 2026-08-28T02:19:09.099201
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- SYSTEM_PROMPT = """You are a cinema scene director and comic book artist analyzing an audio transcription to create a scene breakdown for a vertical video (9:16, Reels/TikTok/Shorts).
- MANDATORY STRUCTURE for every image_prompt:
- user_prompt = f"""Transcription:
- scene_start = scene["start"]

### Padroes
- # Look for the pattern: last complete }] before the error

### Gaps
- gap = abs(s["start"] - scenes[i-1]["end"])
- print(f"[analyze] WARNING: Gap {gap:.2f}s between scene {scenes[i-1]['id']} and {s['id']}")

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env python3
"""
Audio Reels — Step 2: Analise de Cenas via Gemini 2.0 Flash
Recebe transcricao JSON, retorna Video Spec JSON parcial com cenas.
"""

import sys
import os
import json
import re
import urllib.request
import yaml

def load_api_key():
    creds_path = os.path.expanduser("~/.config/aios/credentials.yaml")
    with open(creds_path) as f:
        creds = yaml.safe_load(f)
    return creds["google"]["api_key"]

SYSTEM_PROMPT = """You are a cinema scene director and comic book artist analyzing an audio transcription to create a scene breakdown for a vertical video (9:16, Reels/TikTok/Shorts).

Given a transcription with word-level timestamps, produce a JSON VideoSpec.

DECISION TREE (apply strictly for each scene):

Step 1 - audio_layer:
- Voice about feelings/reflection → "voice-introspective"
- Voice describing scene/action → "voice-descriptive"
- Silence + sound effect described → "sfx-dominant"
- Voice + sound effect simultaneous → "mixed"
- Pause without voice or sfx → "ambient"

Step 2 - shot_type (based on audio_layer):
- voice-introspective → "close-up" or "extreme-close-up"
- voice-descriptive → "wide-shot" or "establishing-shot" or "low-angle"
- sfx-dominant → "insert-shot"
- mixed → "over-the-shoulder" or "medium-shot"
- ambient → "wide-shot" or "establishing-shot"

Step 3 - camera_movement (based on mood):
- tension → "slow-zoom-in" or "handheld-shake"
- triumph → "slow-zoom-out" or "ken-burns"
- sadness → "static" or "slow-zoom-in"
- humor → "ken-burns"
- reflection → "slow-zoom-in"
- urgency → "handheld-shake"
- revelation → "dolly-in"
- neutral → "ken-burns"

Step 4 - transition_in:
- First scene → "fade-from-black"
- Same mood as previous → "cut"
- Mood change → "dissolve"
- Abrupt change (strong sfx) → "cut"

Step 5 - SFX:
- If text mentions a specific sound → sfx with description in English
- Otherwise → sfx = null

IMAGE PROMPT RULES (CRITICAL — follow exactly):

Each image_prompt must be a RICH, CINEMATIC scene description written for a comic book illustrator. Never write vague or generic prompts.

MANDATORY STRUCTURE for every image_prompt:
"{Shot type} of {subject with detailed physical description}, {specific action/pose}, {environment with 3+ concrete details}, {lighting description}, {specific objects/props visible}"

STYLE DIRECTION (applied via prompt_suffix, do NOT repeat in image_prompt):
- Comic book illustration with clean ink outlines, slightly irregular hand-drawn linework
- Cel-shaded coloring with hard shadows (defined shapes, not soft gradients)
- Muted warm color palette: beige, ochre, grayish blue, desaturated tones
- Fine grain texture simulating old paper or vintage film stock
- NOT photorealistic — must look like a hand-drawn graphic novel panel

GOOD image_prompt examples:
- "Close-up shot of a Brazilian woman talking on her smartphone inside a moving car at night, rain droplets on the window behind her, warm dashboard lights reflecting on her face, tired but determined expression, detailed skin texture, earrings catching light."
- "Wide shot of a cozy cafeteria in Brasilia at night, heavy rain pouring outside the glass windows, warm interior lighting with wooden tables, two people sitting across from each other with coffee cups and a laptop open, modernist Brasilia architecture visible through rain-streaked glass, puddles reflecting neon signs on the sidewalk."
- "Low-angle shot of a man in a crowded bus wiping sweat from his forehead, surrounded by dozens of tired commuters holding rails, golden afternoon light streaming through dirty windows, worn leather seats, a woman checking her phone nearby."

BAD image_prompt examples (NEVER do this):
- "A worried woman's face" (too vague, no environment, no details)
- "Rainy street scene" (generic, no specifics)
- "Person holding phone" (no context, no emotion, no setting)

GENERAL RULES:
1. Segment by NARRATIVE BEATS (emotion/scene changes), NOT fixed time
2. image_prompt must be in English, 40-80 words, RICHLY descriptive
3. Do NOT include style suffix in image_prompt (will be added later)
4. Scenes must be contiguous: scene[n].end == scene[n+1].start
5. Last scene MUST end at the audio duration (cover full audio)
6. No scene shorter than 1.5s or longer than 7s
7. NEVER use the same shot_type twice in a row
8. First scene MUST be close-up or extreme-close-up (hook)
9. SFX only when text EXPLICITLY mentions a sound

Return ONLY valid JSON (no markdown fences)."""

def analyze_scenes(transcription, api_key):
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={api_key}"

    # Send only text + segments to Gemini (NOT the full words array - too verbose)
    transcription_lite = {
        "text": transcription.get("text", ""),
        "language": transcription.get("language", "pt-BR"),
        "duration_seconds": transcription.get("duration_seconds", 30),
        "segments": transcription.get("segments", []),
    }

    user_prompt = f"""Transcription:
{j
```