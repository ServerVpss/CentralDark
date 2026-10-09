---
name: centraldark-evidence-reconciliation
description: "Reconcile CentralDark code, runtime, sources, and projections."
version: 1.1.0
author: SegredoiDev, Hermes Agent
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [CentralDark, evidence, runtime, HUD, logs, oracle, reconciliation, fixed-point]
    category: software-development
centraldark_autosync: true
centraldark_autosync_policy: main-runtime-lock
oracle_review_on_change: true
---

# CentralDark Evidence Reconciliation

Use this as the canonical fixed-point funnel for CentralDark missions that cross GitHub, a checkout, VPS/runtime, sources, API/MCP, HUD, Casa, or an external oracle. It coordinates evidence without creating another owner, scheduler, dispatcher, collector, or brain.

## When to Use

Use for reconciliation, deploy/readback, PR receipts, runtime diagnosis, skill self-upgrade, and cross-surface proof. Do not use a commit, health response, skill load, or oracle answer as global PASS without target readback.

## Non-negotiable contract

```text
ONE_OWNER_PER_SCOPE=true
ONE_WRITER_PER_EXACT_PATH=true
UNKNOWN != PASS
ACTION != PROOF
CODE != RUNTIME
COMMIT != DEPLOYED
MERGED != DEPLOYED
HEALTH != FEATURE_EFFECT
ORACLE_OUTPUT != AUTHORITY
FIXED_POINT_REQUIRES_ZERO_MATERIAL_UNKNOWN=true
```

## Shared fixed-point funnel

```text
INTENT
→ CURRENT (GitHub/main, checkout, runtime)
→ OWNER + WRITER + SCOPE
→ PROOF_PLAN (planes, counterproof, stop conditions)
→ MINIMUM_DELTA
→ TEST / EXECUTE
→ COUNTERPROOF
→ REMEASURE CURRENT
→ EXACT READBACK
→ SANITIZED RECEIPT + NEXT_CURSOR
```

Read the supporting contract at `references/fixed-point-funnel.md` before material mutation.

## Evidence planes

Keep these separate and report each as `PASS|UNKNOWN|FAIL|BLOCKED`:

```text
CODE/MAIN → CHECKOUT → VPS/RUNTIME → SOURCES/INGESTION → ROUTE/API → HUD/PROJECTION
```

A result is only as strong as the plane measured. A catalog entry is not tool execution; a file is not loaded source; a unit is not application-loop health; a public HTTP 200 is not feature effect; an external oracle is not repository or VPS access.

## Procedure

1. **Bind intent and owner.** Record goal, target SHA, exact owner/writer/scope, evidence boundary, counterproof, rollback, and `NEXT_CURSOR`.
2. **Measure CURRENT independently.** Read live GitHub/main, local checkout, PR state, VPS checkout/runtime SHA, branch, dirty paths, process entrypoint, PID/cgroup, listener, and local/public health.
3. **Preserve before mutation.** Archive dirty tracked deltas, untracked runtime scopes, receipts, and original files. Never reset, clean, stash, or overwrite unclassified state.
4. **Trace the owner.** Read source, tests, workflow, runtime entrypoint, consumer, and receipt path at the exact target SHA. Reuse the existing owner before creating anything.
5. **Execute the minimum delta.** Serialize writes by exact path. Parallelize only read-only perception and counterproof.
6. **Test and counterprove.** Run the narrow test, negative test, loaded-source/readback probe, and the strongest falsifying probe for the claim.
7. **Remeasure.** Re-fetch CURRENT and re-read the exact target. Keep old reports as provenance, never as current state.
8. **Emit a layered receipt.** Include `CURRENT`, `OWNER`, `WRITER`, `SCOPE`, `ACTION`, `TEST`, `COUNTERPROOF`, `READBACK`, `UNKNOWN`, `BLOCKED`, `RECEIPT`, and `NEXT_CURSOR`.
9. **Close only at fixed point.** `FIXED_POINT=true` requires every material plane in scope proven, exact effect read back, and no material `UNKNOWN`; otherwise continue through an existing route, back off, or classify a real human frontier.

## Oracle and external-agent boundary

Use an external oracle only as a read-only candidate lens. Require correlated IDs, `RESPONSE_STATE=COMPLETE`, `EVIDENCE_LIMIT`, `COUNTERPROOF`, and `NEXT_READONLY_PROBE`. Reconcile every claim against CURRENT owner and live target before mutation. If the surface is unavailable, record `ORACLE_SURFACE=UNKNOWN` and continue local probes; never invent access.

## Skill self-upgrade boundary

A skill change is not complete because its file changed. Validate frontmatter, references, duplicate rules, required gates, and loadability; compare source and runtime hashes; run the narrow self-test; countercheck the intended behavior; then sync only through the canonical skill-sync owner. If a real limit is found, create the smallest canonical owner-local delta, test it, commit it through the active PR/branch, and read back the remote SHA/state. No runtime-only final skill.

## Common false greens

- `origin/main` has the feature but VPS/runtime is behind.
- `/health=200` belongs to a different service than the target.
- A test writes a temporary file but deployed code uses another path.
- A webhook is configured but valid delivery/effect is unproven.
- A skill is loaded from cache while canonical main is stale.
- A receipt says PASS while the exact target or affected behavior was not reread.

## Required output

```text
INTENÇÃO=
CURRENT=
OWNER=
WRITER=
SCOPE=
CODE=
RUNTIME=
SOURCES=
ROUTE=
HUD=
END_TO_END=
TEST=
COUNTERPROOF=
READBACK=
UNKNOWN=
BLOCKED=
RECEIPT=
NEXT_CURSOR=
FIXED_POINT=
```
