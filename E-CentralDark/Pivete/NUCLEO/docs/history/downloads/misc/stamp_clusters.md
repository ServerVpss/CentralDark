# OUTRO - stamp_clusters.py
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\meteor-decomp-develop\tools\stamp_clusters.py
**SHA:** 99684b806101fb07
**Timestamp:** 2026-08-28T12:23:03.972078
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- if not args.dry_run:

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env python3
# meteor-decomp — clean-room decompilation of FINAL FANTASY XIV 1.x client binaries
# Copyright (C) 2026  Samuel Stegall
# SPDX-License-Identifier: AGPL-3.0-or-later
"""
For each hand-written `_rosetta/*.cpp` candidate, look up the
byte-identical cluster siblings (from `tools/cluster_shapes.py`'s
output) and stamp a per-sibling .cpp copy so `make rosetta` can
match them all without further hand-writing.

The stamper relies on the same C++ source compiling to the same
.obj `.text` bytes — which is true under our pinned cl.exe build
because per-function compilation isn't influenced by anything
outside the .cpp (the cluster siblings live at different RVAs but
their bodies are identical, so the same source matches all of them
when `compare.py` reads orig at each sibling's RVA).

Per-stamped .cpp:
  - filename: `FUN_<sibling_rva>.cpp`
  - content: original template with the FUN_<orig> + 0x<orig>
    references rewritten to the sibling's RVA in comments
    (cosmetic — class names and the rosetta_FUN_* symbol stay as
    the original since per-.cpp compilation is independent)

Skip rules:
  - if a `FUN_<sibling_rva>.cpp` already exists (hand-written or
    previously stamped), it's left alone — the stamper never
    overwrites
  - the original template itself is never stamped over

Usage:
  tools/stamp_clusters.py [binary]              # default ffxivgame
  tools/stamp_clusters.py ffxivgame --dry-run   # show what would happen

Output is appended to `build/easy_wins/<binary>.stamp.log`.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
SRC_ROOT = REPO_ROOT / "src"
OUT_ROOT = REPO_ROOT / "build" / "easy_wins"

RE_FUN_NAME = re.compile(r"FUN_([0-9a-f]+)\.cpp$", re.IGNORECASE)
RE_FUN_HEX = re.compile(r"FUN_([0-9a-f]{6,8})", re.IGNORECASE)
RE_HEX_LITERAL = re.compile(r"0x([0-9a-f]{6,8})", re.IGNORECASE)


def stamp_one(template_text: str, orig_va: int, sibling_va: int, sibling_rva: int) -> str:
    """Substitute the original FUN_<va>/0x<va> references for the sibling."""
    orig_va_hex = f"{orig_va:08x}"
    sibling_va_hex = f"{sibling_va:08x}"
    orig_rva_hex = f"{orig_va & 0xffffff:06x}"  # rva relative-to-image-base lower bytes
    sibling_rva_hex = f"{sibling_rva:08x}"

    # Replace `FUN_<orig_va_hex>` → `FUN_<sibling_va_hex>` (cosmetic).
    text = re.sub(
        rf"\bFUN_{orig_va_hex}\b",
        f"FUN_{sibling_va_hex}",
        template_text,
        flags=re.IGNORECASE,
    )
    # Replace any standalone `0x<orig_va_hex>` literal in comments
    # (the FUNCTION: header line + iteration log). 8-char form only —
    # avoids bashing 4-byte field offsets.
    text = re.sub(
        rf"\b0x{orig_va_hex}\b",
        f"0x{sibling_va_hex}",
        text,
        flags=re.IGNORECASE,
    )
    # Stamp a marker at the top so future readers know it's auto-stamped.
    stamp_header = (
        f"// [STAMPED] from FUN_{orig_va_hex}.cpp by tools/stamp_clusters.py\n"
        f"//           sibling at orig RVA {sibling_rva:#010x} (VA {sibling_va:#010x})\n"
        f"//           same byte-shape cluster — see cluster_shapes.py output\n"
    )
    return stamp_header + text


def parse_template_va(cpp_path: Path) -> int | None:
    """Extract the orig VA (e.g. 0x004165b0) from the template filename."""
    m = RE_FUN_NAME.search(cpp_path.name)
    if not m:
        return None
    return int(m.group(1), 16)


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("binary", default="ffxivgame", nargs="?")
    ap.add_argument("--dry-run", action="store_true", help="show what would be stamped without writing")
    ap.add_argument("--reloc", action="store_true",
                    help="use the relocation-aware clusters JSON (clusters_reloc.json) "
                         "instead of the exact-byte clusters JSON. Reloc clusters are "
                         "coarser and include functions whose only difference is the "
                         "linker fixup target (CALL displacements, absolute moves).")
    ap.add_argument("--image-base", type=lambda s: int(s, 0), default=0x400000,
                    help="image base for converting VA ↔ RVA (default 0x400000)")
    args = ap.parse_args()
    stem = args.binary.replace(".exe", "")

    rosetta_dir = SRC_ROOT / stem / "_rosetta"
    if not rosetta_dir.is_dir():
        print(f"error: {rosetta_dir} not found — no hand-written templates", file=sys.stderr)
        return 1

    clusters_filename = f"{stem}.clusters_reloc.json" if args.reloc else f"{stem}.clusters.json"
    clusters_path = OUT_ROOT / clusters_filename
    if not clusters_path.exists():
        run_tool = "tools/cluster_relocs.py" if args.reloc else "tools/cluster_shapes.py"
        print(f"error: {clusters_path} missing — run {run_tool} first", file=sys.stderr)
        return 1
    cl
```