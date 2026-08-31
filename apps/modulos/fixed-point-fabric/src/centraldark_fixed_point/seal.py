from __future__ import annotations

import hashlib
import json
from pathlib import Path
from typing import Any


def build_seal(root: Path, paths: list[str]) -> dict[str, Any]:
    entries = []
    for relative in sorted(set(paths)):
        target = (root / relative).resolve()
        if not target.is_relative_to(root.resolve()):
            raise ValueError(f"path escapes root: {relative}")
        if target.is_file():
            entries.append(_entry(root, target))
        elif target.is_dir():
            entries.extend(_entry(root, item) for item in sorted(target.rglob("*")) if item.is_file())
        else:
            raise FileNotFoundError(relative)
    payload = {"schema": 1, "algorithm": "sha256", "entries": entries}
    payload["seal_sha256"] = hashlib.sha256(json.dumps(payload, sort_keys=True, separators=(",", ":")).encode()).hexdigest()
    return payload


def verify_seal(root: Path, seal: dict[str, Any]) -> dict[str, Any]:
    expected = seal.get("seal_sha256")
    unsigned = {key: value for key, value in seal.items() if key != "seal_sha256"}
    actual_seal = hashlib.sha256(json.dumps(unsigned, sort_keys=True, separators=(",", ":")).encode()).hexdigest()
    changed = []
    for entry in seal.get("entries", []):
        path = root / entry["path"]
        if not path.is_file():
            changed.append({"path": entry["path"], "reason": "missing"})
            continue
        data = path.read_bytes()
        if len(data) != entry["size"] or hashlib.sha256(data).hexdigest() != entry["sha256"]:
            changed.append({"path": entry["path"], "reason": "content_changed"})
    return {"valid": expected == actual_seal and not changed, "manifest_valid": expected == actual_seal, "changed": changed}


def _entry(root: Path, path: Path) -> dict[str, Any]:
    data = path.read_bytes()
    return {"path": path.relative_to(root).as_posix(), "size": len(data), "sha256": hashlib.sha256(data).hexdigest()}

