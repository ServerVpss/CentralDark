# COMANDO - regenerative-self-refinement-engine.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\ECentralDark_RECONCILIATIONOUROLOCALskills 2\references\regenerative-self-refinement-engine.md
**SHA:** 08e41574d114d291
**Timestamp:** 2026-08-28T02:57:25.198028
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- CONTRATO: INFORMATION_GAIN_REQUIRED=true
- ZERO_REGRESSION_GATE =

### Ouro Bruto (primeiros 5000 chars)
```
# Regenerative Self-Refinement Engine — Hermes

**Acoplamento:** `KIMETSU_LEGACY_FIXED_POINT`
**Modo:** Deliberativo + Generativo + Regenerativo + Monotônico
**Objetivo:** Autoaprimoramento contínuo sem substituir estado comprovado por pior.

---

## Princípio Central: GERAR != ACEITAR

```text
Hermes pode gerar 20, 50 ou 200 refinamentos.
O estado canônico só avança quando o candidato vence o baseline nas provas.
Zero regressão = propriedade do gate de aceitação, não promessa.
```

---

## Auto-Refinement Loop

```text
BASELINE = current_proven_state

LOOP:
  MEASURE(BASELINE)
  DELIBERATE() → identify_gap(), identify_improvement()
  GENERATE(candidate)
  TEST(candidate)
  COUNTERPROOF(candidate)
  COMPARE(candidate, BASELINE)

  IF candidate_is_materially_better
     AND applicable_tests_pass
     AND applicable_invariants_hold
     AND no_new_regression_detected:
    ACCEPT(candidate)
    BASELINE = candidate
    GENERATION += 1
  ELSE:
    REJECT(candidate)
    PRESERVE(BASELINE)

  REMEASURE()
UNTIL FIXED_POINT
```

---

## Regeneração dentro da Mesma Respiração

Falha ≠ trocar Respiração. Se política continua adequada → regenerar dentro da mesma.

```text
RESPIRAÇÃO=INSETO, POLICY=MINIMAL_PRECISION
Tentativa 1: PATCH_A → FAIL
→ DELIBERATE → nova informação → PATCH_B → TEST → PASS
```

Só troca Respiração quando muda a **política necessária**.

---

## NO_RANDOM_TRANSITION

```
EXECUTION_FAILED
→ A política continua adequada?
  SIM → REFINE_INSIDE_SAME_BREATH
  NÃO → SELECT_BREATH(new_state)
```

---

## Verso = Mudança Real de Política

```text
IF NEW_POLICY != CURRENT_POLICY:
    DECLARE_VERSE()
ELSE:
    REFINE_SILENTLY()
```

Múltiplas iterações na mesma Respiração = **um só Verso**.

---

## Deliberação Obrigatória Antes de Regenerar

```text
INPUT: previous_candidate, previous_evidence, previous_failure, current_state

DELIBERATION:
  what_changed?
  what_failed?
  why_failed?
  what_survived?
  what_information_gained?
  what_should_remain_untouched?

OUTPUT: DELTA_BELIEF=, DELTA_ACTION=, PRESERVE=

RULE: SAME_ERROR AND NO_NEW_INFORMATION = WASTE
```

---

## Geração Paralela, Mutação Serial

```text
PARALLELIZE_PERCEPTION
SERIALIZE_MUTATION
```

Múltiplos candidatos conceituais → uma mutação validada por vez.

---

## Regeneração Requer Delta de Informação

```
FAILURE → EVIDENCE → INFORMATION_GAIN → NEW_CANDIDATE
PROIBIDO: FAILURE → RANDOM_VARIATION → TRY_AGAIN
CONTRATO: INFORMATION_GAIN_REQUIRED=true
```

---

## Monotonic Acceptance Gate

```text
COMPARE: correctness, applicable_tests, invariants, behavior, compatibility, complexity, blast_radius

IF candidate_improves_target AND preserves_required_baseline:
    ACCEPT → BASELINE = candidate
ELSE:
    REJECT → RESTORE_LOGICAL_BASELINE
```

---

## Zero Regression Gate Rigoroso

```text
ZERO_REGRESSION_GATE = 
  nenhuma regressão detectada
  dentro do conjunto DECLARADO de invariantes + testes + dimensões

REGRESSION_DENOMINATOR = <testes/invariantes declarados>
```

---

## Cristalização

```
EXECUTION → TEST → COUNTERPROOF → REGRESSION_GATE → REMEASURE
→ CRYSTALLIZE(candidate) → candidate becomes new BASELINE
```

Geração = histórico, não fragmentação: `ONE_SYSTEM_ONLY`

---

## Fixed Point Regenerativo

```text
IF objective_closed
AND counterproof_survived
AND applicable_invariants_hold
AND no_material_unknown
AND no_new_material_failure
AND no_new_information
AND no_candidate_beats_baseline:
    FIXED_POINT=TRUE
ELSE:
    FIXED_POINT=FALSE
    CONTINUE_REFINEMENT
```

---

## Stop Conditions

```
FIXED_POINT=TRUE
OR BLOCKED_BY_EXTERNAL_AUTHORITY
OR (NO_NEW_INFORMATION AND NO_CANDIDATE_BEATS_BASELINE)
OR FURTHER_CHANGE_HAS_NO_MATERIAL_GAIN
```

---

## Kernel Regenerativo

```python
while FIXED_POINT == FALSE:
    state = REMEASURE()
    breath = SELECT_BREATH(state)
    if breath != current_breath: DECLARE_VERSE(breath)
    candidate = DELIBERATE_AND_GENERATE(state, evidence, baseline)
    result = EXECUTE_AND_TEST(candidate)
    counterproof = ADVERSARIAL_REVIEW(result)
    regression = COMPARE_TO_BASELINE(candidate, baseline)
    if result.pass and counterproof.survived and regression.pass:
        baseline = CRYSTALLIZE(candidate)
    else:
        PRESERVE(baseline)
    information_gain = MEASURE_INFORMATION_GAIN()
    FIXED_POINT = EVALUATE_FIXED_POINT()
```

---

## Regra de Ouro Regenerativa

> Gere livremente. Delibere antes de repetir. Ataque cada candidato.
> Compare com o que já funcionava. Cristalize só melhoria comprovada.
> Regenerar não significa esquecer.
> Pare quando nenhuma rodada melhora materialmente o baseline.
```