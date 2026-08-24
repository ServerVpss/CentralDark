# CENTRALDARK — Trigger Fabric canônica

A Trigger Fabric **não é um novo orquestrador**. Ela é o contrato que liga os gatilhos da Casa aos owners já existentes, preservando `ONE_SYSTEM_ONLY`, `REUSE_BEFORE_CREATE`, `ONE_OWNER_PER_CAPABILITY` e `ONE_WRITER_PER_SCOPE`.

```text
SEGREDO/CHEFE
      ↓
INTENÇÃO + DESTINO
      ↓
DESTINATION_LOCK
      ↓
BOT / AGENT ENTRY
      ↓
CENTRALDARK_AI_BOOT
      ↓
#ACORDAR
A1 história/SOUL · A2 Git vivo · A3 owners/writers · A4 runtime/tools · A5 continuidade/delta
      ↓
!CALIBRAR
C1 intenção · C2 autoridade · C3 capacidades/reuso · C4 prova/risco · C5 engine/custo/latência
      ↓
!MULTIBUSSOLA
TOP-DOWN ↓ · BOTTOM-UP ↑ · FORWARD → · REVERSE ← · ROUND-TRIP ↔ · TRANSVERSAIS
      ↓
RENDEZVOUS
normalize → dedupe → conflito → teste discriminante
      ↓
META_LUPA ADAPTATIVA
FRIA | MÉDIA | QUENTE
      ↓
ROTEAR PARA OWNER EXISTENTE
      ↓
GraphRAG
Memory Linker
Session Harvester
MetaLupa
Reality Judge
Hermes Core
Knowledge Compiler
Vector Memory quando implementado/provado
      ↓
ONE WRITER PER SCOPE
      ↓
EXECUÇÃO MÍNIMA
      ↓
OUTPUT_GUARD
claim ↔ proof
hora/HEAD/proveniência
fato/inferência/hipótese/UNKNOWN
top-down ↔ bottom-up ↔ round-trip
falso-verde
history ↔ current
spec ↔ implementation
action ↔ proof
      ↓
REALITY JUDGE
  ┌────────┬────────┬────────┬────────┬────────┐
  ↓        ↓        ↓        ↓        ↓
PROVEN   FAILED   UNKNOWN   LOCKED   WORKING
  ↓        ↓        ↓
RECEIPT  REMEDE   MEDIR REALIDADE
CRYSTAL    ↘       ↙
LEARNING    RENDEZVOUS
  ↓
LAST_GOOD_STATE
  ↓
NEXT_CURSOR / NEXT BOOT
```

## Mapa visual derivado — aliases, nunca novos owners

A Forja de cartas e outros artefatos visuais podem representar a mesma arquitetura com nomes culturais. Esses nomes **não criam componente, autoridade, gate ou owner**. Quando houver equivalência provada, o visual aponta para o owner canônico; quando não houver owner provado, permanece representação/UNKNOWN.

```text
                         👑 CHEFE
                    intenção + autoridade
                              │
                              ▼
          ☼ #ACORDAR → ⚙ !CALIBRAR → 🧭 !MULTIBÚSSOLA
                              │
                              ▼
                        ☀️ SOL
                 coordena / reconcilia
                              │
                 ┌────────────┼────────────┐
                 ▼            ▼            ▼
              ✶ GRAFO      ♄ VIGIA      ♃ J.R.V.S.
              estado      observação     agentes
                 └────────────┼────────────┘
                              ▼
                         ⊛ META LUPA
                       tenta falsificar
                              │
                              ▼
                        ✎ WRITER ÚNICO
                              │
                              ▼
                          ☿ HERMES
                    executa / preserva
                              │
                              ▼
                         ∞ FABLE LOOP
                  executar → medir → repetir
                              │
                              ▼
                         ⚖ FABLE JUDGE
                       segundo leitor
                              │
                    ┌─────────┴─────────┐
                    │                   │
                 FALHOU              PROVOU
                    │                   │
                    ▼                   ▼
             🜏 TÉCNICA DA LUPA      APRENDIZADO
             erro → mecanismo            │
                    │                    │
                    └──────────┬─────────┘
                               ▼
                           ✶ GRAFO
                        estado atualizado
                               │
                               ▼
                         PRÓXIMO #ACORDAR
```

Mapeamento operacional:

```text
CHEFE -> SEGREDO/CHEFE
SOL -> SOL / coordenação canônica
GRAFO -> GraphRAG + estado/grafo observável quando aplicável
META_LUPA -> .agents/skills/meta-lupa/
WRITER_UNICO -> ONE_WRITER_PER_SCOPE
HERMES -> Hermes Core / PIVETE-HERMES executor
FABLE_LOOP -> EXECUTE_MEASURE_REMEDIATE_LOOP
FABLE_JUDGE -> REALITY_JUDGE
TECNICA_DA_LUPA -> FAILURE_TO_LEARNING_LOOP / cristalização no owner existente
VIGIA -> OBSERVABILITY_ALIAS; owner concreto deve ser provado por consumidor
J.R.V.S. -> VISUAL_ALIAS_ONLY_UNTIL_CANONICAL_OWNER_PROVEN
GUARDIAO_CASA -> REPRESENTATION_GAP_NOT_CANONICAL_OWNER
```

Invariantes da camada visual:

