from __future__ import annotations

import hashlib
import json
from pathlib import Path
from typing import Any


def build_seal(root: Path, paths: list[str]) -> dict[str, Any]:
    roots = sorted(set(paths))
    entries = _entries_for_paths(root, roots)
    payload = {
        "schema": 2,
        "algorithm": "sha256",
        "paths": roots,
        "entries": entries,
    }
    payload["seal_sha256"] = _manifest_hash(payload)
    return payload


def verify_seal(root: Path, seal: dict[str, Any]) -> dict[str, Any]:
    expected = seal.get("seal_sha256")
    unsigned = {key: value for key, value in seal.items() if key != "seal_sha256"}
    manifest_valid = (
        seal.get("schema") == 2
        and seal.get("algorithm") == "sha256"
        and isinstance(seal.get("paths"), list)
        and expected == _manifest_hash(unsigned)
    )
    changed: list[dict[str, str]] = []
    try:
        actual_entries = _entries_for_paths(root, seal.get("paths", []))
    except (FileNotFoundError, ValueError) as error:
        return {
            "valid": False,
            "manifest_valid": manifest_valid,
            "changed": [{"path": str(error), "reason": "root_invalid"}],
        }

    expected_by_path = {
        entry["path"]: entry
        for entry in seal.get("entries", [])
        if isinstance(entry, dict) and isinstance(entry.get("path"), str)
    }
    actual_by_path = {entry["path"]: entry for entry in actual_entries}

    for path in sorted(expected_by_path.keys() - actual_by_path.keys()):
        changed.append({"path": path, "reason": "missing"})
    for path in sorted(actual_by_path.keys() - expected_by_path.keys()):
        changed.append({"path": path, "reason": "added"})
    for path in sorted(expected_by_path.keys() & actual_by_path.keys()):
        expected_entry = expected_by_path[path]
        actual_entry = actual_by_path[path]
        if (
            expected_entry.get("size") != actual_entry["size"]
            or expected_entry.get("sha256") != actual_entry["sha256"]
        ):
            changed.append({"path": path, "reason": "content_changed"})

    return {
        "valid": manifest_valid and not changed,
        "manifest_valid": manifest_valid,
        "changed": changed,
    }


def _entries_for_paths(root: Path, paths: list[str]) -> list[dict[str, Any]]:
    resolved_root = root.resolve()
    entries: dict[str, dict[str, Any]] = {}
    for relative in sorted(set(paths)):
        target = (root / relative).resolve()
        if not target.is_relative_to(resolved_root):
            raise ValueError(f"path escapes root: {relative}")
        if target.is_file():
            entry = _entry(root, target)
            entries[entry["path"]] = entry
        elif target.is_dir():
            for item in sorted(target.rglob("*")):
                if item.is_file():
                    entry = _entry(root, item)
                    entries[entry["path"]] = entry
        else:
            raise FileNotFoundError(relative)
    return [entries[path] for path in sorted(entries)]


def _manifest_hash(value: dict[str, Any]) -> str:
    return hashlib.sha256(
        json.dumps(value, sort_keys=True, separators=(",", ":")).encode()
    ).hexdigest()


def _entry(root: Path, path: Path) -> dict[str, Any]:
    data = path.read_bytes()
    return {
        "path": path.relative_to(root).as_posix(),
        "size": len(data),
        "sha256": hashlib.sha256(data).hexdigest(),
    }
