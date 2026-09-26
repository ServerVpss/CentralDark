#!/usr/bin/env python3
"""Fetch public YouTube captions for the CentralDark media adapter.

The script is intentionally read-only: it fetches caption tracks, emits JSON,
and never downloads video/audio. Audio transcription is a separate, explicit
fallback because it has different cost, rights, and runtime requirements.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
from urllib.parse import parse_qs, urlparse

VIDEO_ID = re.compile(r"^[A-Za-z0-9_-]{11}$")


def video_id(value: str) -> str:
    value = value.strip()
    if VIDEO_ID.fullmatch(value):
        return value
    parsed = urlparse(value)
    if parsed.netloc in {"youtu.be", "www.youtu.be"}:
        candidate = parsed.path.strip("/").split("/")[0]
    elif parsed.netloc.endswith("youtube.com"):
        query_id = parse_qs(parsed.query).get("v", [""])[0]
        candidate = query_id or parsed.path.strip("/").split("/")[-1]
    else:
        candidate = ""
    if not VIDEO_ID.fullmatch(candidate):
        raise ValueError("URL_YOUTUBE_INVALIDA")
    return candidate


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("url")
    parser.add_argument("--language", default="pt,en")
    args = parser.parse_args()
    try:
        from youtube_transcript_api import YouTubeTranscriptApi
    except ImportError:
        print(json.dumps({"ok": False, "status": "DEPENDENCY_MISSING", "dependency": "youtube-transcript-api"}))
        return 2

    try:
        ident = video_id(args.url)
        languages = [item.strip() for item in args.language.split(",") if item.strip()]
        transcript = YouTubeTranscriptApi().fetch(ident, languages=languages or None)
        segments = [
            {"text": item.text, "start": float(item.start), "duration": float(item.duration)}
            for item in transcript
        ]
        full_text = " ".join(item["text"].strip() for item in segments if item["text"].strip())
        transcript_hash = hashlib.sha256(
            json.dumps(segments, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
        ).hexdigest()
        print(json.dumps({
            "ok": True,
            "status": "CAPTIONS_FETCHED",
            "provider": "youtube-transcript-api",
            "video_id": ident,
            "language": getattr(transcript, "language_code", None),
            "is_generated": getattr(transcript, "is_generated", None),
            "segment_count": len(segments),
            "transcript_sha256": transcript_hash,
            "full_text": full_text,
            "segments": segments,
        }, ensure_ascii=False))
        return 0
    except Exception as exc:
        print(json.dumps({
            "ok": False,
            "status": "CAPTIONS_UNAVAILABLE",
            "video_id": locals().get("ident"),
            "error_class": type(exc).__name__,
            "error": str(exc)[:400],
        }, ensure_ascii=False))
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
