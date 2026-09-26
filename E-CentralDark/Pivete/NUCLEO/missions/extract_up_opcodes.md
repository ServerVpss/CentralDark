# MISSAO - extract_up_opcodes.py
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\meteor-decomp-develop\tools\extract_up_opcodes.py
**SHA:** 06302b003bd2f99c
**Timestamp:** 2026-08-28T12:23:03.486854
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- text_va_start = text_sec["virtual_address"]
- text_va_start = text_sec["virtual_address"]
- start = max(text_off, call_off - lookback)

### Gaps
- Lobby ClientPacketBuilder ctor — RVA 0x009a2bf0 (TODO: confirm)
- Chat  ClientPacketBuilder ctor — RVA 0x00a40a60 (TODO: confirm)

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env python3
# meteor-decomp — clean-room decompilation of FINAL FANTASY XIV 1.x client binaries
# Copyright (C) 2026  Samuel Stegall
# SPDX-License-Identifier: AGPL-3.0-or-later
"""
Up-direction (client → server) opcode reconnaissance for the IpcChannel
ClientPacketBuilders.

Architectural finding:

  Each *ProtoChannel::ClientPacketBuilder is a 4-slot generic vtable —
  there is no per-opcode method. The opcode is stored at offset 0x1C
  of the builder instance and is set by the constructor (which takes
  it as the first stack arg). The constructors observed:

    Lobby ClientPacketBuilder ctor — RVA 0x009a2bf0 (TODO: confirm)
    Zone  ClientPacketBuilder ctor — RVA 0x009c1c60 (141 B; 1 caller)
                                  + RVA 0x009c1cf0 (126 B; 2 callers)
    Chat  ClientPacketBuilder ctor — RVA 0x00a40a60 (TODO: confirm)

  Both Zone constructors do `MOV [this+0x1C], <stack-arg>`, so the
  opcode is determined dynamically per call site.

  This means there is **no compact per-opcode table** for Up packets
  analogous to the Down dispatcher's byte_table+dword_table. The
  Up-opcode space is implicit in the binary — distributed across
  dozens of "send" functions, each of which loads its opcode from
  context-specific sources (struct fields, computed values, hard-
  coded immediates).

  Fully enumerating the Up-opcode space requires Ghidra-driven cross-
  reference analysis (per-callsite constant propagation through the
  builder constructor's `arg0` slot). That's beyond what static
  byte-pattern scanning can produce reliably.

What this tool DOES produce:

  1. **Constructor inventory** — locates ClientPacketBuilder ctors
     by scanning for direct vtable RVA stores (`MOV [reg], imm32`
     where imm32 is a known CPB vtable VA).

  2. **Garlemald RX opcode validation** — for each `OP_RX_*` constant
     in `garlemald-server/map-server/src/packets/opcodes.rs`, scans
     `.text` for `PUSH imm` instructions whose immediate matches the
     opcode value. Reports per-opcode site counts and the surrounding
     functions. High-frequency small opcodes (0x3, 0x6, 0x7, 0xCA …)
     produce many false positives (the value 7 is just used a lot in
     non-network code); the larger opcodes (≥ 0x100) cluster in
     clearly-relevant sender functions. Entries whose opcode is also an
     outbound sender in ffxivDecomp's symbol import get a
     `direction_conflict` annotation: garlemald's `OP_RX_*` name marks
     the opcode inbound, but the send-path RE shows it is a client→server
     sender (e.g. 0x12d–0x135) — so it must not be built as an inbound
     handler.

  3. **A cross-reference markdown report** for the contributor doing
     subsequent Ghidra analysis to start from.

Output:
  config/<binary>.up_opcodes.json
  build/wire/<binary>.up_opcodes.md
"""

from __future__ import annotations

import argparse
import json
import re
import struct
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
ORIG_PE = REPO_ROOT / "orig" / "ffxivgame.exe"
PE_LAYOUT = REPO_ROOT / "build" / "pe-layout" / "ffxivgame.json"
CONFIG = REPO_ROOT / "config"
WIRE = REPO_ROOT / "build" / "wire"
GARLEMALD_OPCODES = REPO_ROOT.parent / "garlemald-server" / "map-server" / "src" / "packets" / "opcodes.rs"

# Discovered ClientPacketBuilder vtable VAs (image_base + RVA).
CPB_VTABLES = {
    "lobby": 0x01127754,
    "zone":  0x01129ae8,
    "chat":  0x0113e8d0,
}


def _load_pe() -> dict:
    return json.loads(PE_LAYOUT.read_text())


def _load_text() -> tuple[bytes, dict]:
    pe = _load_pe()
    text_sec = next(s for s in pe["sections"] if s["name"] == ".text")
    return ORIG_PE.read_bytes(), text_sec


def _load_syms() -> list[dict]:
    return json.loads((CONFIG / "ffxivgame.symbols.json").read_text())


def _find_fn(rva: int, syms: list[dict]) -> str | None:
    for s in syms:
        if s["rva"] <= rva < s["rva"] + s["size"]:
            return s["name"]
    return None


def find_ctor_sites(data: bytes, text_sec: dict) -> dict[str, list[dict]]:
    """For each CPB vtable VA, find places that store it into an object's
    first slot — those are constructor invocations of the CPB class
    hierarchy. We don't decode WHICH constructor, just locate them."""
    text_off = text_sec["raw_pointer"]
    text_size = text_sec["raw_size"]
    text_va_start = text_sec["virtual_address"]
    out: dict[str, list[dict]] = {ch: [] for ch in CPB_VTABLES}
    for ch, vt in CPB_VTABLES.items():
        needle = struct.pack("<I", vt)
        i = text_off
        end = text_off + text_size
        while True:
            i = data.find(needle, i, end)
            if i < 0:
                break
            # Look back 2 bytes for `c7 0?` (MOV [reg], imm32) or `c7 4?` (with disp8) etc.
            if i >= 2 and data[i-2] == 0xc7 and (data[i-2+1] & 0x07) != 0x04:
                rva = (i - text_off) + text_va_start
                out[ch].append({"rva_hex": f"0x{rva:08x}", "store_form": f"c7 {data[i-1]:02
```