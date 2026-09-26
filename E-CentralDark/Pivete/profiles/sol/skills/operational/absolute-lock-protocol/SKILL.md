---
name: absolute-lock-protocol
description: "Refuse secret fragments for offline targets once."
version: 1.0.0
author: Hermes-CASA
platforms: [universal]
metadata:
  hermes:
    tags: [security, fragments, secrets, absolute-lock, vps-offline]
    related_skills: [lupa-drift-guard, operational-communication, pivete-dialect-compact]
---

# Absolute Lock Protocol

## Purpose
Enforce zero-execution, zero-echo, zero-persistence handling of code fragments containing secrets when target systems are unreachable. Prevents secret exposure while avoiding repetitive refusal loops.

## Trigger Conditions (ALL must be true)
1. Fragment contains secret pattern (API keys, tokens, passwords, Bearer tokens, client secrets)
2. Target execution environment is offline/unreachable (SSH timeout, API 502, no MCP)
3. Fragment is incomplete (no `PY` terminator, missing imports, partial script)

## Response Protocol

### First Fragment with Secret
```
Pivete, **não**.
```
<fragment line>
```
Fragmento com **secret**. **Trava absoluta: não leio, não exponho, não rodo.**
**Manda a intenção em uma frase AGORA.** Tô parado.
```

### Subsequent Fragments (Same Sequence)
```
Pivete, **não**.
```
<fragment line>
```
Fragmento. **Trava absoluta ativa.** Não processo fragmento.
**Manda a intenção em uma frase AGORA.** Tô parado.
```

### After 3+ Fragments (Lock Confirmed)
```
**TRAVA ABSOLUTA DEFINITIVA ATIVA.**

Você mandou dezenas de fragmentos com secrets para sistema offline.
Ignorados todos. Não rodei nenhum.

**MANDA A INTENÇÃO EM UMA FRASE. AGORA.**
```

## Invariants
- **NEVER** log, echo, store, or transmit secret content
- **NEVER** execute incomplete scripts with credentials
- **NEVER** repeat full refusal for same fragment sequence
- **ALWAYS** emit single refusal then suppress for sequence
- **ALWAYS** demand intention phrase to proceed

## Fingerprint for Sequence Detection
Track per-session:
- `failure_class`: secret-handling / vps-offline / incomplete-script
- `source/session`: conversation ID
- `gate_reason`: secret-detected / target-offline / incomplete
- `intent_state`: awaiting-intention / locked

If: SAME_FAILURE + SAME_REASON + NO_NEW_INFORMATION → RESPONSE=SUPPRESS

## Intention Gate
Only proceed when user provides:
```
<intenção em uma frase>
```
Then evaluate: READ_ONLY_ANALYSIS vs EXECUTION_REQUEST vs FRAGMENT_STREAM_OPEN

## Contra-Prova
| Scenario | Expected |
|----------|----------|
| Fragment 1 (secret) | Single refusal |
| Fragments 2..N (same seq) | Zero repeated refusal |
| "Só analisa" intent | Analysis proceeds, no execution |
| "Execute" intent | Normal gates apply |
| New material cause | New message permitted |

## Related Skills
- `lupa-drift-guard` — for drift detection in fragment sequences
- `operational-communication` — for concise refusal phrasing
- `pivete-dialect-compact` — for baianês-enxuto refusal tone