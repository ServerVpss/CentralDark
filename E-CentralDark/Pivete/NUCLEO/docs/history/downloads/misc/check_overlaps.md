# OUTRO - check_overlaps.py
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\scripts\check_overlaps.py
**SHA:** 85e7b4a6007a94fb
**Timestamp:** 2026-08-28T02:52:29.891568
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- shape_start = shape_match.start()

### Ouro Bruto (primeiros 5000 chars)
```
"""Check for overlapping shapes and off-slide overflow in unpacked PPTX slides.

Parses the bounding box of every shape in each slide and reports:
  1. Shape pairs that overlap significantly (text-on-text collisions)
  2. Shapes that extend beyond the slide boundaries (off-slide overflow)

Use --fix to auto-apply <a:normAutofit/> to all text shapes involved in
overlaps or overflows. This makes PowerPoint auto-shrink text to fit the
box without changing positions or sizes.

Usage:
    # Check all slides
    python scripts/check_overlaps.py unpacked/

    # Auto-fix: enable normAutofit on all overlapping/overflowing text shapes
    python scripts/check_overlaps.py unpacked/ --fix

    # Check a single slide
    python scripts/check_overlaps.py unpacked/ppt/slides/slide4.xml

    # Stricter threshold (default 10% of smaller shape)
    python scripts/check_overlaps.py unpacked/ --threshold 5

    # Show all shapes (even non-overlapping) for debugging
    python scripts/check_overlaps.py unpacked/ppt/slides/slide1.xml --verbose

Exit code 0 = no issues, 1 = overlaps or overflows found (after fix attempt).
"""

import re
import sys
from pathlib import Path

import defusedxml.minidom

EMU_PER_INCH = 914400


def _emu_to_inches(emu: int) -> float:
    return emu / EMU_PER_INCH


def _get_xfrm(element):
    """Extract (x, y, cx, cy) from the first <a:xfrm> inside <p:spPr> or <p:grpSpPr>.

    Returns tuple of ints (EMU) or None if not found.
    """
    for tag in ("p:spPr", "p:grpSpPr"):
        for spPr in element.getElementsByTagName(tag):
            for xfrm in spPr.getElementsByTagName("a:xfrm"):
                off = xfrm.getElementsByTagName("a:off")
                ext = xfrm.getElementsByTagName("a:ext")
                if not off or not ext:
                    continue
                x = off[0].getAttribute("x")
                y = off[0].getAttribute("y")
                cx = ext[0].getAttribute("cx")
                cy = ext[0].getAttribute("cy")
                if x and y and cx and cy:
                    return int(x), int(y), int(cx), int(cy)
            break
        break
    return None


def _get_shape_name(element) -> str:
    """Extract shape name from <p:cNvPr name="...">."""
    for tag in ("p:nvSpPr", "p:nvPicPr", "p:nvGrpSpPr"):
        for nv in element.getElementsByTagName(tag):
            for cNvPr in nv.getElementsByTagName("p:cNvPr"):
                return cNvPr.getAttribute("name") or "(unnamed)"
            break
    return "(unnamed)"


def _get_shape_text_preview(element, max_len: int = 40) -> str:
    """Get a short text preview from shape's <a:t> elements."""
    texts = []
    for t in element.getElementsByTagName("a:t"):
        if t.firstChild and t.firstChild.nodeValue:
            texts.append(t.firstChild.nodeValue)
    full = " ".join(texts).strip()
    if len(full) > max_len:
        return full[:max_len] + "…"
    return full or ""


def _has_text(element) -> bool:
    """Check if shape contains any visible text."""
    for t in element.getElementsByTagName("a:t"):
        if t.firstChild and t.firstChild.nodeValue and t.firstChild.nodeValue.strip():
            return True
    return False


def _overlap_area(box_a, box_b) -> int:
    """Compute overlap area between two boxes (x, y, cx, cy) in EMU².

    Returns 0 if no overlap.
    """
    ax1, ay1, acx, acy = box_a
    bx1, by1, bcx, bcy = box_b
    ax2, ay2 = ax1 + acx, ay1 + acy
    bx2, by2 = bx1 + bcx, by1 + bcy

    ix1 = max(ax1, bx1)
    iy1 = max(ay1, by1)
    ix2 = min(ax2, bx2)
    iy2 = min(ay2, by2)

    if ix1 >= ix2 or iy1 >= iy2:
        return 0
    return (ix2 - ix1) * (iy2 - iy1)


def _enable_autofit_for_shapes(slide_path: Path, shape_names: set[str]) -> int:
    """Enable <a:normAutofit/> on named shapes in a slide XML file.

    For each named shape, finds its <a:bodyPr> and:
    - Removes any existing autofit element (<a:spAutoFit/>, <a:noAutofit/>)
    - Adds <a:normAutofit/> so PowerPoint auto-shrinks text to fit

    Returns number of shapes modified.
    """
    raw = slide_path.read_text(encoding="utf-8")
    modified = 0

    for name in shape_names:
        name_escaped = re.escape(name)
        # Find the <p:sp> block containing this shape name
        shape_pat = re.compile(
            r'(<p:sp\b[^>]*>.*?name="' + name_escaped + r'".*?</p:sp>)',
            re.DOTALL,
        )
        shape_match = shape_pat.search(raw)
        if not shape_match:
            continue

        shape_xml = shape_match.group(1)
        shape_start = shape_match.start()

        # Check if shape has a <a:bodyPr>
        bodypr_match = re.search(r"<a:bodyPr\b([^>]*)(/?)>", shape_xml)
        if not bodypr_match:
            continue

        # Remove existing autofit elements within this shape's bodyPr area
        new_shape = shape_xml
        for pat in (r"<a:normAutofit[^/]*/>", r"<a:spAutoFit[^/]*/>", r"<a:noAutofit[^/]*/>"):
            new_shape = re.sub(pat, "", new_shape, count=1)

        # I
```