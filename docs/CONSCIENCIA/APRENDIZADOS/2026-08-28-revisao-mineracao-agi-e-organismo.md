# Revisão cruzada — Mineracao AGI, MetaLupa canônica e organismo

## Status

```text
CANONICO_LEI=Carregada
CANONICO_GATE=Carregado
WORKTREE_AGI_MINERACAO=Carregada
WORKTREE_N7=Carregado
WORKTREE_AGI_GATE=Carregado
WORKTREE_SERIES_GATE=Carregado
PR_JA_MERGED=NÃO — ainda worktree pr-1165-esteira-motor
```

## 1. Canônico (CentralDark clone, `E:/CentralDark/Pivete/CentralDark`)

### Lei — `docs/CONSCIENCIA/METACOGNICAO-OPERACIONAL.md`

Definição operacional: metacognição = observar e falsificar o próprio processo de trabalho (contexto, hipótese, ferramenta, validação, prova, memória, regra, coordenação) e alterar o scaffold quando a evidência mostrar falha reutilizável.

Invariantes centrais:

```text
AUTHORITY_REMAINS_WITH_SEGREDO_CHEFE=true
METHOD_CAN_EVOLVE=true
MODEL_PROVIDER_REPLACEABLE=true
EVOLUTION_CLAIM_REQUIRES_RECEIPT=true
EVOLUTION_IS_NOT_XP=true
EVOLUTION_IS_NOT_TEXT_GROWTH=true
EVOLUTION_MUST_BE_REPRODUCIBLE=true
META_SELF_APPLICATION_REQUIRED=true
```

Five mandatory META subjects:

```text
META_EXPANSAO_DE_DOMINIO
META_MENOS_E_MAIS
META_LUPA
META_INSTINTO_SUPERIOR
META_METACOGNICAO_OPERACIONAL
```

CRROS-META refinement:

- recursivo por informação, não por número de camadas
- `META_META_META` não é objetivo
- cada passagem precisa acrescentar pelo menos um delta discriminável
- `NO_NEW_INFORMATION → FIXED_POINT → STOP`

CRISTAL:

```text
META_CRISTAL_IS_NEW_LENS=false
CRISTAL_IS_CROSS_META_OUTPUT=true
FIXED_POINT != IRREDUCIBLE
IRREDUCIBLE_REQUIRES_EXECUTABLE_RECEIPT=true
```

Busca de irreducibilidade é sobre `DECLARED_RESIDUE_SET`, não powerset global:

```text
IRREDUCIBILITY_SCOPE=DECLARED_RESIDUE_SET
GLOBAL_POWERSET_MINIMALITY=UNPROVEN_UNLESS_EXHAUSTIVE
```

### Gate — `.agents/skills/meta-lupa/scripts/evolution_gate.py`

Gate fail-closed de evolução verificável. Valida manifest de receipt com:

```text
REQUIRED_META_SUBJECTS={
  META_LUPA, MENOS_E_MAIS, INSTINTO_SUPERIOR,
  EXPANSAO_DE_DOMINIO, METACOGNICAO_OPERACIONAL
}
CROSS_META_LENSES=(
  EXPANSAO_DE_DOMINIO, META_MINERACAO, MENOS_E_MAIS,
  META_LUPA, INSTINTO_SUPERIOR, METACOGNICAO_OPERACIONAL
)
CRYSTAL_CLAIMS={IRREDUCIBLE}
```

Campos obrigatórios do receipt:

```text
subject, before_ref(40), after_ref(40), same_scope=true,
canonical_owner, claim, verifier,
new_information, capability_delta,
before_evidence, after_evidence, counterproof, provenance,
lost_capabilities=[], tests=[...PASS...], regressions=[...PASS...]
```

Para subjects META obrigatórios e crystal_claim=IRREDUCIBLE:

```text
cross_meta_review obrigatório com os 6 lenses
meta_fixed_point=true obrigatório
```

Para `MENOS_E_MAIS`: `complexity_after <= complexity_before`

Self-test do gate valida 8 cenários (PASS evolution_gate).

## 2. Worktree `pr-1165-esteira-motor` (`E:/e/CentralDark/Pivete/worktrees/pr-1165-esteira-motor`)

### Mineração do AGI — `docs/APRENDIZADOS/2026-08-16-mineracao-agi-self-improvement.md`

Source: `agi-self-improvement-main.zip`  
`SOURCE_SHA256=757f09a723ca5b789f12f2d0c04f8ba33a1915fbf520a5a9675193b65ffdf27f`

Receit:

