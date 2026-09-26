"""Local-only SOL transcription adapter for the existing faster-whisper install."""

import json
import os
import sys
from pathlib import Path

from faster_whisper import WhisperModel


def main() -> int:
    if len(sys.argv) != 2:
        print("audio_path_required", file=sys.stderr)
        return 2
    audio_path = Path(sys.argv[1])
    model_path = os.environ.get("SOL_STT_MODEL_PATH", "base")
    language = os.environ.get("SOL_STT_LANGUAGE", "pt")
    if not audio_path.is_file():
        print("audio_file_missing", file=sys.stderr)
        return 2

    model = WhisperModel(model_path, device="cpu", compute_type="int8", local_files_only=True)
    segments, info = model.transcribe(str(audio_path), language=language, beam_size=1, vad_filter=True)
    text = " ".join(segment.text.strip() for segment in segments).strip()
    print(json.dumps({
        "text": text,
        "language": info.language,
        "model": model_path,
        "local_files_only": True,
        "mutation": False,
    }, ensure_ascii=False))
    return 0 if text else 3


if __name__ == "__main__":
    raise SystemExit(main())
