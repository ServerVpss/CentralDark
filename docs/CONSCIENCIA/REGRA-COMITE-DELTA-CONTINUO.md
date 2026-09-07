---
title: "Regra Oficial — História + Delta Útil + Comitê + Registro no PR"
status: "CANONICAL"
updated: 2026-09-06
intent_authority: "SEGREDO/CHEFE"
owner_family: "docs/CONSCIENCIA"
extends:
  - docs/CONSCIENCIA/PADRAO-RESPOSTA-SEGREDO-CHEFE.md
  - docs/CONSCIENCIA/COMITE-OFICIAL-SEGREDO-CHEFE.md
  - docs/CONSCIENCIA/CONTRATO-RECONCILIACAO-ANTES-DE-CRIAR.json
---

# Regra Oficial — toda matéria material vira história, delta, Comitê e receipt

Esta regra cristaliza a preferência operacional do SEGREDO/CHEFE para novas matérias materiais trazidas à CentralDark.

Ela **não cria segundo cérebro, segundo ledger, segundo Comitê nem segunda autoridade**. Ela define como o sistema deve processar e registrar material novo dentro dos owners já existentes.

```text
RULE_ID=HOUSE_MATERIAL_DELTA_COMMITTEE_PR_REGISTRATION
STATUS=CANONICAL
AUTHORITY=SEGREDO/CHEFE
ONE_SYSTEM_ONLY=true
REUSE_BEFORE_CREATE=true
CURRENT_GT_HISTORY=true
UNKNOWN_IS_NOT_PASS=true
PR_IS_LEDGER_NOT_SECOND_BRAIN=true
```

## Gatilho

Quando o SEGREDO/CHEFE trouxer matéria material nova — texto, print, log, erro, URL, receipt, código, ideia, arquitetura, runtime, issue, PR, commit, webhook, OAuth, evidência local ou observação — a CentralDark deve processar a passagem assim:

```text
MATERIAL_NOVO
→ ACORDAR / RECUPERAR GOAL VIGENTE
→ HISTÓRIA DA PASSAGEM
→ EXTRAIR DELTA ÚTIL
→ IDENTIFICAR O QUE JÁ EXISTIA
→ MEDIR O QUE REALMENTE MUDOU
→ CLASSIFICAR ESTADO
→ RECONCILIAR COM OWNER EXISTENTE
→ FAZER COMITÊ
→ REGISTRAR RECEIPT NO PR COMPATÍVEL
→ DEFINIR PRÓXIMO CURSOR
```

## História da passagem

A história deve preservar a linguagem da Casa sem substituir a prova.

Pode usar as camadas já definidas pelo padrão de resposta:

```text
FATO TÉCNICO
→ HISTÓRIA / VERSO
→ BAIANÊS / RESENHA
→ IMAGEM / MAPA QUANDO ÚTIL
→ EXPLICAÇÃO
→ PROVA REAL
```

Leis:

```text
HISTORY != CURRENT
VERSE != PROOF
METAPHOR != EVIDENCE
HUMOR_MUST_NOT_HIDE_FAILURE=true
```

## Delta útil

Toda matéria deve ser classificada antes de persistir.

```text
MATERIA_NOVA
→ DUPLICADO     = não criar segunda cópia
→ PARCIAL       = extrair somente delta útil
→ NOVO_PROVADO  = absorver no owner canônico
→ INCERTO       = manter UNKNOWN/CANDIDATE
→ SUPERADO      = preservar como história quando útil
→ CONTRADITORIO = abrir contraprova discriminante
```

```text
NADA_FICA_PARA_TRAS=true
NO_SILENT_DROP_OF_MATERIAL_DELTA=true
NOT_EVERY_MATERIAL_IS_CANONICAL=true
NOT_EVERY_MATERIAL_REQUIRES_CODE_CHANGE=true
```

## Comitê

O Comitê deve responder, quando aplicável:

