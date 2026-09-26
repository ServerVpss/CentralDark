# OUTRO - replace_text.py
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\docx\scripts\replace_text.py
**SHA:** 2ef13f137a7050f8
**Timestamp:** 2026-08-28T02:52:25.562018
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- start = len(concat_text)
- match_start = search_from + found.start()
- if cstart < match_end and cend > match_start:
- start = raw.find(tag_open, pos)
- if start == -1:
- segments.append(raw[start:end])
- dry_run: bool = False,
- if args.match and args.text is None and not args.dry_run:
- if args.dry_run:
- results = replace_text_in_file(xml_file, replacements, dry_run=args.dry_run)

### Padroes
- t_pattern = re.compile(r"(<w:t[^>]*>)(.*?)(</w:t>)", re.DOTALL)
- p_pattern = re.compile(r"(<w:p\b[^>]*>.*?</w:p>)", re.DOTALL)
- p_pattern = re.compile(r"(<w:p\b[^>]*>.*?</w:p>)", re.DOTALL)

### Ouro Bruto (primeiros 5000 chars)
```
"""Replace text in a DOCX document while preserving formatting.

Handles text split across multiple <w:r> runs — the #1 pain point in
DOCX XML editing. Searches across run boundaries and preserves the
formatting from the first matching run.

Usage:
    # Replace a single text match (case-insensitive)
    python scripts/replace_text.py unpacked/ --match "Work Phone" --text "+1 (555) 123-4567"

    # Batch replace from a JSON mapping file
    python scripts/replace_text.py unpacked/ --map replacements.json

    # Dry run (preview without modifying)
    python scripts/replace_text.py unpacked/ --match "Name Surname" --text "Jane Smith" --dry-run

    # Also search headers and footers (not just document.xml)
    python scripts/replace_text.py unpacked/ --match "Company" --text "Acme" --all-files

JSON map format (replacements.json):
    {
      "Name Surname": "Jane Smith",
      "Job Title": "Wedding Photographer",
      "Work Phone": "+1 (555) 123-4567",
      "Work Email": "jane@example.com"
    }

Notes:
    - Searches across <w:r> run boundaries (handles split text)
    - Preserves <w:rPr> formatting from the first matching run
    - Replaces ALL occurrences in the file, not just the first
    - By default only edits word/document.xml; use --all-files for headers/footers
"""

import json
import re
import sys
from pathlib import Path


def _get_text(node):
    if node.nodeType == node.TEXT_NODE:
        return node.data
    return "".join(_get_text(c) for c in node.childNodes)


def _collect_runs_text(paragraph):
    """Collect (run_element, text) pairs from a <w:p> paragraph.

    Returns list of tuples. Each tuple is either:
    - (run_element, text_string) for <w:r> elements containing <w:t>
    - (None, "") for non-run elements (spacing, breaks, etc.)
    """
    runs = []
    for child in paragraph.childNodes:
        if child.nodeType != child.ELEMENT_NODE:
            continue
        if child.tagName == "w:r":
            text = ""
            for t in child.getElementsByTagName("w:t"):
                text += _get_text(t)
            runs.append((child, text))
    return runs


def _get_rPr_xml(run_element):
    """Extract the <w:rPr>...</w:rPr> XML string from a run, or empty."""
    for rPr in run_element.getElementsByTagName("w:rPr"):
        return rPr.toxml()
    return ""


def _xml_escape(text: str) -> str:
    return text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def _replace_in_paragraph_raw(raw_paragraph: str, old_text: str, new_text: str) -> tuple[str, int]:
    """Replace text within a raw paragraph XML string.

    Concatenates the <w:t> content to locate matches that span multiple
    <w:r> runs, then rewrites the spanning runs. The paragraph is re-parsed
    after every replacement so positions stay valid even when the same text
    (or a single <w:t>) is matched more than once. Replacement text is
    XML-escaped before insertion.

    Returns (modified_raw, replacement_count).
    """
    if not old_text:
        return raw_paragraph, 0

    new_text_escaped = _xml_escape(new_text)
    t_pattern = re.compile(r"(<w:t[^>]*>)(.*?)(</w:t>)", re.DOTALL)
    result = raw_paragraph
    count = 0
    search_from = 0  # concat offset to resume from, so inserted text is not re-matched

    while True:
        t_elements = list(t_pattern.finditer(result))
        if not t_elements:
            break

        concat_text = ""
        char_map = []  # (char_start_in_concat, char_end_in_concat, match_object)
        for m in t_elements:
            start = len(concat_text)
            concat_text += m.group(2)
            char_map.append((start, len(concat_text), m))

        found = re.search(re.escape(old_text), concat_text[search_from:], re.IGNORECASE)
        if not found:
            break
        match_start = search_from + found.start()
        match_end = search_from + found.end()

        first_t_idx = None
        last_t_idx = None
        for idx, (cstart, cend, _) in enumerate(char_map):
            if cstart < match_end and cend > match_start:
                if first_t_idx is None:
                    first_t_idx = idx
                last_t_idx = idx
        if first_t_idx is None:
            break

        if first_t_idx == last_t_idx:
            old_content = char_map[first_t_idx][2].group(2)
            offset = match_start - char_map[first_t_idx][0]
            new_content = (
                old_content[:offset] + new_text_escaped + old_content[offset + len(old_text) :]
            )
        else:
            first_text = char_map[first_t_idx][2].group(2)
            offset_first = match_start - char_map[first_t_idx][0]
            last_text = char_map[last_t_idx][2].group(2)
            offset_last = match_end - char_map[last_t_idx][0]
            new_content = first_text[:offset_first] + new_text_escaped + last_text[offset_last:]

        space_attr = (
            ' xml:space="preserve"'
            if new_content.startswith(" ") or new_content.en
```

