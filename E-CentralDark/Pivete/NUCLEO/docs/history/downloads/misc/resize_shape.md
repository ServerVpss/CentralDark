# OUTRO - resize_shape.py
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\scripts\resize_shape.py
**SHA:** c098d45a22a877e8
**Timestamp:** 2026-08-28T02:52:29.942742
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- dry_run: bool = False,
- dry_run: preview without modifying
- if dry_run:
- if modified and not dry_run:
- dry_run=args.dry_run,

### Padroes
- shape_pattern = re.compile(

### Ouro Bruto (primeiros 5000 chars)
```
"""Resize or reposition shapes in a PPTX slide XML file.

When replacement text is longer than the original, text boxes may overflow.
Use this script to adjust shape dimensions (width, height) and position (x, y)
without touching any text or formatting.

Usage:
    # List all shapes with current dimensions and positions
    python scripts/resize_shape.py slide.xml --list

    # Set absolute dimensions (inches) — only specified dimensions change
    python scripts/resize_shape.py slide.xml --ph body --height 3.5
    python scripts/resize_shape.py slide.xml --ph ctrTitle --width 9.0 --height 2.0
    python scripts/resize_shape.py slide.xml --name "Title 1" --width 8.0
    python scripts/resize_shape.py slide.xml --match "Lorem" --height 4.0

    # Adjust relative to current size (inches, +/-)
    python scripts/resize_shape.py slide.xml --ph body --dh 0.5     # grow 0.5" taller
    python scripts/resize_shape.py slide.xml --ph body --dw -0.5    # shrink 0.5" narrower

    # Set absolute position (inches from top-left)
    python scripts/resize_shape.py slide.xml --ph body --x 1.0 --y 3.0

    # Adjust position relative to current
    python scripts/resize_shape.py slide.xml --ph body --dy -0.5    # move up 0.5"

    # Dry run (preview without modifying)
    python scripts/resize_shape.py slide.xml --ph body --height 3.5 --dry-run

Units: all values are in inches. Internally converted to EMU (914400 EMU = 1").

Run inspect_slide.py first to see placeholder types, current sizes, and autofit mode.
"""

import re
import sys
from pathlib import Path

import defusedxml.minidom

_EMU_PER_INCH = 914400


def _emu_to_inches(emu: int) -> float:
    return emu / _EMU_PER_INCH


def _inches_to_emu(inches: float) -> int:
    return round(inches * _EMU_PER_INCH)


def _get_text(node) -> str:
    """Get all text from a node and children."""
    if node.nodeType == node.TEXT_NODE:
        return node.data
    return "".join(_get_text(c) for c in node.childNodes)


def _find_shapes(dom) -> list[dict]:
    """Find all <p:sp> elements and extract metadata."""
    shapes = []
    for sp in dom.getElementsByTagName("p:sp"):
        name = ""
        ph_type = ""
        ph_idx = ""

        for nvSpPr in sp.getElementsByTagName("p:nvSpPr"):
            for cNvPr in nvSpPr.getElementsByTagName("p:cNvPr"):
                name = cNvPr.getAttribute("name")
            for nvPr in nvSpPr.getElementsByTagName("p:nvPr"):
                for ph in nvPr.getElementsByTagName("p:ph"):
                    ph_type = ph.getAttribute("type") or "body"
                    ph_idx = ph.getAttribute("idx")
            break

        # Get position and size from spPr/xfrm
        x = y = cx = cy = 0
        for spPr in sp.getElementsByTagName("p:spPr"):
            for xfrm in spPr.getElementsByTagName("a:xfrm"):
                for off in xfrm.getElementsByTagName("a:off"):
                    x = int(off.getAttribute("x") or 0)
                    y = int(off.getAttribute("y") or 0)
                for ext in xfrm.getElementsByTagName("a:ext"):
                    cx = int(ext.getAttribute("cx") or 0)
                    cy = int(ext.getAttribute("cy") or 0)
            break

        # Get text content
        full_text = ""
        for txBody in sp.getElementsByTagName("p:txBody"):
            for t in txBody.getElementsByTagName("a:t"):
                full_text += _get_text(t)
            break

        shapes.append(
            {
                "element": sp,
                "name": name,
                "ph_type": ph_type,
                "ph_idx": ph_idx,
                "x": x,
                "y": y,
                "cx": cx,
                "cy": cy,
                "text": full_text.strip(),
            }
        )

    return shapes


def _match_shapes(
    shapes: list[dict],
    ph_type: str | None = None,
    name: str | None = None,
    match_text: str | None = None,
) -> list[dict]:
    """Filter shapes by criteria."""
    results = []
    for s in shapes:
        if ph_type and s["ph_type"] == ph_type:
            results.append(s)
        elif name and s["name"] == name:
            results.append(s)
        elif match_text and match_text.lower() in s["text"].lower():
            results.append(s)
    return results


def list_shapes(slide_path: Path) -> None:
    """List all shapes with positions and dimensions."""
    dom = defusedxml.minidom.parse(str(slide_path))
    shapes = _find_shapes(dom)

    if not shapes:
        print("No shapes found")
        return

    print(f"{'#':>3}  {'Name':24s}  {'Type':10s}  {'Position':16s}  {'Size':16s}  Text")
    print(f"{'---':>3}  {'----':24s}  {'----':10s}  {'--------':16s}  {'----':16s}  ----")

    for i, s in enumerate(shapes):
        text_preview = s["text"][:40]
        if len(s["text"]) > 40:
            text_preview += "..."
        ph = s["ph_type"] or "-"
        pos = f'({_emu_to_inches(s["x"]):.1f}", {_emu_to_inches(s["y"]):.1f}")'
        size = f'{_emu_to_inches(s["
```