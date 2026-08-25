---
name: capability-contract-router
description: Roteamento determinístico e mensurável de tarefas para capacidades, papéis e handoffs no CentralDark, sem transformar modelo em identidade nem ampliar autoridade.
status: CANONICAL_CANDIDATE
owner: SEGREDO/CHEFE
runtime_role: SOL_COORDINATES_HERMES_EXECUTES_ENGINES_ARE_REPLACEABLE
boot_required: true
---

# Capability Contract Router

## Finalidade

Transformar intenção + estado vivo + capacidades observadas em uma atribuição operacional reproduzível.

```text
TASK
+ REQUIRED_CAPABILITIES
+ LIVE_CANDIDATES
+ WRITER_SCOPE
+ BOUNDARY
+ PROOF_TARGET
→ FILTER
→ COVER
→ ASSIGN
→ HANDOFF_CONTRACT
→ EXECUTE
→ RECEIPT
→ REMEASURE
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

Carregar quando uma missão precisar selecionar agente/modelo/tool/papel por capacidade, dividir trabalho, produzir handoff, reconciliar múltiplos candidatos ou provar que a cobertura funcional está completa.

```text
TRIGGER = MULTI_CANDIDATE | MULTI_ROLE | HANDOFF | CAPABILITY_GAP | ROUTING_DECISION
BOOT_DISCOVERABLE=true
DETERMINISTIC_ROUTING_REQUIRED=true
MEASURABLE_COVERAGE_REQUIRED=true
FAIL_CLOSED_ON_CAPABILITY_GAP=true
ONE_WRITER_PER_SCOPE=true
```

Tarefa simples, de candidato único e sem ambiguidade pode atravessar a skill em fast-path sem fan-out.

## Contrato de entrada

```json
{
  "task": {
    "task_id": "string",
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
2. Normalizar capacidades em lowercase, únicas e ordenadas.
3. Remover candidatos indisponíveis, em conflito de Writer ou que atravessem capability proibida declarada.
4. Cobrir primeiro capacidades obrigatórias ainda não atendidas.
5. Empate: maior cobertura obrigatória → maior cobertura opcional → menor superfície total de capacidades → `id` lexicograficamente menor.
6. Repetir até cobrir o denominador ou não existir ganho.
7. Se faltar capacidade obrigatória: `BLOCKED_CAPABILITY_GAP`.
8. Se fechar o denominador: `PASS_ROUTE_READY` — isso prova apenas o roteamento, não a execução.

```text
ROUTE_READY != TASK_DONE
SELECTED != EXECUTED
EXECUTED != CORRECT
CORRECT != FIXED_POINT
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
→ derivar required_capabilities + boundary + proof_target

CAPABILITY_CONTRACT_ROUTER
→ produzir rota determinística

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

A skill só pode ser promovida de candidata para canônica quando:

```text
SELF_TEST=PASS
+ BOOT_CONSUMER_DISCOVERABLE
+ POSITIVE_FIXTURE_PASS
+ CAPABILITY_GAP_NEGATIVE_FIXTURE_BLOCKS
+ WRITER_CONFLICT_FIXTURE_BLOCKS_AFFECTED_CANDIDATE
+ NO_DUPLICATE_OWNER_FOUND
→ PROMOTION_CANDIDATE
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
