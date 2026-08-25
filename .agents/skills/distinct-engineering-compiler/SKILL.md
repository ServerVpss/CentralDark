---
name: distinct-engineering-compiler
description: Detecta engenharia distinta em qualquer matéria, prova lacunas contra o canônico e serializa somente o delta reutilizável até owner, consumidor, teste e gate reais. Compõe #ACORDAR, !CALIBRAR, Knowledge Compiler e MetaLupa sem criar cérebro paralelo.
---

# DISTINCT ENGINEERING COMPILER

## Função

Transformar sinais diferentes, falhas, issues/PRs vermelhos, correções humanas, documentos, runtimes e fontes externas em **lacunas comprováveis + menor delta reutilizável**, sem copiar owners existentes.

```text
HOUSE_WIDE=true
MODEL_NEUTRAL=true
SECOND_BRAIN=false
NEW_AUTHORITY=false
NEW_JUDGE=false
NEW_WRITER=false
REUSE_BEFORE_CREATE=true
ONE_SYSTEM_ONLY=true
REALITY_IS_JUDGE=true
ONE_WRITER_PER_SCOPE=true
PARALLELIZE_PERCEPTION=true
SERIALIZE_MUTATION=true
```

## Gatilho

Ativar quando qualquer destes sinais for material:

```text
#ACORDAR
!CALIBRAR
RED_ISSUE
RED_PR_OR_FAILED_CHECK
HUMAN_CORRECTION
NEW_DISTINCT_PATTERN
CONTRADICTION
REPEATED_FAILURE
SOURCE_WITH_TRANSFERABLE_ENGINEERING
```

`#ACORDAR` mede o mundo real. `!CALIBRAR` compara intenção + estado + owners + capacidades + prova. Esta skill entra **depois da medição e durante C3/C4**, quando existir suspeita de lacuna, engenharia diferente ou falha reutilizável.

## Owners compostos — não duplicar

```text
BOOT/ESTADO          = LEIA-ME-IA.md + AGENTS.md
EXECUCAO/HERMES      = .agents/skills/centraldark-operational-method/SKILL.md
MINERACAO/SINTESE    = .agents/skills/knowledge-compiler/SKILL.md
CONTRAPROVA          = .agents/skills/meta-lupa/SKILL.md
MATERIAL_INGEST      = .agents/skills/session-intelligence-harvester/SKILL.md
ROTEAMENTO/GATILHOS  = docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/
OWNER_FINAL          = dono canônico da capacidade afetada
```

A skill **compõe** esses donos; não redefine suas regras.

## Modelo operacional

```text
INTENCAO_VIGENTE
+ ESTADO_VIVO
+ MATERIAL_NOVO|RED_SIGNAL
→ INVENTORY
→ CLASSIFY_SIGNAL
→ FIND_CANONICAL_OWNER
→ COMPARE_CAPABILITY
→ DISTINCT_ENGINEERING?
   NAO → DUPLICATE|NO_CHANGE
   SIM → PROVE_MATERIAL_GAP
→ MAP_WORLD_STATE
→ ROUTE_SPECIALIST_OWNER
→ BUILD_GAP_RECORD
→ COUNTERPROOF
→ SERIALIZE_BY_SCOPE
→ ONE_WRITER
→ APPLY_MINIMAL_DELTA
→ RETEST_SAME_TARGET
→ REMEASURE_WORLD_STATE
→ REALITY_JUDGE
→ CRYSTALLIZE_IF_REUSABLE
→ NEXT_CURSOR
```

## Padrão generalizado: Guild Leader

Uma mesma classe de problema pode possuir múltiplos especialistas por área, mas cada ferida precisa ser roteada ao especialista aplicável e ao owner canônico real.

```text
PROBLEM_CLASS
+ AFFECTED_AREA
+ REQUIRED_CAPABILITY
→ SPECIALIST_CANDIDATES
→ CANONICAL_OWNER_RESOLUTION
→ ONE_OWNER_FOR_CAPABILITY
→ ONE_WRITER_PER_SCOPE
```

Regras:

```text
SPECIALIST != AUTHORITY
ROUTER != OWNER
LABEL != AUTHORITY
MULTIPLE_CAPABLE_ACTORS != MULTIPLE_WRITERS
WRONG_AREA_SPECIALIST = ROUTING_ERROR
```

## Padrão generalizado: World Change

Falha vermelha não é fotografia eterna. É um **estado do mundo** que precisa ser consultado novamente antes e depois da ação.

```text
WORLD_STATE_T0
+ ACTIONS/DECISIONS/EVENTS
→ STATE_TRANSITION
→ WORLD_STATE_T1
```

Aplicação CentralDark:

```text
ISSUE|PR|CI|RUNTIME_STATE
→ OBSERVED_AT + HEAD/SHA + TARGET
→ ACTIVE|RESOLVED|SUPERSEDED|DRIFTED|UNKNOWN
→ AÇÃO SOMENTE SOBRE ESTADO ATUAL
→ T0_T1
→ EFEITO MEDIDO
```

```text
HISTORY != CURRENT_STATE
RED_YESTERDAY != RED_NOW
GREEN_NOW_WITHOUT_SAME_TARGET_PROOF != PASS
STATE_CHANGE_INVALIDATES_STALE_ASSUMPTIONS=true
```

