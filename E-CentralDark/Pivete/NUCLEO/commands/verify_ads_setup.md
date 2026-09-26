# COMANDO - verify_ads_setup.py
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\openai-ads-conversions\skills\openai-ads-conversions-setup\scripts\verify_ads_setup.py
**SHA:** 78feb6c1cb9ee364
**Timestamp:** 2026-08-26T18:40:18.812225
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- for line_number, line in enumerate(text.splitlines(), start=1):
- for line_number, line in enumerate(text.splitlines(), start=1):
- for line_number, line in enumerate(text.splitlines(), start=1):

### Padroes
- pattern: re.Pattern[str],

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env python3
"""Static sanity checks for OpenAI Ads Pixel and CAPI integrations."""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
from pathlib import Path
from typing import Iterable

SKIP_DIRS = {
    ".git",
    ".hg",
    ".svn",
    ".next",
    ".nuxt",
    ".turbo",
    ".venv",
    "build",
    "coverage",
    "dist",
    "node_modules",
    "out",
    "target",
    "test",
    "tests",
    "venv",
    "__tests__",
}

SKIP_FILES = {
    "verify_capi_secret_not_exposed.py",
    "verify_ads_setup.py",
}

TEXT_EXTENSIONS = {
    ".astro",
    ".cjs",
    ".erb",
    ".go",
    ".html",
    ".java",
    ".js",
    ".json",
    ".jsx",
    ".mjs",
    ".php",
    ".py",
    ".rb",
    ".rs",
    ".svelte",
    ".ts",
    ".tsx",
    ".vue",
    ".yaml",
    ".yml",
}

DOC_EXTENSIONS = {
    ".md",
    ".mdx",
    ".rst",
}


def is_env_file(filename: str) -> bool:
    return filename == ".env" or filename.startswith(".env.")


def is_env_template_file(filename: str) -> bool:
    return is_env_file(filename) and (
        filename in {".env.example", ".env.sample", ".env.template"}
        or filename.endswith((".example", ".sample", ".template"))
    )


PIXEL_MARKER_RE = re.compile(
    r"(?i)(openai[_\-\s]?ads[_\-\s]?pixel|openai[_\-\s]?pixel|measurement[_\-\s]?pixel|OPENAI_ADS_PIXEL_ID)"
)
CAPI_MARKER_RE = re.compile(
    r"(?i)(openai[_\-\s]?ads[_\-\s]?(conversions[_\-\s]?)?(api|capi)|conversions[_\-\s]?api|OPENAI_ADS_CONVERSIONS_API_KEY)"
)
EVENT_ID_RE = re.compile(r"(?i)\b(event[_\-]?id|eventId|dedupe|deduplication|idempotency)\b")
OPPREF_RE = re.compile(r"(?i)\b(__oppref|oppref)\b")
SOURCE_URL_RE = re.compile(r"(?i)\b(source_url|sourceUrl|sourceURL)\b")
OPENAI_ADS_CAPI_CONTEXT_RE = re.compile(
    r"(?i)(bzr\.openai\.com/v1/events|/v1/events\?pid=|OPENAI_ADS_CONVERSIONS_API_KEY|"
    r"OPENAI_ADS_CAPI_KEY|openai[_\-\s]?ads[_\-\s]?(conversions[_\-\s]?)?(api|capi))"
)
CAPI_LEGACY_FIELD_RE = re.compile(
    r"(?i)(?:[\"']|\b)(event_name|event_time_epoch_ms|event_source_url|event_data)(?:[\"']|\b)\s*:"
)
VALIDATE_ONLY_TRUE_RE = re.compile(
    r"(?i)^\s*(?:export\s+)?"
    r"OPENAI_ADS(?:_(?:CAPI|CONVERSIONS|CONVERSIONS_API))?_VALIDATE_ONLY"
    r"\s*[:=]\s*[\"']?(?:true|1|yes)[\"']?\s*(?:#.*)?$"
)
PUBLIC_CAPI_ENV_RE = re.compile(
    r"\b(?:NEXT_PUBLIC|NUXT_PUBLIC|PUBLIC|REACT_APP|VITE)_"
    r"(?:[A-Z0-9]+_)*(?:OPENAI_ADS|OPENAI|ADS|CAPI|CONVERSION|CONVERSIONS)"
    r"(?:_[A-Z0-9]+)*_(?:API_KEY|KEY|SECRET|TOKEN)[A-Z0-9_]*\b",
)
PUBLIC_PIXEL_ENV_RE = re.compile(
    r"\b(?:NEXT_PUBLIC|NUXT_PUBLIC|PUBLIC|REACT_APP|VITE)_OPENAI_ADS_PIXEL_ID\b"
)
SERVER_PIXEL_ENV_RE = re.compile(r"\bOPENAI_ADS_PIXEL_ID\b")
SHARED_PIXEL_GUIDANCE_RE = re.compile(
    r"(?i)(same|shared|reuse|match|identical|alias|same value).{0,80}"
    r"(pixel id|OPENAI_ADS_PIXEL_ID)"
)
ADS_MEASURE_EVENT_RE = re.compile(
    r"(?is)(?:\bwindow\s*\.\s*)?\boaiq\s*(?:\?\.)?\(\s*"
    r"[\"']measure[\"']\s*,\s*[\"']([a-z0-9_-]+)[\"']"
)
SUPPORTED_EVENT_NAMES = {
    "appointment_scheduled",
    "checkout_started",
    "contents_viewed",
    "custom",
    "items_added",
    "lead_created",
    "order_created",
    "page_viewed",
    "registration_completed",
    "subscription_created",
    "trial_started",
}


def iter_candidate_files(root: Path, *, include_docs: bool = False) -> Iterable[Path]:
    for current_root, dirs, files in os.walk(root):
        dirs[:] = [
            directory
            for directory in dirs
            if directory not in SKIP_DIRS and not (Path(current_root) / directory).is_symlink()
        ]
        for filename in files:
            if filename in SKIP_FILES:
                continue
            path = Path(current_root) / filename
            suffix = path.suffix.lower()
            if (
                is_env_file(filename)
                or suffix in TEXT_EXTENSIONS
                or (include_docs and suffix in DOC_EXTENSIONS)
            ):
                yield path


def read_file(path: Path) -> str:
    try:
        return path.read_text(encoding="utf-8", errors="ignore")
    except OSError:
        return ""


def first_hits(
    root: Path,
    pattern: re.Pattern[str],
    limit: int = 20,
    *,
    include_docs: bool = False,
) -> list[dict[str, object]]:
    hits: list[dict[str, object]] = []
    for path in iter_candidate_files(root, include_docs=include_docs):
        text = read_file(path)
        for line_number, line in enumerate(text.splitlines(), start=1):
            if pattern.search(line):
                hits.append(
                    {
                        "path": str(path.relative_to(root)),
                        "line": line_number,
                    }
                )
                break
        if len(hits) >= limit:
            break
    return hits


def literal_hits(root: Path, literal: str, limit: int = 20) -> list[dict[str, object]]:
    if not literal:
        return []

    hits: list[dict[str, objec
```