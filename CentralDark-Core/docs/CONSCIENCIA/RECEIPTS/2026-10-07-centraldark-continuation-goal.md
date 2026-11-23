# Receipt — CentralDark continuation goal contract

Date: 2026-10-07
Status: ACTIVE_CONTINUATION_CONTRACT
Authority: SEGREDO/CHEFE
Owner: `.agents/skills/software-development/centraldark-oracle-surface/SKILL.md`
HUD_OWNER: `docs/HUD/HUD.html`

## Intent

Continue the existing CentralDark Goal. Do not start a new mission, create parallel architecture, create another Hermes, or open an upstream NousResearch/hermes-agent PR.

```text
CENTRALDARK = project/canonical system
HERMES = dependency/executor component
VPS/runtime = measured execution reality
CURRENT main + owners/docs/receipts = source of truth
```

## Envelope

Every same-Goal CHAT_GLOBAL/SOL continuation carries:

```text
ACTOR=HERMES
LOOP_ID=...
TURN_ID=...
ATTEMPT_ID=...
RECEIPT_ID=...
PARENT_ID=...
INTENT_ID=...
EVENT_ID=...
CAUSATION_ID=...
SURFACE_ID=...
NEXT_CURSOR=...
```

An envelope with an open `NEXT_READONLY_PROBE`, open `NEXT_CURSOR`, `COUNTERPROOF`, recoverable `UNKNOWN`, recoverable `FAIL`, or `RESULT_READY` is continuation evidence, never Goal done.

## Required loop

```text
read complete oracle response
→ extract NEXT_READONLY_PROBE/NEXT_CURSOR
→ execute the pertinent probe/action
→ measure reality
→ build the next correlated envelope
→ increment TURN_ID/ATTEMPT_ID/RECEIPT_ID
→ CAUSATION_ID = previous receipt
→ send readback to the same CHAT_GLOBAL/SOL
→ await response
→ continue the same Goal
```

`WAITING_EXTERNAL != CONTROLLER_BLOCKED`. Independent read-only sectors may continue while one worker waits: GitHub/CI, Trigger Fabric, porta-de-entrada, Local AI, MCP, runtime, HUD, GlobalPing, Buildkite, CURRENT/docs, capability discovery, and recovery tests.

Writers remain serialized:

```text
ONE_WRITER_PER_SCOPE=true
```

## Recovery and human delta

```text
CHAT_FAILURE
→ preserve LAST_GOOD_STATE + LOOP_ID + RECEIPT_ID + NEXT_CURSOR
→ reread/snapshot/refresh/retry
→ if needed, new chat with minimum handoff
→ continue from the same cursor
```

A message without the Hermes envelope is `HUMAN_DELTA`: incorporate and reconcile it without killing independent probes or restarting the Goal.

## HUD contract

```text
proven execution + readback + counterproof → green/SELADO
partial or UNKNOWN → yellow/ABERTO/EM PROGRESSO
current deterministic failure → red/FALHA
```

The Obsidian HUD is a mirror of `docs/HUD/HUD.html`, not a second state owner. Do not promote a status by inference.

## Stop condition

Do not stop because a probe, subagent, response, worker, or sector finished, or because a recoverable error appeared. `GOAL_DONE` requires the parent contract to be terminal at `FIXED_POINT`, or a genuine `HUMAN_FRONTIER`, or explicit CHEFE cancellation.

```text
CONTINUE_SAME_GOAL=true
CONTINUE_ORACLE_LOOP=true
CONTINUE_EVOLVING_CENTRALDARK=true
RESOLVE_ALL_OPEN_ERRORS=true
```

## Next cursor

`CONTINUE_CURRENT_GOAL_READ_CURRENT_THEN_ORACLE_THEN_NEXT_OPEN_ERROR`
