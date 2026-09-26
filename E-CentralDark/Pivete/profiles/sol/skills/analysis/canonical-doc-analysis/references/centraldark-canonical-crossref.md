# CentralDark Canonical Files for Cross-Reference

When analyzing CentralDark doctrine texts, cross-reference against these canonical sources.

## Core doctrine files

- `LEIA-ME-IA.md` — boot requirements, framework identity, universal boot sequence
- `docs/CONSCIENCIA/METACOGNICAO-OPERACIONAL.md` — metacognition doctrine, the file that contains `NOVA_INFORMACAO_OU_CAPACIDADE?` and `NO_NEW_INFORMATION → FIXED_POINT → STOP`
- `docs/CONSCIENCIA/APRENDIZADOS/` — learning records, contains assay documents
- `.agents/skills/meta-lupa/SKILL.md` — MetaLupa skill definition
- `docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/MASTER-CYCLE.yml` — operational cycle, contains `FIXED_POINT: meaning: STOP_ONLY_AT_LOCAL_FIXED_POINT_OR_PROVEN_FRONTIER`
- `docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/TRIGGERS.yml` — trigger definitions, contains learning triggers
- `scripts/trigger-fabric/engine_gap_fixed_point.py` — controller that implements `SAME_FAILURE_NO_NEW_INFO → STOP_AND_PRESERVE_FRONTIER`

## What each file contributes

**METACOGNICAO-OPERACIONAL.md**
- Contains the `NO_NEW_INFORMATION → FIXED_POINT → STOP` chain
- This is the file where STOP scope ambiguity is most visible
- Also contains `METHOD_CAN_EVOLVE` declaration

**MASTER-CYCLE.yml**
- Contains `FIXED_POINT: meaning: STOP_ONLY_AT_LOCAL_FIXED_POINT_OR_PROVEN_FRONTIER`
- This is the canonical statement that FIXED_POINT is LOCAL, not global
- Proves that the framework already intends LOCAL fixed point

**TRIGGERS.yml**
- Lists learning triggers that survive FIXED_POINT
- Contains: HUMAN_CORRECTION, TOOL_ERROR, TEST_FAILURE, CONTRADICTION_FOUND, PATTERN_FOUND, MEMORY_DELTA, KNOWLEDGE_CRYSTAL, POST_MUTATION, RUNTIME_DRIFT, SESSION_END
- Proves learning continues after fixed point

**engine_gap_fixed_point.py**
- Implements `SAME_FAILURE_NO_NEW_INFO → STOP_AND_PRESERVE_FRONTIER`
- This is CORRECT — it says "don't repeat same measurement without new info", not "never learn about this"
- Proves the bug is textual, not in the controller

## How to use for cross-reference

When a pasted text makes a claim about CentralDark doctrine:

1. Find the specific file the text references
2. Read that file from disk (not from the paste)
3. Compare the claim against what the file actually says
4. Note discrepancies

This session found that the pasted text's diagnosis was CORRECT (STOP scope is ambiguous in METACOGNICAO-OPERACIONAL.md), but the prescription (separating into 3 concepts, modifying MetaLupa flow) was OVER-ENGINEERED — the existing doctrine already has LOCAL_FIXED_POINT in MASTER-CYCLE.yml and learning triggers in TRIGGERS.yml.
