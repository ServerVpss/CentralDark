# CENTRALDARK — MAPA CANÔNICO DA CASA

Mesma família canônica, evoluída por DELTA. Não é V2/V3.

`REUSE_BEFORE_CREATE=true` · `ONE_SYSTEM_ONLY=true` · `VISUAL_CLAIM != RUNTIME_PROOF` · `REALITY = JUDGE`

## Lei suprema

CHEFE = intenção + destino. SOL = navegação/reconciliação. HERMES = execução/preservação. MODELOS/FERRAMENTAS = meios substituíveis. REALIDADE = confirmação.

```text
CHEFE_INTENT
→ DESTINATION_LOCK
→ MEASURE_LIVE_STATE
→ SEARCH_ALL_MATERIAL_PATHS
→ RESOLVE_CANONICAL_OWNER
→ ONE_WRITER_PER_SCOPE
→ EXECUTE_MINIMAL_DELTA
→ OUTPUT_GUARD
→ COUNTERPROOF
→ REALITY_JUDGE
→ RECEIPT
→ LAST_GOOD_STATE
→ NEXT_CURSOR
```

## Regra operacional global

Toda correção humana, falha de tool/teste/CI/runtime ou nova invariante deve virar comportamento reutilizável só quando houver owner, consumidor, gate/runtime, teste positivo, teste negativo, contraprova e receipt.

```text
PROSE_ONLY_RULE = NOT_LEARNED
DOCUMENTED_ONLY_RULE = NOT_LEARNED
REPEATED_CHEFE_INSTRUCTION_AFTER_PROMOTION = LEARNING_TRANSFER_FAIL
```

## Qualquer bot/agente

```text
BOT_ENTRY
→ CENTRALDARK_AI_BOOT
→ #ACORDAR
→ !CALIBRAR
→ !MULTIBÚSSOLA
→ !META_LUPA proporcional ao risco
→ DESTINATION_LOCK
→ OWNER EXISTENTE
→ EXECUÇÃO
→ OUTPUT_GUARD
→ REALITY JUDGE
```

`ENGINE != OWNER` · `ENGINE_SWITCH != RESET`

## Qualquer PR / qualquer commit

```text
ANY_PR_OR_COMMIT
→ REMEASURE_HEAD
→ ENFORCE_CANONICAL_RUNNER_POLICY
→ ENFORCE_WORKFLOW_REUSE
→ RUN_GATES
→ COLLECT_FAILURE_SIGNATURE
→ SELF_HEAL_IF_SAFE
→ COUNTERPROOF
→ RECEIPT
→ CONTINUE_TO_FIXED_POINT
```

Runner padrão da Casa: `[self-hosted, Linux]`. `ubuntu-latest`, `windows-latest`, `macos-latest` são proibidos nos workflows raiz. Exceção de plataforma continua self-hosted e precisa de necessidade comprovada.

## Anti-proliferação

Não criar workflow/promotor/dispatcher/MCP/segundo cérebro equivalente quando owner já existe. Reutilizar e atualizar:

- `.github/workflows/porta-de-entrada.yml`
- `.github/workflows/autonomia-promocao.yml`
- `.github/workflows/trigger-fabric-package.yml`

## Self-healing

```text
FAILURE
→ FAILURE_SIGNATURE
→ IDENTIFY_CAUSE
→ SEARCH_EXISTING_CRYSTAL
→ DISCRIMINATING_TEST
→ MINIMAL_REMEDIATION
→ SAME_OWNER / SAME_WORKFLOW
→ RETEST
→ COUNTERPROOF
→ REALITY_JUDGE
→ RECEIPT
→ CRYSTAL
→ LAST_GOOD_STATE
→ NEXT_CURSOR
```

Cristal do runner:
`GITHUB_HOSTED_RUNNER_SELECTED_WHILE_HOUSE_IS_SELF_HOSTED → BIND_EXISTING_WORKFLOW_TO_SELF_HOSTED_CANONICAL_PLATFORM → BLOCK BEFORE MERGE → REUSE CRYSTAL`.

## Labels

`👑 PERMITO-SEGREDO` = autoridade humana delegada. `🔄 GIT` = roteamento Git. `🤖 AUTO` = automação. `🟡 IA-PRECISA-REVISAR` = baseline de revisão. `✅ PR CONFIRMADO` = resultado derivado pós-prova; nunca autoridade.

## Estados

`GREEN=PROVEN` · `RED=FAILED/BLOCKED` · `BLACK=UNKNOWN/NOT_PROVEN` · `LOCKED=QUARANTINE/HUMAN_LOCK` · `WORKING/FORJA=EM ANDAMENTO, NUNCA PASS`.

## Invariantes

`ONE_SYSTEM_ONLY` · `REUSE_BEFORE_CREATE` · `ONE_OWNER_PER_CAPABILITY` · `ONE_WRITER_PER_SCOPE` · `PARALLELIZE_PERCEPTION` · `SERIALIZE_MUTATION` · `SEARCH_BEFORE_ASK` · `UNKNOWN != PASS` · `ERROR != PASS` · `ACTION != PROOF` · `DOCUMENTED != EXECUTED` · `SPEC != IMPLEMENTATION` · `FOUND != CURRENT` · `HISTORY != CURRENT_STATE` · `SELF_PROOF != PASS`.

## Fixed Point

Somente quando destino provado, falha generalizada, nova ocorrência bloqueada pelo gate, workflows afetados reconciliados, cristal reutilizável, contraprova sobrevivida e UNKNOWN material zero no escopo.

## BOOT

`CHEFE_INTENT → DESTINATION_LOCK → CASA → OWNER/WRITER → EXECUTE → SELF_HEAL → COUNTERPROOF → REALITY → RECEIPT → NEXT_BOOT`

## Fio da missão

`intenção → destino travado → estado vivo → descoberta automática → owner existente → execução mínima → falha vira sensor → cura vira cristal → próximo PR/commit herda → realidade confirma → continuidade`
