#!/usr/bin/env python
"""No-network probe for Hermes Telegram MEDIA routing and PTB filename/MIME."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

from gateway.config import Platform
from gateway.platforms.base import BasePlatformAdapter, should_send_media_as_audio
from telegram import InputFile


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("path", type=Path)
    parser.add_argument(
        "--voice",
        action="store_true",
        help="Include the [[audio_as_voice]] semantic marker",
    )
    args = parser.parse_args()

    path = args.path.expanduser().resolve()
    if not path.is_file():
        parser.error(f"not a file: {path}")

    message = ("[[audio_as_voice]]\n" if args.voice else "") + f"MEDIA:{path}"
    media, cleaned = BasePlatformAdapter.extract_media(message)
    media = BasePlatformAdapter.filter_media_delivery_paths(media)
    if not media:
        print(json.dumps({"path": str(path), "error": "MEDIA path not accepted"}, indent=2))
        return 1

    routed_path, is_voice = media[0]
    suffix = Path(routed_path).suffix.lower()
    native_audio = should_send_media_as_audio(
        Platform.TELEGRAM, suffix, is_voice=is_voice
    )
    if native_audio and suffix in {".ogg", ".opus"}:
        method = "sendVoice"
    elif native_audio:
        method = "sendAudio"
    else:
        method = "sendDocument"

    with path.open("rb") as handle:
        upload = InputFile(handle)

    print(
        json.dumps(
            {
                "path": str(path),
                "suffix": suffix,
                "is_voice": is_voice,
                "expected_method": method,
                "upload_filename": upload.filename,
                "upload_mimetype": upload.mimetype,
                "cleaned_text": cleaned,
            },
            indent=2,
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
