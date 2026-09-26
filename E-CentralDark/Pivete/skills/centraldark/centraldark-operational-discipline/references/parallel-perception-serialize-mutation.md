# Parallel Perception + Serialize Mutation

**Session:** 05/09/2026 — confirmed as operational law for CentralDark.

## Principle

Perception (read-only) can be parallelized. Mutation (write) must be serialized per scope.

## Rules

PARALLELIZE_PERCEPTION=true
SERIALIZE_MUTATION=true
ONE_WRITER_PER_SCOPE=true
MULTI_READER=true

## Parallel Perception

- Multiple readers can scan the same repo simultaneously
- Reading, searching, testing can occur in parallel when there is real gain
- Independent lookups are batched into the same assistant turn
- search_files, read_file, terminal calls for read-only operations can be parallelized

## Serialize Mutation

- Mutation is serial and synchronized in the correct scope
- One writer per file/escopo
- If another Worker already picked up the same wound: do NOT duplicate mutation; observe, attack independent front, or wait for handoff/release

## Before Composing Capabilities

Raw observations go through envelope, clustering, and deduplication:

N_RAW_OBSERVATIONS
→ NORMALIZE_EVIDENCE
→ CLUSTER_BY_SOURCE|CAUSE|CLAIM|SCOPE|TIME
→ FINGERPRINT
→ DEDUPE
→ M_INDEPENDENT_DELTAS

M_INDEPENDENT_DELTAS <= N_RAW_OBSERVATIONS
SAME_SOURCE_REPEATED → ONE_EVIDENCE_CLUSTER_UNTIL_PROVED_OTHERWISE
INTELLIGENCE_SIGNAL_METRIC=INDEPENDENT_DELTAS_AFTER_DEDUPE
N=200_AND_M=1 → ECHO_NOT_200X_TRUTH

The composition uses the residual after dedupe, not the quantity of manifestations.

## Writer Collision Detection

If HEAD jumps between subcommands (multi-writer active):
1. Do NOT commit/push/pull on a checkout that changed SHA during measurement
2. Re-measure origin/main every round with git fetch + git rev-parse origin/main
3. When another agent opened a PR for a file: that is the writer for that scope

## Anti-pattern

NEVER create second brain, V2/V3, router parallel, or second memory when the owner absorbs the delta
NEVER duplicate work already done by another writer in the same scope

## Reference

See centraldark-master-funnel-autonomo SKILL.md and centraldark-operational-discipline Rule 75 for checkout-mobile/multi-writer details.
