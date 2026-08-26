---
name: capability-contract-router
description: Roteamento determinístico e mensurável de tarefas para capacidades, papéis e handoffs no CentralDark, sem transformar modelo em identidade nem ampliar autoridade.
status: CANONICAL
owner: SEGREDO/CHEFE
runtime_role: SOL_COORDINATES_HERMES_EXECUTES_ENGINES_ARE_REPLACEABLE
boot_required: true
---

# Capability Contract Router

## Finalidade

Transformar intenção + estado vivo + capacidades observadas em uma atribuição operacional reproduzível.

```text
FASE_ATUAL
+ INTENCAO
+ ESTADO_VIVO
+ RISCO
+ ESCOPO
+ REQUIRED_CAPABILITIES
+ LIVE_CANDIDATES
+ WRITER_SCOPE
+ BOUNDARY
+ PROOF_TARGET
→ FILTER
→ COVER
→ ASSIGN
→ MENOR_CONJUNTO_SUFICIENTE
→ HANDOFF_CONTRACT
→ EXECUTE
→ RECEIPT
→ REMEASURE
```

Mesma entrada observável + mesmo estado + mesmas capacidades disponíveis + mesmos limites devem produzir a mesma rota determinística, salvo mudança explícita no critério de desempate ou nova evidência.

```text
SAME_INPUT_STATE_CAPABILITIES_BOUNDARY
→ SAME_ROUTE_EXPECTED=true
MODEL_FEELING_ROUTING=FORBIDDEN
```

Esta skill não cria personagem, autoridade ou segundo orquestrador.

```text
MODEL != ROLE
ROLE != IDENTITY
ROLE != AUTHORITY
CAPABILITY != EXECUTION
ASSIGNMENT != PROOF
SEGREDO/CHEFE = AUTHORITY_FINAL
SOL = COORDINATION
PIVETE/HERMES = EXECUTION + PRESERVATION + CONTINUITY
REALITY = JUDGE
```

## Origem generalizada

A inspiração veio de padrões observáveis de sistemas com papéis sobrepostos, contratos estáveis e progresso por limiar:

- uma entidade pode cumprir mais de uma função; categoria funcional não é identidade exclusiva;
- um serviço pode manter contrato uniforme e exceções explícitas;
- uma missão coletiva pode depender de metas, janelas temporais, sincronização e limiares mensuráveis;
- recompensa/avanço só ocorre quando o denominador aplicável fecha.

A proveniência é externa; a implementação abaixo é neutra e pertence ao método da Casa.

## Gatilho obrigatório

Carregar quando uma missão precisar selecionar agente/modelo/tool/papel por capacidade, dividir trabalho, produzir handoff, reconciliar múltiplos candidatos, escolher destino de um delta útil ou provar que a cobertura funcional está completa.

```text
TRIGGER = MULTI_CANDIDATE | MULTI_ROLE | HANDOFF | CAPABILITY_GAP | ROUTING_DECISION | DELTA_HARVEST_DESTINATION
BOOT_DISCOVERABLE=true
DETERMINISTIC_ROUTING_REQUIRED=true
MEASURABLE_COVERAGE_REQUIRED=true
FAIL_CLOSED_ON_CAPABILITY_GAP=true
ONE_WRITER_PER_SCOPE=true
EXISTING_OWNER_FIRST=true
```

Tarefa simples, de candidato único e sem ambiguidade pode atravessar a skill em fast-path sem fan-out.

## Contrato de entrada

```json
{
  "task": {
    "task_id": "string",
    "phase": "phase-or-null",
    "intent_ref": "current-human-intent-or-null",
    "live_state_ref": "observed-state-or-null",
    "risk": "R0-R4-or-null",
    "scope": "scope-or-null",
    "required_capabilities": ["capability"],
    "optional_capabilities": ["capability"],
    "forbidden_capabilities": ["capability"],
    "writer_scope": "scope-or-null",
    "proof_target": "observable-target-or-null"
  },
  "candidates": [
    {
      "id": "stable-id",
      "capabilities": ["capability"],
      "available": true,
      "writer_conflicts": ["scope"]
    }
  ]
}
```

Capacidade não observada é `UNKNOWN`, nunca inventada para fechar cobertura.

## Algoritmo determinístico

1. Validar schema mínimo.
2. Preservar referência de fase, intenção, estado vivo, risco, escopo, Writer e proof target quando materiais.
3. Normalizar capacidades em lowercase, únicas e ordenadas.
4. Resolver owner existente antes de considerar novo destino.
5. Remover candidatos indisponíveis, em conflito de Writer ou que atravessem capability proibida declarada.
6. Cobrir primeiro capacidades obrigatórias ainda não atendidas.
7. Empate: maior cobertura obrigatória → maior cobertura opcional → menor superfície total de capacidades → `id` lexicograficamente menor.
8. Repetir até cobrir o denominador ou não existir ganho.
9. Se faltar capacidade obrigatória: `BLOCKED_CAPABILITY_GAP`.
10. Se fechar o denominador: `PASS_ROUTE_READY` — isso prova apenas o roteamento, não a execução.

```text
ROUTE_READY != TASK_DONE
SELECTED != EXECUTED
EXECUTED != CORRECT
CORRECT != FIXED_POINT
```

## !DELTA UTILS — destino do ouro, não novo router

Quando o Trigger Fabric classificar fala como `DELTA_HARVEST`, esta skill recebe somente o delta com ganho informacional e escolhe o destino canônico já existente.