```text
VISUAL_ALIAS_IS_NOT_OWNER=true
VISUAL_ALIAS_IS_NOT_RUNTIME_PROOF=true
VISUAL_POSITION_IS_NOT_AUTHORITY=true
FABLE_JUDGE_IS_ALIAS_OF_REALITY_JUDGE=true
FABLE_LOOP_IS_ALIAS_OF_EXECUTE_MEASURE_REMEDIATE_LOOP=true
JRVS_VISUAL_ALIAS_IS_NOT_CANONICAL_OWNER=true
GUARDIAO_CASA_REPRESENTATION_GAP_IS_NOT_CANONICAL_OWNER=true
NO_NEW_OWNER_FROM_VISUAL_METAPHOR=true
```

A ausência de `GuardiaoCasa` como owner canônico observado não proíbe futura representação visual; só impede promover a inferência para runtime sem owner + consumidor + prova. Da mesma forma, `J.R.V.S.` pode continuar como linguagem visual sem ganhar governança própria.

## Camisa de força de saída

A entrada correta não basta. Antes de qualquer retorno material ao humano, o `OUTPUT_GUARD` verifica o mesmo claim ao contrário:

```text
CLAIM
→ TARGET/SCOPE
→ OBSERVED_AT + SOURCE_TIME
→ HEAD/SHA/PROVENIÊNCIA
→ FACT | INFERENCE | HYPOTHESIS | UNKNOWN
→ OWNER + CONSUMER
→ TOP_DOWN_RESULT
→ BOTTOM_UP_RESULT
→ ROUND_TRIP_RESULT
→ EVIDENCE + COUNTEREVIDENCE
→ PROOF_TARGET_MATCH
→ TEMPORAL_FRESHNESS
→ ARITHMETIC/DENOMINATOR
→ DUPLICATE_CHECK
→ FALSE_GREEN_CHECK
→ HISTORY_CURRENT_CHECK
→ SPEC_IMPLEMENTATION_CHECK
→ ACTION_PROOF_CHECK
→ VERDICT
```

Contradição material no próprio veredito aciona AutoLupa e impede a saída até correção ou preservação explícita de `UNKNOWN`.

## Owners existentes

| Capacidade | Owner observado |
|---|---|
| Boot/governança | `LEIA-ME-IA.md`, `AGENTS.md`, `docs/CONSCIENCIA/00-PORTA-DE-ENTRADA-IA.md` |
| `!MULTIBUSSOLA` | `docs/CONSCIENCIA/MULTIBUSSOLA.md` |
| MetaLupa | `.agents/skills/meta-lupa/` |
| Missões/retomada | `apps/modulos/HERMES-CORE/core/orchestrator.mjs` |
| Prompt operacional Hermes | `apps/modulos/HERMES-CORE/prompts/hermes-core.md` |
| GraphRAG | `apps/modulos/HERMES-CORE/agents/GraphRAG-Master/agent.mjs` |
| Memória/delta/dream/padrões | `scripts/memory-linker/` |
| Colheita de sessão | `.agents/skills/session-intelligence-harvester/SKILL.md` |
| Cristalização | `.agents/skills/knowledge-compiler/` |
| Memória vetorial | `.agents/skills/vector-memory/SKILL.md` |
| Gate global de entrada | `.github/workflows/porta-de-entrada.yml` |
| Juiz/promotor autônomo | `.github/workflows/autonomia-promocao.yml` |
| Empacotamento/counterproof | `.github/workflows/trigger-fabric-package.yml` |
| Labels | `docs/CONSCIENCIA/GITHUB-LABELS-OPERACIONAIS.md` |

## Automatismos observados no código

- mission poll: `5s`
- orphan recovery: `45s`
- GraphRAG refresh: `30m`
- GC legado: `6h` — **não promover como seguro automaticamente**; é destrutivo e precisa de reconciliação com a política atual.

## Anti-ruído e continuidade

```text
NO_NEW_INFORMATION → NO_CHANGE → NEXT
BYTE_IDENTICAL → PROCESS_ONCE_KEEP_PROVENANCE
LAST_GOOD_STATE → INPUT_DIFF → REVALIDATE_CHANGED_SURFACE_ONLY → NEXT_CURSOR
MODEL_SWITCH != RESET
SESSION_SWITCH != RESET
```

## Estados sem amarelo diplomático

```text
GREEN  = PROVEN
RED    = FAILED/BLOCKED
BLACK  = UNKNOWN/NOT_PROVEN
LOCKED = QUARANTINE/HUMAN_LOCK
WORKING/FORJA = ação em andamento, nunca PASS
```

Tema visual não é estado operacional.

## UNKNOWNs materiais preservados

```text
SESSION_END_HOOK_PHYSICAL_WIRING = NOT_PROVEN
DREAM_REVIEW_SCHEDULER_LOCAL = NOT_PROVEN
VECTOR_MEMORY_RUNTIME = NOT_PROVEN
WINDOWS_E_CENTRALDARK_SAME_HERMES_CORE_ACTIVE = NOT_PROVEN
BOT_ENTRY_RUNTIME_INHERITANCE_ALL_ENGINES = NOT_PROVEN_UNTIL_RUNTIME_TEST
```

A Casa não transforma esses UNKNOWNs em `PASS`. `UNKNOWN` faz a Casa andar atrás da realidade.

## Regra de interligação

```text
EVENTO
→ CLASSIFICAR
→ LOCALIZAR OWNER EXISTENTE
→ PROVAR CONSUMIDOR
→ NO_NEW_INFORMATION ? STOP : CONTINUE
→ RENDEZVOUS
→ ONE_WRITER
→ EXECUTAR
→ OUTPUT_GUARD
→ PROVAR NO MESMO ALVO
→ APRENDER
```

Nenhum `second brain`, `dispatcher-v2`, `MCP paralelo`, `GraphRAG-v2`, segundo scheduler, segundo promotor ou workflow equivalente nasce desta arquitetura.
