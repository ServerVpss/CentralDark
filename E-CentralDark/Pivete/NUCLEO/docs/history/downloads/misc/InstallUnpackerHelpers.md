# OUTRO - InstallUnpackerHelpers.cpp
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\meteor-decomp-develop\src\ffxivgame\install\InstallUnpackerHelpers.cpp
**SHA:** 275b7c3f5c305a35
**Timestamp:** 2026-08-28T12:06:23.202306
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- // The spin pattern:

### Ouro Bruto (primeiros 5000 chars)
```
// meteor-decomp — clean-room decompilation of FINAL FANTASY XIV 1.x client binaries
// Copyright (C) 2026  Samuel Stegall
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published
// by the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// SPDX-License-Identifier: AGPL-3.0-or-later
//
// Helpers internal to Component::Install::InstallUnpacker. Each is a
// non-virtual member function called from the slot-2 unpack loop
// (FUN_00cc6700, see docs/install-unpacker.md). Match attempts here.

#include "../../../include/install/ResourceQueue.h"

extern "C" __declspec(dllimport) long __stdcall InterlockedExchange(long *target, long value);
extern "C" __declspec(dllimport) int __stdcall SwitchToThread();
extern "C" __declspec(dllimport) long __stdcall InterlockedIncrement(long *target);
extern "C" __declspec(dllimport) long __stdcall InterlockedExchangeAdd(long *target, long add);
extern "C" __declspec(dllimport) long __stdcall InterlockedCompareExchange(long *target, long exch, long cmp);
extern "C" __declspec(dllimport) void __stdcall Sleep(unsigned long ms);
// IAT layout (Ghidra-confirmed 2026-05-02):
//   [0x00f3e148]  InterlockedExchange
//   [0x00f3e1a0]  InterlockedCompareExchange
//   [0x00f3e1a4]  InterlockedExchangeAdd
//   [0x00f3e1c8]  Sleep
//   [0x00f3e2cc]  InterlockedIncrement
//   [0x00f3e2d4]  SwitchToThread

// Each entry in ChunkSource::m_entries is 12 bytes. State machine:
//   1 = released (just freed by consumer)
//   3 = available (producer filled, ready for consumer)
//   4 = claimed (consumer grabbed it, processing in flight)
struct chunk_entry {
    long state;     // +0x00 — atomic state: 1/3/4
    int  data;      // +0x04 — written to *out_param by AcquireChunk
    int  handle;    // +0x08 — returned by AcquireChunk, matched by ReleaseChunk
};

// FUNCTION: ffxivgame 0x00cc6620 — wait-for-resource-ready spin (71 B)
//
// Recovered from Ghidra GUI 2026-05-02:
//   void FUN_00cc6620(int param_1) {
//     InterlockedExchange((LONG *)(param_1 + 4), 1);
//     cVar1 = FUN_008edbf0(&param_1);
//     while (cVar1 == '\0') {
//       SwitchToThread();
//       cVar1 = FUN_008edbf0(&param_1);
//     }
//     return;
//   }
//
// In the binary this is `__thiscall` (callee gets `this` in ECX) — Ghidra
// elided that. The function arg is the caller's "resource handle"
// (an int passed as a value, but the same address `&param_1` is forwarded
// to the predicate).
//
// FUN_008edbf0 (the predicate at RVA 0x004edbf0) is invoked on the parent's
// `this + 0x38` member with `&param_1` as its single arg. It returns
// `char` — non-zero meaning "resource ready, exit loop".
//
// The spin pattern:
//   1. Atomically write 1 to (arg+4) — likely "I'm waiting on this"
//      handshake bit so producers can wake us.
//   2. First-try the predicate.
//   3. On failure, loop calling SwitchToThread() and re-check.
//
// Original bytes (71 B):
//   008c6620: 8b 44 24 04 56 6a 01 83 c0 04 50 8b f1 ff 15 ?? ?? ?? ?? 8d 4c 24 08 83 c6 38 51 8b ce e8 ?? ?? ?? ?? 84 c0 75 1d 57 8b 3d ?? ?? ?? ?? 8d 49 00 ff d7 8d 54 24 0c 52 8b ce e8 ?? ?? ?? ?? 84 c0 74 ee 5f 5e c2 04 00
//
// Decoded:
//   MOV  EAX, [ESP+4]          ; arg1
//   PUSH ESI
//   PUSH 1
//   ADD  EAX, 4
//   PUSH EAX
//   MOV  ESI, ECX              ; ESI = this  (saved across all calls)
//   CALL [InterlockedExchange] ; (arg1+4, 1)
//   ; --- first predicate try ---
//   LEA  ECX, [ESP+8]          ; ECX = &arg1 (back to caller's arg slot)
//   ADD  ESI, 0x38             ; ESI = this + 0x38
//   PUSH ECX                    ; arg
//   MOV  ECX, ESI              ; this for thiscall
//   CALL FUN_008edbf0
//   TEST AL, AL
//   JNZ  exit                   ; if returned true, return
//   ; --- spin loop ---
//   PUSH EDI
//   MOV  EDI, [SwitchToThread]
//   LEA  ECX, [ECX+0]           ; 3-byte NOP for branch alignment
//   loop:
//   CALL EDI                    ; SwitchToThread()
//   LEA  EDX, [ESP+0xc]         ; &arg1 (offset shifted by EDI push)
//   PUSH EDX
//   MOV  ECX, ESI               ; this+0x38
//   CALL FUN_008edbf0
//   TEST AL, AL
//   JZ   loop                   ; loop while predicate returns false
//   POP  EDI
//   exit:
//   POP  ESI
//   RET  4
//
// The parent class's +0x38 sub-object is now modeled as
// `ResourceQueue` (see include/install/ResourceQueue.h). FUN_008edbf0
// — the function this loop spins on — is its `TryEnqueue` member,
// matched in src/ffxivgame/install/ResourceQueue.cpp.

class InstallUnpacker {
public:
    void WaitForReady(int handle);
private:
    char m_pad_00[0x38];
    ResourceQueue m_resource;   // +0x38
};

void InstallUnpacker::WaitForReady(int handle) {
    InterlockedExchange((long *)(handle + 4), 1);
    if (!m_resource.TryEnqueue(&handle)) {
        do {
            SwitchToThread();
        } while (!m_resource.TryEnqueue(&handle));
    }
}

// FUNCTION: f
```