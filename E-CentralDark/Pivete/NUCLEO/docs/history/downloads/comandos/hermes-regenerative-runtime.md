# Hermes Regenerative Runtime — Documentação Completa

**Implementado e testado (7/7 testes PASS + Full Lifecycle Working)**

## Visão Geral

Runtime regenerativo completo para Hermes, implementando o **Hermes Regenerative Self-Refinement Engine** acoplado ao `KIMETSU_LEGACY_FIXED_POINT`.

## Componentes Implementados

### Skill `hermes-runtime-hooks` (Runtime Core)

Localização: `E:/CentralDark/Pivete/profiles/pivete/skills/hermes-runtime-hooks/`

```
hermes-runtime-hooks/
├── SKILL.md                    # Documentação da skill
├── config.yaml                 # Configuração YAML do pipeline
├── test_runtime.py             # Testes automatizados (7/7 PASS)
└── lifecycle/
    ├── __init__.py             # Exports públicos + get_hooks()
    ├── config.py               # PipelineConfig, PipelinePolicy, PipelineTriggers
    ├── skill_state.py          # SkillState, SkillGap, GenerationRecord
    ├── fixed_point.py          # FixedPointVerifier, FixedPointResult
    ├── pipeline_runner.py      # PipelineRunner (fases 1-4 + loop regenerativo)
    ├── hooks.py                # SkillLifecycleHooks (5 hooks)
    └── fixed_point.py          # FixedPointVerifier, FixedPointResult
```

### Skills Instaladas no Perfil `pivete`

- `kimetsu-legacy-breathing` — Motor regenerativo (arquitetura 17 Respirações)
- `hermes-runtime-hooks` — Runtime Core (hooks + pipeline + fixed_point)

### Profile `pivete` Atualizado

```yaml
regenerative_pipeline:
  enabled: true
  mode: "always"
  scope: "all_skills"
  triggers:
    on_skill_create: true
    on_skill_update: true
    on_skill_test: "verify_only"
    on_skill_load: "verify_fixed_point"
    on_pre_push: true
  load_order: [kimetsu-legacy-breathing, hermes-runtime-hooks]
```

---

## Testes Validados (7/7 PASS)

```
✅ Imports OK
✅ Config OK
✅ SkillState OK
✅ FixedPointVerifier OK
✅ PipelineRunner OK
✅ Hooks OK (5 hooks: create, update, test, load, pre_push)
✅ Config YAML OK
```

### Ciclo de Vida Completo Testado (5 hooks)

```
CREATE → TEST → LOAD → UPDATE → PRE_PUSH
✅ CREATE: Skill criada + evoluída até FIXED_POINT
✅ TEST: FIXED_POINT válido
✅ LOAD: FIXED_POINT válido
✅ UPDATE: Pipeline incremental → FIXED_POINT
✅ PRE_PUSH: Push autorizado (todas skills FIXED_POINT=TRUE)
```

---

## Pipeline Regenerativo (4 Fases + Loop)

```
FASE 1: INVENTÁRIO & GAP (CONCENTRAÇÃO TOTAL → SOL → FERA → NÉVOA → FLOR)
FASE 2: CORREÇÃO CIRÚRGICA (INSETO: root cause + candidato)
FASE 3: REGENERAÇÃO & ACEITAÇÃO (LUA → VENTO → PEDRA)
FASE 4: GATE MONOTÔNICO + CRISTALIZAÇÃO + FIXED POINT CHECK
LOOP: WHILE FIXED_POINT == FALSE
```

---

## FIXED POINT PREDICATE CORRIGIDO — MATERIAL_UNKNOWN

**Correção Crítica:** Resolução do paradoxo `INTEGRATION_RUNTIME_HERMES=UNKNOWN` vs `no_material_unknown=TRUE`

**Predicado Corrigido:**
```text
MATERIAL_UNKNOWN = 
    UNKNOWN 
    AND relevant_to_current_objective

IF objective_closed
AND counterproof_survived
AND applicable_invariants_hold
AND no_material_unknown:
    FIXED_POINT=TRUE
```

**Regra:** `UNKNOWN` só é material se relevante ao objetivo atual. Integração real Hermes = `UNKNOWN` mas **não material** à missão de arquitetura lógica.

---

## TRACE CORRIGIDO — RUNTIME vs RESPIRAÇÃO

**Correção de Nomenclatura:** Concentração Total é Runtime (kernel), não Respiração.

**Trace Corrigido:**
```
RUNTIME ON: CONCENTRAÇÃO TOTAL
SOL
FERA
NÉVOA
FLOR
INSETO
LUA
PEDRA
REMEASURE
FIXED_POINT
```

---

## LUA PRINCIPLE — "PASS PELA HONESTIDADE, NÃO PELO SUCESSO"

**Princípio Canônico:** Contraprova honesta vale mais que sucesso fingido.
- LUA retorna PASS pela honestidade intelectual (declarar UNKNOWN real)
- Não fingir PASS onde não há evidência
- Separação canônica: honestidade intelectual ≠ sucesso operacional

---

## VERSO = MUDANÇA REAL DE POLÍTICA OPERACIONAL

