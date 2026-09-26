# COMANDO - workbench_db.py
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\codex-security\scripts\workbench_db.py
**SHA:** 15ad4281a6c5ebc6
**Timestamp:** 2026-08-26T18:31:18.938249
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- at_line_start = True
- if at_line_start:
- at_line_start = chunk.endswith(b"\n")

### Contratos
- target_contract = {
- expected_contract = scan_contract(scan)

### Gaps
- missing = required - keys
- if missing:

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env python3
"""Persist Codex Security workbench state in a local SQLite database."""

from __future__ import annotations

import argparse
import csv
import errno
import hashlib
import io
import json
import math
import os
import re
import sqlite3
import stat
import sys
import tempfile
import time
import uuid
from contextlib import closing, contextmanager
from datetime import datetime, timedelta, timezone
from pathlib import Path, PurePosixPath
from typing import Any

try:
    import fcntl as posix_file_lock
except ModuleNotFoundError:  # pragma: no cover - exercised through the Windows lock test.
    posix_file_lock = None

try:
    import msvcrt as windows_file_lock
except ModuleNotFoundError:  # pragma: no cover - msvcrt is only available on Windows.
    windows_file_lock = None

# Some plugin hosts launch Python with safe-path isolation enabled.
sys.path.insert(0, str(Path(__file__).resolve().parent))
import workbench_remediation as remediation
from filesystem_identity import (
    serialize_filesystem_identity,
    stored_filesystem_identity_matches,
)
from finalize_scan_contract import (
    ContractError,
    finalize_scan,
    open_scan_local_file_descriptor,
    write_sarif_projection,
    write_scan_local_bytes,
)
from finding_preview import bounded_finding_details
from workbench_cli import parse_args
from workbench_constants import (
    ARTIFACTS,
    CLAIM_LEASE_SECONDS,
    DELIVERED_ACTION_LEASE_SECONDS,
    DIFF_TARGET_KINDS,
    EMPTY_GIT_TREE,
    FINDING_ABSOLUTE_PATH_BYTES,
    FINDING_LEVEL_BYTES,
    FINDING_LOCATION_PATH_BYTES,
    FINDING_LOCATION_ROLE_BYTES,
    FINDING_LOCATIONS_LIMIT,
    FINDING_REMEDIATION_BYTES,
    FINDING_SUMMARY_BYTES,
    FINDING_TITLE_BYTES,
    FINDINGS_PAGE_MAX,
    FINDINGS_RESULT_LIMIT,
    MAX_CAPABILITY_PREFLIGHT_INPUT_JSON_BYTES,
    MAX_CAPABILITY_PREFLIGHT_PERSISTED_JSON_BYTES,
    PATCH_ARTIFACT_MAX_BYTES,
    PATCH_PREVIEW_BYTES,
    PHASES,
    SQLITE_RETRY_ATTEMPTS,
)
from workbench_progress import reportable_count
from workbench_schema import MIGRATIONS
from workbench_source_excerpt import finding_source_excerpt
from workbench_target import (
    clean_worktree_content_digest,
    copy_directory_excluding,
    copy_git_worktree_files,
    directory_content_digest,
    git_command,
    git_output,
    git_revision,
    git_submodule_paths,
    git_target_metadata,
    git_worktree_context,
    worktree_content_digest,
    worktree_content_digest_for_context,
)
from workbench_validation import (
    optional_text,
    require_handoff_claim_token,
    require_occurrence,
    require_uuid,
    validate_handoff_delivery_thread,
)

FINDING_ARTIFACT_DIRECTORIES_LIMIT = 80
FINDING_ARTIFACTS_LIMIT = 40
FINDING_WRITEUP_REPORT_PATH = re.compile(r"^findings/([a-z0-9][a-z0-9._-]*)/\1\.md$")


def now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def stale_claim_before(seconds: int = CLAIM_LEASE_SECONDS) -> str:
    return (
        (datetime.now(timezone.utc) - timedelta(seconds=seconds)).isoformat().replace("+00:00", "Z")
    )


def state_dir() -> Path:
    state_dir = os.environ.get("CODEX_SECURITY_STATE_DIR")
    if state_dir:
        return Path(state_dir).expanduser().resolve()
    codex_home = Path(os.environ.get("CODEX_HOME", "~/.codex")).expanduser()
    return codex_home / "state" / "plugins" / "codex-security"


def database_path() -> Path:
    return state_dir() / "workbench.sqlite3"


@contextmanager
def scan_completion_lock(scan_id: str) -> Any:
    lock_dir = state_dir() / "completion-locks"
    lock_dir.mkdir(parents=True, exist_ok=True)
    lock_path = lock_dir / f"{require_uuid(scan_id, 'scan-id')}.lock"
    descriptor = os.open(
        lock_path,
        os.O_RDWR | os.O_CREAT | getattr(os, "O_BINARY", 0),
        0o600,
    )
    locked = False
    try:
        acquire_completion_file_lock(descriptor)
        locked = True
        yield
    finally:
        try:
            if locked:
                release_completion_file_lock(descriptor)
        finally:
            os.close(descriptor)


def is_file_lock_contention(error: OSError) -> bool:
    return error.errno in {errno.EACCES, errno.EAGAIN, errno.EDEADLK}


def acquire_completion_file_lock(descriptor: int) -> None:
    if posix_file_lock is not None:
        posix_file_lock.flock(descriptor, posix_file_lock.LOCK_EX)
        return
    if windows_file_lock is None:
        raise SystemExit("Scan completion requires operating-system file locking support.")

    # msvcrt locks a byte range. Seed a newly-created lock file before locking its
    # first byte, and retry if another process locks that byte between our checks.
    while os.fstat(descriptor).st_size == 0:
        os.lseek(descriptor, 0, os.SEEK_SET)
        try:
            os.write(descriptor, b"\0")
        except OSError as exc:
            if not is_file_lock_contention(exc):
                raise
            time.sleep(0.05)

    while True:
        os.lseek(descriptor
```