# COMANDO - Utf8String.cpp
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\meteor-decomp-develop\src\ffxivgame\sqex\Utf8String.cpp
**SHA:** 1a28148bce703844
**Timestamp:** 2026-08-28T12:06:23.334823
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- // Match orig's exact pattern: pre-save `data + 1` so the

### Gaps
- //      Remaining gap: MSVC reuses EDX=1 in the strlen loop's

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
// FUNCTION: ffxivgame 0x00047260 — Sqex::Misc::Utf8String::Utf8String(data, len)
//
// One of the SE-internal string constructors. The class has SSO (small-
// string optimisation) with a 64-byte inline buffer and a heap fallback
// when content > 64 bytes. This particular ctor takes (data, length)
// where length=-1 means "use strlen(data) at runtime".
//
// Class layout (recovered from this constructor's stores):
//
//   class Utf8String {
//       char *m_data;            // +0x00 — points to inline buf or heap
//       int   m_capacity;        // +0x04 — initially 0x40 (64-byte SSO)
//       int   m_size;            // +0x08 — # bytes in use (incl. NUL)
//       int   m_field_c;         // +0x0c — flags / encoding bits (?)
//       char  m_flag_10;         // +0x10 — set to 1 by ctor
//       char  m_flag_11;         // +0x11 — set to 1 by ctor
//       char  m_inline_buf[0x40]; // +0x12..+0x51 (64 bytes inline SSO)
//       // sizeof = 0x54 (84 bytes, padded to int alignment)
//   };
//
// The constructor's stack footprint of 0 bytes locals (just PUSH EBX,
// ESI, EDI for callee-saves) plus the class's 84 bytes is what gives
// ProcessChunk its 92-byte (0x5c) frame: 84 (Utf8String) + 4 (byte-
// swap scratch) + 4 (SEH state index) = 92.
//
// Original bytes (116 B; ends at 0x000472d3 with `c2 08 00` RET 8,
// followed by `cc cc...` INT3 padding):
//
//   00047260: 53 8b 5c 24 08 56 8b f1 ba 01 00 00 00 57 8b 7c
//   00047270: 24 14 83 ff ff 8d 46 12 88 56 10 88 56 11 c7 46
//   00047280: 0c 00 00 00 00 89 56 08 c7 46 04 40 00 00 00 89
//   00047290: 06 c6 00 00 75 17 8b c3 8d 78 01 eb 03 8d 49 00
//   000472a0: 8a 08 83 c0 01 84 c9 75 f7 2b c7 8b f8 52 8d 47
//   000472b0: 01 50 8b ce e8 ?? ?? ?? ?? 8b 0e 57 53 51 e8 ??
//   000472c0: ?? ?? ?? 8b 16 83 c4 0c c6 04 17 00 5f 8b c6 5e
//   000472d0: 5b c2 08 00
//
// Decoded:
//   PUSH EBX                              ; callee-saved
//   MOV  EBX, [ESP+8]                     ; arg1 = data ptr
//   PUSH ESI
//   MOV  ESI, ECX                          ; ESI = this
//   MOV  EDX, 1                            ; EDX = 1 (reused throughout)
//   PUSH EDI
//   MOV  EDI, [ESP+0x14]                  ; arg2 = length
//   CMP  EDI, -1                           ; length == 0xffffffff sentinel?
//   LEA  EAX, [ESI+0x12]                   ; EAX = &m_inline_buf[0]
//   MOV  [ESI+0x10], DL                    ; m_flag_10 = 1
//   MOV  [ESI+0x11], DL                    ; m_flag_11 = 1
//   MOV  DWORD PTR [ESI+0xc], 0            ; m_field_c = 0
//   MOV  [ESI+8], EDX                      ; m_size = 1
//   MOV  DWORD PTR [ESI+4], 0x40           ; m_capacity = 64
//   MOV  [ESI], EAX                        ; m_data = &m_inline_buf[0]
//   MOV  byte ptr [EAX], 0                 ; null-terminate inline
//   JNZ  have_length                        ; if length != -1, skip strlen
//   ; --- length == -1: compute strlen(data) ---
//   MOV  EAX, EBX                           ; EAX = data
//   LEA  EDI, [EAX+1]                       ; EDI = data + 1 (saved start+1)
//   JMP  loop
//   nop  (LEA ECX, [ECX+0])                  ; alignment padding
//   loop:
//   MOV  CL, [EAX]
//   ADD  EAX, 1
//   TEST CL, CL
//   JNZ  loop                               ; until null
//   SUB  EAX, EDI                            ; EAX = strlen(data)
//   MOV  EDI, EAX
//   ; --- have_length (EDI = string length) ---
//   PUSH EDX                                ; push 1 (still EDX)
//   LEA  EAX, [EDI+1]                        ; EAX = length + 1
//   PUSH EAX                                 ; push (length + 1)
//   MOV  ECX, ESI                            ; ECX = this
//   CALL Utf8String::Reserve                  ; Reserve(length+1, 1)
//   ; --- copy data in via memcpy ---
//   MOV  ECX, [ESI]                          ; ECX = m_data
//   PUSH EDI                                 ; len
//   PUSH EBX                                 ; src
//   PUSH ECX                                 ; dst
//   CALL memcpy
//   MOV  EDX, [ESI]                          ; EDX = m_data
//   ADD  ESP, 0xc                            ; clean memcpy args
//   MOV  byte ptr [EDX+EDI], 0               ; null-terminate at end
//   POP  EDI; MOV EAX, ESI; POP ESI; POP EBX
//   RET  8                                  ; stdcall, 2 args
//
// The MSVC clever bits worth flagging:
//   1. EDX is set to 1 once at the top and reused for two byte stores
//      ([ESI+0x10], [ESI+0x11]) AND the dword `m_size` store ([ESI+8])
//      AND the PUSH 1 arg to Reserve. Saves 8 bytes vs separate
//      immediates.
// 
```