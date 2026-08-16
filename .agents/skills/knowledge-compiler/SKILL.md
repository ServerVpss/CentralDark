---
name: knowledge-compiler
description: Compila muitas fontes e deltas em um único cristal operacional por capacidade/fronteira, separando FORJA rigorosa de runtime FLASH. Use em mineração multi-fonte, síntese reutilizável, planejamento antes de aplicar, cristalização, dedupe, arbitragem e invalidação seletiva por delta. Não é novo cérebro; é projeção chamável do método canônico.
---

# Knowledge Compiler — muitas fontes → um cristal → uma rota

Owner conceitual: `docs/CONSCIENCIA/METACOGNICAO-OPERACIONAL.md`.
Owner de modos/execução: `docs/CONSCIENCIA/PROTOCOLO-ORQUESTRACAO-PIVETE.md`.

```text
SECOND_BRAIN=false
HOUSE_WIDE=true
MODEL_NEUTRAL=true
SOURCE_IS_PROVENANCE_NOT_AUTHORITY=true
PRIVATE_CHAIN_OF_THOUGHT_NOT_REQUIRED=true
```

## Supercomando operacional

O humano não precisa decorar nem repetir este comando. Quando a missão exigir síntese multi-fonte ou aprendizado reutilizável, SOL pode ativá-lo automaticamente dentro da intenção/autorização vigente.

```text
COMPILE_THEN_APPLY

INTENCAO
+ ESTADO_VIVO
+ AUTORIDADE
+ FONTES/APRENDIZADOS
→ PLAN_ONLY
→ INGEST
→ EXTRACT
→ DEDUPE
→ COUNTERPROOF
→ ARBITRATE_CONFLICTS
→ CLASSIFY_PROVEN|CANDIDATE|UNKNOWN|DROP
→ SELECT_CANONICAL_OWNER
→ SELECT_CALLABLE_SKILL
→ SELECT_REAL_CONSUMER
→ SELECT_TEST
→ SELECT_GATE
→ BUILD_ROUTE_IR
→ READY_TO_APPLY?
   NAO → CANDIDATE|BLOCKED + RESIDUO
   SIM → APPLY_MINIMAL_DELTA
→ VERIFY
→ FINAL_COUNTERPROOF
→ CRYSTALLIZE
→ FLASH_READY
```

O planejamento não é autorização nova:

```text
PLAN_ONLY != EXECUTION
COMPILED_ROUTE != AUTHORIZATION
ANTICIPATION != AUTHORIZATION
APPLY_REQUIRES_EXISTING_AUTHORITY=true
```

## FORJA — caminho lento e rigoroso

```text
README ────────┐
SKILLS ────────┤
DOC OFICIAL ───┤
CODIGO ────────┤
TESTES ────────┤
INCIDENTES ────┤
HISTORICO GIT ─┤
COMUNIDADE ────┘
        │
        ▼
   MINERACAO
        │
        ▼
   EXTRACAO
        │
        ▼
   CONTRAPROVA
        │
        ├── conflito?  → TESTE DISCRIMINANTE / ARBITRAGEM
        ├── duplicado? → DROP_DUPLICATE / REUSE
        ├── sem prova? → CANDIDATE|UNKNOWN / QUARENTENA
        └── ouro?      → CONTINUA
        │
        ▼
   DESTILACAO
        │
        ▼
   OWNER CANONICO
        │
        ▼
   SKILL CHAMAVEL
        │
        ▼
   CONSUMIDOR REAL
        │
        ▼
   TESTE + GATE
        │
        ▼
   CRISTAL
        │
        ▼
   ROTA UNICA POR CAPACIDADE/FRONTEIRA
```

A frase curta é:

```text
MUITAS FONTES
→ UMA VERDADE OPERACIONAL NO ESCOPO DECLARADO
→ UMA ROTA ATIVA POR CAPACIDADE/FRONTEIRA
→ ACAO MINIMA
→ PROVA
```

