# Contrato — META cristalização de incidentes

Status: CANONICAL_CANDIDATE
Owner conceitual: `docs/CONSCIENCIA/METACOGNICAO-OPERACIONAL.md`
Executor verificável: `.agents/skills/meta-lupa/scripts/incident_crystal_gate.py`
Ledger: `.agents/skills/meta-lupa/references/incident-crystals.json`

Este contrato não cria uma sétima lente META. `CRISTAL` continua sendo saída do refino META cruzado. Aqui a lei existente é aplicada à classe `INCIDENTE` para impedir cristalização narrativa, esquecimento histórico, falsa totalidade e autoabsolvição do próprio agente.

```text
DOCUMENTED != CRYSTALLIZED
RULE_EXISTS != ENFORCED
TEST_EXISTS != TEST_PASSED
GATE_EXISTS != SAME_HEAD_PASS
FIXED_POINT != IRREDUCIBLE
NARRATIVE_CLAIM != RECEIPT
```

## Denominador antes do total

O denominador desta capacidade é calculado no próprio checkout:

```text
1. docs/**/*incidente*
2. docs/CONSCIENCIA/APRENDIZADOS.md
   → Categoria contém armadilha | erro-correcao | erro-correção
   → categoria `regra` não vira incidente só porque o título contém "falha"
3. história explícita no ledger
   → PR/commit/incidente sem arquivo dedicado
```

```text
TOTAL_REQUIRES_CLOSED_DENOMINATOR=true
TOTAL_REQUIRES_ZERO_UNREGISTERED=true
TOTAL_REQUIRES_ZERO_NONTERMINAL=true
TOTAL_REQUIRES_ZERO_STRUCTURAL_ERRORS=true
TOTAL_IS_SCOPED_TO_DISCOVERED_DENOMINATOR=true
DENOMINATOR_IS_BOUND_TO_REPOSITORY_STATE=true
CATEGORY_REGRA_IS_NOT_INCIDENT_BY_TITLE_ALONE=true
AGENT_CANNOT_FIX_OFFICIAL_DENOMINATOR_BY_NARRATIVE=true
CHEFE_OWNS_OFFICIAL_RUBRIC=true
```

`100%` significa somente `100% do denominador descoberto por este contrato no HEAD observado`. Não significa “todo bug possível do universo foi eliminado”.

```text
100_PERCENT_IS_SCOPE_BOUND=true
UNKNOWN_OUTSIDE_DENOMINATOR_REMAINS_UNKNOWN=true
CRISTAL_TOTAL_DOES_NOT_PROVE_GLOBAL_RUNTIME_HEALTH=true
CRISTAL_TOTAL_DOES_NOT_ERASE_OTHER_TECHNICAL_DEBT=true
```

## Compressão causal sem apagar proveniência

Incidentes diferentes podem compartilhar a mesma causa, owner, regra e regressão. Isso não exige duplicar arquitetura nem teste idêntico N vezes.

```text
EVENTO_1 ┐
EVENTO_2 ├→ CLUSTER_CAUSAL → OWNER → REGRA → REGRESSAO → CONTRAPROVA
EVENTO_N ┘
```

```text
SAME_CAUSE_CAN_SHARE_CLUSTER=true
SHARED_CLUSTER_DOES_NOT_ERASE_EVENT_PROVENANCE=true
REPEATED_EVENT_IS_NOT_INDEPENDENT_PROOF=true
CLUSTER_REQUIRES_OWNER_MARKERS=true
CLUSTER_REQUIRES_REGRESSION=true
```

Cada evento continua individualmente enumerado no ledger. A compressão acontece na solução causal, não no desaparecimento do fato histórico.

## Estados terminais

```text
CRYSTAL
NO_CHANGE_PROVEN
HISTORICAL_EXCEPTION
```

`NO_CHANGE_PROVEN` é apropriado quando o evento observado é o comportamento correto de um guard fail-closed, e a contraprova mostra que corrigir o “vermelho” significaria enfraquecer a proteção.

`HISTORICAL_EXCEPTION` é permitido quando a evidência foi fechada, mas a superfície que originou o evento não está sob enforcement deste repositório. A exceção precisa declarar o limite; ela não pode ser usada para esconder dívida controlável pela Casa.

## Escada