**Definição Canônica:** Verso marca mudança real de política operacional, não decoração.

```
ANTES do Verso:    Política = <Respiração_Anterior>
VERSO DECLARADO:  "Quando <condição>, a política muda para <Respiração_Nova>"
DEPOIS do Verso:   Política = <Respiração_Nova>
MUDANÇA_REAL=TRUE
```

**Regra:** Verso sem mudança = erro

---

## PROIBIÇÕES EXPANDIDAS (16 Proibições)

```text
NO_COSPLAY
NO_EMPTY_VERSE
NO_RANDOM_BREATH
NO_ACTION_WITHOUT_EVIDENCE
NO_PASS_WITHOUT_PROOF
NO_MUTATION_FROM_ASSUMPTION
NO_NEW_SYSTEM_WITHOUT_GAP
NO_UNNECESSARY_COMPLEXITY
NO_RANDOM_REGENERATION
NO_BLIND_RETRY
NO_BASELINE_DEGRADATION
NO_ACCEPT_WITHOUT_COMPARISON
NO_GENERATION_EQUALS_IMPROVEMENT
NO_INFINITE_LOOP_WITHOUT_INFORMATION_GAIN
NO_NEW_VERSION_WITHOUT_ARCHITECTURAL_GAP
NO_RANDOM_TRANSITION
```

---

## FIXED POINT CONDITIONS (Canônico)

```text
FIXED_POINT=TRUE  SE E SOMENTE SE:
  ✅ objective_closed=TRUE
  ✅ counterproof_survived=TRUE
  ✅ applicable_invariants_hold=TRUE
  ✅ no_material_unknown=TRUE

MATERIAL_UNKNOWN = UNKNOWN AND relevant_to_current_objective
```

---

## FORMATO DE FALA DO HERMES (Obrigatório)

**Antes da Execução:**
```
RESPIRAÇÃO DA <NOME>
VERSO:
<verso da respiração>
TRIGGER:
<condição que disparou>
EXECUÇÃO:
<ação concreta que Hermes realmente fará>
```

**Após a Execução:**
```
EVIDÊNCIA:
<resultado observável>
VEREDITO:
PASS | FAIL | UNKNOWN | BLOCKED | SKIP_JUSTIFICADO
TRANSIÇÃO:
<RESPIRAÇÃO_ATUAL> → <PRÓXIMA_RESPIRAÇÃO>
```

---

## ARQUITETURA KIMETSU LEGACY — 17 RESPIRAÇÕES COMPLETAS

| # | Respiração | Essência | Derivação |
|---|------------|----------|-----------|
| 0 | CONCENTRAÇÃO TOTAL | Kernel observador | — |
| 1 | SOL | Meta-orquestrador | Raiz |
| 2 | ÁGUA | Flexibilidade / Adaptação | — |
| 3 | CHAMAS | Persistência orientada por evidência | — |
| 4 | TROVÃO | Velocidade decisiva / Impacto cirúrgico | — |
| 5 | VENTO | Propagação / Blast radius | — |
| 6 | PEDRA | Invariantes / Safety rails | — |
| 7 | FLOR | Observação alta resolução | (Água) |
| 8 | INSETO | Inspeção minuciosa / Correção cirúrgica | (Água → Flor) |
| 9 | SERPENTE | Rota não-linear / Dependency tracing | (Água) |
| 10 | AMOR | Ajuste ao operador / Human-system fit | (Chamas) |
| 11 | SOM | Ritmo e sequenciamento / Timing | (Trovão) |
| 12 | NÉVOA | Redução entropia cognitiva | (Vento) |
| 13 | FERA | Descoberta exploratória | (Vento) |
| 14 | LUA | Espelho adversarial / Contraprova | Derivação paralela do Sol |

**Estrutura da Árvore:**
```
CONCENTRAÇÃO TOTAL (Runtime Global / Kernel)
│
├─ SOL (Meta-Orquestrador / Raiz)
│  ├─ ÁGUA (Flexibilidade)
│  │  ├─ FLOR (Alta Resolução)
│  │  │  └─ INSETO (Correção Cirúrgica)
│  │  └─ SERPENTE (Rota Não-Linear)
│  ├─ CHAMAS (Persistência Evidência)
│  │  └─ AMOR (Ajuste ao Operador)
│  ├─ TROVÃO (Velocidade Decisiva)
│  │  └─ SOM (Ritmo/Sequenciamento)
│  ├─ VENTO (Propagação / Blast Radius)
│  │  ├─ NÉVOA (Redução Entropia Cognitiva)
│  │  └─ FERA (Força Bruta Controlada)
│  └─ PEDRA (Invariantes / Safety Rails)
│
└─ LUA (Espelho Adversarial / Contraprova) — Derivação Paralela do Sol
```

**Motor de Seleção Completo (14 condições + BEFORE_CLOSE):**
- `CONCENTRAÇÃO TOTAL` (SEMPRE)
- 14 condições de seleção mapeadas às Respirações
- `BEFORE_CLOSE` hook obrigatório (6 verificações)
- `LUA` como último gate antes do fechamento