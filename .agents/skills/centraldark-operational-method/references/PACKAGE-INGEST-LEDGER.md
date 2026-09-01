# PACKAGE INGEST LEDGER — CentralDark

**Owner canônico:** `.agents/skills/centraldark-operational-method/SKILL.md`  
**Parent reference:** `.agents/skills/centraldark-operational-method/references/PR-HOUSE-TEMPORAL-RECONCILIATION.md`

Este ledger é uma superfície subordinada de proveniência para pacotes históricos entregues ao mesmo writer/PR. Ele **não cria novo owner, nova skill, novo workflow, novo cérebro ou nova autoridade**.

```text
REUSE_BEFORE_CREATE=true
ONE_SYSTEM_ONLY=true
HISTORICAL_PACKAGE != CURRENT_RUNTIME
PACKAGE_HASH = INGEST_IDENTITY, NOT SEMANTIC_PROOF
VISUAL_CLAIM != RUNTIME_PROOF
UNKNOWN != PASS
RAW_SENSITIVE_EXPORT != SAFE_REPO_CONTEXT
```

## Pipeline canônico

```text
PACKAGE
→ HASH / ORIGIN / DATE
→ SENSITIVE SCREEN
→ CLASSIFY
→ DEDUPE
→ OWNER MATCH
→ EXTRACT USEFUL DELTA
→ COUNTERPROVE
→ CURRENT | ABSORBED | SUPERSEDED | HISTORICAL | DUPLICATE | SENSITIVE_QUARANTINE | UNKNOWN
→ SAME PR / SAME OWNER WHEN MATERIAL
```

Nada deste ledger transforma snapshot, visual, README, ZIP ou histórico em estado vivo.

---

## Batch 2026-09-01 — #ACORDAR

### 1. CentralDark-Pombo-Owner-FailClosed-20260824.zip

```text
SHA256=608f9e60d9d1b89f612b585687877243076978de283d893633a6ec976adf23ed
CLASS=ABSORBED_BY_CURRENT_MAIN + HISTORICAL_PROVENANCE
```

Delta útil:

```text
PATH_LITERAL_REFERENCE != OWNER_VERIFICATION
OWNER_EXISTS != OWNER_CONTRACT_VALID
OWNER_DELETE_MUST_FAIL_CLOSED=true
OWNER_INVARIANT_REGRESSION_MUST_FAIL_CLOSED=true
```

O pacote nasceu da ferida observada no PR #1136: verificar apenas o texto do caminho do owner permitia falso verde. O `main` atual já abre/verifica diretamente `docs/CONSCIENCIA/02-PROTOCOLO-HANDOFF-IA.md` no `verify_repo_contract.py`; portanto **não reaplicar patch histórico cegamente**. Preservar a contraprova como padrão reutilizável.

`CentralDark-Pombo-Owner-FailClosed-20260824 (1).zip` possui o mesmo SHA-256 e é `EXACT_DUPLICATE`.

### 2. CENTRALDARK_VISUAL_RECONCILIATION_20260824.zip

```text
SHA256=64bdaaa469b503d3693e1b769d8ce0aeecbd98948a740a25b7948266cfcc0150
CLASS=HISTORICAL_USEFUL_DELTA
```

Delta útil:

```text
IMAGE != DOCUMENTATION
DOCUMENTATION != DIAGRAM
VISUAL_CLAIM != RUNTIME_PROOF
REALITY = JUDGE
ONE_ARTIFACT_FAMILY_PER_VISUAL=true
```

Lente investigativa preservada:

```text
FISICO
→ TEMPORAL
→ CAUSAL
→ COUNTERPROOF
→ PROOF
```

Handoff `IMAGE → MARKDOWN → MERMAID → ZIP` é exigência de **família visual/handoff quando houver consumidor**, não custo obrigatório de toda missão de código.

### 3. CENTRALDARK_SESSION_MASTER_HANDOFF.zip

```text
SHA256=81479e1e9a049b556415d7c7d06a5ec1006ae06b881a813dc51f31b3bf61e6cf
CLASS=HISTORICAL_USEFUL_DELTA
```

