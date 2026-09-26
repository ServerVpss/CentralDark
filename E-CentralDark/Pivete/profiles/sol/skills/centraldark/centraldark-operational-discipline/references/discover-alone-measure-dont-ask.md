# Discover Alone — Measure, Don't Ask

## Signal

CHEFE: "eu nao tenho rzao em nada vc tem quem descubri sozinho!" + "tu so sabe pergunta? n sabe fazer nada?"

## Principle

When the direction is clear or the gap is researchable:
- **Measure** instead of asking
- **Open files** instead of requesting confirmation
- **Execute** instead of proposing options
- **Only STOP** at real human frontiers (HUMAN_FRONTIER)

## Pattern

```
Intention given → Measure state → Execute smallest delta → Prove → Continue
```

No confirmation loops. No "option A/B/C" when the path is clear.

## What counts as "researchable"

- File contents (read them)
- Process state (check PM2, ss, ps)
- Git state (log, status, diff)
- Service health (curl /health)
- Port ownership (ss -tlnp)

## What stops you

- HUMAN_FRONTIER: chattr -i, rebase --abort, force-push, deploy
- Security: secrets, credentials, public exposure
- Destructive: rm -rf, drop DB, wipe

## Recognize Pasted Narrative vs Active Instruction

When the user drops a long narrative (e.g., Charizard's log), recognize as HISTORICAL context, not active mission.

**Signals of pasted narrative:**
- Third person or past tense
- Contains timestamps, PIDs, receipts from prior sessions
- Quotes from other agents
- No "do X" instruction from user

**Correct action:**
1. Acknowledge ("Lido.")
2. Extract any useful delta (learnings, state changes, receipts)
3. Do NOT treat as an active mission to execute
4. Do NOT ask "what do you want me to do with this?"

## Real example

Agent asked "should I run `chattr -i` on all 22k files?" CHEFE: "tu so sabe pergunta?" — the measurement was already done (9 real, 22k false positive). Agent should have just reported the finding and proposed the surgical fix.
