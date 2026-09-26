# OUTRO - validate-plan.py
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\execute-plan\scripts\validate-plan.py
**SHA:** 37edacba88b9f53d
**Timestamp:** 2026-08-28T02:52:27.837425
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- start = heading.end()
- next_section = re.search(r"^## (?!PR Plan\s*$)", stripped[start:], re.MULTILINE)
- section = stripped[start : start + next_section.start()] if next_section else stripped[start:]
- body_start = m.end()
- body = section[body_start:body_end]

### Padroes
- pattern = re.compile(

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env python3
"""Validate a design document's PR Plan section.

Usage:
    python3 validate-plan.py <design-doc-path>

Parses the ``## PR Plan`` section, extracts PR entries from ``### PR N:``
headings, validates the dependency DAG (unique IDs, valid references, no
cycles), computes level assignments, linearises for Graphite stack order,
and reports max parallelism.

Output (stdout): a JSON report.
Exit codes: 0 = valid, 1 = validation errors, 2 = usage / IO errors.
"""

import json
import re
import sys
from collections import defaultdict, deque

# ---------------------------------------------------------------------------
# Parsing
# ---------------------------------------------------------------------------


def _strip_fenced_code_blocks(content):
    """Remove fenced code blocks (backtick and tilde) so headings inside examples are ignored."""
    flags = re.MULTILINE | re.DOTALL
    content = re.sub(r"^\s*```[^\n]*\n.*?^\s*```\s*$", "", content, flags=flags)
    return re.sub(r"^\s*~~~[^\n]*\n.*?^\s*~~~\s*$", "", content, flags=flags)


def parse_pr_plan(content):
    """Parse the ``## PR Plan`` section from a design document.

    Returns ``(entries, errors)`` where *entries* is a list of dicts and
    *errors* is an empty list on success, or *entries* is ``None`` and
    *errors* is a non-empty list of error strings on failure.
    """
    # Strip fenced code blocks so example PR Plans inside ``` ``` are ignored.
    stripped = _strip_fenced_code_blocks(content)
    heading = re.search(r"^## PR Plan\s*$", stripped, re.MULTILINE)
    if heading is None:
        return None, ["No '## PR Plan' section found in the document"]

    start = heading.end()
    # Slice to the next ``## `` heading (that isn't the PR Plan itself) or EOF.
    next_section = re.search(r"^## (?!PR Plan\s*$)", stripped[start:], re.MULTILINE)
    section = stripped[start : start + next_section.start()] if next_section else stripped[start:]

    pr_re = re.compile(r"^###\s+PR\s+(\S+?):\s*(.+)$", re.MULTILINE)
    matches = list(pr_re.finditer(section))

    if not matches:
        return None, ["No PR entries found in the PR Plan section"]

    entries = []
    parse_errors = []
    for i, m in enumerate(matches):
        pr_num = m.group(1)
        title = m.group(2).strip()

        body_start = m.end()
        body_end = matches[i + 1].start() if i + 1 < len(matches) else len(section)
        body = section[body_start:body_end]

        files_raw = _extract_field(body, "Files/components affected")
        deps_raw = _extract_field(body, "Dependencies")
        description = _extract_field(body, "Description") or ""

        files = [f.strip() for f in files_raw.split(",") if f.strip()] if files_raw else []
        dependencies, dep_errors = _parse_dependencies(deps_raw, "PR {}".format(pr_num))
        parse_errors.extend(dep_errors)

        entries.append(
            {
                "id": "pr-{}".format(pr_num.lower()),
                "number": pr_num,
                "title": title,
                "files": files,
                "dependencies": dependencies,
                "description": description,
            }
        )

    if parse_errors:
        return None, parse_errors
    return entries, []


def _extract_field(body, field_name):
    """Return the value of a ``- **FieldName:** value`` bullet, or *None*.

    Handles continuation lines (indented past the bullet marker).
    """
    escaped = re.escape(field_name)
    # Handles **Field:** val, **Field**: val, and plain Field: val.
    # The tail ``(?:\n[ \t]+\S.*)*`` grabs indented continuation lines.
    pattern = re.compile(
        rf"^\s*[-*]\s+\**{escaped}:?\**:?\s*(.+(?:\n[ \t]+\S.*)*)",
        re.MULTILINE | re.IGNORECASE,
    )
    m = pattern.search(body)
    if m:
        return re.sub(r"\s*\n[ \t]+", " ", m.group(1)).strip()
    return None


def _parse_dependencies(deps_raw, pr_label):
    """Turn a dependency string like ``"PR 0a, PR 1"`` into ``(ids, errors)``.

    *pr_label* (e.g. ``"PR 1"``) is used in error messages for context.
    Returns a tuple ``(dep_ids, errors)`` where *errors* is a list of
    strings describing any comma-separated parts that could not be parsed.
    """
    if not deps_raw:
        return [], []
    stripped = deps_raw.strip()
    if stripped.lower() in ("none", "n/a", "-", ""):
        return [], []

    parts = [p.strip() for p in stripped.split(",")]
    deps = []
    errors = []
    for part in parts:
        if not part:
            continue
        m = re.match(r"PR\s+(\S+)", part, re.IGNORECASE)
        if m:
            deps.append("pr-{}".format(m.group(1).lower()))
        else:
            errors.append(
                "Unrecognized dependency format '{}' in {} (expected 'PR <id>')".format(
                    part, pr_label
                )
            )
    return deps, errors


# ---------------------------------------------------------------------------
# Validation
# ---------------------------
```