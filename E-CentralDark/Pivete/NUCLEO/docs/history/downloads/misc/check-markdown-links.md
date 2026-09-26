# OUTRO - check-markdown-links.py
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\scripts\check-markdown-links.py
**SHA:** b486fd43eeb6b8ec
**Timestamp:** 2026-08-28T02:19:08.455026
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- LINK_PATTERN = re.compile(r'\[([^\]]*)\]\(([^)]+)\)')
- pattern = re.escape(f"]({link})")
- pattern = re.escape(f"]({link})") + r'\s*\*\(coming soon\)\*'

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env python3
"""
Markdown Link Checker for AIOS Documentation

Validates internal markdown links and tracks documentation status.
Inspired by Obsidian's broken link checker.

Usage:
    python scripts/check-markdown-links.py              # Default report
    python scripts/check-markdown-links.py --json       # JSON output for CI
    python scripts/check-markdown-links.py --fix        # Auto-fix broken links (add coming soon)
    python scripts/check-markdown-links.py --summary    # Quick summary only

Exit codes:
    0 - All links valid (or only coming soon)
    1 - Broken links found (needs attention)
    2 - Incorrect markings found (exists but marked coming soon)
"""

import argparse
import json
import os
import re
import sys
from collections import defaultdict
from pathlib import Path
from typing import Optional

# Configuration
DOCS_DIR = "docs"
LINK_PATTERN = re.compile(r'\[([^\]]*)\]\(([^)]+)\)')
COMING_SOON_MARKER = " *(coming soon)*"


def normalize_path(source_file: str, link: str) -> Optional[str]:
    """Resolve a relative link to an absolute path."""
    # Skip external links, mailto, and anchors
    if link.startswith(('http://', 'https://', 'mailto:', '#')):
        return None

    # Remove anchor from link
    link = link.split('#')[0]
    if not link:
        return None

    # Handle URL encoding
    link = link.replace('%20', ' ')

    # Resolve relative path
    source_dir = os.path.dirname(source_file)
    return os.path.normpath(os.path.join(source_dir, link))


def is_coming_soon(line: str, link: str) -> bool:
    """Check if a link is marked as coming soon."""
    link_escaped = re.escape(f"]({link})")
    return bool(re.search(link_escaped + r'.*coming soon', line, re.IGNORECASE))


def scan_file(filepath: str) -> dict:
    """Scan a markdown file for link issues."""
    results = {
        'broken': [],
        'coming_soon': [],
        'incorrect_marking': [],
        'valid': []
    }

    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            lines = f.readlines()

        for line_num, line in enumerate(lines, 1):
            for match in LINK_PATTERN.finditer(line):
                text, link = match.group(1), match.group(2)
                resolved = normalize_path(filepath, link)

                if resolved is None:
                    continue

                exists = os.path.exists(resolved)
                coming_soon = is_coming_soon(line, link)

                info = {
                    'line': line_num,
                    'text': text,
                    'link': link,
                    'resolved': resolved,
                    'line_content': line.rstrip()
                }

                if exists and coming_soon:
                    results['incorrect_marking'].append(info)
                elif not exists and coming_soon:
                    results['coming_soon'].append(info)
                elif not exists:
                    results['broken'].append(info)
                else:
                    results['valid'].append(info)

    except Exception as e:
        print(f"Error scanning {filepath}: {e}", file=sys.stderr)

    return results


def fix_broken_link(filepath: str, line_num: int, link: str) -> bool:
    """Add 'coming soon' marker to a broken link."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            lines = f.readlines()

        line_idx = line_num - 1
        line = lines[line_idx]

        # Find the link and add marker after it
        pattern = re.escape(f"]({link})")
        if re.search(pattern + r'\s*\*\(coming soon\)\*', line, re.IGNORECASE):
            return False  # Already marked

        new_line = re.sub(
            pattern,
            f"]({link}){COMING_SOON_MARKER}",
            line
        )

        if new_line != line:
            lines[line_idx] = new_line
            with open(filepath, 'w', encoding='utf-8') as f:
                f.writelines(lines)
            return True

    except Exception as e:
        print(f"Error fixing {filepath}:{line_num}: {e}", file=sys.stderr)

    return False


def fix_incorrect_marking(filepath: str, line_num: int, link: str) -> bool:
    """Remove 'coming soon' marker from a link to existing file."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            lines = f.readlines()

        line_idx = line_num - 1
        line = lines[line_idx]

        # Remove the coming soon marker after this specific link
        pattern = re.escape(f"]({link})") + r'\s*\*\(coming soon\)\*'
        new_line = re.sub(pattern, f"]({link})", line, flags=re.IGNORECASE)

        if new_line != line:
            lines[line_idx] = new_line
            with open(filepath, 'w', encoding='utf-8') as f:
                f.writelines(lines)
            return True

    except Exception as e:
        print(f"Error fixing {filepath}:{line_num}: {e}", file=sys.stderr)

    return False


def scan_docs(docs_dir: str = DOCS_DIR) -> dict
```