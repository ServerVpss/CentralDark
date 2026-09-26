# COMANDO - memory.py
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\implement\scripts\memory.py
**SHA:** 5c37eecccb7213ef
**Timestamp:** 2026-08-28T02:52:28.414505
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- current_run: dict[str, Any] | None = None
- current_run = None
- current_run = None
- current_run = {
- run = _require_dict(run_raw, "run")
- if run:
- def _merge_recent_run(state: dict[str, Any], run: dict[str, Any], stats: dict[str, Any]) -> None:

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env python3
"""Implement skill memory file manager.

The /implement skill records common review issue patterns to a workspace-scoped
memory file so future runs can warn the implementer/reviewers up front. This
helper centralises:

  * **Workspace-scoped path resolution.** The file lives under
    ``$HOME/.grok/implement-memory/<workspace-id>.md``. The workspace id is
    derived from a canonicalised git remote URL (or, as fallbacks, the absolute
    path of the main ``.git`` directory or the absolute cwd). Canonicalisation
    collapses SSH/HTTPS, with/without ``.git`` suffix, and trailing-slash
    variants of the same upstream onto a single id, so all worktrees and
    clones of one logical repo share a single memory file.

  * **Concurrency-safe writes.** Updates take an exclusive lock on a sibling
    ``.lock`` file (``fcntl.flock`` on POSIX, ``msvcrt.locking`` on Windows)
    and are committed via temp-file + rename, so two /implement runs in
    different worktrees can update the file at the same time without
    corrupting it. Readers see a consistent snapshot.

  * **Deterministic dedup + compaction.** The orchestrator passes this run's
    patterns as JSON; the helper normalises descriptions (case, whitespace,
    trailing punctuation) to merge duplicates into existing entries with
    incremented counters, caps each category at ``MAX_PATTERNS_PER_CATEGORY``
    (lowest-count entries dropped first), and caps the Recent Runs log at
    ``MAX_RECENT_RUNS`` entries.

Subcommands
-----------
``path``      Print the resolved memory file path.
``read``      Print the memory file contents (empty output if file is missing).
``snapshot``  Print the parsed file as JSON, so the orchestrator never has to
              re-parse markdown.
``update``    Read a JSON merge spec from stdin, merge into the memory file
              under an exclusive lock, and print summary stats as pretty JSON.

Update spec (stdin)
-------------------
::

    {
      "patterns": [
        {"category": "Error Handling",
         "description": "Missing null/undefined checks on function inputs"},
        ...
      ],
      "run": {
        "date": "2026-04-23",
        "description": "Add retry logic to blackbox client",
        "rounds": 2,
        "issues_by_severity": {"bug": 1, "suggestion": 1, "nit": 5},
        "key_patterns": ["...", "..."],
        "specializations": ["general", "security"]
      }
    }

Either field may be omitted: send only ``patterns`` to merge issue patterns
without logging a run; send only ``run`` to log a run without new patterns.
Malformed input fails fast with a clear message and exit code 4 — the helper
never silently drops malformed entries.

File permissions
----------------
Both the memory file and the lock file are written and then ``chmod``ded to
mode ``0o600`` (owner read/write only) on a best-effort basis. The memory
file may contain security-review patterns and ``key_patterns`` drawn from
non-public source review, so it must not be world-readable on shared hosts:
the workspace id is a deterministic SHA-256 of the canonical remote URL,
so an unprivileged account on the same host that knows or can guess the
public-repo URL could otherwise enumerate and ``cat`` the file directly.
If a cross-user race causes the ``chmod`` to fail the file's umask-default
mode is preserved (the ``flock`` semantics that matter for correctness do
not depend on the mode); in the typical single-user case both files end
up at ``0o600`` regardless of the process umask.

Platform support
----------------
POSIX (Linux, macOS, BSD) and Windows. Locking uses ``fcntl.flock`` +
``O_CLOEXEC`` on POSIX and ``msvcrt.locking`` on Windows.

Python version: 3.9+ recommended (the helper uses PEP 585/604 syntax that is
lazy via ``from __future__ import annotations`` on 3.7+, but stdlib type
introspection of those hints requires 3.9+).

Exit codes
----------
0  success
1  unexpected I/O error not otherwise classified
2  workspace id could not be determined (cwd unreadable, ``$HOME`` unset)
3  lock could not be acquired within ``LOCK_TIMEOUT_SECONDS``
4  invalid JSON on stdin / malformed spec
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import subprocess
import sys
import tempfile
import time
from collections import OrderedDict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

MEMORY_DIR_NAME = "implement-memory"
MAX_PATTERNS_PER_CATEGORY = 25
MAX_RECENT_RUNS = 20
LOCK_TIMEOUT_SECONDS = 30
LOCK_POLL_INTERVAL = 0.2
GIT_TIMEOUT_SECONDS = 5
# Owner-only read/write. The memory file may contain security-review
# patterns and key_patterns drawn from non-public source review; on shared
# hosts where the workspace id (sha256 of the canonical remote URL) is
# guessable, w
```