`UMA VERDADE OPERACIONAL` não significa verdade absoluta universal. Significa que, para a capacidade + fronteira declaradas, conflitos relevantes foram arbitrados e existe uma única rota operacional ativa. Claims fora dessa fronteira continuam separados.

## FLASH — runtime não paga a mineração inteira de novo

Depois do cristal promovido:

```text
INTENCAO
→ ROTEADOR
→ OWNER
→ SKILL
→ CONSUMIDOR
→ ACAO
→ PROVA
→ PASS|FAIL|UNKNOWN
```

```text
MINERAR_UMA_VEZ
→ CRISTALIZAR_UMA_VEZ
→ REUTILIZAR_N_VEZES
```

O runtime FLASH carrega o **mínimo necessário**: rota compilada, owner, skill, estado vivo e prova aplicável. README bruto, corpus histórico e fontes de descoberta voltam apenas sob demanda quando houver invalidação ou informação nova relevante.

```text
FLASH_DOES_NOT_REPLAY_FULL_INGESTION=true
RAW_CORPUS_LOAD_ON_DEMAND=true
RUNTIME_LATENCY_PAYS_ROUTE_NOT_MUSEUM=true
```

## Invalidação seletiva — recompilar só o que o delta tocou

```text
NEW_SOURCE
| OWNER_CHANGED
| SKILL_CHANGED
| CONSUMER_CHANGED
| TEST_FAILED
| GATE_CHANGED
| BOUNDARY_CHANGED
| EVIDENCE_STALE
| RUNTIME_DRIFT
→ MAP_TO_AFFECTED_CAPABILITY
→ INVALIDATE_ONLY_DEPENDENT_ROUTE
→ PRESERVE_UNAFFECTED_CRYSTALS
→ RECOMPILE_DELTA
→ VERIFY
→ FLASH_READY_AGAIN
```

```text
NEW_INFORMATION != REBUILD_ALL
DELTA_AFFECTED_ONLY=true
UNAFFECTED_ROUTE_REUSE=true
```

## Cristal operacional forte

Um achado útil sem consumidor ainda é conhecimento; não é cristal operacional completo.

```text
OPERATIONAL_CRYSTAL
= CANONICAL_OWNER
+ CALLABLE_SKILL
+ REAL_CONSUMER
+ TEST
+ GATE
+ PROVENANCE
+ COUNTERPROOF
+ ROUTE_IR
```

```text
CRYSTAL_WITHOUT_OWNER=UNPROVEN
CRYSTAL_WITHOUT_CONSUMER=KNOWLEDGE_ONLY_NOT_OPERATIONAL
CRYSTAL_WITHOUT_TEST=UNPROVEN
CRYSTAL_WITHOUT_GATE=BEST_EFFORT_NOT_HARD_GUARANTEE
UNRESOLVED_CONFLICT=NOT_FLASH_READY
UNKNOWN != PASS
```

## TICK — conversar enquanto trabalha sem despejar raciocínio privado

Quando progresso visível ajudar o CHEFE, emitir apenas telemetria comprimida de estado:

```text
TICK:
  phase: INGEST|DISTILL|ARBITRATE|COMPILE|APPLY|VERIFY|CRYSTALLIZE|FLASH_READY
  delta: <mudanca material observavel>
  owner: <owner ou UNKNOWN>
  route: <route_id ou PENDING>
  blocker: <0|causa real>
  next: <proximo passo unico>
```

`TICK` não contém scratchpad, cadeia de pensamento, tentativa token a token nem narrativa teatral. É recibo operacional para manter o fio.

## Implementação determinística

- contrato: `contract.json`;
- compilador/validador: `scripts/compiler.mjs`;
- regressão: `tests/compiler.test.mjs`;
- gate: `.github/workflows/lupa-conformance.yml`.

O código determinístico valida estrutura, estados, dedupe, promoção e invalidação. A IA continua responsável pela parte semântica residual — entender intenção, extrair capacidade e propor arbitragem — sem poder pular os mesmos gates.