```text
REGULAR_FILES=128
CLASSIFIED=128
UNCLASSIFIED=0
COVERAGE=128/128
PYTHON_COMPILE=104/104 PASS
SHELL_SYNTAX=4/4 PASS
UPSTREAM_PYTEST=55 PASS / 19 FAIL / 74
CORE_WITHOUT_UNMATERIALIZED_EXTERNAL_WRAPPER_SUITES=44/44 PASS
```

19 FAIL dependem de 6 famílias de submódulos externos vazios no ZIP: awesome-llm-apps, background-agents, external integrations, prefect, project-nomad, ragflow. Não foram importados como implementação funcional.

AGI gate do pacote:

```text
HOLDOUT_IN_ZIP=0
SELF_DISTILLATION_IN_ZIP=0
GENERALIZATION_TERM_IN_ZIP=0
TRANSFER_TERM_IN_ZIP=0
REPRODUCIBILITY_TERM_IN_ZIP=0
AUTONOMY_MECHANISMS=PRESENT
SELF_IMPROVEMENT_LOOPS=PRESENT
PROPOSAL_TRACE_EVALUATION_EXPERIMENT_APPROVAL_ROLLBACK_MEMORY=PRESENT
README_OR_PROJECT_NAME_IS_NOT_AGI_PROOF=true
```

Delta já absorvido no canônico pelo #947:

```text
PREDEFINED_DEFINITION | HOLDOUT | GENERALIZATION | TRANSFER |
AUTONOMY | LONGITUDINAL_LEARNING | ROBUSTNESS | REPRODUCIBILITY |
INDEPENDENT_EVALUATION
```

Reusing MetaLupa, pattern-discovery.mjs, longitudinal gates.

Disposição das 128 peças:

```text
NO_CODE_IMPORT_GENERIC_ADAPTER_ONLY=24
REFERENCE_AND_COUNTERPROOF=2
REFERENCE_ONLY=23
REUSE_EXISTING=62
REUSE_EXISTING_AND_EXTEND_GAP=9
REUSE_STRONGER_EXISTING=7
REUSE_WITHOUT_MARKETPLACE_IDENTITY=1
```

### Agentes de auto-melhoria relevantes (REUSE_EXISTING_AND_EXTEND_GAP)

| # | Arquivo | Categoria | Owner |
|---|---------|-----------|-------|
| 019 | agents/evaluator_agent.py | SELF_IMPROVEMENT_EVALUATION | METACOGNICAO+META_LUPA+evolution_gate |
| 020 | agents/experimentation_agent.py | SELF_IMPROVEMENT_EVALUATION | METACOGNICAO+META_LUPA+evolution_gate |
| 023 | agents/hyper_meta_improver_agent.py | SELF_IMPROVEMENT_EVALUATION | METACOGNICAO+META_LUPA+evolution_gate |
| 026 | agents/memory_synthesizer.py | SELF_IMPROVEMENT_EVALUATION | METACOGNICAO+META_LUPA+evolution_gate |
| 027 | agents/meta_improver_agent.py | SELF_IMPROVEMENT_EVALUATION | METACOGNICAO+META_LUPA+evolution_gate |
| 039 | agents/self_verification_agent.py | SELF_IMPROVEMENT_EVALUATION | METACOGNICAO+META_LUPA+evolution_gate |

Disposição: estender o gap existente, não criar segundo cérebro.

Outros agentes com owner `MEMORY_LINKER+DreamReview` (knowledge_curator, research agents, web agents): reusam a memória existente, não inventam novo esquema.

Scripts de auto-melhoria:

```text
scripts/daily_self_improvement.py       → SELF_IMPROVEMENT_EVALUATION
scripts/review_proposals.py             → SELF_IMPROVEMENT_EVALUATION
test_reflection_loop.py                 → SELF_IMPROVEMENT_EVALUATION
```

Tracing (proposal/apply/feedback/cost/memory/model):

```text
tracing/apply.py, approval.py, auto_apply.py
tracing/experiment.py, history.py, proposal.py, task_trace.py
tracing/cost_optimizer.py, model_preference.py, usage_tracker.py
tracing/feedback.py, memory_consolidation.py
tracing/skill_marketplace.py, versioning.py
```

### Agentes N7 — `.agents/skills/meta-lupa/agents/nivel-7/`

Arquitetura em três agentes com guard read-only reentrante:

```text
_guard.py          → sys.addaudithook, reentrant, tracks violations
observador.py      → read-only, verdict=CONDICIONAR, evidence_refs, lupa_trace
conversor.py       → converter (imported by orquestrador)
orquestrador.py    → _decidir(verdict, hipotese) → PARAR/EXECUTAR/REFINAR
runner.py          → entry point
```

