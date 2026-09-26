# OUTRO - replace_field.py
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\docx\scripts\replace_field.py
**SHA:** a0dbe8c852480051
**Timestamp:** 2026-08-28T02:52:25.548955
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- abs_start = m.end() + t_match.start()
- if total > 0 and not args.dry_run:

### Padroes
- pattern = re.compile(
- # Pattern: <w:r>...<w:instrText>MERGEFIELD Name</w:instrText>...</w:r>
- instr_pattern = re.compile(
- sdt_pattern = re.compile(r"(<w:sdt>)(.*?)(</w:sdt>)", re.DOTALL)
- content_pattern = re.compile(r"(<w:sdtContent>)(.*?)(</w:sdtContent>)", re.DOTALL)

### Ouro Bruto (primeiros 5000 chars)
```
"""Find and replace DOCX structured placeholders: merge fields, content controls, bookmarks.

Many Word templates use these instead of plain text for placeholder values.
This script understands all three mechanisms.

Usage:
    # List all fields/placeholders
    python scripts/replace_field.py unpacked/ --list

    # Replace merge fields by name
    python scripts/replace_field.py unpacked/ --field "CompanyName" --text "Acme Corp"

    # Replace content control (SDT) by tag or alias
    python scripts/replace_field.py unpacked/ --sdt "author_name" --text "Jane Smith"

    # Replace all fields from a JSON mapping
    python scripts/replace_field.py unpacked/ --map fields.json

JSON map format (fields.json):
    {
      "CompanyName": "Acme Corp",
      "AuthorName": "Jane Smith",
      "Date": "2025-04-07"
    }
"""

import json
import re
import sys
from pathlib import Path

import defusedxml.minidom


def _xml_escape(text: str) -> str:
    return text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def _get_text(node):
    if node.nodeType == node.TEXT_NODE:
        return node.data
    return "".join(_get_text(c) for c in node.childNodes)


def list_fields(unpacked_dir: Path) -> str:
    """List all merge fields, content controls, and bookmarks."""
    word_dir = unpacked_dir / "word"
    doc_path = word_dir / "document.xml"
    if not doc_path.is_file():
        return "Error: document.xml not found"

    dom = defusedxml.minidom.parse(str(doc_path))
    lines = ["\n=== Document Fields & Placeholders ==="]

    # Merge fields (MERGEFIELD in instrText)
    merge_fields = []
    for instrText in dom.getElementsByTagName("w:instrText"):
        text = _get_text(instrText).strip()
        m = re.match(r'MERGEFIELD\s+"?(\w+)"?', text, re.IGNORECASE)
        if m:
            merge_fields.append(m.group(1))
    # Also check fldSimple
    for fld in dom.getElementsByTagName("w:fldSimple"):
        instr = fld.getAttribute("w:instr") or ""
        m = re.match(r'\s*MERGEFIELD\s+"?(\w+)"?', instr, re.IGNORECASE)
        if m:
            merge_fields.append(m.group(1))

    if merge_fields:
        lines.append("\n  Merge Fields:")
        for name in sorted(set(merge_fields)):
            count = merge_fields.count(name)
            lines.append(f"    {name}" + (f" ({count}x)" if count > 1 else ""))

    # Content controls (SDT)
    sdt_items = []
    for sdt in dom.getElementsByTagName("w:sdt"):
        tag = alias = ""
        for sdtPr in sdt.getElementsByTagName("w:sdtPr"):
            for t in sdtPr.getElementsByTagName("w:tag"):
                tag = t.getAttribute("w:val") or ""
            for a in sdtPr.getElementsByTagName("w:alias"):
                alias = a.getAttribute("w:val") or ""
            break
        # Get current content
        content = ""
        for sdtContent in sdt.getElementsByTagName("w:sdtContent"):
            for t in sdtContent.getElementsByTagName("w:t"):
                content += _get_text(t)
            break
        if tag or alias:
            sdt_items.append((tag, alias, content.strip()[:50]))

    if sdt_items:
        lines.append("\n  Content Controls (SDT):")
        for tag, alias, content in sdt_items:
            label = tag or alias or "(no tag)"
            preview = f' = "{content}"' if content else ""
            alias_note = f" alias={alias}" if alias and alias != tag else ""
            lines.append(f"    {label}{alias_note}{preview}")

    # Bookmarks
    bookmarks = []
    for bm in dom.getElementsByTagName("w:bookmarkStart"):
        name = bm.getAttribute("w:name") or ""
        if name and not name.startswith("_"):  # Skip internal bookmarks
            bookmarks.append(name)

    if bookmarks:
        lines.append("\n  Bookmarks:")
        for name in sorted(set(bookmarks)):
            lines.append(f"    {name}")

    if len(lines) == 1:
        lines.append("  (no fields, content controls, or bookmarks found)")

    return "\n".join(lines)


def replace_merge_field(raw: str, field_name: str, new_text: str) -> tuple[str, int]:
    """Replace MERGEFIELD values in raw XML. Returns (new_raw, count)."""
    count = 0
    new_text = _xml_escape(new_text)

    # Handle <w:fldSimple w:instr=" MERGEFIELD FieldName "> ... </w:fldSimple>
    pattern = re.compile(
        r'(<w:fldSimple\s+w:instr="[^"]*MERGEFIELD\s+"?'
        + re.escape(field_name)
        + r'"?[^"]*"[^>]*>)(.*?)(</w:fldSimple>)',
        re.DOTALL | re.IGNORECASE,
    )
    for m in reversed(list(pattern.finditer(raw))):
        # Find existing run formatting inside the field
        rPr_match = re.search(r"(<w:rPr>.*?</w:rPr>)", m.group(2), re.DOTALL)
        rPr = rPr_match.group(1) if rPr_match else ""
        space = (
            ' xml:space="preserve"' if new_text.startswith(" ") or new_text.endswith(" ") else ""
        )
        new_content = f"<w:r>{rPr}<w:t{space}>{new_text}</w:t></w:r>"
        raw = raw[: m.start()] + m.group(1) + new_content + m.group(3) + ra
```