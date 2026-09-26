# OUTRO - emit_passthrough_cpp.py
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\meteor-decomp-develop\tools\emit_passthrough_cpp.py
**SHA:** 284c053590e0558b
**Timestamp:** 2026-08-28T12:23:03.288482
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- orig_bytes: bytes, yaml_path: Path, dry_run: bool, force: bool) -> str:
- if not dry_run:
- orig_bytes: bytes, yaml_path: Path, dry_run: bool, force: bool,
- if not dry_run:

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env python3
# meteor-decomp — clean-room decompilation of FINAL FANTASY XIV 1.x client binaries
# Copyright (C) 2026  Samuel Stegall
# SPDX-License-Identifier: AGPL-3.0-or-later
"""
Emit a `__declspec(naked)` C++ source file that compiles to an .obj
whose `.text` section is byte-identical to one function's bytes in the
original binary.

This is the "fallback" path for any function we haven't matched at
source-level: it gets a tiny .cpp under `src/<bin>/_passthrough/<sym>.cpp`
that simply re-emits the orig instruction bytes via MASM-style
`_emit 0xNN` directives. The compiled .obj's `.text` matches orig
byte-for-byte (modulo nothing — there are no relocations because the
bytes are emitted as immediates), so `tools/compare.py` reports GREEN
and the YAML row gets stamped `matched`.

Caveats:
  - **Linking these passthrough .objs into a runnable PE requires
    placing each function at its orig RVA.** Their CALL/JMP/MOV-imm32
    bytes encode absolute or PC-relative targets that are only valid
    at the orig RVA. The companion (future) linker pipeline uses
    `#pragma code_seg(".text$NNNNNNNN")` per RVA + `link.exe /MERGE`
    to lay sections out in sorted RVA order; this tool emits that
    pragma so the .obj is already wired for that strategy.
  - Naked functions can't have C++ exception handling, automatic
    locals, or default calling conventions — but they can have ANY
    body the assembler accepts. We emit only `_emit` (raw byte) and
    no actual instructions, which is universally accepted.
  - This tool is INTENTIONALLY brain-dead. It does not know what the
    function does. It does not produce readable source. It just
    guarantees the bytes round-trip. Source-level matching (the
    `_rosetta/<sym>.cpp` files) is always preferable when available;
    `_passthrough/<sym>.cpp` is the universal fallback so we can
    relink the binary even before every function has a hand-written
    source equivalent.

Usage:
  tools/emit_passthrough_cpp.py FUN_004165e0
  tools/emit_passthrough_cpp.py 0x000165e0                 # bare RVA
  tools/emit_passthrough_cpp.py FUN_004165e0 --binary ffxivlogin
  tools/emit_passthrough_cpp.py --all                      # every still-unmatched fn
  tools/emit_passthrough_cpp.py --all --binary ffxivlogin
  tools/emit_passthrough_cpp.py --all --max 100            # cap output (smoke-test)

Reads:
  config/<binary>.yaml                — work pool (per-function rva, size, status)
  build/pe-layout/<binary>.json       — section table for orig→file-offset mapping
  orig/<binary>.exe                   — orig bytes (symlinked, not committed)

Writes:
  src/<binary>/_passthrough/<sym>.cpp — one per function emitted
"""

from __future__ import annotations

import argparse
import json
import re
import struct
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
CONFIG_DIR = REPO_ROOT / "config"
SRC_ROOT = REPO_ROOT / "src"
ORIG_ROOT = REPO_ROOT / "orig"
PE_LAYOUT_ROOT = REPO_ROOT / "build" / "pe-layout"

KNOWN_BINARIES = ("ffxivgame", "ffxivlogin", "ffxivboot", "ffxivconfig", "ffxivupdater")

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


# ----------------------------------------------------------------------
# YAML parsing — streaming, since the YAML is ~1M lines.
# ----------------------------------------------------------------------

RE_YAML_HEADER = re.compile(r"^- rva: (0x[0-9a-fA-F]+)")


def stream_yaml_rows(yaml_path: Path):
    """Yield (rva, end, size, symbol, status) per row. Streaming parser."""
    rva = end = size = None
    symbol = None
    status = None
    with yaml_path.open() as f:
        for line in f:
            m = RE_YAML_HEADER.match(line)
            if m:
                if rva is not None:
                    yield (rva, end, size, symbol, status)
                rva = int(m.group(1), 16)
                end = size = None
                symbol = None
                status = None
                continue
            stripped = line.strip()
            if stripped.startswith("end:"):
                end = int(stripped.split(":", 1)[1].split("#", 1)[0].strip(), 0)
            elif stripped.startswith("size:"):
                size = int(stripped.split(":", 1)[1].split("#", 1)[0].strip(), 0)
            elif stripped.startswith("symbol:"):
                symbol = stripped.split(":", 1)[1].split("#", 1)[0].strip()
            elif stripped.startswith("status:"):
                status = stripped.split(":", 1)[1].split("#", 1)[0].strip()
    if rva is not None:
        yield (rva, end, size, symbol, statu
```