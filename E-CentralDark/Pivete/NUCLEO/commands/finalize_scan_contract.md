# COMANDO - finalize_scan_contract.py
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\codex-security\scripts\finalize_scan_contract.py
**SHA:** c072bc5b44107909
**Timestamp:** 2026-08-26T18:31:09.563280
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- start = location.get("startLine")
- if not isinstance(end, int) or end < start:
- line_start = True
- if line_start:
- line_start = False
- line_start = True
- run: dict[str, Any] = {
- run = runs[0]

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env python3
"""Validate and seal additive Codex Security scan-contract artifacts."""

from __future__ import annotations

import argparse
import copy
import errno
import hashlib
import importlib.util
import json
import os
import re
import secrets
import stat
from collections.abc import Iterator
from datetime import datetime
from pathlib import Path, PurePosixPath
from typing import Any, TextIO
from urllib.parse import quote, urlsplit

SCHEMA_VERSION = "1.0"
FINGERPRINT_ALGORITHM = "codex-security/v1"
SARIF_SCHEMA = "https://docs.oasis-open.org/sarif/sarif/v2.1.0/os/schemas/sarif-schema-2.1.0.json"
SEVERITIES = {"critical", "high", "medium", "low", "informational"}
CONFIDENCES = {"high", "medium", "low"}
TARGET_KINDS = {"git_revision", "git_worktree", "git_diff", "directory_snapshot"}
DISPOSITIONS = {"reported", "no_issue_found", "rejected", "not_applicable", "needs_follow_up"}
SARIF_LEVELS = {
    "critical": "error",
    "high": "error",
    "medium": "warning",
    "low": "note",
    "informational": "note",
}
SLUG_RE = re.compile(r"^[a-z0-9][a-z0-9._/-]*$")
RFC3339_RE = re.compile(
    r"^\d{4}-\d{2}-\d{2}[Tt]\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:[Zz]|[+-]\d{2}:\d{2})$"
)
GITHUB_HASH_BLOCK_SIZE = 100
GITHUB_HASH_MOD = 37
GITHUB_HASH_MASK = (1 << 64) - 1
GITHUB_HASH_EOF = 65535
GITHUB_HASH_MAX_LINES = 100_000
SOURCE_READ_CHUNK_SIZE = 64 * 1024
SOURCE_READ_MAX_BYTES = 10 * 1024 * 1024


class ContractError(ValueError):
    """Raised when a completed scan does not satisfy the additive contract."""


def _reject_non_finite_json(value: str) -> None:
    raise ValueError(f"non-finite JSON number {value!r} is not supported")


def _loads_json(value: str | bytes) -> Any:
    return json.loads(value, parse_constant=_reject_non_finite_json)


def _read_json(path: Path) -> dict[str, Any]:
    try:
        payload = _loads_json(path.read_text(encoding="utf-8"))
    except FileNotFoundError as exc:
        raise ContractError(f"missing required contract artifact: {path}") from exc
    except ValueError as exc:
        raise ContractError(f"{path}: invalid JSON: {exc}") from exc
    if not isinstance(payload, dict):
        raise ContractError(f"{path}: expected a JSON object")
    return payload


def _write_json(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(_json_bytes(payload))


def _generate_report_projection(
    manifest: dict[str, Any],
    findings: dict[str, Any],
    coverage: dict[str, Any],
) -> bytes:
    script = Path(__file__).resolve().parent / "report_projection.py"
    spec = importlib.util.spec_from_file_location("codex_security_report_projection", script)
    if spec is None or spec.loader is None:
        raise ContractError(f"could not load report projection helper: {script}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    try:
        return module.generate_report_markdown(manifest, findings, coverage)
    except (OSError, ValueError) as exc:
        raise ContractError(f"report projection failed: {exc}") from exc


def _validate_report_output_paths(scan_dir: Path) -> None:
    _validate_scan_local_output_path(scan_dir, scan_dir / "report.md", "report.md")


def _json_bytes(payload: Any) -> bytes:
    try:
        encoded = json.dumps(payload, allow_nan=False, indent=2, sort_keys=True)
    except ValueError as exc:
        raise ContractError(f"cannot encode canonical JSON: {exc}") from exc
    return (encoded + "\n").encode("utf-8")


def _sha256_text(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def _sha256_bytes(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def _sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def _require_dict(payload: dict[str, Any], key: str, context: str) -> dict[str, Any]:
    value = payload.get(key)
    if not isinstance(value, dict):
        raise ContractError(f"{context}.{key}: expected an object")
    return value


def _require_list(payload: dict[str, Any], key: str, context: str) -> list[Any]:
    value = payload.get(key)
    if not isinstance(value, list):
        raise ContractError(f"{context}.{key}: expected an array")
    return value


def _require_str(payload: dict[str, Any], key: str, context: str) -> str:
    value = payload.get(key)
    if not isinstance(value, str) or not value.strip():
        raise ContractError(f"{context}.{key}: expected a non-empty string")
    return value


def _require_safe_relative_path(value: str, context: str, *, allow_dot: bool = False) -> str:
    try:
        value.encode("utf-8")
    except UnicodeEncodeError as exc:
        raise ContractError(f"{context}: expected a safe repository-relative POSIX path") from exc
    path = PurePosixPath(value)
    normalized = path.as_posix()

```