# OUTRO - download_semantic_model.py
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\infra\mcp\download_semantic_model.py
**SHA:** 581093c4a1800967
**Timestamp:** 2026-08-28T02:57:28.627471
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- raise RuntimeError(f"SOURCE_FILE_MISSING:{filename}")

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env python3
"""Explicit, pinned downloader/verifier for the CentralDark NILC GloVe model."""
from __future__ import annotations

import argparse
import json
import os
from datetime import datetime, timezone
from pathlib import Path

import numpy as np
from huggingface_hub import snapshot_download
from safetensors.numpy import load_file

from semantic_core import (
    DIMENSION,
    EMBEDDING_FILENAME,
    EXPECTED_EMBEDDINGS_SHA256,
    MANIFEST_FILENAME,
    MODEL_ID,
    MODEL_SLUG,
    SOURCE_FILES,
    SOURCE_LICENSE,
    SOURCE_REPO,
    SOURCE_REVISION,
    VOCAB_FILENAME,
    sha256_file,
)


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def choose_tensor(payload: dict[str, np.ndarray]) -> np.ndarray:
    if "embeddings" in payload:
        return payload["embeddings"]
    if len(payload) == 1:
        return next(iter(payload.values()))
    raise RuntimeError(f"EMBEDDING_TENSOR_AMBIGUOUS: {sorted(payload)}")


def verify(model_dir: Path, downloaded_at: str | None = None) -> dict:
    embedding_path = model_dir / EMBEDDING_FILENAME
    vocab_path = model_dir / VOCAB_FILENAME
    if not embedding_path.is_file() or not vocab_path.is_file():
        raise RuntimeError("MODEL_FILES_MISSING")

    vocab = vocab_path.read_text(encoding="utf-8", errors="strict").splitlines()
    vectors = np.asarray(choose_tensor(load_file(str(embedding_path))))
    if vectors.ndim != 2:
        raise RuntimeError(f"EMBEDDING_RANK_INVALID:{vectors.shape}")
    if vectors.shape[0] != len(vocab):
        raise RuntimeError(f"VOCAB_ROWS_MISMATCH:vocab={len(vocab)} rows={vectors.shape[0]}")
    if vectors.shape[1] != DIMENSION:
        raise RuntimeError(f"DIMENSION_MISMATCH:expected={DIMENSION} observed={vectors.shape[1]}")

    observed_embedding_sha = sha256_file(embedding_path)
    if observed_embedding_sha != EXPECTED_EMBEDDINGS_SHA256:
        raise RuntimeError(
            f"SHA256_MISMATCH:{EMBEDDING_FILENAME}:expected={EXPECTED_EMBEDDINGS_SHA256} observed={observed_embedding_sha}"
        )

    file_records = []
    for filename in SOURCE_FILES:
        path = model_dir / filename
        if not path.is_file():
            raise RuntimeError(f"SOURCE_FILE_MISSING:{filename}")
        file_records.append({
            "name": filename,
            "sha256": sha256_file(path),
            "size": path.stat().st_size,
        })

    now = utc_now()
    return {
        "schema_version": 1,
        "status": "VERIFIED",
        "model_id": MODEL_ID,
        "source": SOURCE_REPO,
        "revision": SOURCE_REVISION,
        "license": SOURCE_LICENSE,
        "files": file_records,
        "dimension": int(vectors.shape[1]),
        "vocab_size": int(vectors.shape[0]),
        "physical_path": str(model_dir.resolve()),
        "downloaded_at": downloaded_at,
        "verified_at": now,
        "original_files_modified": False,
        "git_binary_storage": "NOT_REQUIRED_MODEL_OUTSIDE_GIT",
    }


def write_manifest(model_dir: Path, manifest: dict) -> Path:
    path = model_dir / MANIFEST_FILENAME
    temp = path.with_suffix(".json.tmp")
    temp.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    os.replace(temp, path)
    return path


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--model-home",
        default=os.getenv("SEMANTIC_MODEL_HOME"),
        help="owner físico; pode ser o diretório do modelo ou seu diretório-pai",
    )
    parser.add_argument("--verify-only", action="store_true")
    ns = parser.parse_args()

    if not ns.model_home:
        raise SystemExit("SEMANTIC_MODEL_HOME_REQUIRED")

    base = Path(ns.model_home).expanduser()
    model_dir = base if (base / EMBEDDING_FILENAME).exists() else base / MODEL_SLUG
    model_dir.mkdir(parents=True, exist_ok=True)

    downloaded_at = None
    if not ns.verify_only:
        downloaded_at = utc_now()
        snapshot_download(
            repo_id=SOURCE_REPO,
            revision=SOURCE_REVISION,
            local_dir=str(model_dir),
            allow_patterns=list(SOURCE_FILES),
        )

    manifest = verify(model_dir, downloaded_at=downloaded_at)
    manifest_path = write_manifest(model_dir, manifest)
    print(json.dumps({
        "ok": True,
        "model_id": MODEL_ID,
        "revision": SOURCE_REVISION,
        "model_path": str(model_dir),
        "manifest_path": str(manifest_path),
        "vocab_size": manifest["vocab_size"],
        "dimension": manifest["dimension"],
        "status": manifest["status"],
    }, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

```