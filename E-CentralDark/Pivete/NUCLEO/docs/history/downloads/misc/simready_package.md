# OUTRO - simready_package.py
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\nvidia\skills\omniverse-cad-to-simready\shared\simready_package.py
**SHA:** 8c7e5807a6346e9a
**Timestamp:** 2026-08-26T18:42:41.336937
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- missing = sorted({"format_version", "package_id", "license"} - set(payload))
- checks.append(_check(f"metadata_file_exists:{name}", exists, f"Metadata file exists: {name}" if exists else f"Metadata file listed but missing: {name}", code="PKG.META.001"))
- checks.append(_check(f"bom_file_exists:{rel}", file_exists, f"BOM item file exists: {rel}" if file_exists else f"BOM item file is missing: {rel}", code="PKG.BOM.001"))
- checks.append(_check("bom_complete", actual_content == bom_content, "BOM lists every package content file" if actual_content == bom_content else f"BOM content mismatch; missing={sorted(actual_content 

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env python3
# SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
# SPDX-License-Identifier: Apache-2.0

from __future__ import annotations

import argparse
from datetime import datetime, timezone
import hashlib
import json
import os
from pathlib import Path, PurePosixPath
import re
import subprocess
import sys
from typing import Any

from script_utils import check_result_with_code as _check, emit_json_report


PACKAGING_DEFINITION_FILENAME = "com.nvidia.simready.packaging.json"
METADATA_FOLDER = ".metadata"
BOM_FILENAME = "com.nvidia.simready.packaging.bom.json"
ROOT_USDS_FILENAME = "com.nvidia.simready.root_usds.json"
STANDARD_FORMAT_VERSION = "1.0"
SIMREADY_PROFILE_VERSION = "1.0.0"
PACKAGE_ID_PREFIX = "com.nvidia.simready"
PACKAGE_ROOT_USD_SUFFIXES = {".usd", ".usda", ".usdc"}
SUPPORTED_REFERENCED_SUFFIXES = {".usd", ".usda", ".usdc", ".usdz", ".png", ".jpg", ".jpeg", ".exr", ".m4a", ".mp3", ".wav"}
SUPPORTED_PACKAGE_SIDECAR_SUFFIXES = {".json", ".md", ".txt"}
PROFILE_CHOICES = ("Package", "Package-NoBOM")


def _skill_name() -> str:
    return Path(sys.argv[0]).resolve().parents[1].name


def _phase(name: str, checks: list[dict[str, Any]], success_message: str, fail_message: str) -> dict[str, Any]:
    passed = not _errors_from_checks(checks)
    return {
        "name": name,
        "passed": passed,
        "status": "PASS" if passed else "FAIL",
        "message": success_message if passed else fail_message,
        "checks": checks,
    }


def _errors_from_checks(checks: list[dict[str, Any]]) -> list[str]:
    return [check["message"] for check in checks if check["severity"] == "error" and not check["passed"]]


def _warnings_from_checks(checks: list[dict[str, Any]]) -> list[str]:
    return [check["message"] for check in checks if check["severity"] == "warning" and not check["passed"]]


def _read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def _write_json(path: Path, payload: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2, sort_keys=True) + "\n", encoding="utf-8")


def _hash_bytes(data: bytes) -> dict[str, str]:
    return {"sha256": hashlib.sha256(data).hexdigest()}


def _hash_file(path: Path) -> dict[str, str]:
    return _hash_bytes(path.read_bytes())


def _content_files(package_root: Path) -> list[Path]:
    files: list[Path] = []
    for path in package_root.rglob("*"):
        if not path.is_file():
            continue
        rel = path.relative_to(package_root).as_posix()
        if rel == PACKAGING_DEFINITION_FILENAME:
            continue
        if rel == METADATA_FOLDER or rel.startswith(f"{METADATA_FOLDER}/"):
            continue
        if rel.endswith(".wrapp"):
            continue
        files.append(path)
    return sorted(files, key=lambda value: value.relative_to(package_root).as_posix())


def _build_bom(package_root: Path) -> dict[str, Any]:
    items = []
    for path in _content_files(package_root):
        items.append(
            {
                "relative_path": path.relative_to(package_root).as_posix(),
                "size": path.stat().st_size,
                "hash": _hash_file(path),
            }
        )
    return {
        "format_version": STANDARD_FORMAT_VERSION,
        "content_root": str(package_root),
        "items": items,
    }


def _compute_content_hash(items: list[dict[str, Any]]) -> dict[str, str] | None:
    buffer = bytearray()
    for item in sorted(items, key=lambda value: str(value["relative_path"]).encode("utf-8")):
        sha256 = item.get("hash", {}).get("sha256")
        if not sha256:
            return None
        buffer.extend(str(item["relative_path"]).encode("utf-8"))
        buffer.append(0)
        buffer.extend(bytes.fromhex(sha256))
    return _hash_bytes(bytes(buffer))


def _compute_package_hash(
    package_id: str,
    license_id: str,
    content_hash: dict[str, str],
    metadata_entries: list[dict[str, Any]],
) -> dict[str, str]:
    buffer = bytearray()
    buffer.extend(package_id.encode("utf-8"))
    buffer.append(0)
    buffer.extend(license_id.encode("utf-8"))
    buffer.append(0)
    buffer.extend(bytes.fromhex(content_hash["sha256"]))
    for entry in sorted(metadata_entries, key=lambda value: str(value["name"]).encode("utf-8")):
        buffer.extend(str(entry["name"]).encode("utf-8"))
        buffer.append(0)
        buffer.extend(bytes.fromhex(entry["hash"]["sha256"]))
    return _hash_bytes(bytes(buffer))


def _is_valid_posix_relative_path(value: str) -> bool:
    pure = PurePosixPath(value)
    if "\\" in value or pure.is_absolute():
        return False
    if not value or value.startswith("../") or value == ".." or "/../" in value:
        return False
    return True


def _open_usd(path: Path) -> bool:
    try:
        from pxr import Usd
    except Exception:
        return False
    try:
        return Usd.Stage.Open(str(
```