# COMANDO - generate-videos.py
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\squads\audio-reels\scripts\generate-videos.py
**SHA:** e1bde760d41723c2
**Timestamp:** 2026-08-28T02:19:09.016219
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- prompt = scene.get("image_prompt", "")
- # Build motion prompt: scene description + camera + style enforcement
- motion_prompt = prompt
- prompt=motion_prompt,

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env python3
"""
Audio Reels — Step 3c: Video Clip Generation via Freepik Kling AI (image-to-video)
Reads spec.json, takes generated scene images, sends to Kling O1 API for image-to-video,
polls for completion, downloads video clips, updates spec with video_path.

Usage:
    python3 generate-videos.py --spec-dir /path/to/output-dir
    python3 generate-videos.py --spec-dir /path/to/output-dir --api-key FPSX...
    python3 generate-videos.py --spec-dir /path/to/output-dir --model kling-o1-pro
    python3 generate-videos.py --spec-dir /path/to/output-dir --duration 10

Environment:
    FREEPIK_API_KEY - Freepik API key (alternative to --api-key)
"""

import sys
import os
import json
import base64
import time
import argparse
import urllib.request
import urllib.error

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

BASE_URL = "https://api.freepik.com"
ASPECT_RATIO = "9:16"

# Available Kling O1 models on Freepik
MODELS = {
    "kling-o1-std": "/v1/ai/image-to-video/kling-o1-std",
    "kling-o1-pro": "/v1/ai/image-to-video/kling-o1-pro",
}

# Video-reference endpoints (support reference_images for character consistency)
MODELS_VIDEO_REF = {
    "kling-o1-std": "/v1/ai/image-to-video/kling-o1-std-video-reference",
    "kling-o1-pro": "/v1/ai/image-to-video/kling-o1-pro-video-reference",
}

# Task status endpoint (shared for all O1 models)
TASK_STATUS_PATH = "/v1/ai/image-to-video/kling-o1"

# Default model: Standard is faster and cheaper
DEFAULT_MODEL = "kling-o1-std"

# Polling configuration
POLL_INTERVAL_SECONDS = 10
POLL_MAX_ATTEMPTS = 90        # 90 * 10s = 15 minutes max wait per task
INITIAL_WAIT_SECONDS = 15     # Wait before first poll (videos take 30-120s)

# Retry configuration
MAX_RETRIES = 3
RETRY_DELAY_SECONDS = 5

# Rate limit: Freepik allows up to 3 concurrent requests
CONCURRENT_LIMIT = 3
DELAY_BETWEEN_SUBMITS = 2     # seconds between task submissions


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def api_request(method, path, api_key, body=None, timeout=60):
    """Make an HTTP request to the Freepik API."""
    url = f"{BASE_URL}{path}"
    headers = {
        "x-freepik-api-key": api_key,
        "Content-Type": "application/json",
    }

    data = json.dumps(body).encode("utf-8") if body else None
    req = urllib.request.Request(url, data=data, headers=headers, method=method)

    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            response_body = resp.read().decode("utf-8")
            if response_body:
                return json.loads(response_body)
            return {}
    except urllib.error.HTTPError as e:
        error_body = ""
        try:
            error_body = e.read().decode("utf-8")
        except Exception:
            pass
        raise RuntimeError(
            f"API {method} {path} returned {e.code}: {error_body}"
        ) from e


def image_to_base64(image_path):
    """Read an image file and return its base64-encoded string."""
    with open(image_path, "rb") as f:
        return base64.b64encode(f.read()).decode("utf-8")


def download_file(url, output_path, timeout=120):
    """Download a file from URL to local path."""
    req = urllib.request.Request(url)
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        with open(output_path, "wb") as f:
            while True:
                chunk = resp.read(8192)
                if not chunk:
                    break
                f.write(chunk)


def choose_duration(scene_duration):
    """Pick 5s or 10s video based on scene duration.

    Kling O1 supports only 5 or 10 second outputs.
    - If scene duration >= 8s, use 10s video
    - Otherwise use 5s video
    """
    if scene_duration >= 8.0:
        return 10
    return 5


# ---------------------------------------------------------------------------
# Core API functions
# ---------------------------------------------------------------------------

def submit_image_to_video(
    api_key,
    image_path,
    prompt,
    model=DEFAULT_MODEL,
    duration=5,
    aspect_ratio=ASPECT_RATIO,
    webhook_url=None,
    character_image_path=None,
):
    """Submit an image-to-video task to Freepik Kling O1 API.

    If character_image_path is provided, uses the video-reference endpoint
    with both character photo and scene image as reference_images.
    Otherwise uses the standard endpoint with first_frame.

    Returns the task_id on success.
    """
    if character_image_path:
        # Use video-reference endpoint for character consistency
        endpoint = MODELS_VIDEO_REF.get(model)
        if not endpoint:
            raise ValueError(f"Unknown model: {model}. Available: {list(MODELS_VIDEO_REF.keys())}")

        # Build reference_images: character photo + scene image
```