Delta útil:

```text
PACKAGE_FIXED_POINT != GLOBAL_SYSTEM_FIXED_POINT
SUPERSEDED_HISTORY != CANONICAL_CURRENT
NO_NEW_INFORMATION → NO_CHANGE → FIXED_POINT_CHECK
```

Artefato reprovado/corrigido deve permanecer rastreável como `SUPERSEDED_BY_COUNTERPROOF`, fora da área canônica, em vez de ser apagado ou confundido com o atual.

A seção 7 de um handoff visual e o 7º nó de um BOOT são identificadores de domínios diferentes: **posição/número textual não cria equivalência semântica**.

### 4. CENTRALDARK_REVISAO_FIEL_READ_ONLY.zip

```text
SHA256=a93e63f5f03a85db173f649ee8aa94e6815de51c3ca34c1507c3158146789f58
CLASS=HISTORICAL_USEFUL_DELTA
```

Delta útil:

```text
EVENT != NEW_INTENT
FILE_SAVED != NEW_MISSION
TEST_FAILED != SECOND_SYSTEM
COMMAND != AUTHORITY
MODEL != OWNER
```

Evento que pertence a uma missão ativa deve ser agregado/coalescido na mesma intenção quando possível. Não criar `centraldark.run`, nova fachada universal ou entrypoint paralelo até provar gap real no entrypoint vivo existente.

Visual pack é condicional ao consumidor:

```text
VISUAL_HANDOFF_REQUIRED → IMAGE/MARKDOWN/MERMAID/ZIP
ELSE → DO_NOT_EMIT_UNUSED_ARTIFACT
```

### 5. CENTRALDARK_OURO_RUNTIME_SKILLS_PACK.zip

```text
SHA256=1a036a0b59de1ac0ba85ca4cf2d2e127df95f6032f560c08a9d9962de330e2a2
CLASS=HISTORICAL_USEFUL_DELTA
```

Padrão semântico de skill preservado:

```text
TRIGGER
→ MEASURE
→ DIAGNOSE
→ DISCRIMINATING_TEST
→ MINIMAL_REMEDIATION
→ RETEST
→ COUNTERPROOF
→ RECEIPT
→ CRYSTALIZE_REUSABLE_DELTA
→ FIXED_POINT_CHECK
```

Skill material deve declarar quando aplicável: owner, consumidores, estado medido, assinatura de falha, menor remediação, pós-condições executáveis, contraprova, proveniência, receipt, critério de stale/revalidação e limites de UNKNOWN.

Deltas de dependência relatados historicamente devem ser consolidados como cristais/receitas sob owner existente antes de criar vários owners/skills novos:

```text
MANY_FAILURE_SIGNATURES
→ ONE_DEPENDENCY_CAPABILITY
→ MANY_REUSABLE_CRYSTALS
```

O pacote contém um `PREVIOUS_MASTER_HANDOFF.zip` com SHA-256 `bbd5e6551c9c186e2546ec741e24b18cf895cea2334613a529567fe4f95b0dcb`; nested provenance não é automaticamente reingerida como novo conhecimento.

### 6. CENTRALDARK-CONTRATO-TOTAL-20260901(1).zip

```text
SHA256=7cab9492488419326fad5e227e77320c22f68be2dd7e6487c35486803878a60b
CLASS=CURRENT_DAY_PACKAGE + CANDIDATE_DELTA
```

O pacote registrou `main=b8053aae3acd3308b48476210aea911c60f3d7e5`, que coincide com o `main` remoto observado nesta rodada; isso aumenta a proveniência temporal, mas não prova runtime local.

Delta útil compatível:

```text
CASA + GITHUB + DRIVE + SESSIONS/LOGS
→ PARALLEL_READERS
→ RENDEZVOUS
→ RECONCILE
→ OWNER EXISTENTE
→ ONE_WRITER_PER_SCOPE
→ PATCH_MINIMUM
→ FALSIFIER
→ REMEASURE
→ REALITY_JUDGE
```

