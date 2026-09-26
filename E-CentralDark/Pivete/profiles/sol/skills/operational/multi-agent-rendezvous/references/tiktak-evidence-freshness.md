# TIK_TAK — Evidence Freshness Rule

**Core principle:** A measurement loses validity the moment state changes. Using pre-action evidence as proof of post-action state is a reasoning error, not a minor oversight.

## The rule
- Every measurement has a lifespan
- State-changing actions invalidate prior measurements of that state
- Before relying on any measurement to prove something, check: **when was this measured, and has anything changed since?**

## Decision tree
```
TASK: "prove X is true"
    ↓
WAS X MEASURED?
    ↓
    NO → measure it (don't guess, don't ask if measurable)
    ↓
WHEN MEASURED?
    ↓
BEFORE LAST STATE CHANGE? → stale → remeasure
    ↓
ANY STATE CHANGE SINCE? → stale → remeasure
    ↓
MEASUREMENT FRESH? → usable as evidence (ACTION ≠ PROOF still applies)
```

## Worked examples

### Service health
- Measured: "Omni Router :8099 is up"
- Action: kill the process (watchdog, manual, crash)
- After: the measurement is stale → remeasure port before claiming "Omni Router is up"
- Pitfall: reporting "Omni Router fixed" based on pre-restart measurement

### Git state
- Measured: "HEAD is abc123"
- Action: git pull / commit / checkout
- After: HEAD measurement is stale → remeasure before any git-based claim
- Pitfall: claiming "file doesn't exist" based on pre-fetch measurement

### CI status
- Measured: "PR #123 CI is green"
- Action: new commit pushed to PR
- After: CI measurement stale → remeasure or assume pending
- Pitfall: treating "was green" as "is green" without checking

### File contents
- Measured: "health_check.sh has float bug"
- Action: patch applied
- After: content measurement stale → remeasure/diff to prove patch landed
- Pitfall: saying "fixed" without re-reading the file

## Anti-patterns
- Using screenshot as proof of runtime state (screenshot shows pixels, not process health)
- Using health endpoint as proof of invocation (HEALTH_PASS ≠ INVOCATION_PASS)
- Using config file existence as proof service is configured correctly
- Using conversation history as current state
- Using "I saw it working 5 minutes ago" as proof it still works after action

## Relationship to other rules
- UNKNOWN ≠ PASS: stale measurement that can't be confirmed = UNKNOWN, not PASS
- ACTION ≠ PROOF: the action happened, but the measurement must still confirm the effect
- HISTORY ≠ CURRENT_STATE: history is provenance, not live state

## Quick heuristic
**If you acted since the last measurement, the measurement is stale.** Remasure. Always.
