---
name: multi-agent-rendezvous
description: Parallel agent rendezvous with TIK_TAK proof freshness.
---

# Multi-Agent Rendezvous

## When to use
- Dispatching multiple agents to one mission
- Reconciling state across sessions/windows
- Preventing duplicate work or stale measurements
- Recovering from context loss without restart

## Core Rules

**One Writer Per Scope:** only one agent mutates a scope; others READ_ONLY/REVIEW/COUNTERPROOF.

**TIK_TAK — Evidence Freshness:** stale measurement = history, not current state. After any state-changing action, remeasure before relying on the result. A pre-action measurement does NOT prove the post-action state.

| Measurement | Stale after |
|------------|-------------|
| Service health | Any start/stop/restart |
| File contents | Any write |
| Git state | Any commit/fetch/checkout |
| Process list | Any spawn/termination |
| Port occupancy | Any bind/release |
| CI status | Any new commit/rerun |

When in doubt, remeasure. Cost of extra read ≪ cost of acting on stale data.

**Continue, Don't Restart:** recover MISSION_ID, CHECKPOINT, NEXT_CURSOR; then measure CURRENT_STATE fresh. Don't restart unless HEAD/runtime/proof changed or contradiction appeared.

## Dispatched Brief Template
```
MISSION_ID=
CURRENT_STATE= (measured, fresh)
NEXT_CURSOR=
DECISIONS_PROVEN=
UNKNOWN=
ONE_WRITER_PER_SCOPE=
YOUR_FRONT=
PROVE_BY=
```
Do NOT dispatch full conversation history. Give what's needed to act.

## Anti-Patterns
- Duplicate reads across agents
- Using pre-action measurement as proof of post-action state
- Restarting mission because context window changed
- Presenting options as questions — pick lowest-motion path and execute
- Declaring PASS from screenshot/health/config alone
- Killing processes/windows belonging to another agent/user
- Treating conversation history as current state

## User Preference (embedded from session)

This user explicitly forbids:
- Offering options as questions ("A or B?")
- Asking for confirmation when one path is clearly shorter
- Repeating same proof already delivered
- Re-asking authorization already given

**Pick the lowest-motion path and execute. Show the result.**

Style: ultra-concise Baianês. Direct action over explanation. Evidence-first (UNKNOWN≠PASS, ACTION≠PROOF).

## Image Failure Handling
When `vision_analyze` returns connection error or similar:
1. Try once more (transient)
2. If fails again, ask for textual description or another measurable proof
3. Do NOT insist on the image or fabricate content
4. Do NOT treat "image shared" as "content known"

## References
- `references/tiktak-evidence-freshness.md`
- `references/rendezvous-checklist.md`
