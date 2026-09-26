# Session Goal Persistence Gap — observed failure mode

> Not a one-off incident. A reusable class: long autonomous mission, tool process exits cleanly, context compacts/truncates/reconnects, and the agent loses the standing goal.

## Observed shape

1. Tool/process finishes with exit 0.
2. Context is compacted or the session reconnects.
3. Agent responds with "I do not have context / what are we doing?" instead of recovering.
4. Human re-pastes the standing goal; agent resumes partially.

## Classification tree

```
TOOL_PROCESS_EXIT_0
  → not GOAL_COMPLETE
  → classify cause

PROCESS_CRASH=false
  → not an engine death

CONTEXT_HANDOFF_LOST=true
  → the gap is continuity, not completion

STANDING_GOAL_REENTRY_FAILED=true
  → when agent asks human instead of reconstructing

RECOVERY_FROM_PERSISTED_PASTE=PARTIAL
  → paste/summary re-introduced goal, but canonical ledger did not prove it

SESSION_SEARCH_RECALL=ERROR
  → recall tool failed; treat as tool failure, not mission over

GOAL_FULL_REENTRY=NOT_PROVEN
  → until the canonical mechanism proves resume without human re-introduction
```

## Real test that proves the mechanism

```
1. Tool exits 0.
2. Context truncates/compacts/reconnects.
3. Agent reconnects.
4. Agent resumes the SAME goal_id, PR, HEAD, branch, next_cursor.
5. Agent does NOT ask the human for the mission.
```

That sequence is the fixed-point proof. Anything short of it is partial recovery.

## Invariants

- `TRUNCATION != FORGET_GOAL`
- `TOOL_PROCESS_EXIT_0 != GOAL_COMPLETE`
- `RECONNECT != NEW_MISSION`
- `CONTEXT_LOSS → RECOVER_FROM_LEDGER`
- `PASTE_RECOVERY != LEDGER_RECOVERY`
- `PARTIAL_RECOVERY != FIXED_POINT`
- `SESSION_SEARCH_ERROR != ENGINE_STOP`

## Why this matters

A mission that can only be re-introduced by pasting is not yet deterministically recoverable. The durable fix is to persist the standing goal and next cursor outside the live context window before a turn ends, so a later truncation can resume from persisted state rather than from a re-pasted summary.