Fluxo:

```text
payload
  → observador.run()     → observacao(verdict, evidence_refs)
  → conversor.run()      → conversao(hipotese, erro_convertido)
  → _decidir()           → decisao PARAR|EXECUTAR|REFINAR
  → lupa_trace com 3 passos evidenciados
```

Invariante: toda função decorated com `@read_only` é auditada pelo hook. Se agente tentar escrever, assertion falha com lista de violações. Dominio: `ROOT/evidence/ledger.jsonl` é fita imutável de rastro.

Testes: imutabilidade de contratos, precedência epistêmica, isolamento pycache, contrato read-only, teatro de lupa.

### AGI claim gate — `.agents/skills/meta-lupa/scripts/agi_claim_gate.py`

Gate fail-closed para claim científico/externo de AGI. 9 critérios obrigatórios:

```text
PREDEFINED_DEFINITION, HOLDOUT, GENERALIZATION, TRANSFER,
AUTONOMY, LONGITUDINAL_LEARNING, ROBUSTNESS,
REPRODUCIBILITY, INDEPENDENT_EVALUATION
```

Estrutura de validação por critério:

- `PREDEFINED_DEFINITION`: definition+criteria frozen before, sha256 verificado
- `HOLDOUT`: hidden_until_final, sealed_before_optimization, contamination_check=PASS, training_overlap=0
- `GENERALIZATION`: novelty_verified, recipe_not_preprovided, minimum_pass_rate
- `TRANSFER`: source_domains ≠ target_domains, cross_domain=true
- `AUTONOMY`: episode_count, human_intervention_rate ≤ max, goal_given_once, no continuous_routing, self_correction_observed, plan_execute_verify_loop
- `LONGITUDINAL_LEARNING`: usa evolution_series_gate, self_distillation_operational=true
- `ROBUSTNESS`: ≥3 trials, ≥2 contexts, perturbations_tested, critical_regressions=0
- `REPRODUCIBILITY`: independent_reproducer_count, same_conclusion_count=total, protocol_supplied, artifact_hashes(64)
- `INDEPENDENT_EVALUATION`: builder≠judge, judge_independent, blind_or_sealed, judge_did_not_train, external_observer_can_recompute

`LONGITUDINAL_LEARNING` delega para `evolution_series_gate.validate_series`.

Self-test com manifest fixture que passa os 9 critérios.

### Evolution series gate — `.agents/skills/meta-lupa/scripts/evolution_series_gate.py`

Extensão composicional do `evolution_gate.py`. Claim `SELF_DISTILLATION_LONGITUDINAL`, subject `METACOGNICAO_OPERACIONAL`.

Valida cadeia contínua de receipts (A→B→C):

```text
chain_continuity: receipt[i].after_ref == receipt[i+1].before_ref
each receipt must be EVOLVED by evolution_gate
```

Métricas por passagem (mesmo workload, denominators frozen before):

```text
repetition: after < before (strict improvement)
hypothesis_rate: after > before (strict improvement)
transfer_rate (holdout): after > before (strict improvement)
rigor_rate: after ≥ before (no regression)
critical_regressions_after = 0
```

Self-test valida: cadeia quebrada, repetição regressiva, hipótese regressiva, transfer regressivo, rigor regressivo, receipt tampered.

## 3. Como as peças se conectam

### MetaLupa canônica absorve o AGI

O pacote AGI não é “segundo cérebro”. Sua classificação `REUSE_EXISTING_AND_EXTEND_GAP` com owner `METACOGNICAO+META_LUPA+evolution_gate` diz: os agentes de auto-melhoria entram como extensão do loop já existente na MetaLupa canônica, não como sistema paralelo.

A lei canônica (`METACOGNICAO-OPERACIONAL.md`) já define:

```text
METACOGNICAO_OPERACIONAL=EVOLUTION_REQUIRED
META_SELF_APPLICATION_REQUIRED=true
CROSS_META_REFINEMENT_REQUIRED_WHEN_REUSABLE_DELTA=true
```

O gate `evolution_gate.py` já torna fail-closed qualquer alegação de evolução.

O worktree traz:

- gate `agi_claim_gate.py` para claim externo de AGI (9 critérios)
- gate `evolution_series_gate.py` para longitudinal self-distillation
- N7 com guard read-only e rastro em ledger.jsonl
- manifest de 128 peças com owner e disposição

### Donos META obrigatórios cobram CROSS-META em cada evolução

Quando um agente de auto-melhoria alegar `EVOLVED`, o receipt precisa:

