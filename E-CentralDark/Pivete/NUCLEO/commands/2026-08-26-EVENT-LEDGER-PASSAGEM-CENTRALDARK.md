# COMANDO - 2026-08-26-EVENT-LEDGER-PASSAGEM-CENTRALDARK.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\centraldark\docs\RELATORIOS\2026-08-26-EVENT-LEDGER-PASSAGEM-CENTRALDARK.md
**SHA:** f0240f839cfaac7b
**Timestamp:** 2026-08-28T02:55:12.015646
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- RESTART=NO

### Contratos
- Invariant:
- Invariant:

### Principios
- Invariant:
- Invariant:

### Riscos
- RISK=MERGE_POLICY_NOT_ENFORCED_BY_GITHUB_BRANCH_PROTECTION

### Ouro Bruto (primeiros 5000 chars)
```
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
SAME_BYTES = SAME_EVIDE
```