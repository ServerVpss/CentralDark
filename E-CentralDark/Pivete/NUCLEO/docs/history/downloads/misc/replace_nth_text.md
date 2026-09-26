# OUTRO - replace_nth_text.py
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\scripts\replace_nth_text.py
**SHA:** df89772be19a3e51
**Timestamp:** 2026-08-28T02:52:29.917023
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- dry_run: bool = False,
- dry_run: preview without modifying
- if dry_run:
- dry_run=args.dry_run,

### Ouro Bruto (primeiros 5000 chars)
```
"""Replace text in individual <a:t> elements of a PPTX slide XML file.

When replace_text.py can't help — duplicate text, substring fields, non-
placeholder shapes — this script operates directly on <a:t> elements:

  1. Finds ALL <a:t> elements containing the search string.
  2. Lists them with indices so you can pick the right one.
  3. Replaces the matched substring (not the whole element) by default.

Usage:
    # List all text elements (see indices)
    python scripts/replace_nth_text.py slide.xml --list

    # List only elements matching a string
    python scripts/replace_nth_text.py slide.xml --list --find "Chapter Title"

    # Substring replacement (default) — only the matched part changes:
    #   <a:t>Debut Year: YYYY</a:t>  →  <a:t>Debut Year: 2015</a:t>
    python scripts/replace_nth_text.py slide.xml --find "YYYY" --nth 1 --text "2015"

    # Replace multiple fields in the same slide:
    python scripts/replace_nth_text.py slide.xml --find "YYYY" --all --text "2015"
    python scripts/replace_nth_text.py slide.xml --find "[Fan Club Name]" --all --text "ONCE"
    python scripts/replace_nth_text.py slide.xml --find "[Company Name]" --all --text "JYP Entertainment"

    # Full-element replacement — replace entire <a:t> content:
    python scripts/replace_nth_text.py slide.xml --find "Chapter Title" --nth 1 --text "2025 CREATIVE VISION" --full

    # Replace by global index (from --list output) — always replaces full element
    python scripts/replace_nth_text.py slide.xml --index 5 --text "New Text Here"

    # Dry run (preview without modifying)
    python scripts/replace_nth_text.py slide.xml --find "YYYY" --nth 1 --text "2015" --dry-run

Shell quoting warning:
    If the replacement text contains $, use SINGLE quotes to prevent shell
    expansion. "$4,500" becomes ",500" (bash eats $4). Use '$4,500' instead.

This complements replace_text.py:
  - replace_text.py     → targets shapes by placeholder type, replaces whole text body
  - replace_nth_text.py → targets individual <a:t> elements, substring or full replacement
"""

import re
import sys
from pathlib import Path


def _find_text_elements(raw: str) -> list[dict]:
    """Find all <a:t>...</a:t> elements with their positions and content.

    Returns list of dicts: {text, start, end, line}
    """
    results = []
    for m in re.finditer(r"<a:t(?:\s[^>]*)?>([^<]*)</a:t>", raw):
        text = m.group(1)
        # Unescape XML entities for display
        display = (
            text.replace("&amp;", "&")
            .replace("&lt;", "<")
            .replace("&gt;", ">")
            .replace("&quot;", '"')
        )
        line = raw[: m.start()].count("\n") + 1
        results.append(
            {
                "text": text,
                "display": display,
                "start": m.start(),
                "end": m.end(),
                "full_match": m.group(0),
                "line": line,
            }
        )
    return results


def list_text(slide_path: Path, find: str | None = None) -> list[dict]:
    """List all <a:t> elements, optionally filtered by substring match."""
    raw = slide_path.read_text(encoding="utf-8")
    elements = _find_text_elements(raw)

    filtered = []
    for i, el in enumerate(elements):
        el["index"] = i
        if find is None or find.lower() in el["display"].lower():
            filtered.append(el)

    return filtered


def replace_nth(
    slide_path: Path,
    *,
    find: str | None = None,
    nth: int | None = None,
    global_index: int | None = None,
    replace_all: bool = False,
    new_text: str,
    full: bool = False,
    dry_run: bool = False,
) -> int:
    """Replace text in specific <a:t> element(s).

    By default, when ``find`` is used, only the matched substring within each
    ``<a:t>`` is replaced (e.g., ``"YYYY"`` → ``"2015"`` inside
    ``<a:t>Debut Year: YYYY</a:t>``).  Use ``full=True`` to replace the
    entire ``<a:t>`` content instead.

    When ``global_index`` is used (no ``find`` string), the entire element
    content is always replaced.

    Args:
        find: text substring to match (case-sensitive)
        nth: which occurrence of ``find`` to replace (1-based)
        global_index: absolute index from ``--list`` output (0-based)
        replace_all: replace ALL occurrences of ``find``
        new_text: replacement text
        full: if True, replace entire ``<a:t>`` content (not just substring)
        dry_run: preview without modifying

    Returns number of replacements made.
    """
    raw = slide_path.read_text(encoding="utf-8")
    elements = _find_text_elements(raw)

    # Determine which elements to replace
    targets: list[dict] = []
    # full-element mode: --index always, --find only with --full
    full_element = full or (global_index is not None)

    if global_index is not None:
        if 0 <= global_index < len(elements):
            targets = [elements[global_index]]
        else:
            print(
                f"Error: index
```