Regras preservadas:

```text
DRIVE = DURABLE_CONTINUITY, NOT AUTHORITY
ONE_ROUTE_FAILED != MISSION_FAILED
#CRISTALIZAR = PHASE_MARKER, NOT NEW_ENGINE
ALIAS != NEW_ENGINE
PHASE_MARKER != NEW_OWNER
```

Identidade de prova Git quando aplicável:

```text
TESTED_HEAD == COMMITTED_HEAD == PUSHED_PR_HEAD
```

Remeasure deve comparar T1 contra o mesmo alvo semântico de T0; mudar alvo durante a verificação invalida a comparação.

### 7. CENTRALDARK_INSTINTO_SUPERIOR_EMERGENTE_PACK(1).zip

```text
SHA256=495b1c1e02db07b342d0238368b110a449591116deaa306482e368484c3d1637
CLASS=HISTORICAL_USEFUL_DELTA / MOSTLY_ABSORBED
```

Delta útil:

```text
NOVELTY_REAL → DEEPER_DELIBERATION
PROVEN_PATTERN → CANONICAL_REFLEX
MATERIAL_ERROR → SIGNATURE → CAUSE → TEST → REMEDIATION → COUNTERPROOF → CRYSTAL
NO_NEW_INFORMATION → NO_CHANGE
LAST_GOOD_STATE = NEXT_EXECUTION_BASELINE
ENGINE_SWITCH != RESET
```

`CANONICAL_REFLEX` significa reutilizar padrão provado com gates/evidência, não pular julgamento ou contraprova.

### 8. CENTRALDARK_MAPA_CANONICO_DA_CASA_PACK(1).zip

```text
SHA256=a944be155d5076bff8a1afaf9700f21d4b6a18498c69b523ea66c139d22d3bc6
CLASS=HISTORICAL_USEFUL_DELTA + PARTIAL_CURRENT_ABSORPTION
```

Delta útil:

```text
PROSE_ONLY_RULE = NOT_LEARNED
DOCUMENTED_ONLY_RULE = NOT_LEARNED
REPEATED_CHEFE_INSTRUCTION_AFTER_PROMOTION = LEARNING_TRANSFER_FAIL
ENGINE != OWNER
ENGINE_SWITCH != RESET
```

Qualquer `PR/commit` usado como prova precisa ser remedido no HEAD realmente julgado.

O pacote histórico declara regra de runner de forma absoluta. O `main` atual refinou esse contrato e possui exceções explícitas para workflows manuais cuja função é recuperar/forensicar o próprio executor. Portanto:

```text
HISTORICAL_SELF_HOSTED_ONLY_ABSOLUTE_RULE = SUPERSEDED_BY_CURRENT_MAIN_REFINEMENT
CURRENT_MAIN_POLICY_WINS=true
```

### 9. CENTRALDARK_MAPA_CANONICO_DA_CASA_2_0_CARD_RODADA_1138.png

```text
SHA256=e1c7e43e542ea92e94e447cf690b9479e786d97747e1102a938fb5d0914ee853
DIMENSIONS=1652x952
CLASS=HISTORICAL_VISUAL_PROVENANCE
RELATED_PR=#1138
```

O PR #1138 foi mergeado, mas o review daquele candidato encontrou falso verde de single-writer e snapshot/HEAD stale. Logo, qualquer selo `APROVADO`, status verde ou fixed point desenhado no card é **estado histórico escopado à rodada**, nunca runtime atual.

```text
HISTORICAL_GREEN != CURRENT_PASS
VISUAL_APPROVED != CURRENT_RUNTIME_PROOF
FIXED_POINT_MUST_DECLARE_SCOPE=true
```

### 10. cf609eae-5f01-45ed-a8ab-a34248c89a54.zip

```text
SHA256=f9a2a1427d0737070f105aa2c24feb7d5878ef993b3b3d52cea1e1d1852e9bf6
CLASS=SENSITIVE_QUARANTINE + SELECTIVE_MINING_ONLY
```

