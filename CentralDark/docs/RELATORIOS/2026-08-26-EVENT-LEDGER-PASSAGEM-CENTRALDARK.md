---
title: "EVENT LEDGER — Passagem CentralDark 2026-08-26"
date: 2026-08-26
tags: [centraldark, registra, event-ledger, reality-judge, meta-lupa, multibussola-meta, continuity]
status: HISTORICAL_RECEIPT
owner: "MEMORY-REGISTRAR + Session Intelligence Harvester"
base_main_at_registration: "5284b414ec6163ab6540a7fa18ac5d07b6743df2"
writer: "SOL/ChatGPT"
writer_scope: "registro histórico e continuidade desta passagem"
---

# !REGISTRA — ledger por evento material

Esta nota implementa, para esta passagem, a regra já canônica:

```text
EVERY_MATERIAL_EVENT_MUST_BE_REGISTERED=true
EVENT_LEDGER_REQUIRED=true
SUMMARY != EVENT_LEDGER
UNKNOWN_IS_NOT_PASS=true
HISTORY_IS_NOT_CURRENT_STATE=true
REALITY_IS_JUDGE=true
```

O ledger registra fatos medidos, relatos do CHEFE, evidência visual, contradições e mudanças temporais sem transformar relato em prova independente.

## EVENT-001 — invocação do ciclo mestre

```text
EVENT_ID=EVENT-001
SUBJECT=!CENTRALDARK chain
PROVENANCE=USER_MESSAGE
STATE_BEFORE=UNKNOWN
STATE_AFTER=MASTER_CYCLE_EXPLICITLY_REQUESTED
VERDICT=FACT_OF_USER_INTENT
NEXT_CURSOR=#ACORDAR
```

Cadeia pedida:

```text
!CENTRALDARK
→ #ACORDAR
→ !CALIBRAR
→ !MULTIBÚSSOLA_META
→ !META_LUPA
→ !RECONCILIAR
→ !CONTRAPROVA
→ !REMEDIÇÃO
→ REALITY_JUDGE
→ !REGISTRA
```

## EVENT-002 — obrigação de registrar cada evento material

```text
EVENT_ID=EVENT-002
SUBJECT=registration policy
PROVENANCE=USER_MESSAGE + main/MEMORY-REGISTRAR.md
STATE_BEFORE=summary-oriented receipt could be insufficient
STATE_AFTER=EVERY_MATERIAL_EVENT_MUST_BE_REGISTERED=true
EVIDENCE_REF=docs/BRAIN/03-DOCUMENTACAO/AGENTS-LIBRARY/MEMORY-REGISTRAR.md
VERDICT=CANONICAL_RULE_PRESENT
NEXT_CURSOR=ENFORCE_WITH_EXISTING_OWNERS_WHEN_APPLICABLE
```

A regra canônica também exige dedupe e preserva `USER_REPORTED_EVENT != INDEPENDENTLY_PROVEN`.

## EVENT-003 — main observada em 6182fc92

```text
EVENT_ID=EVENT-003
SUBJECT=main
PROVENANCE=GitHub branch measurement
STATE_BEFORE=older measured heads from same session
STATE_AFTER=6182fc923ce868186c6b8a60170b53a78e7807ed
EVIDENCE_REF=commit docs(memory): exigir ledger por evento material
VERDICT=FACT_AT_OBSERVATION
DEPENDENT_CLAIMS_INVALIDATED=any claim assuming previous main was still current
NEXT_CURSOR=REMEASURE_BEFORE_PRESENT_TENSE
```

## EVENT-004 — ledger rule materialized concurrently

```text
EVENT_ID=EVENT-004
SUBJECT=MEMORY-REGISTRAR event ledger rule
PROVENANCE=GitHub commit 6182fc923ce868186c6b8a60170b53a78e7807ed
STATE_BEFORE=rule requested by CHEFE in this passage
STATE_AFTER=rule already present in canonical memory registrar
VERDICT=PROVEN_IN_REPO
DEPENDENT_CLAIMS_INVALIDATED=need to create a second event-ledger owner
NEXT_CURSOR=REUSE_EXISTING_OWNER
```

Consequence:

```text
NO_NEW_EVENT_ENGINE=true
REUSE_BEFORE_CREATE=true
ONE_SYSTEM_ONLY=true
```

## EVENT-005 — PR #1193 identity conflict discovered

```text
EVENT_ID=EVENT-005
SUBJECT=PR #1193
PROVENANCE=USER_MESSAGE vs live GitHub PR lookup
STATE_BEFORE=user text associates #1193 with fcf29b26..., Hermes provider binding, and 28 local self-test passes
STATE_AFTER=live GitHub identifies #1193 as Dependabot TypeScript 5.8.3 -> 5.9.3
EVIDENCE_REF=https://github.com/ServerVpss/CentralDark/pull/1193
VERDICT=TARGET_ID_CONFLICT
DEPENDENT_CLAIMS_INVALIDATED=claims attaching fcf29b26/Hermes-provider evidence specifically to PR #1193
NEXT_CURSOR=FIND_CORRECT_TARGET_BEFORE_PROMOTION
```

