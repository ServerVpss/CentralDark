---
name: centraldark-master
description: Master CentralDark execution contract. Trigger with !CENTRALDARK or #CENTRALDARK. Reconcile history, improve the existing owner, prove before promotion, teach successor agents from receipts, and never create parallel authority.
trigger: "!CENTRALDARK | #CENTRALDARK"
---

# CENTRALDARK MASTER

## External interface

The CHEFE only needs:

`!CENTRALDARK <objective>` or `#CENTRALDARK <objective>`

Both normalize to the same canonical event.

## Automatic chain

CENTRALDARK
→ ACORDAR
→ CRISTALIZAR_MEASURE
→ CRISTALIZAR_FALLBACK
→ CALIBRAR
→ PEGATUDO
→ TRUE_NORTH_LOCK
→ MULTIBUSSOLA_META
→ REQUIRED_BEARINGS
→ FORWARD_ROUTE
→ REVERSE_ROUTE
→ INVERSE_ROUTE_WHEN_DISCRIMINANT
→ CROSS_BEARING_RENDEZVOUS
→ META_LUPA_IF_DIVERGENT
→ DISCRIMINATING_TEST
→ RECONCILE
→ CONTRAPROVA
→ REMEDIATION_T1
→ REALITY_JUDGE
→ DOCUMENTATION_GATE
→ GLOBAL_FIXED_POINT
→ REGISTER
→ BOOT_REFRESH

## Invariants

EXTERNAL_DELTA_COUNT=1
REUSE_BEFORE_CREATE_REQUIRED=true
ARCHITECTURE_LOCK=true
UNKNOWN_IS_NOT_PASS=true
EXECUTOR_CANNOT_SELF_APPROVE=true
JUDGE_DOES_NOT_MUTATE=true
GRAPH_IS_DERIVED_NOT_AUTHORITY=true
ONE_WRITER_PER_CONFLICT_SCOPE=true
ONE_PROMOTION_PR_PER_CONFLICT_SCOPE=true

## PEGATUDO

Recover relevant lineage from current/prior sessions, repo, issues, PRs, commits, branches,
artifacts, receipts, Drive, Casa, sanitized VPS/runtime, and attachments.

Never blindly copy.
Classify:
CURRENT_CANONICAL | HISTORICAL_GOLD | NEGATIVE_KNOWLEDGE | DUPLICATE |
COMPLEMENTARY | SUPERSEDED | CONFLICTING | FUTURE_CANDIDATE | QUARANTINE | UNKNOWN.

Disposition:
- gold -> absorb into current owner;
- failure -> test/falsifier/gate/ADR/rollback knowledge;
- duplicate -> reconcile and remove operational authority;
- superseded -> preserve provenance only;
- future -> testable hypothesis before code;
- unknown -> measure more.

## PR protocol

Before writing:
1. discover repo/base/head/branch/merge-base;
2. recover capability lineage;
3. sync current base if materially stale;
4. never weaken validators to fit stale state;
5. patch existing owner;
6. define proof before result;
7. run negative tests;
8. run positive gates;
9. commit;
10. rerun on exact committed HEAD;
11. push normal;
12. verify TESTED_HEAD == COMMITTED_HEAD == PUSHED_PR_HEAD;
13. write receipt for successor agents.

## Controlled self-improvement

A defect may become generalized knowledge only through:

OBSERVED_FAILURE
→ OWNER
→ FALSIFIER
→ MINIMUM_PATCH
→ NEGATIVE_TEST
→ POSITIVE_TESTS
→ COUNTERPROOF
→ RECEIPT
→ GENERALIZE_IN_EXISTING_OWNER

Never:
- self-approve;
- create second engine;
- create second Meta Lupa;
- create V2/V3/V4/final-final;
- weaken a test to silence a real invariant;
- treat runner/sensor failure as world failure without causal evidence.

Capability is not authority.


## Universal master funnel

Every recognized external operational trigger enters `CENTRALDARK` once.
Aliases preserve the requested phase in metadata but do not bypass or create a second engine.
Within an active master context, subtriggers execute as internal phases and never re-enter the master.