```text
OBSERVED
→ DISCOVERED
→ FORENSIC
→ OWNER_MAPPED
→ RULE_PROMOTED
→ REGRESSION_WIRED
→ COUNTERPROVED
→ CROSS_META_COUNTERPROOF
→ FIXED_POINT
→ FINAL_SAME_HEAD_GATE
→ CRYSTAL
```

## Same-HEAD sem paradoxo

É proibido gravar no próprio commit o SHA que esse commit só terá depois de existir.

```text
STATIC_SELF_REFERENTIAL_HEAD_FORBIDDEN=true
SOURCE_STORES_CONTRACT_NOT_ITS_OWN_FINAL_SHA=true
FINAL_GATE_MEASURES_GIT_HEAD_AT_RUNTIME=true
FINAL_SEAL_RUNS_AFTER_REGRESSIONS=true
SAME_HEAD_PASS_IS_RUNTIME_RECEIPT=true
```

O workflow executa a auditoria parcial cedo, roda regressões e, por último, mede `git rev-parse HEAD` e exige totalidade no mesmo checkout.

## Autoaplicação

```text
CRYSTALLIZER_FAILURE_REENTERS_DENOMINATOR=true
SELF_EXONERATION=FORBIDDEN
SELF_VALIDATION_WITHOUT_COUNTERPROOF=UNPROVEN
META_CRISTAL_IS_NEW_LENS=false
CRISTAL_IS_CROSS_META_OUTPUT=true
```

Exemplos já cristalizáveis como regra de método:

```text
TEMP_PLACEHOLDER_MAIN_FORBIDDEN=true
POST_MERGE_RESIDUAL_ONLY=true
BLIND_INDEPENDENCE_REQUIRES_SEAL_BEFORE_REVEAL=true
BARRIER_OPEN_ONLY_AFTER_ALL_INDEPENDENT_SEALS=true
PROMISE_CANNOT_EXCEED_PROVEN_CAPABILITY=true
RUNNER_AVAILABILITY_REQUIRES_OBSERVED_EXECUTION=true
CHEFE_INPUT_NOT_LIMITED_BY_AGENT_COMPRESSION=true
DEDUCIBLE_TECHNICAL_STEP_WITHIN_INTENT_DOES_NOT_REQUIRE_NEW_HUMAN_DECISION=true
```

## Falso vermelho também é falsificado

Nem todo bloqueio é defeito:

```text
FAIL_CLOSED_BLOCK != SYSTEM_DEFECT
PROOF_GRAPH_PARTIAL_EXPLICIT != PROOF_GRAPH_FAILURE
TOPOLOGY_ONLY_WITH_ERROS_0 != INCIDENT
```

O grafo de propriedade da prova pode permanecer `PARTIAL_EXPLICIT` e `TOPOLOGY_ONLY` quando isso descreve honestamente sua classe de prova. Torná-lo “COMPLETE” só para verde seria falso verde.

## Anti-mentira operacional

O guard procura claims explícitos de totalidade em artefatos declarativos. Se houver claim total enquanto o denominador tiver resíduo, falha.

```text
REPO_GUARD_CAN_BLOCK_FALSE_CANONICAL_TOTAL=true
EXTERNAL_UI_ENFORCEMENT_REQUIRES_PROVEN_RUNTIME_HOOK=true
UNKNOWN_EXTERNAL_ENFORCEMENT_IS_NOT_PASS=true
```

Selo máximo desta capacidade:

```text
DENOMINATOR>0
AND REGISTERED=DENOMINATOR
AND TERMINAL=DENOMINATOR
AND UNREGISTERED=0
AND NONTERMINAL=0
AND STRUCTURAL_ERRORS=0
AND FINAL_GATE_HEAD==GIT_HEAD
→ LOCKED_100_ZERO_FALSE_GREEN
```

## Regra curta

```text
ACHOU INCIDENTE → ENTRA NO DENOMINADOR
DOCUMENTOU → AINDA NÃO É CRISTAL
MESMA CAUSA → PODE REUSAR O MESMO CLUSTER, SEM APAGAR O EVENTO
DISSE TOTAL → DENOMINADOR TEM QUE ZERAR
SHA DO PRÓPRIO COMMIT → MEDIR NO RUNNER, NÃO ESCREVER ANTES
GUARD BLOQUEOU CORRETAMENTE → NÃO “CORRIGIR” O GUARD
CRISTALIZADOR ERROU → ELE TAMBÉM ENTRA
```