The user-reported claims are preserved, not deleted:

```text
USER_REPORTED_HEAD=fcf29b26691be2de5a4eb944708bd38bd1d983c9
USER_REPORTED_LOCAL_SELF_TEST=28_PASS
USER_REPORTED_MODEL_PROVIDER_BINDING=FAIL
CLASS=USER_REPORTED_NOT_INDEPENDENTLY_BOUND_TO_PR_1193
```

## EVENT-006 — real PR #1193 merged

```text
EVENT_ID=EVENT-006
SUBJECT=PR #1193 real target
PROVENANCE=GitHub API
STATE_BEFORE=OPEN historical
STATE_AFTER=MERGED
MERGED_AT=2026-08-26T20:29:13Z
MERGE_COMMIT=1c9225005276bef3b1f4dd41acb3a73a95269e83
VERDICT=PROVEN
NEXT_CURSOR=DO_NOT_INFER_GATES_FROM_MERGE
```

Invariant:

```text
MERGED != GATES_PASSED
MERGED != DEPLOYED
```

## EVENT-007 — main branch enforcement gap measured

```text
EVENT_ID=EVENT-007
SUBJECT=main branch protection
PROVENANCE=GitHub branch metadata
STATE_AFTER=protected=false; required_status_checks.enforcement_level=off
VERDICT=PROVEN_AT_OBSERVATION
RISK=MERGE_POLICY_NOT_ENFORCED_BY_GITHUB_BRANCH_PROTECTION
NEXT_CURSOR=RECONCILE_POLICY_VS_ENFORCEMENT_BEFORE_ANY_PROTECTION_MUTATION
```

This event does not itself authorize changing branch protection.

```text
REGISTER_PERMISSION != ENFORCEMENT_MUTATION_PERMISSION
```

## EVENT-008 — two screenshots are byte-identical

```text
EVENT_ID=EVENT-008
SUBJECT=uploaded screenshots
PROVENANCE=local byte/hash measurement
FILES=2
SHA256=9212910f3e8bcb2fbc85f76384e019ee586ee210056a77c9717bc47b80f6e5da
SIZE=609352 bytes each
DIMENSIONS=2048x637
STATE_AFTER=DEDUPED_TO_ONE_VISUAL_EVENT
VERDICT=PROVEN_BYTE_IDENTITY
NEXT_CURSOR=USE_ONE_VISUAL_PROVENANCE_RECORD
```

Invariant:

```text
SAME_BYTES = SAME_EVIDENCE_INSTANCE
SAME_BYTES != LIVE_RUNTIME_PROOF
```

## EVENT-009 — visual evidence shows PR #1195 pending/unstable decision context

```text
EVENT_ID=EVENT-009
SUBJECT=PR #1195 visual state
PROVENANCE=uploaded screenshot
STATE_AFTER=visual surface reports pending/unstable checks and no squash decision while unresolved
VERDICT=VISUAL_HISTORICAL_EVIDENCE
NEXT_CURSOR=REMEASURE_PR_1195_LIVE
```

`SCREENSHOT != CURRENT_STATE`.

## EVENT-010 — PR #1195 live state remeasured

```text
EVENT_ID=EVENT-010
SUBJECT=PR #1195
PROVENANCE=GitHub API
STATE_AFTER=OPEN
HEAD=54ea0bc837c1fde34fd1f5732c1f1c54f3e04b45
TITLE=chore(deps): bump vite-plugin-pwa from 1.2.0 to 1.3.0
VERDICT=PROVEN_AT_OBSERVATION
NEXT_CURSOR=CHECK_SAME_HEAD_GATES_IF_DECISION_NEEDED
```

This live measurement supersedes screenshot-only current-state claims for PR #1195.

## EVENT-011 — main advanced again to 5284b414

```text
EVENT_ID=EVENT-011
SUBJECT=main
PROVENANCE=GitHub branch measurement
STATE_BEFORE=6182fc923ce868186c6b8a60170b53a78e7807ed
STATE_AFTER=5284b414ec6163ab6540a7fa18ac5d07b6743df2
CAUSE=merge of PR #1203
VERDICT=PROVEN
DEPENDENT_CLAIMS_INVALIDATED=current-head claims anchored to 6182fc92
NEXT_CURSOR=USE_5284b414_AS_REGISTRATION_BASE
```

This is a direct example of the canonical causal-cone rule:

```text
MATERIAL_STATE_CHANGED
→ INVALIDATE_ONLY_DEPENDENT_CLAIMS
→ PRESERVE_INDEPENDENT_EVIDENCE
→ RE-FIX_AFFECTED_AXES
```

