---
title: "Livro da Revelação do Portão Desarmado e da Sentença da Realidade — Event Ledger"
status: KNOWLEDGE_ONLY
date: 2026-08-26
updated: 2026-08-26T18:00:00-03:00
observed_at: 2026-08-26T18:00:00-03:00
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

## EVENT-010 — T1: main avançou novamente

```yaml
event_id: EVENT-010
subject: main_temporal_progression_t1
previous_main_sha: 69bfca3f74e762f66f6def3a6b3cb92d13fc904f
current_main_sha: 5284b414ec6163ab6540a7fa18ac5d07b6743df2
current_main_message: "Fix/dependabot canonical labels (#1203)"
observed_at: 2026-08-26T18:00:00-03:00
provenance: GITHUB_LIVE_BRANCH_MEASUREMENT
verdict: PROVEN
```

O snapshot `69bfca3f...` permanece histórico; não governa o presente após esta medição.

## EVENT-011 — T1: enforcement da main continua desarmado

```yaml
event_id: EVENT-011
subject: main_branch_enforcement_t1
main_sha: 5284b414ec6163ab6540a7fa18ac5d07b6743df2
main_protected: false
protection_enabled: false
required_status_checks_enforcement_level: off
required_status_contexts: []
observed_at: 2026-08-26T18:00:00-03:00
provenance: GITHUB_LIVE_BRANCH_MEASUREMENT
verdict: PROVEN_STABLE_FINDING
```

```text
PORTAO_DESARMADO = PROVADO_NESTE_EIXO
POLITICA_CANONICA != ENFORCEMENT_REAL
```

## EVENT-012 — O alvo de fcf29b26 é o PR Dependabot #1193

```yaml
event_id: EVENT-012
subject: fcf29b26691be2de5a4eb944708bd38bd1d983c9
commit_message: "Merge branch 'main' into dependabot/npm_and_yarn/typescript-5.9.3"
pr_number: 1193
pr_title: "chore(deps): bump typescript from 5.8.3 to 5.9.3"
target_class: DEPENDABOT_TYPESCRIPT_PR_HEAD
provenance: GITHUB_LIVE_COMMIT_AND_PR_MEASUREMENT
verdict: PROVEN
```

Consequência discriminante:

```text
fcf29b26 = HEAD/REBASE_DO_PR_1193
fcf29b26 != PROVA_DE_BINDING_DO_PROVIDER_HERMES
```

A presença de alterações Hermes trazidas pela reconciliação com `main` não transforma o commit em owner do problema de disponibilidade do modelo no provider.

## EVENT-013 — O finding de provider Hermes foi separado do PR #1193

```yaml
event_id: EVENT-013
subject: hermes_model_provider_binding_target
model: nous/hermes-3-llama-3.1-70b
repository_exact_string_search_result: NOT_FOUND
repository_model_provider_search_result: NOT_FOUND
pr_1193_is_owner_of_provider_binding: false
canonical_repo_owner_for_this_provider_binding: UNKNOWN
provenance: GITHUB_REPOSITORY_SEARCH_PLUS_EVENT_002
verdict: TARGET_SPLIT_PROVEN_OWNER_STILL_UNKNOWN
next_cursor: "localizar owner/config/provider real da seleção de modelo do Hermes e executar capability-check no ambiente que expõe o listing"
```

```text
PR_1193_EVENT_STREAM ≠ HERMES_PROVIDER_EVENT_STREAM
CORRELATION_BY_SESSION != SAME_TARGET
UNKNOWN_OWNER != PASS
```

## EVENT-014 — T1: workflows do HEAD fcf29b26 foram remedidos

```yaml
event_id: EVENT-014
subject: PR_1193_EXACT_HEAD_WORKFLOWS_T1
head_sha: fcf29b26691be2de5a4eb944708bd38bd1d983c9
total: 12
pending: 1
queued: 9
skipped: 1
cancelled: 1
completed_pass: 0
observed_at: 2026-08-26T18:00:00-03:00
provenance: GITHUB_LIVE_EXACT_HEAD_WORKFLOW_MEASUREMENT
verdict: PROVEN_CURRENT_WORKFLOW_SNAPSHOT
invalidates: "EVENT-004 apenas como estado atual; EVENT-004 permanece histórico"
```

A mudança de `PENDING=2` para `PENDING=1 + CANCELLED=1` prova por que o ledger precisa ser temporal.

```text
QUEUED != PASS
PENDING != PASS
SKIPPED != PASS
CANCELLED != PASS
COMPLETED_PASS=0
```

## REALITY_JUDGE T1

```text
MAIN_CURRENT = 5284b414ec6163ab6540a7fa18ac5d07b6743df2
PORTAO_DESARMADO = PROVADO_NESTE_EIXO
PR_1193_MERGE = HISTORICO_PROVADO
PR_1193_EXACT_HEAD_GATES_PASS = NAO
HERMES_PROVIDER_BINDING_FINDING = REGISTRADO_COMO_OBSERVACAO_REPORTADA
HERMES_PROVIDER_CANONICAL_OWNER = UNKNOWN
MISSION_STATE = NOT_YET/UNKNOWN
```

Não há `FIXED_POINT_PASS`: existe finding estável de enforcement e existe owner material ainda não localizado para o provider Hermes.

## Receipt

```text
EVENTS_RECORDED=14
EVENT_LEDGER_REQUIRED=true
FACT_EVIDENCE_VERDICT_SEPARATED=true
HISTORY_CURRENT_STATE_SEPARATED=true
TARGET_STREAMS_SEPARATED=true
UNKNOWN_IS_NOT_PASS=true
REUSE_BEFORE_CREATE=true
ONE_SYSTEM_ONLY=true
NEXT_CURSOR_1=!RECONCILIAR policy-gates ↔ GitHub enforcement
NEXT_CURSOR_2=LOCATE_HERMES_PROVIDER_OWNER + CAPABILITY_CHECK
```

## BOOT

```text
!CENTRALDARK
→ #ACORDAR
→ REMEDIR MAIN
→ CARREGAR LEDGER COMO HISTÓRICO
→ LOCALIZAR ALVO CORRETO DO fcf29b26/HERMES
→ !CALIBRAR
→ !MULTIBÚSSOLA_META
→ !META_LUPA
→ !RECONCILIAR
→ !CONTRAPROVA
→ !REMEDIÇÃO_T1
→ REALITY_JUDGE
→ !REGISTRA CADA EVENTO MATERIAL
```