1. before_ref / after_ref distinguíveis
2. same_scope=true
3. canonical_owner (um dos 5 donos META ou capacity future)
4. new_information material
5. capability_delta reutilizável
6. before_evidence / after_evidence
7. counterproof
8. tests=PASS com evidência
9. regressions=PASS com evidência
10. lost_capabilities=[]
11. Para META subjects: cross_meta_review com 6 lenses + meta_fixed_point=true

O AGI package reusa exatamente esse receipt schema.

### Rastro como alimento

Antes: `MODEL_TOUCH → OBSERVABLE_KNOWLEDGE_HARVEST` era descrição.  
Agora há estrutura concreta: N7 escreve em `evidence/ledger.jsonl` (fita imutável), `lupa_trace` com 3 passos evidenciados, `_guard` impede escrita acidental.

A lacuna que ainda é descrição (não infra): coleta automática de `MODEL_TOUCH` de múltiplos motores (Claude, Codex, Hermes, Gemini) e converção em candidato de evolução que passe pelo gate. O N7 é um esqueleto de como o rastro pode ser estruturado; a tubulação multi-motor é still pending.

## 4. O que está canônico vs worktree

### Já no clone canônico (CentralDark)

```text
docs/CONSCIENCIA/METACOGNICAO-OPERACIONAL.md
.agents/skills/meta-lupa/scripts/evolution_gate.py
LEIA-ME-IA.md (boot referencia metacognicao)
CENTRALDARK_AI_BOOT.yaml
```

### Apenas no worktree `pr-1165-esteira-motor`

```text
docs/APRENDIZADOS/2026-08-16-mineracao-agi-self-improvement.md
.agents/skills/meta-lupa/scripts/agi_claim_gate.py
.agents/skills/meta-lupa/scripts/evolution_series_gate.py
.agents/skills/meta-lupa/agents/nivel-7/   (observador, conversor, orquestrador, _guard, runner, tests)
agents/*.py                                 (pacote AGI extraído)
scripts/daily_self_improvement.py
scripts/review_proposals.py
test_reflection_loop.py
tracing/*.py
```

Nota: `evolution_gate.py` existe no worktree também (`.agents/skills/meta-lupa/scripts/evolution_gate.py`) como réplica/compatibilidade para os scripts do pacote AGI que dele dependentes. O canônico tem a versão fonte.

## 5. Lacunas

1. `agi_claim_gate.py` e `evolution_series_gate.py` não estão no canônico ainda — estão no worktree.
2. N7 (`nivel-7`) não está no canônico — está no worktree.
3. O manifest de 128 peças do trabalho AGI (`2026-08-16-mineracao`) não está no canônico.
4. O pipeline `MODEL_TOUCH → HARVEST → CANDIDATO → GATE` ainda é descrição para multi-motor; N7 mostra o rastro estruturado em single-window; cross-window rendezvous é descrito em `MULTI-MODEL-ORCHESTRATION.md` (não encontrado no clone atual, vinha do worktree).
5. Web não disponível nesta sessão — não puxamos referências externas de AGI para confrontar com o gate.

## 6. Resumo para a Casa

A Casa já tem a lei e o gate de evolução. O pacote AGI que você achou traz:

- uma mineração honesta (128/128 classificadas, 19 FAIL rastreados para submódulos externos vazios)
- um gate de claim de AGI externo com 9 critérios (holdout, generalization, transfer, autonomy, longitudinal, robustness, reproducibility, independent evaluation)
- um gate longitudinal de self-distillation com cadeia de receipts e métricas de repetição/hipótese/transfer/rigor
- um agente N7 com guard read-only e rastro estruturado em ledger

Os agentes de auto-melhoria do pacote (evaluator, experimentation, hyper_meta_improver, meta_improver, memory_synthesizer, self_verification) são extensão do gap da MetaLupa canônica — owner `METACOGNICAO+META_LUPA+evolution_gate`. Não é segundo cérebro.

O que falta para o organismo vc descreveu ficar completo:

- absolutar `agi_claim_gate.py`, `evolution_series_gate.py` e N7 no canônico (PR ou merge)
- fechar a tubulação de rastro multi-motor que vira candidato no gate
- manter fixed point da missão, não da capacidade de aprender (`META_LUPA_FINAL=false, META_LUPA_EVOLUTION=EVENT_DRIVEN`)

---

Arquivo: `docs/CONSCIENCIA/APRENDIZADOS/2026-08-28-revisao-mineracao-agi-e-organismo.md`
Data: 2026-08-28
Contexto: revisão cruzada entre canônico CentralDark e worktree pr-1165-esteira-motor
