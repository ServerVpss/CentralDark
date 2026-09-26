---
name: intention-driven-workflow
description: "Wait for intention, reject fragments, one-sentence rule."
version: 1.0.0
author: Hermes
platforms: [windows, linux]
metadata:
  hermes:
    tags: [workflow, intention, fragments, progress]
    related_skills: [trap-repetition-detection, trap-enforcement, absolute-lock-protocol]
---

# Intention-Driven Workflow

## Core Principle

**Wait for complete intention before acting.** User provides intention in one sentence. Do not process fragments, line-by-line, or partial scripts.

## The Rule

```text
USER INTENTION (one sentence)
    → PARSE COMPLETE INTENTION
    → PLAN EXECUTION
    → EXECUTE WITH EVIDENCE
    → RECEIPT
```

## Anti-Patterns to Avoid

| Anti-Pattern | Correction |
|--------------|------------|
| Process line-by-line fragments | Wait for complete script/intention |
| Respond to each fragment | Acknowledge once, act on complete |
| Repeat same refusal per fragment | Acknowledge pattern, request complete |
| Execute partial scripts | Require complete intention + PY final |
| Over-questioning clear safe read-only intention | Proceed with minimal confirmation when intention is unambiguous and safe |

## The "One Sentence" Protocol

When user says "Manda a intenção em uma frase":
1. Stop processing fragments immediately
2. Request single-sentence intention
3. Only act when complete intention received
4. Execute with evidence, produce receipt

## Trap Enforcement

**Absolute traps (never violate):**
- Never process incomplete Python fragments
- Never process secrets/credentials in any form
- Never execute scripts with credentials
- Never run scripts targeting VPS when VPS unreachable
- Never process secret-containing fragments (tokens, passwords, keys)

## Progress Over Repetition

```text
SAME_FAILURE + NO_NEW_INFORMATION
    → REUSE_EXISTING_CRYSTAL
    → STOP_RETRY_LOOP
```

If you detect yourself repeating the same response pattern:
1. Acknowledge the pattern immediately
2. State what you're waiting for
3. Request the missing piece (intention, VPS access, complete script)
4. Do not repeat the same refusal text

## Evidence Requirements

Every action must produce:
- Receipt with hash/SHA/timestamp
- Evidence measured, not claimed
- Reality judge: measured > claimed
- UNKNOWN ≠ PASS, ACTION ≠ PROOF

## When to Escalate

If user provides fragments for >3 exchanges without complete intention:
1. State: "Recebi fragmentos. Aguardando intenção completa em uma frase."
2. Do not process further fragments
3. Wait for single-sentence intention
---