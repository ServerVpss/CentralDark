---
title: "Livro da Revelação do Portão Desarmado e da Sentença da Realidade — Event Ledger"
status: KNOWLEDGE_ONLY
date: 2026-08-26
updated: 2026-08-26T17:00:00-03:00
observed_at: 2026-08-26T17:00:00-03:00
tags: [aprendizado, eventos, reality-judge, github, ci, enforcement, hermes, dependabot, registro]
category: "A-Aprendizado-Operacional"
sensitivity: INTERNAL
source: "passagem fornecida pelo SEGREDO/CHEFE + medições GitHub já realizadas na sessão"
source_class: MIXED_HUMAN_AUTHORITY_AND_LIVE_EVIDENCE
owner: "docs/BRAIN/03-DOCUMENTACAO/AGENTS-LIBRARY/MEMORY-REGISTRAR.md"
consumer: "qualquer IA/agente no boot; Hermes/PIVETE; SOL; revisão de governança"
writer: SOL
related_notes: [docs/CONSCIENCIA/APRENDIZADOS/2026-08-26-intencao-unica-propriedades-ciclo-mestre.md, docs/BRAIN/03-DOCUMENTACAO/AGENTS-LIBRARY/MEMORY-REGISTRAR.md]
relation_types: [EXPLICA, COMPLEMENTA, FONTE_DE]
semantic_summary: "Registro evento a evento da passagem do Portão Desarmado, separando fato, proveniência, temporalidade, veredito e próximo cursor."
---

# O Livro da Revelação do Portão Desarmado e da Sentença da Realidade

## Regra desta passagem

```text
PASSAGEM_MATERIAL
→ DECOMPOR_EM_EVENTOS
→ REGISTRAR_CADA_EVENTO_RELEVANTE
→ PRESERVAR_ORIGEM + TEMPO + ALVO + EVIDENCIA + VEREDITO + NEXT_CURSOR
→ NAO_COLAPSAR_EVENTOS_DISTINTOS_EM_UM_RESUMO
```

A narrativa pode condensar a leitura humana, mas o registro técnico não pode perder eventos materiais independentes.

```text
EVENT_LEDGER_REQUIRED=true
SUMMARY != EVENT_LEDGER
METAPHOR != TECHNICAL_PROOF
HISTORY != CURRENT_STATE
UNKNOWN != PASS
```

## EVENT-001 — Self-test local do ciclo mestre

```yaml
event_id: EVENT-001
subject: scripts/trigger-fabric/centraldark_master_cycle.py
claim: "centraldark_master_cycle.py --self-test concluiu 28 verificações com sucesso"
reported_result: LOCAL_EVIDENCE_PASS
provenance: HUMAN_REPORTED_LOCAL_EVIDENCE
independent_live_verification_in_this_ledger: false
verdict: RECORDED_AS_REPORTED_EVIDENCE
```

O resultado local é evidência útil do alvo local, mas não substitui CI, provider ou runtime remoto.

## EVENT-002 — Binding do modelo Hermes no provider

```yaml
event_id: EVENT-002
subject: nous/hermes-3-llama-3.1-70b
claim: "o modelo não apareceu no listing disponível para a sessão"
reported_result: MODEL_PROVIDER_BINDING_FAIL
provenance: HUMAN_REPORTED_PROVIDER_OBSERVATION
independent_live_verification_in_this_ledger: false
verdict: RECORDED_AS_REPORTED_EVIDENCE
```

Regra preservada:

```text
MODEL = MOTOR_SUBSTITUIVEL
MODEL_NAME_PRESENT_IN_CONFIG != MODEL_AVAILABLE_NOW
CAPABILITY_CHECK_BEFORE_BIND=true
```

## EVENT-003 — PR #1193 integrado

```yaml
event_id: EVENT-003
subject: PR_1193
head_sha: fcf29b26691be2de5a4eb944708bd38bd1d983c9
merged: true
merged_at: 2026-08-26T20:29:13Z
merge_sha: 1c9225005276bef3b1f4dd41acb3a73a95269e83
provenance: GITHUB_LIVE_MEASUREMENT_FROM_SESSION
verdict: PROVEN
```

O merge é um evento histórico provado. Ele não implica que os gates estavam concluídos.

