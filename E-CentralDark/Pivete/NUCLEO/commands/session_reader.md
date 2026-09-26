# COMANDO - session_reader.py
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\shared\resume-session\session_reader.py
**SHA:** 342853ca19f8d9f1
**Timestamp:** 2026-08-28T02:52:42.020236
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- def resolve(start: str) -> str | None:

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env python3
"""Read Claude Code, Codex, and Cursor sessions as untrusted inert history."""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import shutil
import sqlite3
import subprocess
import sys
import time
import unicodedata
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Iterable

for _stream in (sys.stdout, sys.stderr):
    try:
        _stream.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

TOOLS = ("claude", "codex", "cursor")
UUID_RE = re.compile(
    r"^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-"
    r"[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$"
)
CODEX_ROLLOUT_RE = re.compile(
    r"^rollout-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-"
    r"([0-9a-fA-F-]{36})\.jsonl(?:\.zst)?$"
)
GENERATED_META_RE = re.compile(r"^\s*<[a-z][A-Za-z0-9_.:-]*(?:\s|/?>)")
INTERRUPTED_RE = re.compile(r"^\s*\[Request interrupted by user", re.IGNORECASE)
CURSOR_SKIPPED_ROLES = {
    "system",
    "developer",
    "instruction",
    "instructions",
    "preamble",
}
CLAUDE_KNOWN_TYPES = {
    "user",
    "assistant",
    "system",
    "summary",
    "custom-title",
    "ai-title",
    "content-replacement",
    "progress",
    "file-history-snapshot",
    "attribution-snapshot",
    "queue-operation",
    "last-prompt",
    "tag",
    "agent-name",
    "agent-color",
    "agent-setting",
    "mode",
    "worktree-state",
    "context-collapse-commit",
    "context-collapse-snapshot",
}
CODEX_SAFE_TOP_LEVEL = {
    "session_meta",
    "response_item",
    "compacted",
    "event_msg",
}
CODEX_IGNORED_TOP_LEVEL = {
    "turn_context",
    "world_state",
    "inter_agent_communication",
    "inter_agent_communication_metadata",
}


class ReaderError(RuntimeError):
    """An operator-facing session reader error."""


class AmbiguousReference(ReaderError):
    """A free-text reference matched more than one session."""

    def __init__(self, reference: str, matches: list[dict[str, Any]]):
        self.reference = reference
        self.matches = matches
        super().__init__(f"reference {reference!r} matched {len(matches)} sessions")


def _warning(code: str, message: str) -> dict[str, str]:
    return {"code": code, "message": message}


def _add_warning(warnings: list[dict[str, str]], code: str, message: str) -> None:
    if not any(item["code"] == code and item["message"] == message for item in warnings):
        warnings.append(_warning(code, message))


def _safe_text(value: Any) -> str:
    if value is None:
        return ""
    text = value if isinstance(value, str) else str(value)
    output: list[str] = []
    for char in text:
        if char in ("\n", "\t"):
            output.append(char)
        elif unicodedata.category(char) in {"Cc", "Cs"}:
            output.append("\ufffd")
        else:
            output.append(char)
    return "".join(output)


def _one_line(value: Any, limit: int) -> str:
    text = " ".join(_safe_text(value).split())
    if limit < 1:
        return ""
    if len(text) <= limit:
        return text
    return text[:limit] + "..."


def _json_preview(value: Any, limit: int) -> str:
    if isinstance(value, str):
        raw = value
    else:
        try:
            raw = json.dumps(value, ensure_ascii=False, sort_keys=True)
        except (TypeError, ValueError):
            raw = repr(value)
    return _one_line(raw, limit)


def _is_generated_meta_text(text: str) -> bool:
    return bool(GENERATED_META_RE.match(text) or INTERRUPTED_RE.match(text))


def _blocks(content: Any) -> list[dict[str, Any]]:
    if isinstance(content, str):
        return [{"type": "text", "text": content}]
    if isinstance(content, list):
        return [item for item in content if isinstance(item, dict)]
    if isinstance(content, dict):
        return [content]
    return []


def _content_text(content: Any) -> str:
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        parts: list[str] = []
        for item in content:
            if isinstance(item, str):
                parts.append(item)
            elif isinstance(item, dict):
                text = item.get("text")
                if isinstance(text, str):
                    parts.append(text)
        return "\n".join(parts)
    if isinstance(content, dict):
        for key in ("text", "output", "content"):
            value = content.get(key)
            if isinstance(value, str):
                return value
    return ""


def _turn(
    role: str,
    *,
    text: str = "",
    tool_calls: list[dict[str, Any]] | None = None,
    tool_results: list[dict[str, Any]] | None = None,
) -> dict[str, Any]:
    return {
        "role": role,
        "text": _safe_text(text),
        "tool_calls": tool_calls or [],
        "tool_results": tool_results or [],
        "inert": True,
    }


def _assistant_action(turn: dict[str, Any]) -> str:
    if turn["text"]:
        return _one_line(tu
```