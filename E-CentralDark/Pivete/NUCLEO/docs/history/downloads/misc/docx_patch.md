# OUTRO - docx_patch.py
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\docx\scripts\docx_patch.py
**SHA:** e0e036b3aef74f09
**Timestamp:** 2026-08-28T02:52:25.245328
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- content_start = body_start_m.end()
- run = run_match.group(0)
- run = re.sub(r"<w:rPr>.*?</w:rPr>", "", run, flags=re.DOTALL)
- run = re.sub(r"(<w:r\b[^>]*>)", r"\1" + new_rPr, run, count=1)
- def apply_patch(xml_path: Path, operations: list[dict], dry_run: bool = False) -> list[str]:
- if not dry_run:
- if args.dry_run:
- messages = apply_patch(xml_file, file_ops, dry_run=args.dry_run)
- if not args.dry_run:

### Padroes
- p_pattern = re.compile(r"(<w:p\b[^>]*>.*?</w:p>)", re.DOTALL)
- t_pattern = re.compile(r"(<w:t[^>]*>)(.*?)(</w:t>)", re.DOTALL)
- p_pattern = re.compile(r"(<w:p\b[^>]*>.*?</w:p>)", re.DOTALL)
- p_pattern = re.compile(r"(<w:p\b[^>]*>.*?</w:p>)", re.DOTALL)
- p_pattern = re.compile(r"(<w:p\b[^>]*>.*?</w:p>)", re.DOTALL)
- tbl_pattern = re.compile(r"(<w:tbl\b.*?</w:tbl>)", re.DOTALL)
- p_pattern = re.compile(r"(<w:p\b[^>]*>.*?</w:p>)", re.DOTALL)

### Ouro Bruto (primeiros 5000 chars)
```
"""Apply a batch of operations to an unpacked DOCX via a JSON patch.

One script handles all common document modifications. The model generates
a JSON array of operations; this script applies them in order.

Usage:
    python scripts/docx_patch.py unpacked/ --patch '[
      {"op": "replace_text", "match": "old text", "text": "new text"},
      {"op": "insert_after", "match": "Title", "paragraphs": ["Line 1", "Line 2"]},
      {"op": "delete_paragraph", "match": "Lorem ipsum"},
      {"op": "set_table_cell", "table": 0, "row": 1, "col": 0, "text": "Jane Smith"},
      {"op": "set_style", "match": "Title", "bold": true, "size": 36}
    ]'

    # From a file
    python scripts/docx_patch.py unpacked/ --patch-file changes.json

    # Dry run
    python scripts/docx_patch.py unpacked/ --patch '[...]' --dry-run

    # Also patch headers/footers
    python scripts/docx_patch.py unpacked/ --patch '[...]' --all-files

Supported operations:

    replace_text    Replace text (handles split runs). Use \\n in "text" to
                    expand one paragraph into multiple.
                    {"op": "replace_text", "match": "old", "text": "new"}

    insert_after    Insert new paragraphs after the paragraph containing "match".
                    {"op": "insert_after", "match": "Title",
                     "paragraphs": ["Line 1", "Line 2"]}

    insert_before   Insert new paragraphs before the paragraph containing "match".
                    {"op": "insert_before", "match": "Title",
                     "paragraphs": ["Line 1", "Line 2"]}

    delete_paragraph  Delete all paragraphs containing "match".
                    {"op": "delete_paragraph", "match": "Lorem ipsum"}

    delete_section  Delete or keep sections by index.
                    {"op": "delete_section", "keep": [0, 1, 13]}
                    {"op": "delete_section", "delete": [3, 4, 5]}

    set_table_cell  Set text in a specific table cell.
                    {"op": "set_table_cell", "table": 0, "row": 1, "col": 0,
                     "text": "Jane Smith"}

    set_style       Change formatting on paragraphs matching text.
                    {"op": "set_style", "match": "Title",
                     "bold": true, "size": 28, "font": "Georgia", "color": "2E75B6"}

    add_paragraph   Append paragraphs at end of document body.
                    {"op": "add_paragraph",
                     "paragraphs": ["New content", "More content"]}
"""

import json
import re
import sys
from pathlib import Path

import defusedxml.minidom


def _xml_escape(text: str) -> str:
    return text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def _get_all_text_in_para(para_raw: str) -> str:
    """Concatenate all <w:t> content in a raw paragraph string."""
    return "".join(re.findall(r"<w:t[^>]*>(.*?)</w:t>", para_raw, re.DOTALL))


def _extract_rPr(para_raw: str) -> str:
    """Extract first <w:rPr>...</w:rPr> from paragraph."""
    m = re.search(r"(<w:rPr>.*?</w:rPr>)", para_raw, re.DOTALL)
    return m.group(1) if m else ""


def _extract_pPr(para_raw: str) -> str:
    """Extract <w:pPr>...</w:pPr> from paragraph."""
    m = re.search(r"(<w:pPr>.*?</w:pPr>)", para_raw, re.DOTALL)
    return m.group(1) if m else ""


def _make_paragraph(text: str, pPr: str = "", rPr: str = "") -> str:
    """Build a <w:p> element with optional formatting."""
    escaped = _xml_escape(text)
    space = ' xml:space="preserve"' if escaped.startswith(" ") or escaped.endswith(" ") else ""
    return f"<w:p>{pPr}<w:r>{rPr}<w:t{space}>{escaped}</w:t></w:r></w:p>"


def _build_rPr(style_op: dict) -> str:
    """Build <w:rPr> from style operation dict."""
    parts = []
    if style_op.get("font"):
        parts.append(f'<w:rFonts w:ascii="{style_op["font"]}" w:hAnsi="{style_op["font"]}"/>')
    if style_op.get("bold"):
        parts.append("<w:b/>")
    if style_op.get("italic"):
        parts.append("<w:i/>")
    if style_op.get("size"):
        # size in half-points (28pt = 56)
        parts.append(f'<w:sz w:val="{style_op["size"] * 2}"/>')
    if style_op.get("color"):
        parts.append(f'<w:color w:val="{style_op["color"]}"/>')
    if style_op.get("underline"):
        parts.append('<w:u w:val="single"/>')
    if not parts:
        return ""
    return "<w:rPr>" + "".join(parts) + "</w:rPr>"


# ---------------------------------------------------------------------------
# Operation implementations
# ---------------------------------------------------------------------------


def op_replace_text(raw: str, op: dict) -> tuple[str, str]:
    """Replace text, optionally expanding into multiple paragraphs."""
    match_text = op["match"]
    new_text = op["text"]
    new_lines = new_text.replace("\\n", "\n").split("\n")
    expand = len(new_lines) > 1

    p_pattern = re.compile(r"(<w:p\b[^>]*>.*?</w:p>)", re.DOTALL)
    parts = []
    last_end = 0
    count = 0

    for m in p_pattern.finditer(raw):
        parts.append(raw[last_end : m.start()])
        para = m.g
```