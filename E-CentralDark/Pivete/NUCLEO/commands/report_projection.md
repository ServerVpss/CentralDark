# COMANDO - report_projection.py
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\codex-security\scripts\report_projection.py
**SHA:** 0e6c246ac0a7c63b
**Timestamp:** 2026-08-26T18:31:10.923931
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- start = item.get("startLine")
- longest_run = max((len(match.group(0)) for match in re.finditer(r"`+", code)), default=0)
- start = location["startLine"]
- prompt = _text(question.get("followUpPrompt"), "")
- if prompt:
- lines.append(f"  - Follow-up prompt: {prompt}")

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env python3
"""Project canonical Codex Security scan JSON into the standard reports."""

from __future__ import annotations

import argparse
import importlib.util
import re
from collections import Counter
from pathlib import Path
from types import ModuleType
from typing import Any

SEVERITY_ORDER = {"critical": 0, "high": 1, "medium": 2, "low": 3, "informational": 4}
CONFIDENCE_ORDER = {"high": 0, "medium": 1, "low": 2}
REPORTABLE_SEVERITIES = {"critical", "high", "medium", "low"}
DISPOSITION_LABELS = {
    "reported": "Reported",
    "no_issue_found": "No issue found",
    "rejected": "Rejected",
    "not_applicable": "Not applicable",
    "needs_follow_up": "Needs follow-up",
}
WRITEUP_REPORT_PATH_RE = re.compile(r"^findings/([a-z0-9][a-z0-9._-]*)/\1\.md$")


class ReportProjectionError(ValueError):
    """Raised when a canonical scan cannot be projected into a valid report."""


def _load_script(name: str) -> ModuleType:
    path = Path(__file__).resolve().parent / f"{name}.py"
    spec = importlib.util.spec_from_file_location(f"codex_security_{name}", path)
    if spec is None or spec.loader is None:
        raise ReportProjectionError(f"could not load report helper: {path}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def _text(value: Any, fallback: str) -> str:
    candidate = value if isinstance(value, str) and value.strip() else fallback
    normalized = " ".join(candidate.split())
    if not normalized:
        return ""
    if re.match(r"^(?:#{1,6}\s|[-*+]\s|>\s|```|\d+\.\s|\|)", normalized):
        normalized = f"Text: {normalized}"
    rendered: list[str] = []
    cursor = 0
    for match in re.finditer(r"(?<!`)`([^`\n]+)`(?!`)", normalized):
        rendered.append(_escape_markdown_text(normalized[cursor : match.start()]))
        rendered.append(f"`{match.group(1)}`")
        cursor = match.end()
    rendered.append(_escape_markdown_text(normalized[cursor:]))
    return "".join(rendered)


def _escape_markdown_text(value: str) -> str:
    return re.sub(r"([\\`*\[\]<>])", r"\\\1", value)


def _strings(value: Any) -> list[str]:
    if not isinstance(value, list):
        return []
    normalized: list[str] = []
    for item in value:
        text = _text(item, "")
        if text:
            normalized.append(text)
    return normalized


def _cell(value: Any) -> str:
    return _text(value, "none").replace("|", "\\|").replace("\n", "<br>")


def _link_label(value: Any, fallback: str) -> str:
    return _cell(value) or _cell(fallback)


def _deep_report_id(finding: dict[str, Any]) -> str:
    extensions = finding.get("extensions")
    if isinstance(extensions, dict):
        report_id = extensions.get("reportId")
        if isinstance(report_id, str) and report_id.strip():
            return report_id
        ledger_row_id = extensions.get("ledgerRowId")
        if isinstance(ledger_row_id, str) and ledger_row_id.strip():
            return ledger_row_id
    identity = finding.get("identity")
    if isinstance(identity, dict):
        instance = identity.get("instance")
        if isinstance(instance, str) and instance.strip():
            return instance
    occurrence_id = finding.get("occurrenceId")
    return (
        occurrence_id
        if isinstance(occurrence_id, str) and occurrence_id.strip()
        else "Unidentified report"
    )


def _deep_candidate_id(finding: dict[str, Any]) -> str:
    extensions = finding.get("extensions")
    if isinstance(extensions, dict):
        candidate_id = extensions.get("candidateId")
        if isinstance(candidate_id, str) and candidate_id.strip():
            return candidate_id
    return _deep_report_id(finding)


def _has_deep_child_metadata(finding: dict[str, Any]) -> bool:
    extensions = finding.get("extensions")
    if not isinstance(extensions, dict):
        return False
    return any(
        isinstance(extensions.get(field), str) and extensions[field].strip()
        for field in ("candidateId", "reportId")
    )


def _uses_deep_presentation(coverage: dict[str, Any], findings: list[dict[str, Any]]) -> bool:
    if coverage.get("mode") == "deep_repository":
        return True
    if coverage.get("mode") != "scoped_path":
        return False
    # Scoped deep scans can arrive as scoped_path artifacts. The child ids are
    # the stable deep-scan signal; ordinary scoped scans do not emit them.
    return any(_has_deep_child_metadata(finding) for finding in findings)


def _deep_title_parts(finding: dict[str, Any]) -> tuple[str, str | None]:
    title = finding.get("title")
    if not isinstance(title, str):
        return "Untitled finding", None
    normalized = " ".join(title.split())
    match = re.fullmatch(r"(.+?)\s+\[([^\[\]\n]+)\]", normalized)
    if match is None:
        return normalized, None
    annotation = match.group(2)
    extensions = finding.get("extensions")
    recognized_ids = [_deep_report_id(finding)]
    if isinstance(extensions, dic
```