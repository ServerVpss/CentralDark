# CentralDark Fixed-Point Funnel

This reference is the shared operational gate for CentralDark-owned skills.

```text
INTENT
→ CURRENT (GitHub/main, checkout, runtime)
→ OWNER + ONE_WRITER + SCOPE
→ PROOF_PLAN (planes, counterproof, stop conditions)
→ MINIMUM_DELTA
→ TEST / EXECUTE
→ COUNTERPROOF
→ REMEASURE CURRENT
→ EXACT READBACK
→ SANITIZED RECEIPT + NEXT_CURSOR
```

## Gates

- `UNKNOWN != PASS`, `ACTION != PROOF`, `CODE != RUNTIME`, `MERGED != DEPLOYED`.
- Preserve dirty worktrees, untracked runtime, secrets, receipts, and historical provenance.
- Reuse existing owners, schedulers, dispatchers, routes, writers, and receipts before creation.
- Parallelize perception; serialize mutation by exact path/scope.
- A commit, HTTP 200, active unit, catalog entry, tool result, or skill load proves only its own layer.
- Retry only when the next attempt adds evidence; otherwise use an existing alternate route or backoff.
- `FIXED_POINT=true` requires exact target effect readback and zero material UNKNOWN.

## Receipt

```text
INTENT=
CURRENT=
OWNER=
WRITER=
SCOPE=
ACTION=
TEST=
COUNTERPROOF=
READBACK=
PASS=
UNKNOWN=
BLOCKED=
RECEIPT=
NEXT_CURSOR=
FIXED_POINT=
```