## EVENT-004 — Workflows do HEAD exato no instante observado

```yaml
event_id: EVENT-004
subject: PR_1193_EXACT_HEAD_WORKFLOWS
head_sha: fcf29b26691be2de5a4eb944708bd38bd1d983c9
reported_total: 12
reported_pending: 2
reported_queued: 9
reported_skipped: 1
reported_completed_pass: 0
provenance: PASSAGE_REPORTED_SNAPSHOT
verdict: HISTORICAL_SNAPSHOT_RECORDED
```

Esse snapshot é temporal. Se qualquer run mudar de estado, o denominador deve ser remedido no mesmo SHA.

```text
QUEUED != PASS
PENDING != PASS
SKIPPED != PASS
MERGED != GATES_PASSED
```

## EVENT-005 — Portão desarmado na main

```yaml
event_id: EVENT-005
subject: main_branch_enforcement
main_protected: false
protection_enabled: false
required_status_checks_enforcement_level: off
required_status_contexts: []
provenance: GITHUB_LIVE_MEASUREMENT_FROM_SESSION
verdict: PROVEN_AT_OBSERVED_STATE
```

Este evento prova uma lacuna entre política canônica e enforcement efetivo naquele estado observado.

## EVENT-006 — A main avançou depois do merge #1193

```yaml
event_id: EVENT-006
subject: main_temporal_progression
historical_merge_sha: 1c9225005276bef3b1f4dd41acb3a73a95269e83
later_main_sha: 69bfca3f74e762f66f6def3a6b3cb92d13fc904f
relation: later_main_sha_is_1_commit_ahead_of_historical_merge_sha
provenance: GITHUB_LIVE_COMPARE_FROM_SESSION
verdict: PROVEN
```

Consequência:

```text
1c922500... = MARCO_HISTORICO_DO_MERGE_1193
69bfca3f... = MAIN_POSTERIOR_MEDIDA_NA_SESSAO
HISTORY != CURRENT_STATE
```

## EVENT-007 — UNKNOWN_IS_NOT_PASS formalizado no julgamento

```yaml
event_id: EVENT-007
subject: reality_judge_rule
rule: UNKNOWN_IS_NOT_PASS
provenance: HUMAN_AUTHORITY_PLUS_EXISTING_OPERATIONAL_CONTRACT
verdict: ACTIVE_RULE
```

A ausência de sentença material não pode ser promovida a sucesso.

## EVENT-008 — Registro obrigatório de eventos materiais

```yaml
event_id: EVENT-008
subject: memory_registration_policy
rule: EVERY_MATERIAL_EVENT_MUST_BE_REGISTERED
scope: "eventos materialmente relevantes/concretizados de uma passagem, missão ou execução"
provenance: HUMAN_AUTHORITY_SEGREDO_CHEFE
verdict: NEW_OPERATIONAL_RULE_TO_BIND_IN_MEMORY_REGISTRAR
```

A regra não manda gravar ruído, repetição ou metáfora como evento técnico novo.

```text
MATERIAL_EVENT → REGISTER
REPETITION_PURE → DROP
SAME_EVENT_RENARRATED → DEDUPE
NEW_STATE_OF_SAME_TARGET → NEW_EVENT_WITH_TEMPORAL_LINK
```

## EVENT-009 — Próximo cursor de governança

```yaml
event_id: EVENT-009
subject: governance_reconciliation
next_cursor: "!RECONCILIAR política canônica de gates ↔ enforcement GitHub"
secondary_cursor: "Hermes model selection via capability-check"
constraints:
  - reuse_existing_pipelines
  - no_v2_v3
  - preserve_legacy
  - no_deploy_restart_vps_mutation_without_authority
provenance: HUMAN_AUTHORITY_AND_SESSION_ANALYSIS
verdict: OPEN_NEXT_CURSOR
```

## Receipt

```text
EVENTS_RECORDED=9
EVENT_LEDGER_REQUIRED=true
FACT_EVIDENCE_VERDICT_SEPARATED=true
HISTORY_CURRENT_STATE_SEPARATED=true
UNKNOWN_IS_NOT_PASS=true
REUSE_BEFORE_CREATE=true
ONE_SYSTEM_ONLY=true
NEXT_CURSOR=!RECONCILIAR
```

## BOOT

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