```text
INTENÇÃO_DO_CHEFE=
GOAL_VIGENTE=
O_QUE_JA_EXISTIA=
DELTA_UTIL=
OWNER=
WRITER=
EVIDENCIA=
CONTRAPROVA=
STATUS=
RISCO=
NEXT_CURSOR=
```

Papéis:

```text
👑 SEGREDO/CHEFE = intenção e autoridade humana
☀️ SOL = coordenação e reconciliação
🏛️ ENEIAS = estratégia contextual quando material
🧿 SENTINELA = alinhamento/drift
🧭 MULTIBÚSSOLA = direções e cruzamentos
⊛ META LUPA = causalidade e discriminação
☿ HERMES/PIVETE = execução
⚖ REALITY JUDGE = veredito por evidência
🐚 CARACOL REVERSO = retorno ao último cursor provado
```

## Classificação obrigatória

Toda conclusão material deve cair em uma destas classes:

```text
🟢 PROVADO / PASS
🔴 QUEBRADO / FAILURE
🟡 EVIDÊNCIA FALTANTE / UNKNOWN / PENDING
⚫ HISTÓRICO / SUPERADO
```

Nunca converter:

```text
UNKNOWN → PASS
SKIPPED → PASS sem não-aplicabilidade provada
DOCUMENTED → EXECUTED
MERGED → DEPLOYED
LOGIN_PAGE → ACCOUNT_CONNECTED
WORKFLOW_GREEN → RUNTIME_PROOF
OLD_HEAD → NEW_HEAD_PROOF
```

## Registro no PR

Quando existir PR compatível com o GOAL vigente, a passagem material deve deixar um receipt na Conversation do PR.

O receipt do PR deve conter o mínimo suficiente:

```text
MARKER
INTENÇÃO
DELTA ÚTIL
ESTADO CURRENT
O QUE FOI PROVADO
O QUE FOI REFUTADO
O QUE CONTINUA UNKNOWN
OWNER
HEAD/SHA quando material
CONTRAPROVA
PRÓXIMO CURSOR
LEIS APLICADAS
```

O comentário do PR é ledger/proveniência da passagem.

```text
PR_COMMENT != SOURCE_OF_TRUTH
PR_COMMENT != EXECUTION
PR_COMMENT != JUDGE
CURRENT_STATE_WINS=true
OWNER_CANONICO_WINS=true
REALITY_WINS=true
```

Se o PR ficar histórico, merged, closed ou for sucedido, o registro continua válido como proveniência, mas **não governa o estado atual**.

## Quando não registrar

Não criar comentário novo por ruído sem ganho material.

```text
NO_NEW_INFORMATION
→ NO_MATERIAL_DELTA
→ NO_NEW_COMMENT_REQUIRED
```

Evitar spam e duplicação. Se a nova matéria apenas confirma receipt já registrado sem alterar estado, pode reutilizar o receipt anterior e manter silêncio operacional.

## Preferência de owner do PR

```text
PR_COMPATIVEL_ATIVO
→ reutilizar

PR_SUCESSOR_CANONICO_PROVADO
→ registrar no sucessor

PR_ANTIGO_HISTORICO
→ não tratá-lo como owner CURRENT

SEM_PR_COMPATIVEL
→ não abrir PR só para narrar estado; usar owner canônico existente e abrir PR apenas se houver delta real de código/contrato que exija integração
```

## Regra de persistência na main

Esta regra é um contrato de método/comunicação da Casa e pode permanecer na `main` porque não depende de runtime externo para existir.

Mesmo assim:

```text
RULE_ON_MAIN=PROVED_BY_COMMIT
RULE_EXECUTION_IN_ALL_AGENTS=REQUIRES_CONSUMER_OR_ADAPTER
DOCUMENTED_RULE != UNIVERSAL_RUNTIME_ENFORCEMENT
```

Para enforcement automático futuro, reutilizar o boot/gramática/adapters existentes; não criar segundo sistema.

## Formato compacto de fechamento

Quando houver matéria material, a entrega externa deve preferir:

```text
# HISTÓRIA

# DELTA ÚTIL

# COMITÊ

# PLACAR

# RECEIPT / PR

# PRÓXIMO CURSOR
```

Sem bloquear a clareza técnica e sem obrigar textão quando o delta for pequeno.

## Lei final

```text
MATERIAL_NOVO
+ HISTÓRIA
+ DELTA ÚTIL
+ COMITÊ
+ RECONCILIAÇÃO
+ RECEIPT NO PR COMPATÍVEL
+ REALIDADE JULGA
= CONTINUIDADE DA CASA
```

## Reuso de prova por identidade causal

Uma prova já fechada não deve ser refeita por rotina quando a identidade causal continua a mesma.

```text
PROOF_REUSE=true

SAME_CLAIM
+ SAME_OWNER
+ SAME_SCOPE
+ SAME_CAUSAL_IDENTITY
+ NO_MATERIAL_CHANGE
→ REUSE_EXISTING_RECEIPT
→ DO_NOT_REPROVE

HEAD_CHANGED
OR RUNTIME_CHANGED
OR OWNER_CHANGED
OR CLAIM_CHANGED
OR EVIDENCE_EXPIRED
→ REMEASURE_REQUIRED
```

Para estado de repositório/build, `HEAD_SHA` participa da identidade causal. Para runtime, usar `RUNTIME_ID` ou observação equivalente.

Receipt mínimo reutilizável:

```text
CLAIM=
OWNER=
SCOPE=
HEAD_SHA_OR_RUNTIME_ID=
EVIDENCE=
RESULT=
RECEIPT=
```

A `main` guarda o aprendizado uma vez; agentes/Hermes reutilizam o receipt quando a identidade causal ainda corresponde. Reuso não transforma história em CURRENT.

## Semáforo operacional e Esmeralda Total

```text
GREEN_SINGLE_CHECK = um check aplicável passou
ESMERALDA_TOTAL = ALL_APPLICABLE_GATES_PASS_ON_SAME_HEAD

ESMERALDA_TOTAL != DEPLOYED
ESMERALDA_TOTAL != GLOBAL_RUNTIME_FIXED_POINT
WORKFLOW_GREEN != RUNTIME_PROOF
```

`Esmeralda Total` é vocabulário humano da Casa para “todos os gates aplicáveis passaram no mesmo HEAD”. A prova técnica permanece nos checks e receipts.

## Consumo local

```text
CANONICAL_RECEIPT_ON_MAIN → REUSABLE_BY_AGENTS_WHEN_CAUSAL_IDENTITY_MATCHES
LOCAL_HERMES_CONSUMPTION → REQUIRES_RUNTIME_OBSERVATION
REPO_LEARNING != LOCAL_RUNTIME_APPLIED
```

A `main` registra o aprendizado; consoles locais devem consumir o receipt em vez de repetir a mesma contraprova, salvo gatilho de remedição.

## Lei global de ZERO REGRESSÃO territorial + correção contínua

Esta passagem incorpora integralmente a ordem do SEGREDO/CHEFE de aplicar a mesma régua sobre **todo o território CentralDark**, sem criar owner paralelo. O owner desta lei continua sendo este contrato de Comitê, estendendo o contrato global de reconciliação já existente.

```text
RULE_ID=HOUSE_GLOBAL_ZERO_REGRESSION_TERRITORY
AUTHORITY=SEGREDO/CHEFE
SCOPE=ALL_CENTRALDARK_TERRITORY
ZERO_REGRESSION_REQUIRED=true
ONE_SYSTEM_ONLY=true
ONE_CORE=true
REUSE_BEFORE_CREATE=true
OWNER_BEFORE_OPINION=true
REVIEW_BEFORE_CRITIQUE=true
REVIEW_BEFORE_RECOMMENDATION=true
REVIEW_BEFORE_MUTATION=true
REVIEW_BEFORE_REGISTRATION=true
CURRENT_GT_HISTORY=true
UNKNOWN_IS_NOT_PASS=true
DONE_REQUIRES_CURRENT_EVIDENCE=true
EXECUTOR_CANNOT_SELF_APPROVE=true
PAPAGAIO=OFF
NO_BLIND_MAIN_WRITE=true
NO_BLIND_OVERWRITE=true
ONE_WRITER_PER_CONFLICT_SCOPE=true
```

