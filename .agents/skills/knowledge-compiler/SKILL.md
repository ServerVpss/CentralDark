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

## MetaForja — a FORJA passando pelo próprio CROSS-META

`METAFORJA` é um alias operacional para aplicar as lentes META canônicas sobre a própria FORJA. Não cria sétima lente, novo agente, novo cérebro nem `META_CRISTAL` separado.

```text
METAFORJA
= FORJA
+ META_EXPANSAO_DE_DOMINIO
+ META_MINERACAO
+ META_MENOS_E_MAIS
+ META_LUPA
+ META_INSTINTO_SUPERIOR
+ META_METACOGNICAO_OPERACIONAL

META_FORJA_IS_NEW_LENS=false
META_CRISTAL_IS_NEW_LENS=false
```

O resultado continua sendo:

```text
MUITO MINERIO ENTRA
→ POUCO OURO SAI
→ 1 CRISTAL POR CAPACIDADE/FRONTEIRA
→ 1 ROTA ATIVA
→ EXECUCAO RAPIDA
```

## Importar conhecimento externo sem importar dogma

Fonte externa ensina padrão; não ganha autoridade sobre a Casa. Números, thresholds, nomes de owner, topologias de agentes, pins de modelo e bloqueios de deploy só viram política quando a aplicabilidade local for provada.

```text
SOURCE_PRESTIGE != AUTHORITY
SOURCE_PATTERN != HOUSE_POLICY
SOURCE_NUMERIC_GUIDELINE != HOUSE_THRESHOLD
EXTERNAL_OWNER_NAME != CANONICAL_OWNER
MODEL_NAME != ARCHITECTURAL_AUTHORITY
PLACEHOLDER_TEST != BEHAVIOR_PROOF
```

### SRE — toil vira automação determinística quando a regra já é conhecida

O ouro generalizado é medir e reduzir trabalho operacional repetitivo, previsível e mecânico. Não importar percentual arbitrário.

```text
REPETITIVE
+ PREDICTABLE
+ MECHANICAL
+ KNOWN_RULE
→ DETERMINISTIC_AUTOMATION_FIRST
→ AGENT_ONLY_FOR_RESIDUAL_JUDGMENT

MEASURE_TOIL_WHEN_DECISION_DEPENDS_ON_MAGNITUDE=true
NO_UNIVERSAL_TOIL_PERCENTAGE=true
EXTERNAL_NUMERIC_TARGET_REQUIRES_LOCAL_FIT_OR_EXPLICIT_POLICY=true
```

### SRE — SLO/error budget é política do serviço, não trava mágica

```text
USER_RELEVANT_SLI
+ AGREED_TARGET
+ WINDOW
+ ERROR_BUDGET_POLICY
+ LIVE_MEASUREMENT
→ DECISION_INPUT

NO_SLO_OR_POLICY
→ DO_NOT_INVENT_DEPLOY_BLOCK

SLO_POLICY_IS_SERVICE_SPECIFIC=true
```

A FORJA pode aprender o mecanismo de error budget sem inventar que todo serviço usa o mesmo alvo, janela ou regra de congelamento.

### Fowler/CI — integração pequena, autoteste, feedback e reversibilidade

```text
SMALL_CHANGE
+ SELF_TESTING
+ FAST_FEEDBACK
+ MAINLINE_HEALTH
+ REVERSIBILITY
→ PREFER

CI_FAILURE
→ FIX_OR_REVERT_FAST
→ RESTORE_MAINLINE
```

Uma guideline externa como `10-minute commit build` pode orientar diagnóstico de latência, mas não vira hard gate global sem política CentralDark específica e medição no runtime aplicável.

```text
SOURCE_GUIDELINE_AS_HARD_GATE_REQUIRES_LOCAL_POLICY=true
```

### Arquitetura — evoluir sem carregar cruft

```text
IMPORTANT_DESIGN
+ SIMPLICITY
+ EVOLVABILITY
+ REUSE
→ LOWER_CHANGE_COST

COORDINATE_CENTRALLY_ONLY_WHEN_REAL_COORDINATION_COST_JUSTIFIES
NO_REBUILD_WHEN_DELTA_SUFFICES=true
```

### Agentes — módulos cognitivos não são novos funcionários

Surveys podem decompor sistemas em percepção, memória e ação; isso é útil como mapa de capacidade, não como obrigação de criar três agentes.