```text
DELTA_HARVEST
+ CURRENT_INTENT
+ CURRENT_PHASE
+ LIVE_STATE
+ RISK
+ SCOPE
+ WRITER
+ PROOF_TARGET
→ CLASSIFY_INFORMATION_GAIN
→ RESOLVE_EXISTING_OWNER
→ REQUIRED_CAPABILITIES
→ MINIMUM_SUFFICIENT_SET
→ ROUTE
```

Classificações de entrada:

```text
REPETITION_PURE → DROP
USEFUL_DELTA → ROUTE_TO_OWNER
CORRECTION → UPDATE_EXISTING_OWNER
CONTRADICTION → META_LUPA + RECONCILE
NEW_PROOF → REPLACE_STALE_SAME_TARGET_PROOF
NEWER_STATE → CURRENT_EVIDENCE_WINS
```

```text
INTERESTING != USEFUL_DELTA
DELTA_HARVEST != NEW_BRAIN
DELTA_HARVEST != NEW_ROUTER
DELTA_HARVEST != AUTHORITY_GAIN
NO_V1_V2_V3=true
ZERO_REGRESSION=true
```

## Lente transversal 3 × 3

O roteamento pode usar estas lentes para derivar capacidades e checagens. Elas **não criam novas fases**.

```text
DIMENSOES:
DEPENDENCIA → o que isto precisa?
DECADENCIA → o que pode estar stale, vencido ou divergido?
CADENCIA → quando/evento exige nova medição?

PLANOS:
KNOWLEDGE → o que sabemos e com qual evidência?
EXECUTION → o que realmente executou e produziu efeito?
CONFIG_ORIGIN → qual owner/config/origem governa ou causou?
```

```text
3X3_IS_TRANSVERSAL_LENS=true
3X3_IS_NEW_PIPELINE=false
3X3_IS_NEW_ROUTER=false
```

## Contrato de handoff

Toda passagem entre corpos deve preservar:

```text
TASK_ID
ROLE_CONTRACT
TARGET
STATE
EVIDENCE_REF
NEXT_CURSOR
WRITER_SCOPE quando aplicável
PROOF_TARGET quando aplicável
```

Handoff sem estado ou evidência vira `UNKNOWN_HANDOFF`, não continuidade presumida.

## Métricas

```text
COVERAGE = covered_required / required_denominator
UNRESOLVED = required - covered
SELECTED_COUNT = número de corpos selecionados
REJECTED_COUNT = indisponíveis/conflitantes/bloqueados
ROUTE_STATUS = PASS_ROUTE_READY | BLOCKED_CAPABILITY_GAP | BLOCKED_INVALID_INPUT
```

Percentual só pode ser emitido quando `required_denominator > 0` e o denominador estiver explícito.

## Exceções e sobreposição

Um corpo pode exercer múltiplos papéis quando suas capacidades observadas cobrem o contrato e não existe conflito de Writer. Um papel pode ser exercido por corpos diferentes ao longo do tempo. Sobreposição não duplica identidade.

```text
ONE_BODY_MANY_ROLES=true
ONE_ROLE_MANY_ELIGIBLE_BODIES=true
ROLE_ASSIGNMENT_IS_SCOPE_BOUND=true
ROLE_ASSIGNMENT_IS_TIME_BOUND=true
ROLE_ASSIGNMENT_IS_NOT_AUTHORITY=true
```

## Relação com #ACORDAR / !CALIBRAR

```text
#ACORDAR
→ medir candidatos, tools, disponibilidade, Writer e estado

!CALIBRAR
→ derivar fase + intenção + risco + escopo + required_capabilities + boundary + proof_target

CAPABILITY_CONTRACT_ROUTER
→ produzir rota determinística do menor conjunto suficiente

HERMES/EXECUTOR
→ executar somente no escopo autorizado

REMEDIÇÃO + REALITY_JUDGE
→ provar efeito no alvo correto
```

O roteador não escolhe intenção humana, não altera autorização e não substitui MetaLupa, proof ownership ou execução reversível.

## Runtime executável

```text
python .agents/skills/capability-contract-router/scripts/route_capabilities.py --self-test
python .agents/skills/capability-contract-router/scripts/route_capabilities.py --input <payload.json>
```

Self-test é prova do algoritmo local conhecido, não prova integração em todo runtime.

## Promotion / Fixed Point

A declaração `status: CANONICAL` só tem efeito canônico quando este artefato está presente na `main` vigente e os checks aplicáveis sobrevivem. Branch/PR não substituem promoção real.

Gate de promoção:

```text
SELF_TEST=PASS
+ BOOT_CONSUMER_DISCOVERABLE
+ POSITIVE_FIXTURE_PASS
+ CAPABILITY_GAP_NEGATIVE_FIXTURE_BLOCKS
+ WRITER_CONFLICT_FIXTURE_BLOCKS_AFFECTED_CANDIDATE
+ NO_DUPLICATE_OWNER_FOUND
+ MERGED_TO_MAIN
→ CANONICAL_ACTIVE
```

Fixed point do roteamento:

```text
REQUIRED_DENOMINATOR_CLOSED
AND NO_WRITER_CONFLICT_SELECTED
AND NO_FORBIDDEN_CAPABILITY_SELECTED
AND HANDOFF_CONTRACT_COMPLETE
AND NO_MATERIAL_UNKNOWN_IN_ROUTE
→ ROUTE_FIXED_POINT
```

Isso não declara fixed point da missão inteira.
