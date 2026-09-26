# OUTRO - seed_templates.py
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\meteor-decomp-develop\tools\seed_templates.py
**SHA:** b43a30e0ae47821a
**Timestamp:** 2026-08-28T12:23:03.925276
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- def seed_one(source_stem: str, target_stem: str, dry_run: bool = False, reloc: bool = False) -> dict:
- if not dry_run:
- if not dry_run:
- report = seed_one(args.source, t, dry_run=args.dry_run, reloc=args.reloc)

### Gaps
- return {"error": f"source rosetta dir missing: {source_rosetta}"}

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env python3
# meteor-decomp — clean-room decompilation of FINAL FANTASY XIV 1.x client binaries
# Copyright (C) 2026  Samuel Stegall
# SPDX-License-Identifier: AGPL-3.0-or-later
"""
Cross-binary template seeding.

The matching recipe captures source patterns for a small set of
canonical idioms (return 0, return *this, empty stubs, accessor /
setter shapes). Each idiom compiles to the same byte-shape across
binaries — `void C::empty() {}` produces `c3` whether it lives in
ffxivgame.exe or ffxivboot.exe. The hand-written templates under
`src/ffxivgame/_rosetta/` therefore unlock the same clusters in
every other binary that ships the same idiom.

This tool:
  1. Walks `src/ffxivgame/_rosetta/FUN_*.cpp` for primary (non-stamped)
     templates — files NOT starting with `// [STAMPED]`.
  2. Computes each primary template's cluster shape hash by looking
     up its RVA in `build/easy_wins/ffxivgame.clusters.json`.
  3. For each target binary, opens its `clusters.json` and finds
     clusters with matching shape hashes.
  4. Picks a representative function (smallest RVA) from each
     matching target cluster and stamps a seed `.cpp` at
     `src/<target>/_rosetta/FUN_<rva>.cpp` using the template's
     content, with FUN_<source-va>/0x<source-va> rewritten to the
     target representative's RVA in comments.

After seeding, run `tools/stamp_clusters.py <target>` to expand the
seed templates into per-sibling .cpp files, then
`make rosetta-bulk BINARY=<target>.exe` to validate.

Usage:
  tools/seed_templates.py ffxivboot         # seed one target
  tools/seed_templates.py --all             # seed all non-source binaries
  tools/seed_templates.py --dry-run ffxivboot
  tools/seed_templates.py --source ffxivlogin --target ffxivboot
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
SRC_DIR = REPO_ROOT / "src"
EASY_WINS = REPO_ROOT / "build" / "easy_wins"

KNOWN_BINARIES = ("ffxivgame", "ffxivlogin", "ffxivboot", "ffxivconfig", "ffxivupdater")


def _is_primary(cpp_text: str) -> bool:
    """Return True iff this .cpp is hand-written (not [STAMPED] from another)."""
    return not cpp_text.startswith("// [STAMPED]")


def _va_to_rva(va: int, image_base: int = 0x400000) -> int:
    return va - image_base


def _rva_to_va(rva: int, image_base: int = 0x400000) -> int:
    return rva + image_base


def _load_clusters(binary_stem: str, reloc: bool = False) -> dict[str, list[dict]]:
    suffix = "clusters_reloc" if reloc else "clusters"
    path = EASY_WINS / f"{binary_stem}.{suffix}.json"
    if not path.exists():
        return {}
    return json.loads(path.read_text())


def _build_rva_to_hash(clusters: dict[str, list[dict]]) -> dict[int, str]:
    """For a given clusters JSON, return rva → shape_hash mapping."""
    out: dict[int, str] = {}
    for h, members in clusters.items():
        for m in members:
            out[m["rva"]] = h
    return out


def _stamp_seed(template_text: str, source_va: int, target_va: int, target_rva: int) -> str:
    """Generate seed-template content. Same shape as stamp_clusters.py's
    output but with a `[SEED]` marker so re-runs don't recurse."""
    import re
    source_va_hex = f"{source_va:08x}"
    target_va_hex = f"{target_va:08x}"
    # Rewrite FUN_<source>/0x<source> for the target's VA. Use 8-char hex
    # form only — short field-offset hex strings stay untouched.
    text = re.sub(rf"\bFUN_{source_va_hex}\b", f"FUN_{target_va_hex}", template_text, flags=re.IGNORECASE)
    text = re.sub(rf"\b0x{source_va_hex}\b", f"0x{target_va_hex}", text, flags=re.IGNORECASE)
    header = (
        f"// [SEED] from FUN_{source_va_hex}.cpp by tools/seed_templates.py\n"
        f"//        target VA {target_va:#010x} (RVA {target_rva:#010x})\n"
        f"//        cross-binary cluster match — same shape hash, same C++ idiom.\n"
        f"//        After seeding, run tools/stamp_clusters.py to fan out to siblings.\n"
    )
    return header + text


def seed_one(source_stem: str, target_stem: str, dry_run: bool = False, reloc: bool = False) -> dict:
    """Seed `src/<target>/_rosetta/` from `src/<source>/_rosetta/` primary
    templates whose cluster shapes also exist in the target binary."""
    source_rosetta = SRC_DIR / source_stem / "_rosetta"
    if not source_rosetta.is_dir():
        return {"error": f"source rosetta dir missing: {source_rosetta}"}

    source_clusters = _load_clusters(source_stem, reloc=reloc)
    target_clusters = _load_clusters(target_stem, reloc=reloc)
    cluster_tool = "tools/cluster_relocs.py" if reloc else "tools/cluster_shapes.py"
    if not source_clusters:
        return {"error": f"no clusters for source {source_stem} — run {cluster_tool} {source_stem}"}
    if not target_clusters:
        return {"error": f"no clusters for target {target_stem} — run {cluster_tool} {target_stem}"}

    source_rva_to_hash = _build_rva_to_hash(source_clusters)

    
```