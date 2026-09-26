# OUTRO - recompute_sizes.py
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\meteor-decomp-develop\tools\recompute_sizes.py
**SHA:** f623957681a6b45c
**Timestamp:** 2026-08-28T12:23:03.909680
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- next_start = next_start_by_rva.get(rva)
- if next_start is not None and rva + new_size > next_start:
- if not args.dry_run:
- if not args.dry_run:

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env python3
# meteor-decomp — clean-room decompilation of FINAL FANTASY XIV 1.x client binaries
# Copyright (C) 2026  Samuel Stegall
# SPDX-License-Identifier: AGPL-3.0-or-later
"""
Detect Ghidra-under-counted function sizes by scanning the orig PE
bytes past the reported size for instruction-continuation patterns
followed by INT3 padding.

Ghidra's flow analysis occasionally stops short of the actual end of
a function — typically when the function ends with a pattern its
analyser doesn't recognise as terminal (e.g. an XOR EAX,EAX/RET
appended after a logical exit, or a tail of `ADD ESP,4 / MOV EAX,ESI
/ POP ESI / RET N` that Ghidra split at the POP). The bytes are
still there in the binary; the function's "end" symbol is just 3-9 B
short.

This tool walks `config/<binary>.symbols.json`, reads the orig PE
at each function's RVA, and for any function whose reported `size`
ends RIGHT BEFORE a recognisable continuation pattern, computes the
corrected size and emits an override entry.

Heuristics (in order of confidence):
  1. The byte immediately after the reported end is `c3` (RET) or
     `c2 ?? ??` (RET imm16) — a pure missing terminal. Extend by
     1 or 3 B.
  2. The reported end is followed by a known epilogue prefix:
       `83 c4 ??` (ADD ESP, imm8 — cdecl cleanup)
       `8b c6 5e c2 ?? ??` (MOV EAX,ESI; POP ESI; RET imm16)
       `5e c3` (POP ESI; RET) / `5e c2 ?? ??` (POP ESI; RET imm16)
       `5f 5e c3` / `5f 5e c2 ?? ??` (POP EDI; POP ESI; RET[N])
       `5b 5e c3` / `5b 5e c2 ?? ??` (POP EBX; POP ESI; RET[N])
       `5d c3` / `5d c2 ?? ??` (POP EBP; RET[N])
     Extend until a `c3` or `c2 ?? ??` is consumed.
  3. After step 2, if the next bytes are `cc cc...` (INT3 padding),
     accept the new size. Otherwise revert.

Output:
  config/<binary>.size_overrides.json
    [{"rva": int, "rva_hex": "0x...", "name": "...",
      "old_size": int, "new_size": int, "reason": "..."}, ...]

`compare.py` reads this overlay if present and prefers its size over
both the YAML and `symbols.json`.

Usage:
  tools/recompute_sizes.py [binary]            # default ffxivgame
  tools/recompute_sizes.py ffxivgame --dry-run
"""

from __future__ import annotations

import argparse
import json
import struct
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
CONFIG_DIR = REPO_ROOT / "config"


def _read_pe_text(orig_pe: Path) -> tuple[bytes, int, int]:
    """Return (data, text_va, text_ra) for the .text section."""
    data = orig_pe.read_bytes()
    e_lfanew = struct.unpack_from("<I", data, 0x3c)[0]
    n = struct.unpack_from("<H", data, e_lfanew + 6)[0]
    size_opt = struct.unpack_from("<H", data, e_lfanew + 20)[0]
    sec_off = e_lfanew + 24 + size_opt
    for i in range(n):
        b = sec_off + i * 40
        name = data[b : b + 8].rstrip(b"\0").decode("latin-1")
        if name == ".text":
            vaddr = struct.unpack_from("<I", data, b + 12)[0]
            raddr = struct.unpack_from("<I", data, b + 20)[0]
            return data, vaddr, raddr
    raise RuntimeError("no .text section")


# Epilogue continuation prefixes — when these appear immediately
# after the reported function end, the function probably extended
# further before Ghidra's analysis truncated it.
#
# Note: keep this list TIGHT. Each prefix gets walked-through up to
# `max_extend` bytes hunting for a terminator, so a permissive prefix
# (like a bare `b8` MOV EAX, imm32 — extremely common as a standalone
# instruction at function starts) will run through the next function
# and extend across boundaries. The current set is restricted to
# multi-byte sequences that are MUCH more likely to appear as
# epilogue continuation than as standalone instructions.
EPILOGUE_PREFIXES = [
    bytes([0x83, 0xc4]),   # ADD ESP, imm8 — cdecl caller cleanup
    bytes([0x8b, 0xc6]),   # MOV EAX, ESI  — recover this for return
    bytes([0x8b, 0xc7]),   # MOV EAX, EDI
    bytes([0x8b, 0xc3]),   # MOV EAX, EBX
    bytes([0x33, 0xc0]),   # XOR EAX, EAX  — return 0 idiom
    bytes([0x32, 0xc0]),   # XOR AL, AL    — return false idiom
    bytes([0x5e, 0xc3]),   # POP ESI; RET  — full epilogue tail
    bytes([0x5e, 0xc2]),   # POP ESI; RET imm16
    bytes([0x5d, 0xc3]),   # POP EBP; RET
    bytes([0x5d, 0xc2]),   # POP EBP; RET imm16
    bytes([0x5f, 0x5e]),   # POP EDI; POP ESI — multi-pop epilogue
    bytes([0x5b, 0x5e]),   # POP EBX; POP ESI
    bytes([0x5f, 0x5b]),   # POP EDI; POP EBX
]

TERMINATORS = {
    bytes([0xc3]): 1,                               # RET
    # RET imm16 needs to peek 2 more bytes; handled separately.
}


def _ends_at_terminator(byte: int) -> int:
    """Return length consumed if byte is a recognisable terminator,
    else 0. Caller checks for `c2 ?? ??` separately."""
    if byte == 0xc3:
        return 1
    return 0


def _is_acceptable_boundary(data: bytes, off: int, expected_next: int | None) -> bool:
    """Return True if `off` is a confident function-end boundary.

    Confidence comes fr
```