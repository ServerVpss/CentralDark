# OUTRO - extract_crypt_engine.py
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\meteor-decomp-develop\tools\extract_crypt_engine.py
**SHA:** 146b9507a66e955b
**Timestamp:** 2026-08-28T12:23:03.338766
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- start = text.find(f"{marker}: [u8;")

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env python3
# meteor-decomp — clean-room decompilation of FINAL FANTASY XIV 1.x client binaries
# Copyright (C) 2026  Samuel Stegall
# SPDX-License-Identifier: AGPL-3.0-or-later
"""
Decode `LobbyCryptEngine`'s 9 vtable slots and validate the embedded
Blowfish P/S init tables against the canonical OpenSSL pi-derived
constants and against garlemald-server's `common/src/blowfish_tables.rs`.

Outputs:
- `build/wire/<binary>.crypt_engine.md` — slot-by-slot decode + key
  schedule walkthrough + garlemald cross-validation summary.

The 9 slots were identified from `build/wire/<binary>.net_handlers.md`
(the section `Application::Network::LobbyProtoChannel::ServiceConsumerConnectionManager::LobbyCryptEngine`).
The Blowfish init constants live at fixed virtual addresses in `.data`:
- `0x01267278..0x012672BF` — initial P[18] (72 bytes)
- `0x012672C0..0x012682BF` — initial S[4][256] (4096 bytes)
Total 4168 bytes = `sizeof(BF_KEY)` in OpenSSL.

The lobby's per-block primitives are statically-linked OpenSSL:
- `FUN_0045aac0` = `BF_encrypt(BF_LONG[2], BF_KEY*)` (forward through P[0..17])
- `FUN_0045aa30` = `BF_decrypt(BF_LONG[2], BF_KEY*)` (backward from P[17])
- `FUN_0045abf0` = `BF_set_key(BF_KEY*, int keylen, const unsigned char*)`

The slot-level wrappers add lobby-specific framing:
- 32-byte chunk alignment (encrypt/decrypt round length DOWN to a
  multiple of 32 = 4 Blowfish blocks, NOT 8).
- A non-canonical sign-extension quirk in the key-schedule's byte-
  cycling step (uses `MOVSX byte` not `MOVZX byte`), so keys with
  high-bit bytes produce a different schedule than stock OpenSSL.

Both quirks are faithfully reproduced in
`garlemald-server/common/src/blowfish.rs`.
"""

from __future__ import annotations

import argparse
import struct
import sys
from dataclasses import dataclass
from pathlib import Path

# Paths in the repo
ROOT = Path(__file__).resolve().parent.parent
ORIG = ROOT / "orig"
BUILD_WIRE = ROOT / "build" / "wire"

# ---------------------------------------------------------------------
# Slot table (from build/wire/ffxivgame.net_handlers.md, the
# LobbyProtoChannel::ServiceConsumerConnectionManager::LobbyCryptEngine
# section). 9 slots, all overrides of the abstract
# CryptEngineInterface (whose slots 1..8 are __purecall in the parent
# vtable).
# ---------------------------------------------------------------------

@dataclass(frozen=True)
class Slot:
    idx: int
    rva: int
    semantic: str
    summary: str

LOBBY_SLOTS: list[Slot] = [
    Slot(0, 0x009a1e40, "~LobbyCryptEngine (dtor)",
         "Sets parent vtable, frees [this+0x30] (= BF_KEY*) via _free."),
    Slot(1, 0x009a1590, "PrepareHandshake / SeedRequest",
         "Copies 32-byte seed (\"Test Ticket Data\\0\\0\\0\\0clientNumber\") "
         "from .data 0x011274F0 to this+0x10. Calls __time64(NULL) and stores "
         "low 32 bits of result at this+0x8 + req+0x74. Memcpys 64 bytes from "
         "this+0x10 to req+0x34 (the cipher-init payload sent in the lobby "
         "handshake). Returns true."),
    Slot(2, 0x009a1640, "GetExtendedFlag (3-arg, returns 0)",
         "Logger noise + XOR EAX, EAX; RET 0xc. Always returns 0/null. Stub "
         "override of an interface method that real subclasses might use; "
         "lobby has no extended payload."),
    Slot(3, 0x009a0f10, "Verify-A (2-arg, returns false)",
         "5-byte stub: XOR AL, AL; RET 8. Always returns false. The lobby "
         "doesn't implement this verification slot."),
    Slot(4, 0x009a1670, "SetSessionKey (2 args)",
         "~600 bytes. Frees old [this+0x30] and clears it. Builds a 16-byte "
         "key on stack from arg1+arg2 (the SqexId session token + handshake "
         "response). Allocates 0x1048 (4168) bytes via _malloc → new BF_KEY*. "
         "Calls FUN_0045abf0 = BF_set_key(BF_KEY*, &key_data, 16). Stores "
         "result at [this+0x30]. Logs progress at each step. Returns true."),
    Slot(5, 0x009a0f20, "Verify-B (2-arg, returns false)",
         "5-byte stub: XOR AL, AL; RET 8. Always returns false. Same shape "
         "as slot 3; the two are kept separate rather than COMDAT-folded."),
    Slot(6, 0x009a18d0, "Encrypt(_, buf, len)",
         "Reads len = (uint16) [ESP+0xc], rounds DOWN to multiple of 32 "
         "(via AND ~0x1F). If [this+0x30] != null, calls FUN_0045ab60 with "
         "(buf, buf, len_aligned) — in-place ECB Blowfish encrypt of "
         "len/8 blocks via BF_encrypt per-block. Returns true."),
    Slot(7, 0x009a0f30, "Decrypt(_, buf, len)",
         "Same shape as slot 6 but with no logging; calls FUN_0045abb0 → "
         "in-place ECB Blowfish decrypt via BF_decrypt per-block. The two "
         "32-byte alignment + in-place semantics are identical."),
    Slot(8, 0x009a1920, "GetCompatibility (1-arg, returns true)",
         "Logs the arg, returns AL=1. A capability-probe stub the lobby "
         "always answers \"yes\" to."),
]

# Per-block + key-schedule helper RVAs (file offsets, .text)
HELPERS: 
```