O export contém classes de dados de autenticação/sessão/chaves e também um backend de conversas/projetos. Por isso o ZIP bruto **não entra no repositório, não entra em prompt canônico e não é copiado para artifacts do PR**.

Somente metadados estruturais não sensíveis foram usados para triagem. Há material histórico potencialmente relacionado a CentralDark, mas qualquer mineração futura deve seguir:

```text
RAW_EXPORT
→ DO_NOT_READ_AUTH_VALUES
→ SECRET_SCRUB
→ SELECT_RELEVANT_CONVERSATION
→ EXTRACT_SEMANTIC_DELTA_ONLY
→ DEDUPE_AGAINST_CURRENT_OWNER
→ COUNTERPROVE
→ PERSIST_ONLY_NON_SENSITIVE_DELTA
```

`SENSITIVE_QUARANTINE` não significa irrelevante; significa que o **método de ingestão precisa ser mais restrito**.

### 11. Duplicatas exatas já processadas

```text
CentralDark-Arvores(1).zip
SHA256=a7ae1466976733bc76e1906ce5958b267a0648d87b6af8195d740738ff413fdb
= EXACT_DUPLICATE de CentralDark-Arvores.zip já reconciliado

CentralDark-Cleanup-ProofDriven-20260824-114754(1).zip
SHA256=3ac861fa672aa065edc9a62bb53b96f2099f68dccfb3b95c740778aca2b94233
= EXACT_DUPLICATE do pacote já reconciliado

CentralDark-Pombo-Owner-FailClosed-20260824 (1).zip
SHA256=608f9e60d9d1b89f612b585687877243076978de283d893633a6ec976adf23ed
= EXACT_DUPLICATE do pacote Pombo desta rodada
```

Regra:

```text
BYTE_IDENTICAL_PACKAGE
→ PROCESS_ONCE
→ KEEP_PROVENANCE
→ NO_SECOND_DELTA
```

---

## Deltas generalizados deste batch

```text
1. VERIFY_REAL_OWNER, NOT PATH_LITERAL_ONLY
2. VISUAL_CLAIM != RUNTIME_PROOF
3. FIVE_LENSES = PHYSICAL → TEMPORAL → CAUSAL → COUNTERPROOF → PROOF
4. EVENT != NEW_INTENT; COALESCE INTO ACTIVE MISSION WHEN MATERIAL
5. SKILL_REQUIRES_CONSUMER + DISCRIMINATING_TEST + STALE_REVALIDATION
6. CROSS_SURFACE_READERS → RENDEZVOUS → ONE_WRITER
7. TESTED_HEAD == COMMITTED_HEAD == PUSHED_PR_HEAD
8. PROVEN_PATTERN → CANONICAL_REFLEX; NOVELTY → DELIBERATION
9. FIXED_POINT_MUST_DECLARE_SCOPE
10. HISTORICAL_ABSOLUTE_RULE_CAN_BE_SUPERSEDED_BY_CURRENT_MAIN_REFINEMENT
11. SENSITIVE_EXPORT → QUARANTINE + SELECTIVE_SANITIZED_MINING
12. EXACT_DUPLICATE → PROCESS_ONCE, KEEP_PROVENANCE
```

## Gate de absorção

Um delta deste ledger só deve subir de `HISTORICAL/CANDIDATE` para regra operacional quando:

```text
OWNER_CURRENTLY_EXISTS
AND CONSUMER_EXISTS
AND CURRENT_STATE_REMEASURED
AND DELTA_NOT_ALREADY_ABSORBED
AND POSITIVE_TEST
AND NEGATIVE_TEST_WHEN_MATERIAL
AND COUNTERPROOF_SURVIVES
AND SAME_HEAD_IDENTITY
AND RECEIPT_PERSISTED
```

Caso contrário, permanece `HISTORICAL`, `SUPERSEDED`, `SENSITIVE_QUARANTINE`, `DUPLICATE` ou `UNKNOWN`.
