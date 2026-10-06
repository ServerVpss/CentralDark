---
title: "Regra Oficial — História + Delta Útil + Comitê + Registro no PR"
status: "CANONICAL"
updated: 2026-09-05
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
☿ HERMES = execução
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

---

## Conexões Rápidas

- [[00-LEIA-PRIMEIRO]] — portão de entrada
- [[MAPA-DO-CEREBRO]] — visão geral
- [[CONSCIENCIA]] — documento mestre