---

# OUTRO - replace_text.py
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\scripts\replace_text.py
**SHA:** a86decfa8779f81c
**Timestamp:** 2026-08-28T02:52:29.932229
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- if key in run:
- shape_start = shape_match.start()
- new_raw = raw[:shape_start] + raw[shape_start:].replace(old_p_section, new_p_xml, 1)
- shape_section = new_raw[shape_start:]
- dry_run: bool = False,
- dry_run: if True, print what would change without modifying
- if dry_run:
- dry_run=args.dry_run,

### Padroes
- Handles the common template-filling pattern: find a placeholder by type or
- shape_pattern = re.compile(
- txbody_pattern = re.compile(r"(<p:txBody>)(.*?)(</p:txBody>)", re.DOTALL)
- p_blocks_pattern = re.compile(

### Ouro Bruto (primeiros 5000 chars)
```
"""Replace text in a PPTX slide placeholder while preserving formatting.

Handles the common template-filling pattern: find a placeholder by type or
text content, replace its text with new content, and inherit the template's
fonts, colors, and sizes automatically.

Usage:
    # Simple replacement — inherits formatting from template's first run
    python scripts/replace_text.py slide.xml --ph ctrTitle --text "New Title"

    # Multi-line — \\n creates <a:br> line breaks within one paragraph
    python scripts/replace_text.py slide.xml --ph subTitle --text "Line 1\\nLine 2"

    # Custom formatting per run (JSON array)
    python scripts/replace_text.py slide.xml --ph ctrTitle --runs '[
      {"text": "Gift the Glow", "size": 4800, "color": "accent1"},
      {"br": true},
      {"text": "Subtitle here", "size": 2000, "color": "accent4"}
    ]'

    # Match by text content instead of placeholder type
    python scripts/replace_text.py slide.xml --match "Christmas" --text "Holiday"

    # Auto-shrink text to fit the text box (prevents overflow/overlap)
    python scripts/replace_text.py slide.xml --ph ctrTitle --text "Long Title" --autofit

    # Preview without modifying (dry run)
    python scripts/replace_text.py slide.xml --ph ctrTitle --text "New" --dry-run

Run inspect_slide.py first to see placeholder types, dimensions, and autofit mode.

JSON run format:
    {"text": "...", "size": 4800, "color": "accent1", "font": "Arial", "bold": true}
    {"br": true}   — line break

    - size: hundredths of a point (4800 = 48pt)
    - color: scheme name (accent1, dk1, lt1) or hex (#FF0000)
    - font: typeface name
    - bold/italic: boolean
    - Omitted properties inherit from template's first run
"""

import json
import re
import sys
from pathlib import Path

import defusedxml.minidom


def _get_text(node):
    """Get all text from a node and children."""
    if node.nodeType == node.TEXT_NODE:
        return node.data
    return "".join(_get_text(c) for c in node.childNodes)


def _extract_run_format(rPr):
    """Extract formatting dict from <a:rPr> element."""
    if rPr is None:
        return {}
    fmt = {}

    sz = rPr.getAttribute("sz")
    if sz:
        fmt["size"] = int(sz)

    if rPr.getAttribute("b") == "1":
        fmt["bold"] = True
    if rPr.getAttribute("i") == "1":
        fmt["italic"] = True

    lang = rPr.getAttribute("lang")
    if lang:
        fmt["lang"] = lang

    for latin in rPr.getElementsByTagName("a:latin"):
        tf = latin.getAttribute("typeface")
        if tf:
            fmt["font"] = tf
        break

    for solid in rPr.getElementsByTagName("a:solidFill"):
        for scheme in solid.getElementsByTagName("a:schemeClr"):
            fmt["color"] = scheme.getAttribute("val")
        for srgb in solid.getElementsByTagName("a:srgbClr"):
            fmt["color"] = f"#{srgb.getAttribute('val')}"
        break

    return fmt


def _format_summary(fmt):
    """One-line summary of a format dict."""
    parts = []
    if "font" in fmt:
        parts.append(fmt["font"])
    if "size" in fmt:
        parts.append(f"{fmt['size'] // 100}pt")
    if fmt.get("bold"):
        parts.append("bold")
    if "color" in fmt:
        parts.append(fmt["color"])
    return " ".join(parts) or "(default)"


def _find_target_shapes(dom, ph_type=None, match_text=None):
    """Find ALL matching <p:sp> elements by placeholder type or text match.

    Returns list of (sp_element, shape_name, placeholder_type) tuples.
    """
    results = []
    for sp in dom.getElementsByTagName("p:sp"):
        name = sp_ph_type = ""
        for nvSpPr in sp.getElementsByTagName("p:nvSpPr"):
            for cNvPr in nvSpPr.getElementsByTagName("p:cNvPr"):
                name = cNvPr.getAttribute("name")
            for nvPr in nvSpPr.getElementsByTagName("p:nvPr"):
                for ph in nvPr.getElementsByTagName("p:ph"):
                    sp_ph_type = ph.getAttribute("type") or "body"
            break

        if ph_type and sp_ph_type == ph_type:
            results.append((sp, name, sp_ph_type))

        elif match_text:
            full_text = ""
            for txBody in sp.getElementsByTagName("p:txBody"):
                for t in txBody.getElementsByTagName("a:t"):
                    full_text += _get_text(t)
            if match_text.lower() in full_text.lower():
                results.append((sp, name, sp_ph_type))

    return results


def _get_default_format(txBody):
    """Extract formatting from the first non-empty run in a txBody."""
    for p in txBody.childNodes:
        if p.nodeType != p.ELEMENT_NODE or p.tagName != "a:p":
            continue
        for child in p.childNodes:
            if child.nodeType != child.ELEMENT_NODE or child.tagName != "a:r":
                continue
            for sub in child.childNodes:
                if sub.nodeType == sub.ELEMENT_NODE and sub.tagName == "a:rPr":
                    fmt = _extract_run_format(sub)
                    if fmt:
          
```