```text
PERCEPTION + MEMORY + ACTION = CONCEPTUAL_MODULES
MODULE != NEW_AGENT
MULTI_AGENT=OPTIONAL_WHEN_INFORMATION_GAIN
DETERMINISTIC_TASK != AGENT_BY_DEFAULT
```

### Agentic RAG — contexto e ferramentas sob demanda

```text
DYNAMIC_RETRIEVAL
+ PLANNING
+ REFLECTION
+ TOOL_USE
→ OPTIONAL_PATTERNS_FOR_COMPLEX_WORK

LOAD_CONTEXT_ON_DEMAND=true
MULTI_AGENT_WHEN_BENEFIT_GT_COORDINATION_COST=true
EVALUATION_GOVERNANCE_ERROR_HANDLING_REQUIRED=true
```

### Complexidade e motor — subir frequência, não canonizar nome de modelo

Para debug difícil, arquitetura, código complexo, matemática, ciência, análise visual e investigação multietapa, a SOL escala a frequência cognitiva conforme risco/ambiguidade. A engine continua substituível.

```text
COMPLEX_TASK
→ ESCALATE_SOL_FREQUENCY_AS_NEEDED
→ SELECT_ENGINE_BY_OBSERVED_FITNESS

ARCHITECTURE != O3_HARDCODE
MODEL_PIN_REQUIRES_OBSERVED_FITNESS_AND_RUNTIME_AVAILABILITY=true
PRESTIGE_IS_NOT_ENGINE_FITNESS=true
```

## Proveniência primária do lote SRE/Fowler/Agents

As fontes completas permanecem externas; a Casa guarda somente proveniência + capacidade destilada.

```text
GOOGLE_SRE_BOOK=https://research.google/pubs/site-reliability-engineering-how-google-runs-production-systems/
GOOGLE_SRE_WORKBOOK=https://research.google/pubs/the-site-reliability-workbook/
GOOGLE_ELIMINATING_TOIL=https://sre.google/workbook/eliminating-toil/
GOOGLE_SLO=https://sre.google/workbook/implementing-slos/
FOWLER_ARCHITECTURE=https://martinfowler.com/architecture/
FOWLER_CI=https://martinfowler.com/articles/continuousIntegration.html
AGENTS_SE_SURVEY=https://arxiv.org/abs/2409.09030
AGENTIC_RAG_SURVEY=https://arxiv.org/abs/2501.09136
```

A proveniência acadêmica/industrial reforça ou desafia a Casa; não prova runtime CentralDark por existir.

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
- cristal/rota dogfood: `crystal-route.json`;
- compilador/validador: `scripts/compiler.mjs`;
- regressão: `tests/compiler.test.mjs`;
- gate: `.github/workflows/lupa-conformance.yml`.

O código determinístico valida estrutura, estados, dedupe, promoção, política de importação e invalidação. A IA continua responsável pela parte semântica residual — entender intenção, extrair capacidade e propor arbitragem — sem poder pular os mesmos gates.


## AUTHORITY_NORMALIZE (lei imutável na ingestão)

```text
CAPACIDADE_DA_SKILL → ABSORVE
AUTORIDADE_DA_SKILL → NÃO
AUTORIDADE_FINAL=SEGREDO/CHEFE
SOL=COORDENA
PIVETE/HERMES=EXECUTA
WRITER=MUTA_ESCOPO
JUDGE=CONTRAPROVA
MODEL|WRITER|EXECUTOR|JUDGE != AUTHORITY
```

Pipeline em toda skill/doc/zip absorvido:

```text
AUTHORITY_SCAN
→ CLASSIFY_SOURCE (CURRENT_CANONICAL|LEGACY_HISTORICAL|EXTERNAL_UPSTREAM)
→ EXTRACT_CAPABILITY
→ NORMALIZE_TO_CASA
→ CONTRAPROVA
→ OWNER_EXISTENTE
→ TEST
→ OURO
```

| Classe fonte | Achado | Ação |
|---|---|---|
| CURRENT_CANONICAL + linguagem que concede autoridade a não-Chefe | CURRENT_BUG | menor delta no owner; reformular |
| LEGACY_HISTORICAL | LEGACY_OK | preservar; Pivete legado = LEGACY_ALIAS_OF_SEGREDO_CHEFE |
| EXTERNAL_UPSTREAM | EXTERNAL_ADAPTED | capacidade sim; autoridade externa não |

Implementação: `scripts/authority-normalize.mjs` (hook em `skill-authoring.mjs`).
CLI: `node scripts/authority-normalize.mjs --scan-file PATH [--source CLASS]`