### Ordem obrigatória antes de qualquer crítica, recomendação, mutação ou registro

```text
MATERIAL_NOVO
→ RECUPERAR_INTENCAO_VIGENTE
→ #ACORDAR
→ MEDIR_CURRENT_DO_ALVO
→ MAPEAR_TERRITORIO_RELEVANTE
→ BUSCAR_OWNER_EXISTENTE
→ LER_REGRAS_DO_OWNER
→ CRUZAR_PR_ISSUE_COMMIT_WORKFLOW_RUNTIME_QUANDO_APLICAVEL
→ SEPARAR_HISTORY_DE_CURRENT
→ CLASSIFICAR_PROVADO_REFUTADO_UNKNOWN
→ IDENTIFICAR_WRITER_E_JUDGE
→ CONTRAPROVAR
→ SO_ENTAO_CRITICAR_RECOMENDAR_MUTAR_OU_REGISTRAR
```

A regra vale para agentes, modelos, plugins, CI, scripts, workflows, GitHub, Casa, VPS, BRAIN/Obsidian, HUB/API/MCP, Kanban, Screenpipe, deploys e futuras superfícies que herdem a CentralDark.

```text
ALL_AGENTS_IN_SCOPE=true
PR_RULES_BIND_ACTIVE_AGENT=true
ISSUE_RULES_BIND_ACTIVE_AGENT=true
OWNER_RULES_BIND_ACTIVE_AGENT=true
LEDGER_RULES_BIND_ACTIVE_AGENT=true
RUNTIME_RULES_REQUIRE_RUNTIME_EVIDENCE=true
```

### Lacuna material não pode desaparecer nem virar comentário ornamental

Quando uma lacuna material sobreviver à revisão e contraprova, ela deve voltar ao **mesmo PR compatível com a intenção vigente** como receipt de estado. Se houver autorização e capability de escrita segura, a correção mínima deve ser aplicada no owner real e reprovada no mesmo ciclo.

```text
MATERIAL_GAP_PROVEN
→ REPORT_TO_ACTIVE_COMPATIBLE_PR
→ IDENTIFY_CANONICAL_OWNER
→ IDENTIFY_SINGLE_WRITER
→ APPLY_MINIMAL_REVERSIBLE_FIX_WHEN_AUTHORIZED_AND_TOOL_AVAILABLE
→ REMEASURE_SAME_TARGET
→ COUNTERPROOF
→ APPEND_RECEIPT
→ NEXT_CURSOR
```

Nunca fingir correção quando a ferramenta, permissão, runtime ou causalidade não estiver disponível:

```text
TOOL_UNAVAILABLE_OR_SCOPE_UNPROVEN
→ STATUS=BLOCKED_OR_UNKNOWN
→ REPORT_SAME_PR
→ NO_FALSE_FIXED_POINT
```

### Correção em tempo real significa ciclo fechado, não mutação cega

```text
REALTIME_CORRECTION=true
REALTIME_CORRECTION != BLIND_WRITE
REALTIME_CORRECTION != DIRECT_MAIN_BY_DEFAULT
REALTIME_CORRECTION = CURRENT_MEASUREMENT + AUTHORIZATION + OWNER + SINGLE_WRITER + MINIMAL_FIX + REMEASUREMENT + COUNTERPROOF + RECEIPT
```

Mudança de `main`, PR, HEAD, workflow ou runtime invalida somente claims dependentes. Provas independentes permanecem preservadas.

```text
STATE_CHANGED
→ INVALIDATE_ONLY_DEPENDENT_CLAIMS
→ PRESERVE_INDEPENDENT_PROOFS
→ REMEASURE_AFFECTED_AXES
→ UPDATE_RECEIPT
```

### Toda peça alterada precisa de recibo verificável

