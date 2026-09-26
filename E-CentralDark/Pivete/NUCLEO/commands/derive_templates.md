# COMANDO - derive_templates.py
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\meteor-decomp-develop\tools\derive_templates.py
**SHA:** 73aef83f03079706
**Timestamp:** 2026-08-28T12:23:03.245195
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- def process_binary(stem: str, dry_run: bool, image_base: int = 0x400000) -> dict:
- if not dry_run:
- report = process_binary(t, dry_run=args.dry_run)

### Padroes
- # 25-byte if-not-null-dispatch-then-free pattern:
- # Common MSVC-emitted "destructor helper" pattern: object owns a
- # Pattern: thiscall taking 2 stack args, then fan-outs to a 4-arg
- # pattern: store a const-ptr into a global slot, set ECX to that

### Contratos
- # MSVC-emitted "field-of-method-result" delegate: navigate to a

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env python3
# meteor-decomp — clean-room decompilation of FINAL FANTASY XIV 1.x client binaries
# Copyright (C) 2026  Samuel Stegall
# SPDX-License-Identifier: AGPL-3.0-or-later
"""
Auto-derive matching .cpp templates from cluster byte patterns.

For each multi-member cluster in `<bin>.clusters.json` and
`<bin>.clusters_reloc.json`, examine the cluster representative's
bytes and try to recognise a known idiom (empty method, constant
return, accessor, setter, this-call wrapper, etc.). When a pattern
matches, emit a canonical C++ template at
`src/<bin>/_rosetta/FUN_<rva>.cpp` for the representative; the
companion `tools/stamp_clusters.py` then expands the template to
every byte-identical (or reloc-equivalent) cluster sibling.

Recognised idioms (in evaluation order — most specific first):

  RET                              `c3`
  RET imm16                        `c2 NN 00`        (empty N/4-arg method)
  return 0 (int)                   `33 c0 c3`        / with arg cleanup `33 c0 c2 NN 00`
  return false (bool, 8-bit)       `32 c0 c3`        / `32 c0 c2 NN 00`
  return true (bool, 8-bit)        `b0 01 c3`        / `b0 01 c2 NN 00`
  return *this                     `8b c1 c3`
  return imm8 (signed)             `b0 NN c3`        (NN ≠ 0,1)
  int-getter at offset NN          `8b 41 NN c3`     (NN ≤ 0x7f)
  int-getter at long offset        `8b 81 NN NN NN NN c3`
  byte zero-ext getter             `0f b6 41 NN c3`  (returns int from byte)
  byte sign-ext getter             `0f be 41 NN c3`
  short zero-ext getter            `0f b7 41 NN c3`
  short sign-ext getter            `0f bf 41 NN c3`
  bit-flag getter                  `8a 41 NN 24 01 c2 08 00`  (returns u8 & 1)
  chained ptr getter               `8b 41 NN 8b 40 MM c3`
  int setter at offset NN          `8b 44 24 04 89 41 NN c2 04 00`
  this-call wrapper (return self)  `56 8b f1 e8 RR RR RR RR 8b c6 5e c2 04 00`
  singleton tail-call              `b9 RR RR RR RR e9 RR RR RR RR`
  JMP-thunk forwarder              `e9 RR RR RR RR`
  scalar deleting destructor       `56 8b f1 e8 RR RR RR RR f6 44 24 08 01 74 09 56 e8 RR RR RR RR 83 c4 04 8b c6 5e c2 04 00`

`RR` denotes a relocation byte (cluster member-specific, wildcarded
by the reloc-aware diff in `compare.py`). `NN` and `MM` are immediate
values that the deriver reads from the cluster's bytes and bakes into
the generated template.

Reads:
  build/easy_wins/<binary>.clusters.json
  build/easy_wins/<binary>.clusters_reloc.json (optional)

Writes:
  src/<binary>/_rosetta/FUN_<rva>.cpp  (one per recognised cluster)

Skip rule: never overwrite an existing .cpp.

Usage:
  tools/derive_templates.py [binary]                 # default ffxivgame
  tools/derive_templates.py --all
  tools/derive_templates.py ffxivgame --dry-run
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
SRC_DIR = REPO_ROOT / "src"
EASY_WINS = REPO_ROOT / "build" / "easy_wins"
ASM_ROOT = REPO_ROOT / "asm"

KNOWN_BINARIES = ("ffxivgame", "ffxivlogin", "ffxivboot", "ffxivconfig", "ffxivupdater")

LICENSE = """\
// meteor-decomp — clean-room decompilation of FINAL FANTASY XIV 1.x client binaries
// Copyright (C) 2026  Samuel Stegall
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published
// by the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// SPDX-License-Identifier: AGPL-3.0-or-later
//"""

RE_INSTR = re.compile(
    r"^\s*[0-9a-fA-F]+:\s+((?:[0-9a-fA-F][0-9a-fA-F]\s+)+)\s",
    re.MULTILINE,
)


def read_function_bytes(asm_path: Path) -> bytes | None:
    if not asm_path.exists():
        return None
    text = asm_path.read_text(errors="replace")
    body = bytearray()
    for m in RE_INSTR.finditer(text):
        for tok in m.group(1).split():
            body.append(int(tok, 16))
    return bytes(body)


# -----------------------------------------------------------------------------
# Pattern matchers — each returns (template_text, idiom_name) on match,
# or None on no-match. Each takes the cluster's representative bytes
# and produces a complete .cpp source.
# -----------------------------------------------------------------------------


def _header(va: int, idiom: str, asm_summary: str, n_members: int) -> str:
    return (
        f"{LICENSE}\n"
        f"// SPDX-License-Identifier: AGPL-3.0-or-later\n"
        f"//\n"
        f"// FUNCTION: ffxivgame {hex(va)} — {idiom}\n"
        f"// Auto-generated by tools/derive_templates.py.\n"
        f"// Cluster representative — covers {n_members} byte-identical (or\n"
        f"// reloc-equivalent) members.\n"
        f"//\n"
        f"// Asm: {asm_summary}\n"
    )


def try_empty_void(body: bytes, va: int, n: int) -> tuple[str, str] | None:
    if body == b"\xc3":
        src = (
            _header(va, "empty zero
```