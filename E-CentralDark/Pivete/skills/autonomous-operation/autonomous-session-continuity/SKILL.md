---
name: autonomous-session-continuity
description: "Resume mission after truncation without human re-prompt."
---

# Autonomous Session Continuity

**Trigger:** a tool/process exits cleanly (exit 0), then the session context is truncated/compacted/reconnected, and the agent is about to lose the standing goal.

**Class:** continuity recovery for long-running autonomous missions, not a one-off restart.

## Standing rule

- `TOOL_PROCESS_EXIT_0 != GOAL_COMPLETE`
- `PROCESS_CRASH=false` is not the same as `MISSION_DONE`
- `RECONNECT` and `CONTEXT_COMPACTION` are interrupts, not finals
- Do NOT ask the human "where was I?" if the goal can be reconstructed from persisted state (PR, branch, HEAD, last tool, receipt, compilation ledger)
- If reconstruction is only partial (e.g. a pasted summary re-introduced the goal but the canonical ledger did not), classify `PARTIAL_RECOVERY` and leave `GOAL_FULL_REENTRY=NOT_PROVEN`

## Recovery order

1. Read the latest persisted context the session already has access to (compiled summary handoff, paste, PR comment, commit, receipt).
2. Attempt session/state recall only if it is a real tool; if recall errors, do not treat that as "mission over" — fall back to the persisted summary.
3. Reconstruct: GOAL_ID, NEXT_CURSOR, PR, HEAD, branch, last tool, last result, current blockers.
4. If any of those is missing, classify MISSING and report, do not fake continuity.

## What NOT to do

- Do not declare fixed point because a subprocess exited cleanly.
- Do not treat a pasted re-introduction as canonical ledger recovery.
- Do not invent a new mission because the old one is imperfectly recoverable.

## When to stop and report

- Stop and report BLOCKED with cause when the standing goal is not recoverable from any persisted source AND no new authorized intent has arrived.
- Stop and report PARTIAL_RECOVERY when recovery came from re-introduced paste/summary but the canonical mechanism is not yet proven.

## First-class signal to capture

`SESSION_SEARCH_RECALL_ERROR != ENGINE_STOP`. A recall tool failing is a tool failure, not proof the mission is over.

## References

- `references/session-goal-persistence-gap.md` — the observed failure mode, classification tree, and the real test that proves the deterministic mechanism.
