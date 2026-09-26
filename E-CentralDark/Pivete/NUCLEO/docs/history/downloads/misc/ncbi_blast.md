# OUTRO - ncbi_blast.py
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\life-science-research\skills\ncbi-blast-skill\scripts\ncbi_blast.py
**SHA:** 74970756e0a03eda
**Timestamp:** 2026-08-26T18:31:56.844099
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- for index, report in enumerate(reports[:max_queries], start=1):
- for rank, hit in enumerate(hits[:max_hits], start=1):

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env python3
"""ncbi_blast

Compact NCBI BLAST Common URL API helper.

Reads one JSON object from stdin and prints one JSON object to stdout.
"""

from __future__ import annotations

import io
import json
import os
import re
import sys
import time
import zipfile
from pathlib import Path
from typing import Any, Callable

try:
    import requests
except ImportError as exc:  # pragma: no cover - exercised via runtime guard
    requests = None
    REQUESTS_IMPORT_ERROR = exc
else:
    REQUESTS_IMPORT_ERROR = None

BLAST_URL = "https://blast.ncbi.nlm.nih.gov/Blast.cgi"
DEFAULT_TOOL = "ncbi-blast-skill"
DEFAULT_RESULT_FORMAT = "json2"
DEFAULT_MAX_HITS = 5
DEFAULT_MAX_QUERIES = 5
DEFAULT_HITLIST_SIZE = 50
DEFAULT_DESCRIPTIONS = 5
DEFAULT_ALIGNMENTS = 5
DEFAULT_WAIT_TIMEOUT_SEC = 900
MIN_REQUEST_INTERVAL_SEC = 10
MIN_POLL_INTERVAL_SEC = 60

RID_RE = re.compile(r"^\s*RID\s*=\s*(\S+)", re.MULTILINE)
RTOE_RE = re.compile(r"^\s*RTOE\s*=\s*(\d+)", re.MULTILINE)
STATUS_RE = re.compile(r"Status=(WAITING|READY|FAILED|UNKNOWN)")

VALID_ACTIONS = {"submit", "status", "fetch", "run"}
VALID_PROGRAMS = {"blastn", "blastp", "blastx", "tblastn", "tblastx"}
VALID_RESULT_FORMATS = {"json2", "text"}


def error(code: str, message: str, warnings: list[str] | None = None) -> dict[str, Any]:
    return {
        "ok": False,
        "error": {"code": code, "message": message},
        "warnings": warnings or [],
    }


def _parse_positive_int(payload: dict[str, Any], key: str, default: int) -> int:
    value = payload.get(key, default)
    if not isinstance(value, int) or value <= 0:
        raise ValueError(f"`{key}` must be a positive integer.")
    return value


def _parse_bool(payload: dict[str, Any], key: str, default: bool) -> bool:
    value = payload.get(key, default)
    if not isinstance(value, bool):
        raise ValueError(f"`{key}` must be a boolean.")
    return value


def _parse_str(payload: dict[str, Any], key: str) -> str | None:
    value = payload.get(key)
    if value is None:
        return None
    if not isinstance(value, str) or not value.strip():
        raise ValueError(f"`{key}` must be a non-empty string when provided.")
    return value.strip()


def parse_input(payload: Any) -> dict[str, Any]:
    if not isinstance(payload, dict):
        raise ValueError("Input must be one JSON object.")

    action = payload.get("action")
    if not isinstance(action, str) or action not in VALID_ACTIONS:
        raise ValueError("`action` must be one of: submit, status, fetch, run.")

    program = _parse_str(payload, "program")
    if program is not None and program not in VALID_PROGRAMS:
        raise ValueError("`program` must be one of: blastn, blastp, blastx, tblastn, tblastx.")

    database = _parse_str(payload, "database")
    query_fasta = _parse_str(payload, "query_fasta")
    rid = _parse_str(payload, "rid")

    tool = _parse_str(payload, "tool") or os.environ.get("NCBI_TOOL", DEFAULT_TOOL)
    email = _parse_str(payload, "email") or os.environ.get("NCBI_EMAIL")
    if email:
        email = email.strip()

    result_format_raw = payload.get("result_format", DEFAULT_RESULT_FORMAT)
    if (
        not isinstance(result_format_raw, str)
        or result_format_raw.lower() not in VALID_RESULT_FORMATS
    ):
        raise ValueError("`result_format` must be `json2` or `text`.")
    result_format = result_format_raw.lower()

    raw_output_path = _parse_str(payload, "raw_output_path")

    config = {
        "action": action,
        "program": program,
        "database": database,
        "query_fasta": query_fasta,
        "rid": rid,
        "tool": tool,
        "email": email,
        "result_format": result_format,
        "max_hits": _parse_positive_int(payload, "max_hits", DEFAULT_MAX_HITS),
        "max_queries": _parse_positive_int(payload, "max_queries", DEFAULT_MAX_QUERIES),
        "hitlist_size": _parse_positive_int(payload, "hitlist_size", DEFAULT_HITLIST_SIZE),
        "descriptions": _parse_positive_int(payload, "descriptions", DEFAULT_DESCRIPTIONS),
        "alignments": _parse_positive_int(payload, "alignments", DEFAULT_ALIGNMENTS),
        "wait_timeout_sec": _parse_positive_int(
            payload, "wait_timeout_sec", DEFAULT_WAIT_TIMEOUT_SEC
        ),
        "megablast": _parse_bool(payload, "megablast", False),
        "save_raw": _parse_bool(payload, "save_raw", False),
        "raw_output_path": raw_output_path,
    }

    if action in {"submit", "run"}:
        if program is None:
            raise ValueError(f"`program` is required for `{action}`.")
        if database is None:
            raise ValueError(f"`database` is required for `{action}`.")
        if query_fasta is None:
            raise ValueError(f"`query_fasta` is required for `{action}`.")
        if email is None:
            raise ValueError(f"`email` is required for `{action}` or via NCBI_EMAIL.")

    if action in {"status", "fetch"} and rid is None:
        raise ValueError(f"`rid` is required for `
```