## RED GAP lane — issues/PRs vermelhos

Para cada item vermelho:

```text
RED_ITEM
→ READ_CURRENT_ITEM
→ READ_CURRENT_HEAD/CHECKS/COMMENTS/RELATED_OWNER
→ DEDUPE_BY_FAILURE_SIGNATURE
→ CLASSIFY:
   TRANSIENT
   REPEATED
   STRUCTURAL
   GOVERNANCE
   RUNTIME
   ROUTING
   STALE/SUPERSEDED
   UNKNOWN
→ LOCATE_OWNER
→ SEARCH_EXISTING_CRYSTAL
→ GAP = EXPECTED_CAPABILITY - CURRENT_PROVEN_CAPABILITY
→ COUNTERPROOF_GAP
→ SERIAL_QUEUE_BY_MUTATION_SCOPE
→ EXECUTE_IF_AUTHORIZED
→ RETEST
→ UPDATE_STATE/RECEIPT
```

### Registro mínimo da lacuna

```yaml
GAP_RECORD:
  item: issue|pr|check|runtime
  target: ""
  observed_at: ""
  head_sha: ""
  failure_signature: ""
  state: ACTIVE|RESOLVED|SUPERSEDED|DRIFTED|UNKNOWN
  class: TRANSIENT|REPEATED|STRUCTURAL|GOVERNANCE|RUNTIME|ROUTING|UNKNOWN
  expected_capability: ""
  observed_capability: ""
  material_gap: ""
  canonical_owner: ""
  existing_crystal: "NONE|ref"
  writer: "NONE|id"
  proof_required: ""
  next_cursor: ""
```

## Serialização cognitiva e de mutação

Percepção pode fan-out; mutação nunca disputa a mesma ferida.

```text
N_READERS
→ NORMALIZE_EVIDENCE
→ DEDUPE
→ GROUP_BY_FAILURE_SIGNATURE
→ GROUP_BY_MUTATION_SCOPE
→ ORDER_BY_DEPENDENCY_AND_BLAST_RADIUS
→ ONE_WRITER_EACH_SCOPE
→ MUTATE_ONE_SCOPE_AT_A_TIME
→ RETEST_BEFORE_NEXT_DEPENDENT_SCOPE
```

Se dois itens vermelhos compartilham causa, corrigir o owner/cause uma vez e revalidar ambos. Não criar dois remendos.

```text
SAME_CAUSE + SAME_OWNER → ONE_FIX_MANY_REVALIDATIONS
SAME_FAILURE_NO_NEW_INFO → REUSE_CRYSTAL
DIFFERENT_SYMPTOM_SAME_CAUSE → DO_NOT_DUPLICATE_FIX
```

## Lacuna real vs ruído

Só existe gap promovível se sobreviver:

```text
CURRENT_STATE_OBSERVED
+ EXPECTATION_FROM_CANONICAL_OWNER
+ SAME_TARGET_COMPARISON
+ MATERIAL_IMPACT
+ COUNTERPROOF
→ PROVEN_GAP
```

Bloqueios:

```text
PATH_EXISTS != CAPABILITY_ACTIVE
DOCUMENTED != EXECUTED
PR_OPEN != GAP
ISSUE_RED != ROOT_CAUSE
ACTION != PROOF
UNKNOWN != PASS
CORRELATION != CAUSE
```

## Engenharia distinta → transferência

Quando uma fonte externa ou comportamento trouxer padrão útil:

```text
SOURCE_PATTERN
→ ABSTRACT_FUNCTION
→ REMOVE_DOMAIN_LORE
→ MAP_TO_HOUSE_CAPABILITY
→ CHECK_EXISTING_OWNER
→ TEST_TRANSFER_ON_NEW_CONTEXT
→ COUNTERPROOF
→ ABSORB_MINIMAL_DELTA
```

Não importar nomes, números, personagens, topologia ou política da fonte como autoridade.

```text
SOURCE_IS_PROVENANCE_NOT_AUTHORITY=true
TRANSFER_REQUIRES_NEW_CONTEXT=true
NO_BLIND_ANALOGY=true
```

## Critério de sucesso

```text
DISTINCT_ENGINEERING_COMPILER=PASS somente se:
- estado atual foi medido;
- item vermelho foi classificado;
- owner canônico foi resolvido;
- duplicata/causa compartilhada foi deduplicada;
- gap foi provado no mesmo alvo;
- mutação foi serializada por escopo;
- teste/remedição mediu T0→T1;
- conclusão passou por contraprova;
- aprendizado reutilizável foi para owner/cristal existente.
```

## Anti-teatro

```text
SKILL_CREATED != BOOT_BOUND
BOOT_REFERENCE != RUNTIME_EXECUTION
RED_SCAN != RED_FIX
MANY_AGENTS != MORE_PROOF
MODEL_NAME != SPECIALIST_OWNER
SELF_PROOF != PASS
```

Se a ligação com boot/runtime ainda for apenas contratual, declarar `CONTRACT_BOUND_RUNTIME_NOT_PROVEN` até existir consumidor + teste + gate observáveis.
