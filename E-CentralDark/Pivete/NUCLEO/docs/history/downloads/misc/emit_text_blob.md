# OUTRO - emit_text_blob.py
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\meteor-decomp-develop\tools\emit_text_blob.py
**SHA:** 0df411960f75c7d8
**Timestamp:** 2026-08-28T12:23:03.299544
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- def emit(binary: str, dry_run: bool = False, chunk_bytes: int = DEFAULT_CHUNK_BYTES) -> dict:
- if not dry_run:
- if not dry_run:
- sym = "_text_blob" if is_first else f"_text_blob_{start:08x}"
- def _emit_one_chunk(binary: str, body: bytes, sym: str, start: int,

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env python3
# meteor-decomp — clean-room decompilation of FINAL FANTASY XIV 1.x client binaries
# Copyright (C) 2026  Samuel Stegall
# SPDX-License-Identifier: AGPL-3.0-or-later
"""
Emit ONE giant naked-asm function whose body is `_emit` of every byte
in orig's `.text` section. Compiled to a single .obj, this lands the
entire `.text` content as a single CODE section (CNT_CODE / EXECUTE /
READ) — matching orig's section attributes byte-for-byte.

Why a separate tool from `emit_data_sections.py --include-text`:
that tool emits `.text` as `__declspec(allocate(".text")) const unsigned
char[]` which gets CNT_INITIALIZED_DATA characteristics (0x40), forcing
link.exe to create a second `.text` section. By using a NAKED
FUNCTION, we get CNT_CODE characteristics (0x20) which matches orig
exactly.

Trade-off: the entire .text is one opaque function blob. We can't
substitute individual functions with rosetta sources. For the first
working byte-identical link, that's fine; granularity comes later
once the link path is closed.

Reads:
  build/pe-layout/<binary>.json
  orig/<binary>.exe

Writes:
  src/<binary>/_passthrough/_section_text_blob.cpp

Usage:
  tools/emit_text_blob.py ffxivlogin
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
PE_LAYOUT = REPO_ROOT / "build" / "pe-layout"
ORIG = REPO_ROOT / "orig"
SRC = REPO_ROOT / "src"

LICENSE_HEADER = """\
// meteor-decomp — clean-room decompilation of FINAL FANTASY XIV 1.x client binaries
// Copyright (C) 2026  Samuel Stegall
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published
// by the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// SPDX-License-Identifier: AGPL-3.0-or-later
"""


# cl.exe runs out of heap space (`fatal error C1060`) at roughly
# 9-10 million `_emit` lines (~180 MB of source). For binaries whose
# .text exceeds the threshold (ffxivboot, ffxivgame), chunk the
# blob across multiple .cpp files. Each chunk gets its own
# `.text$X<chunk_offset>` subsection so link.exe lays them out
# in offset order. With patched align=1, chunks pack tightly.
DEFAULT_CHUNK_BYTES = 1_000_000  # ~1 MB per chunk, ~30 MB source — safe


def _load_swaps(binary: str) -> list[tuple[int, int]]:
    """Read `_swap_manifest.json` and return [(rva, size)] of byte
    ranges to SKIP when emitting the blob — those RVAs are filled by
    a `_swap_FUN_<va>.cpp` wrapped rosetta source instead."""
    manifest_path = SRC / binary / "_passthrough" / "_swap_manifest.json"
    if not manifest_path.exists():
        return []
    manifest = json.loads(manifest_path.read_text())
    return sorted(
        ((s["rva"], s["size"]) for s in manifest.get("swaps", [])),
        key=lambda t: t[0],
    )


def _split_chunks_by_swaps(
    body: bytes, text_vaddr: int, swaps: list[tuple[int, int]],
    max_chunk: int,
) -> list[tuple[int, bytes]]:
    """Walk `body` (orig .text) and produce a list of (start_offset, bytes)
    chunks to emit. Each `swap` (rva, size) drops a hole at `rva-text_vaddr`,
    splitting the surrounding chunks. Chunks larger than `max_chunk` are
    further split at byte boundaries so cl.exe's heap doesn't OOM."""
    # Build a list of "byte spans" to emit: walk body offset cursor,
    # for each swap split a hole, then carry on.
    spans: list[tuple[int, int]] = []  # (offset, length)
    cursor = 0
    for swap_rva, swap_size in swaps:
        swap_off = swap_rva - text_vaddr
        if swap_off < 0 or swap_off >= len(body):
            continue
        if cursor < swap_off:
            spans.append((cursor, swap_off - cursor))
        cursor = swap_off + swap_size
    if cursor < len(body):
        spans.append((cursor, len(body) - cursor))

    # Now further split each span if larger than max_chunk.
    chunks: list[tuple[int, bytes]] = []
    for off, length in spans:
        n_sub = (length + max_chunk - 1) // max_chunk
        for i in range(n_sub):
            sub_off = off + i * max_chunk
            sub_len = min(max_chunk, length - i * max_chunk)
            chunks.append((sub_off, body[sub_off:sub_off + sub_len]))
    return chunks


def emit(binary: str, dry_run: bool = False, chunk_bytes: int = DEFAULT_CHUNK_BYTES) -> dict:
    pe_path = PE_LAYOUT / f"{binary}.json"
    orig_path = ORIG / f"{binary}.exe"
    pe = json.loads(pe_path.read_text())
    text_sec = next(s for s in pe["sections"] if s["name"] == ".text")
    orig_bytes = orig_path.read_bytes()
    body = orig_bytes[text_sec["raw_pointer"]:text_sec["raw_pointer"] + text_sec["raw_size"]]
    text_vaddr = text_sec["virtual_address"]

    out_dir = SRC / binary / "_passthrough"
    out_dir.mkdir(parents=True, exist_ok=True)

    # Wipe stale chunk source files AND their .obj counterparts so a
    # smaller new emit doesn't leave orphans (
```