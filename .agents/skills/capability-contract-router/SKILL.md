---
name: capability-contract-router
description: Roteia missões por capacidade mensurável, território semântico, owner canônico e handoff explícito. Papel, nome de agente ou motor não substituem contrato de capacidade.
---

# CAPABILITY CONTRACT ROUTER

## Função

Converter intenção + estado vivo + capacidade requerida em uma rota determinística para owner/consumer/executor aplicável, sem confundir identidade, papel, ferramenta, motor, Writer ou autoridade.

```text
HOUSE_WIDE=true
MODEL_NEUTRAL=true
NEW_AUTHORITY=false
NEW_OWNER=false
NEW_WRITER=false
NEW_JUDGE=false
REUSE_BEFORE_CREATE=true
ONE_SYSTEM_ONLY=true
REALITY_IS_JUDGE=true
```

## Princípio

```text
PAPEL != IDENTIDADE
NOME != CAPACIDADE
CAPACIDADE != AUTORIDADE
ROUTER != OWNER
WRITER != AUTORIDADE_HUMANA
MOTOR != OWNER
```

O SEGREDO/CHEFE define intenção. SOL reconcilia. Esta skill apenas resolve a rota material. HERMES executa quando aplicável. Reality Judge decide pelo efeito provado.

## Entrada

```yaml
CAPABILITY_REQUEST:
  intent: ""
  target: ""
  semantic_territory: ""
  required_capability: ""
  current_state_ref: ""
  authority_scope: ""
  mutation_scope: ""
  proof_target: ""
```

## Fluxo

```text
CAPABILITY_REQUEST
→ MEASURE_CURRENT_STATE
→ RESOLVE_SEMANTIC_TERRITORY
→ SEARCH_EXISTING_CAPABILITY
→ IDENTIFY_CANONICAL_OWNER
→ ENUMERATE_AVAILABLE_PROVIDERS
→ FILTER_BY_AUTHORITY
→ FILTER_BY_CURRENT_AVAILABILITY
→ FILTER_BY_SCOPE
→ FILTER_BY_PROOF_REQUIREMENTS
→ SELECT_LOWEST_SUFFICIENT_ROUTE
→ BUILD_HANDOFF_CONTRACT
→ ACQUIRE_ONE_WRITER_IF_MUTATION
→ EXECUTE_OR_HANDOFF
→ RETEST_SAME_TARGET
→ REALITY_JUDGE
→ RECEIPT + NEXT_CURSOR
```

## Contrato de capacidade

```yaml
CAPABILITY_CONTRACT:
  capability: ""
  territory: ""
  owner: ""
  provider: ""
  available: true|false|unknown
  evidence: ""
  input_contract: ""
  output_contract: ""
  side_effect_scope: ""
  writer: "NONE|id"
  rollback: ""
  proof_target: ""
  next_cursor: ""
```

## Handoff

```yaml
HANDOFF:
  from: ""
  to: ""
  capability: ""
  target: ""
  state_ref: ""
  authorized_scope: ""
  expected_output: ""
  proof_required: ""
  return_cursor: ""
```

Handoff não transfere autoridade humana e não cria novo Writer automaticamente.

```text
HANDOFF != AUTHORITY_TRANSFER
HANDOFF != WRITER_LEASE
HANDOFF != PROOF
```

## Roteamento por território

Território é contexto operacional, não pasta obrigatória.

```text
REPOSITORY
CI_PIPELINE
RUNTIME
TOOLS
MEMORY_GRAPH
OBSERVABILITY
VISUAL_UI
BOUNDARY_GOVERNANCE
DOCUMENTATION
NETWORK_SERVICE
UNKNOWN
```

Quando um target cruza territórios, decompor por dependência e serializar somente as mutações conflitantes.

## Recuperação quando capacidade está ausente

Padrão cristalizado de território degradado:

```text
REQUIRED_CAPABILITY
→ AVAILABLE? 
   YES → ROUTE
   NO  → CONTAIN_SCOPE
       → IDENTIFY_RECOVERY_OWNER
       → MINIMUM_RECOVERY_RESOURCE
       → REPAIR_ROUTE
       → REMEASURE_CAPABILITY
       → ROUTE_OR_ESCALATE_HUMAN_FRONTIER
```

```text
CAPABILITY_NOT_MEASURED=UNKNOWN
UNKNOWN != AVAILABLE
DEPENDENCY_CRITICAL_MISSING != SILENT_DEGRADE
```

## Serialização

```text
PARALLEL_PERCEPTION=true
SERIALIZE_MUTATION=true
ONE_WRITER_PER_SCOPE=true
```

Múltiplos providers podem perceber; somente o Writer aplicável altera um escopo por vez.

## Prova

PASS exige:

```text
SAME_TARGET
+ CURRENT_STATE
+ CAPABILITY_EVIDENCE
+ OWNER_RESOLVED
+ AUTHORITY_PRESERVED
+ OUTPUT_CONTRACT_SATISFIED
+ T0_T1_WHEN_MUTATED
+ EXTERNAL_JUDGE_WHEN_APPLICABLE
```

## Anti-teatro

```text
ROLE_LABEL != CAPABILITY_PROOF
PROVIDER_LISTED != PROVIDER_AVAILABLE
TOOL_INSTALLED != TOOL_WORKING
HANDOFF_CREATED != WORK_DONE
ACTION != PROOF
SELF_PROOF != PASS
```

## Composição

```text
BOOT/STATE       → LEIA-ME-IA.md + AGENTS.md
GAP_DISCOVERY    → distinct-engineering-compiler
SIGNAL/TERRITORY → signal-territory-crystallizer
COUNTERPROOF     → meta-lupa
EXECUTION        → centraldark-operational-method / HERMES
TRIGGERING       → CENTRALDARK-TRIGGER-FABRIC
```