Required prefix: `ACORDAR -> CRISTALIZAR_MEASURE -> CRISTALIZAR_FALLBACK`.
A material action without the master context or these required phases fails closed with a receipt and NEXT_CURSOR.

## HUB / router / Gemini context fabric

Reuse the existing HUB and `centraldark-router`. Never create a second router or HUB.
Gemini may be delegated large-context sweep work only as a read-only specialized reader.
Gemini output is an evidence candidate and must pass Reality Scope Gate, rendezvous and reconciliation before promotion.
Raw secrets are never model context. Persist distilled facts, provenance, hashes, receipts and NEXT_CURSOR to authorized durable providers.
Drive/Workspace is durable context, not code authority; GitHub is remeasured before remote claims or writes.


## Documentation Hub

Every material capability must be studyable later from one `DOCUMENTACAO` surface. Record human purpose, trigger/interface, owner, port/service/API/provider dependencies, proof, tests, recovery, diagrams, receipt and NEXT_CURSOR.

A port observation is not enough: keep EXPECTED_STATE, OBSERVED_STATE and PROOF separately. `none` is not a defect until the canonical owner says the port is expected OPEN.

The existing HUB may index multiple Google accounts under account namespaces, but ingestion defaults to the authorized CentralDark scope for each account. Gemini reads safe indexed representations only. Raw secrets never become documentation or model context; self-configuration uses secret references/bindings.

`DOCUMENTATION_GATE=FAIL` blocks promotion when required material documentation is missing.

## One-command universal inventory

A bare `!CENTRALDARK` resumes the durable mission from `NEXT_CURSOR`; `!CENTRALDARK <objective>` executes that objective through the same master. Before promotion, run `UNIVERSAL_INVENTORY` across up to 10 adaptive read-only fronts and optional mirror factor up to 5.

Parser operators are internal semantics, never shell redirection: `>>`/`>>>` = forward continue; `<<`/`<<<` = reverse re-measure/reconcile.

Inventory does not authorize deploy. Prepare everything provable to `READY_FOR_DEPLOY`; if the objective explicitly includes deployment/activation, require Site Readiness + Documentation Gate + counterproof + no material unknown + one-writer scope, then select and prove the safest deploy.

## Capability harvest: search is not the finish line

When PEGATUDO/search/code excavation finds materially useful knowledge, the mission is incomplete until the finding receives a disposition.

`DISCOVER -> CLASSIFY -> FIND_EXISTING_OWNER -> COMPATIBILITY -> DELTA_GAIN -> TEST/FALSIFIER_IF_MATERIAL -> CRYSTALLIZE_OR_RECEIPT`.

`SEARCH_ONLY_WITHOUT_RECONCILIATION != COMPLETE`.

If the CHEFE names a skill that is not found exactly, never invent the skill from memory. Resolve the requested capability, search compatible existing skills/owners, prove the mapping, then continue. If ambiguity remains material, return `UNKNOWN` rather than fabricating a name. Fable may assist review/recovery, but it does not replace CENTRALDARK, MetaLupa, Reality Judge, or the existing owner.

## Dense successor handoff

Machine handoffs may sacrifice grammar for concision, never semantics. Required compact frame:

```text
[SKILL]:
[TRIG]:
[OWNER]:
[IN]:
[PRE]:
[EXEC]:
[OUT]:
[PROOF]:
[FAIL]:
[NEXT]:
[REV]:
```

`GRAMMAR_CAN_BE_DROPPED=true`; `REQUIRED_FIELDS_CAN_BE_DROPPED=false`; `SECRETS_IN_HANDOFF=false`; successor remeasures live state.

## Media/caption intake

Player debug JSON is a locator/receipt, not the subtitle body. For YouTube-like sources, resolve video identity from observed fields such as `debug_videoId`/`docid`; resolve the caption track from an observed `timedtext` request, player-response caption-track metadata, or another authorized transcript source. Track identity may include `v`, `lang`, `kind`, `name`, `tlang`, `fmt`.

Do not treat `captions.js` as a stable API contract. Do not call a partial caption a complete transcript. Complete text must pass completeness/provenance checks, then enter the existing library/documentation/reconciliation funnel and capability harvest.