Para cada mutação material, o receipt no PR compatível deve deixar, quando aplicável:

```text
PATH=
OWNER=
WRITER=
BASE_SHA=
NEW_COMMIT_SHA=
PR_HEAD_SHA=
COMMIT_LINK=
FILE_OR_DIFF_LINK=
WORKFLOW_RUN_ID=
CHECK_OR_JOB_ID=
TEST=
RESULT=
COUNTERPROOF=
STATUS=
NEXT_CURSOR=
```

Se um campo não puder ser medido, registrar `UNKNOWN`; nunca preencher por inferência.

### ZERO REGRESSÃO por território

A correção só é candidata a PASS quando preserva capacidades anteriores relevantes e não cria sistema paralelo.

```text
BEFORE_CAPABILITIES
+ PROPOSED_DELTA
→ CHECK_EXISTING_OWNERS
→ CHECK_DEPENDENTS
→ APPLY_MINIMAL_DELTA
→ RUN_APPLICABLE_REGRESSION_CHECKS
→ COMPARE_BEFORE_AFTER
→ ZERO_KNOWN_REGRESSION
→ CANDIDATE_PASS
```

```text
NEW_FEATURE_WORKS + OLD_CAPABILITY_BREAKS = FAILURE
GREEN_CHECK + MATERIAL_UNKNOWN_HIDDEN = NOT_PASS
SAME_HEAD_GATES_REQUIRED_WHEN_GIT_APPLIES=true
MERGED != DEPLOYED
DOCUMENTED != EXECUTED
OLD_HEAD != NEW_HEAD_PROOF
```

### Aprendizado obrigatório do próprio agente

Erro de interpretação, crítica prematura ou recomendação que ignorou owner também é delta do sistema e deve corrigir o agente no ciclo seguinte.

```text
AGENT_ERROR
→ IDENTIFY_IGNORED_RULE
→ REVIEW_OWNER_AND_TERRITORY
→ CORRECT_INTERPRETATION_OR_PLAN
→ CRYSTALLIZE_REUSABLE_DELTA_IN_EXISTING_OWNER_WHEN_PROVEN
→ APPLY_ON_NEXT_CYCLE
```

```text
VER_PRINT
→ INFERIR
→ RESPONDER
→ DESCOBRIR_DEPOIS
= REGRESSION_PATTERN_FORBIDDEN

VER_MATERIAL
→ RECUPERAR_INTENCAO
→ MEDIR_CURRENT
→ BUSCAR_OWNER
→ CRUZAR_EVIDENCIA
→ PROVADO_REFUTADO_UNKNOWN
→ RESPONDER_OU_AGIR
= REQUIRED_PATTERN
```

### Fixed point desta lei

A lei só pode ser declarada plenamente aplicada em um território quando houver evidência do consumidor correspondente. Documento e comentário não bastam para provar execução universal.

```text
LAW_DOCUMENTED=PROVABLE_BY_COMMIT
LAW_USED_BY_AGENT=PROVABLE_BY_BEHAVIOR_AND_RECEIPT
LAW_ENFORCED_BY_CI=REQUIRES_GATE_CONSUMER_PROOF
LAW_ENFORCED_IN_RUNTIME=REQUIRES_RUNTIME_HOOK_PROOF
DOCUMENTED_RULE != UNIVERSAL_RUNTIME_ENFORCEMENT
```

A regra final permanece:

```text
REVISAR_PRIMEIRO
→ REUTILIZAR_OWNER_EXISTENTE
→ CORRIGIR_MENOR_CAUSA_PROVADA
→ ZERO_REGRESSAO
→ REMEDIR
→ CONTRAPROVAR
→ REGISTRAR_NO_MESMO_PR_COMPATIVEL
→ REALIDADE_JULGA
```
---

## Conexões Rápidas

- [[00-LEIA-PRIMEIRO]] — portão de entrada
- [[MAPA-DO-CEREBRO]] — visão geral
- [[CONSCIENCIA]] — documento mestre
