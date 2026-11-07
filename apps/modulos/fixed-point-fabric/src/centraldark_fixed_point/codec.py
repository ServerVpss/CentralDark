from __future__ import annotations

# #OBSERVACOES#
# @owner: apps/modulos/fixed-point-fabric/src/centraldark_fixed_point/codec.py
# @doc_ref: docs/CONSCIENCIA/RECEIPTS/2026-11-03-branches-891-funil-hud.md
# @last_updated: 2026-11-03T18:16:50.564Z
# @implementado: arquivamento ignora symlinks e qualquer caminho externo à raiz fonte.
# @pendente: CI e revisão source SAME_HEAD; runtime fora do escopo.
# @estado: SOURCE_CORRECTED; STATIC_GATES=PENDING; RUNTIME=NOT_TESTED_BY_SCOPE
# @next_cursor: confrontar gates e review debts de #1381 no PR #1977.

import base64
import hashlib
import json
import zipfile
from pathlib import Path
from typing import Any


class IntegrityError(ValueError):
    pass


def encode_bytes(data: bytes) -> dict[str, Any]:
    return {"encoding": "base64", "size": len(data), "sha256": hashlib.sha256(data).hexdigest(), "content": base64.b64encode(data).decode("ascii")}


def decode_bytes(envelope: dict[str, Any]) -> bytes:
    if envelope.get("encoding") != "base64":
        raise IntegrityError("unsupported encoding")
    data = base64.b64decode(envelope["content"], validate=True)
    if len(data) != int(envelope["size"]) or hashlib.sha256(data).hexdigest() != envelope["sha256"]:
        raise IntegrityError("size or sha256 mismatch")
    return data


def compact_project(source: Path, destination: Path) -> dict[str, Any]:
    destination_resolved = destination.resolve()
    # Links simbólicos não podem fazer o pacote ler arquivos fora da fonte.
    source_resolved = source.resolve()
    files = sorted(
        path for path in source.rglob("*")
        if not path.is_symlink()
        and path.is_file()
        and path.resolve().is_relative_to(source_resolved)
        and path.resolve() != destination_resolved
        and not any(part in {".git", ".venv", "__pycache__", ".centraldark-fp"} for part in path.parts)
    )
    manifest = {"schema": 1, "files": []}
    destination.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(destination, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
        for path in files:
            relative = path.relative_to(source).as_posix()
            data = path.read_bytes()
            digest = hashlib.sha256(data).hexdigest()
            archive.writestr(relative, data)
            manifest["files"].append({"path": relative, "size": len(data), "sha256": digest})
        archive.writestr("PACKAGE-MANIFEST.json", json.dumps(manifest, sort_keys=True, indent=2).encode())
    manifest["archive_sha256"] = hashlib.sha256(destination.read_bytes()).hexdigest()
    return manifest
