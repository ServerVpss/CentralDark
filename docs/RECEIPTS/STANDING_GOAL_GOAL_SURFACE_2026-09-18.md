# 🧾 RECEIPT — Standing Goal + /goal cristalizado no mesmo runtime

```text
DATE=2026-09-18
AUTHORITY=SEGREDO/CHEFE
PR=#1578
BRANCH=cristal/direct-centraldark-mcp-bridge-20260918
HEAD=b3087e536ce28cc2b82556b5aceac144d892c6e5
OWNER_COT_REACT=.agents/skills/cot-react-loop/SKILL.md
OWNER_MASTER=docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/MASTER-CYCLE.yml
VALIDATOR=apps/modulos/HERMES-CORE/core/universal-method-contract.mjs
REUSE_BEFORE_CREATE=true
NO_NEW_ENGINE=true
NO_NEW_OWNER=true
NO_PARALLEL_ARCHITECTURE=true
```

## Intenção

Cristalizar o comportamento material observado antes de `/goal` sem copiar valores
transitórios de uma missão específica como se fossem arquitetura. O delta preservado
é o mecanismo: contrato de fase, goal pai estável, micro-goal derivado da ferida atual,
continuação até evidência material e `/goal` como introspecção read-only.

## Delta canônico

```text
STANDING_GOAL=ACTIVE
GOAL_PARENT=STABLE
MICRO_GOAL=DERIVED_FROM_CURRENT_WOUND
PHASE_CONTRACT=REHYDRATE_NOT_REINVENT
PREAMBLE_IS_PROGRESS=false
ITERATION_COUNTER_IS_PROGRESS=false
PLANNING_TEXT_IS_DELIVERABLE=false
MISSING_REQUIRED_EVIDENCE_FORCE_CONTINUE=true
```

Fluxo:

```text
OBSERVE
→ COMPARE_REQUIRED_DELIVERABLES
→ UPDATE_EVIDENCE_MAP
→ IF_SUCCESS_PREDICATE_PROVEN: STOP_SUCCESS
→ ELSE_IF_HUMAN_FRONTIER_OR_EXACT_BLOCKER: STOP_BLOCKED
→ ELSE_IF_NO_NEW_INFORMATION: STOP_POINT_FIXED
→ ELSE: CONTINUE_TOWARD_STANDING_GOAL
```

## Semântica de `/goal`

```text
/goal = READ_ONLY_INTROSPECTION
/goal != NEW_GOAL
/goal != AUTHORIZATION_EXPANSION
/goal != PROOF
```

`/goal` deve refletir:

```text
GOAL_PARENT
MISSION_ID
SUCCESS_PREDICATE
DELIVERABLES_REQUIRED
DELIVERABLES_PROVEN
DELIVERABLES_MISSING
CURRENT_HEAD_OR_BASELINE
CURRENT_WRITER
CURRENT_SCOPE
NEXT_CURSOR
```

## EXECUTE_WITH_JUDGMENT

```text
EXECUTE_WITH_JUDGMENT
= escolher o próximo passo dentro do escopo já autorizado
!= ampliar permissão
!= alterar superfície travada
!= ignorar writer lease
!= converter UNKNOWN em PASS
```

## Campo transitório não promovido

Valores específicos de uma execução, como `MISSION_ID` concreto, arquivo alvo temporário,
`CANDIDATE_REF`, `CANDIDATE_SHA256`, contadores `10/20`, plano em `/tmp` ou descrição
de uma tarefa pontual, permanecem provenance/runtime state. Não viraram owner nem contrato
canônico.

## Prova runtime VPS

Os três arquivos foram sincronizados de forma pontual no runtime VPS, com backup prévio:

```text
/root/CentralDark/.agents/skills/cot-react-loop/SKILL.md
/root/CentralDark/docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/MASTER-CYCLE.yml
/root/CentralDark/apps/modulos/HERMES-CORE/core/universal-method-contract.mjs
/root/.hermes/skills/cot-react-loop/SKILL.md
```

Hash da skill no repo runtime e no catálogo Hermes:

```text
0f9cc8379106d29d1e214a1eed77861a5b9aba0f3aa019d477cf7c8ad1ee8a3a
= repo runtime
= /root/.hermes/skills/cot-react-loop/SKILL.md
```

Validador:

```text
cot_react_standing_goal_contract=true
standing_goal_runtime_contract=true
goal_surface_is_read_only_introspection=true
iteration_counter_is_not_completion=true
UNIVERSAL_ENGINE_METHOD_SELF_TEST=PASS
EXIT=0
```

## PDF Gate

Após a mutação, o gate foi reexecutado na Casa:

```text
SECTOR=PDF_GATE
SECTOR_RESULT=PROBE_PASS
```

## Veredito

```text
STANDING_GOAL_CONTRACT=PASS
PHASE_CONTRACT_REHYDRATION=PASS
GOAL_READ_ONLY_SURFACE=PASS
ITERATION_COUNT_NOT_COMPLETION=PASS
RUNTIME_HERMES_SKILL_SYNC=PASS
HERMES_CORE_VALIDATOR=PASS
PDF_GATE_AFTER_MUTATION=PASS
PARALLEL_ARCHITECTURE_CREATED=NO
```

## Next cursor

```text
REMEASURE_CURRENT_HEAD
→ SAME_HEAD_CI
→ KEEP_PARENT_GOAL_STABLE
→ DERIVE_ONLY_NEXT_MICRO_GOAL_FROM_CURRENT_WOUND
```