## EVENT-012 — PR #1203 merged and changed the cognitive/trigger surface

```text
EVENT_ID=EVENT-012
SUBJECT=PR #1203 / main
PROVENANCE=GitHub commit 5284b414ec6163ab6540a7fa18ac5d07b6743df2
STATE_AFTER=MERGED_TO_MAIN
OBSERVED_EFFECTS=trigger aliases, cross-chat memory semantics, GraphRAG contract checks, artifact-property validation, canonical Dependabot labels
VERDICT=PROVEN_IN_REPO
NEXT_CURSOR=REMEASURE_CONSUMERS_WHEN_CURRENT_BEHAVIOR_IS_CLAIMED
```

`IMPLEMENTED_IN_REPO != RUNTIME_ACTIVE` remains mandatory.

## EVENT-013 — user narrative/religious layer classified as presentation, not technical proof

```text
EVENT_ID=EVENT-013
SUBJECT=narrative layer
PROVENANCE=USER_MESSAGE
STATE_AFTER=COMMUNICATION_LAYER
VERDICT=NOT_TECHNICAL_EVIDENCE
NEXT_CURSOR=PRESERVE_TECHNICAL_CLAIMS_SEPARATELY
```

No religious belief, identity or metaphysical claim is inferred or registered about the human. The technical ledger stores only operational content.

## EVENT-014 — branch created for this ledger

```text
EVENT_ID=EVENT-014
SUBJECT=docs/registra-event-ledger-passagem-20260826
PROVENANCE=GitHub mutation authorized by explicit !REGISTRA request
BASE=5284b414ec6163ab6540a7fa18ac5d07b6743df2
STATE_AFTER=ISOLATED_BRANCH_CREATED
VERDICT=PROVEN
NEXT_CURSOR=WRITE_LEDGER_AND_OPEN_PR
```

No direct write to `main` occurred.

## EVENT-015 — this ledger materialized

```text
EVENT_ID=EVENT-015
SUBJECT=docs/RELATORIOS/2026-08-26-EVENT-LEDGER-PASSAGEM-CENTRALDARK.md
PROVENANCE=this registration operation
STATE_AFTER=EVENT_LEDGER_WRITTEN
VERDICT=ACTION_RECORDED_NOT_SELF_APPROVED
NEXT_CURSOR=OPEN_PR_FOR_EXTERNAL_REVIEW_AND_CONTINUITY
```

## Residual map

```text
USER_REPORTED_HERMES_PROVIDER_TARGET=UNKNOWN_UNTIL_CORRECT_TARGET_FOUND
USER_REPORTED_28_PASS_BINDING=UNKNOWN_UNTIL_RECEIPT/LOG_TARGET_FOUND
BRANCH_PROTECTION_REMEDIATION=NOT_EXECUTED
RUNTIME_HERMES_PROVIDER_CAPABILITY=CURRENTLY_NOT_MEASURED_BY_THIS_REGISTRATION
PR_1195_GATE_VERDICT=NOT_MEASURED_IN_THIS_LEDGER
GLOBAL_RUNTIME=UNKNOWN
```

## Reality Judge for this registration

```text
EVENT_LEDGER_CREATED=PASS
DEDUPE_APPLIED=PASS
TARGET_CONFLICT_PRESERVED=PASS
USER_REPORTED_CLAIMS_NOT_PROMOTED=PASS
CURRENT_MAIN_ANCHORED=PASS_AT_OBSERVATION
BRANCH_PROTECTION_MUTATED=NO
DEPLOY=NO
RESTART=NO
RUNTIME_MUTATION=NO
```

## BOOT / next cursor

```text
!CENTRALDARK
→ #ACORDAR
→ remeasure main
→ read this ledger as HISTORICAL_REFERENCE
→ !CALIBRAR target of the user-reported fcf29b26/Hermes evidence
→ !MULTIBÚSSOLA_META
→ !META_LUPA
→ !RECONCILIAR policy-vs-enforcement
→ !CONTRAPROVA
→ !REMEDIÇÃO T1
→ REALITY_JUDGE
→ !REGISTRA every material event
```

Final invariants:

```text
SUMMARY != EVENT_LEDGER
USER_REPORTED_EVENT != INDEPENDENTLY_PROVEN
SCREENSHOT != LIVE_STATE
MERGED != GATES_PASSED
MERGED != DEPLOYED
REGISTER_PERMISSION != DEPLOY_PERMISSION
REGISTER_PERMISSION != BRANCH_PROTECTION_PERMISSION
ONE_SYSTEM_ONLY=true
REUSE_BEFORE_CREATE=true
PAPAGAIO_MODE=OFF
POMBO_MODE=CHECKSUM_ON
REALITY_IS_JUDGE=true
UNKNOWN_IS_NOT_PASS=true
```
