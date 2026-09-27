---
title: "!REMEDIÇÃO — comando oficial da CentralDark"
status: "CANÔNICO"
date: 2026-08-20
authority: "SEGREDO/CHEFE"
scope: "Comando oficial que remede o estado real depois de qualquer ação para fechar o veredito"
owner: "Metacognição operacional + MetaLupa; sem novo cérebro/orquestrador"
---

# !REMEDIÇÃO — comando oficial da CentralDark

`!REMEDIÇÃO` é um gatilho oficial da Casa, no mesmo nível de entrada operacional de `#ACORDAR`, `!CALIBRAR`, `!MULTIBUSSOLA` e `!EXECUÇÃO_REVERSÍVEL`, com função própria:

```text
!EXECUÇÃO_REVERSÍVEL
= antes da ação: garantir rollback

!REMEDIÇÃO
= depois da ação: medir de novo o estado real,
  comparar T0 → T1, só então declarar veredito
```

O comando **não cria outro agente, skill, cérebro, memória, promotor ou orquestrador**. Reutiliza `#ACORDAR`, `!CALIBRAR`, `!MULTIBUSSOLA`, `!EXECUÇÃO_REVERSÍVEL`, MetaLupa, Meta Menos É Mais, owners/prova existentes e o Writer vigente.

## 1. Sintaxe e ativação

```text
!REMEDIÇÃO
!REMEDICAO
!REMEDIÇAO
```

Aceitar sem sensibilidade a maiúsculas/minúsculas nem acentuação.

## 2. Fluxo

```text
AÇÃO EXECUTADA
↓
!REMEDIÇÃO
↓
MEDIR ESTADO REAL AGORA (T1)
↓
COMPARAR COM ESTADO ANTES (T0)
↓
DELTA REAL = T1 - T0
↓
DELTA BATE COM O QUE FOI PROMETIDO?
↓
SE SIM → VEREDITO = PROVADO
SE NÃO → VEREDITO = NÃO PROVADO (nunca "quase" ou "parcial")
```

## 3. Regra

```text
DECLARADO_PRONTO != PROVADO
EXECUTADO != FUNCIONOU
FUNCIONOU_UMA_VEZ != FIXED_POINT
T0_T1_COMPARISON_REQUIRED=true
NO_YELLOW_STATUS=true
SO_VERDE_COM_RECIBO_OU_NAO_PROVADO=true
NEW_ORCHESTRATOR=false
NEW_AGENT=false
NEW_AUTHORITY=false
```

## 4. Retomada do fio antes de continuar

A recuperação do fio continua pertencendo à Porta de Entrada/Trigger Fabric; esta seção apenas amarra a retomada à remedição para impedir reinício cego ou falso contexto.

```text
#ACORDAR !CENTRALDARK
RECUPERA O FIO ATUAL DA CENTRALDARK, RECONCILIA COM O ESTADO VIVO E CONTINUA DO ÚLTIMO CURSOR PROVADO. NÃO RECOMEÇA DO ZERO.
```

A retomada não depende de palavra mágica isolada. Ela usa contexto recuperável da sessão, owners/receipts, âncoras concretas como repo/PR/HEAD e então remede a realidade viva antes de continuar.

```text
SAME_SESSION_CONTEXT=RECOVERY_HINT
TRIGGER_IS_NOT_PROOF=true
REPO_PR_OWNER_ANCHORS_CONTINUITY=true
RECOVERABLE_CONTEXT_SHOULD_NOT_BE_REASKED=true
LAST_PROVEN_CURSOR_IS_RESUME_TARGET=true
LIVE_REMEASURE_OVERRIDES_STALE_CONTEXT=true
DO_NOT_RESTART_FROM_ZERO=true
MISSING_RECOVERABLE_CONTEXT=UNKNOWN
```

Em qualquer superfície/modelo, a ordem mínima é:

```text
CONTEXTO_RECUPERÁVEL
→ #ACORDAR / !CENTRALDARK
→ OWNER + RECEIPT + PR/HEAD QUANDO APLICÁVEL
→ REMEASURE
→ RECONCILIAR DELTA
→ ÚLTIMO CURSOR PROVADO
→ CONTINUAR A MESMA INTENÇÃO
```

## 5. Remedição → !REGISTRA → ledger ativo

Quando T1 produzir **delta material**, a remedição não termina em narrativa. O resultado precisa entrar no ledger do escopo já ativo antes de qualquer decisão sobre outro PR.

```text
T1 MEDIDO
→ CLASSIFICAR DELTA
→ SE DELTA MATERIAL: !REGISTRA
→ REUSAR PR ATIVO DO MESMO ESCOPO
→ COMMITAR DELTA COALESCIDO / DEDUPLICADO
→ TESTE + CONTRAPROVA + CI DO MESMO HEAD
→ FIXED POINT
→ MERGE
→ MAIN CANÔNICA
```

```text
REGISTRA_REQUIRED_FOR_MATERIAL_DELTA=true
REGISTRA_REQUIRED_FOR_ALL_CENTRALDARK_AGENTS_AND_SURFACES=true
NO_MATERIAL_DELTA_NO_COMMIT_REQUIRED=true
COMMIT_PER_MESSAGE=false

PROMOTION_MODE=DIRECT_MAIN_SOFT_EVOLUTION_WITH_EXISTING_CHILD_TRACE
NEW_PR_DEFAULT=false
EXISTING_OPEN_PRS_REMAIN_VALID=true
EXISTING_COMPATIBLE_CHILD_PR_IS_MANDATORY_LANE=true
CHILD_MATCH_KEY=OWNER+SCOPE+CAPABILITY
DIRECT_MAIN_FORBIDDEN_WHEN_COMPATIBLE_CHILD_IS_HEALTHY=true
STALE_OR_CONFLICTING_CHILD_REQUIRES_RECEIPT_BEFORE_BYPASS=true
MAIN_READBACK_MUST_RETURN_TO_CHILD_AND_PR_MOTHER=true
PR_MOTHER=#1562
PR_MOTHER_ROLE=HISTORY_HANDOFF_LEDGER
PR_MOTHER_MERGE_FORBIDDEN=true

DIRECT_MAIN_WRITE=true
DIRECT_MAIN_COMMIT_REQUIRES_CURRENT_MAIN_REMEASURE=true
DIRECT_MAIN_COMMIT_REQUIRES_RECEIPT_IN_PR_MOTHER=true
PR_GATE_HARDENING=DEFERRED_UNTIL_CHEFE_REENABLES
MIN_SECURITY_ONLY=true
MIN_SECURITY_CHECKS=SECRET_SCAN|SYNTAX_OR_PARSE_WHEN_APPLICABLE|TARGETED_TEST_WHEN_AVAILABLE|MAIN_READBACK

SIMPLE_LOW_RISK_MCP_DELTA_CAN_USE_DIRECT_MAIN=true
FULL_CI_REQUIRED_FOR_SIMPLE_LOW_RISK_MCP_DELTA=false
SIMPLE_MCP_REQUIRES_CAUSAL_DEPLOY_WHEN_RUNTIME_AFFECTED=true
SIMPLE_MCP_REQUIRES_T1_REMEASURE=true

PR_PATH_REMAINS_OPTIONAL_ONLY_WHEN_NO_COMPATIBLE_CHILD_EXISTS=true
EXISTING_COMPATIBLE_CHILD_IS_NOT_OPTIONAL=true
PR_AUTOMATION_MUST_NOT_BYPASS_ITS_OWN_BRANCH_BOUNDARY=true
CHILD_STALE_IS_TRACE_REQUIRED_NOT_SILENT_IGNORE=true
ONE_WRITER_PER_SCOPE=true
REUSE_BEFORE_CREATE=true
UNKNOWN_IS_NOT_PASS=true
NEXT_CURSOR_REQUIRED=true
```



### 5.1. Exceção operacional atual — main direta suave

A política CURRENT da Casa é DIRECT_MAIN_SOFT_EVOLUTION_WITH_EXISTING_CHILD_TRACE. Antes de qualquer escrita material, procurar PR-filho compatível por OWNER+SCOPE+CAPABILITY. Filho saudável é lane obrigatória. Filho stale/conflicting recebe receipt antes de bypass permitido. Sem filho compatível, direct-main segue disponível conforme autoridade e risco.

Para delta MCP simples e de baixo risco, CI pesado não é pré-condição. A exigência é menor e causal: remedir a `main`, reutilizar owner existente, aplicar delta mínimo, executar segurança mínima aplicável, ler de volta a `main`, fazer deploy causal quando houver runtime afetado, remedir T1 e registrar receipt no #1562.

```text
CHEFE_EXPLICIT_WRITER_AUTHORITY
→ CURRENT_MAIN_REMEASURE
→ OWNER_EXISTENTE
→ DELTA_MÍNIMO
→ MIN_SECURITY_CHECKS
→ DIRECT_MAIN_COMMIT
→ MAIN_READBACK
→ DEPLOY_CAUSAL_IF_APPLICABLE
→ T1_REMEASURE
→ RECEIPT_PR_MOTHER_1562
→ NEXT_CURSOR

SIMPLE_LOW_RISK_MCP_DELTA
→ FULL_CI_NOT_REQUIRED
→ TARGETED_TEST_WHEN_AVAILABLE
→ MAIN_READBACK_REQUIRED
→ RUNTIME_T1_REQUIRED_IF_DEPLOYED
```

O caminho suave **não** reclassifica como "simples" mudanças de autenticação, segredos, permissões, política de segurança, migração destrutiva, schema persistente, proteção de branch, workflow privilegiado ou qualquer delta cujo blast radius esteja UNKNOWN. Esses casos continuam exigindo o caminho de prova proporcional ao risco.

PR já aberto e compatível por OWNER+SCOPE+CAPABILITY é lane obrigatória enquanto saudável. Se stale/conflicting, registrar CHILD_LANE_STALE_BLOCKED antes de bypass autorizado. Nenhuma rota pode apagar o rastro do filho.

`!REGISTRA` grava fato reconstruível — intenção, escopo, owner, HEAD/estado, delta, evidência, contraprova, status e próximo cursor. Não grava raciocínio privado nem segredos.

Bug material detectado pode iniciar o próximo ciclo apenas depois que o PR anterior do mesmo escopo terminar e `owner + scope + evidence` estiverem provados. Feature nova não nasce autonomamente sem intenção do SEGREDO/CHEFE.

## 6. Regra global — registrar antes de relatar

Esta é uma regra operacional da **CentralDark inteira**. Vale para Casa, GitHub, VPS, MCP, Desktop, Web, Telegram, IDE, agentes, automações e qualquer superfície futura que opere sob a mesma SOUL.

A resposta final ao SEGREDO/CHEFE deve ser consequência do registro/prova já persistido quando a missão produziu delta material persistível.

```text
GLOBAL_HOUSE_RULE=REGISTER_BEFORE_REPORT
REGISTER_BEFORE_REPORT=true
PERSIST_BEFORE_FINAL_REPORT=true
CHAT_REPORT_WITHOUT_PERSISTED_RECEIPT=INVALID_FOR_MATERIAL_DELTA
PRETTY_CHAT_IS_NOT_PERSISTENCE=true
REPORT_IS_PROJECTION_OF_PERSISTED_STATE=true
```

Fluxo obrigatório:

```text
INTENÇÃO
→ #ACORDAR
→ MEDIR TERRITÓRIO APLICÁVEL
→ EXECUTAR NO OWNER
→ REMEDIR T1
→ !REGISTRA
→ PERSISTIR RECEIPT/COMMIT/LEDGER NO OWNER APLICÁVEL
→ REMEDIR O REGISTRO PERSISTIDO
→ SÓ ENTÃO RELATAR AO CHEFE
```

Quando não houver delta material persistível, não inventar commit apenas para satisfazer ritual:

```text
NO_MATERIAL_DELTA
→ NO_FORCED_COMMIT
→ REPORTAR MEDIÇÃO/NO_CHANGE COM EVIDÊNCIA DISPONÍVEL
```

A regra não autoriza mutação fora do escopo nem transforma chat em Writer. Ela apenas impede que uma ação material termine como memória efêmera.

## 7. Simetria operacional por território

CentralDark é um organismo único com corpos diferentes. **O método é igual; o alvo da prova muda conforme o território.**

```text
SAME_OPERATING_STANDARD=true
SAME_METHOD_ACROSS_SURFACES=true
SAME_EVIDENCE_DISCIPLINE=true
SAME_REGISTER_BEFORE_REPORT=true
PROOF_TARGET_IS_SCOPE_BOUND=true
RUNTIME_AUTHORITY_IS_TERRITORY_BOUND=true
```

### CASA_LOCAL

```text
OWNER_LOCAL
→ MUTAR LOCAL QUANDO AUTORIZADO
→ TESTE LOCAL
→ RECEIPT LOCAL
→ HASH/HEAD/ARQUIVO QUANDO APLICÁVEL
→ RECONCILIAR COM GITHUB SE O ESCOPO FOR VERSIONADO
```

### GITHUB_REMOTO

```text
PR/BRANCH OWNER
→ COMMIT
→ COMMIT_SHA
→ FILE/BLOB REF
→ TESTES/CHECKS/WORKFLOW DO MESMO HEAD
→ CONTRAPROVA
→ RECEIPT NO PR/LEDGER
```

### VPS

```text
OWNER VERSIONADO + RUNTIME VPS
→ DEPLOY/AÇÃO SOMENTE QUANDO AUTORIZADA
→ RUNTIME FINGERPRINT
→ SERVIÇO/PROCESSO/ENDPOINT APLICÁVEL
→ LOG SANITIZADO
→ T0/T1
→ RECEIPT
```

### MCP / API / DESKTOP / WEB / TELEGRAM / IDE

```text
MESMO CORE/OWNER
→ PROVA NA SUPERFÍCIE CORRESPONDENTE
→ NÃO USAR OUTRO TERRITÓRIO COMO SUBSTITUTO
→ REGISTRAR DELTA MATERIAL NO LEDGER VERSIONADO QUANDO APLICÁVEL
```

Assim:

```text
CASA_OPERATING_METHOD == GITHUB_OPERATING_METHOD == VPS_OPERATING_METHOD
METHOD_EQUIVALENCE=true
RUNTIME_PROOF_EQUIVALENCE=false
```

Isto significa **mesma disciplina**, não “a mesma evidência física serve para todos”.

## 8. Prova em fileiras por tópico

Toda missão material deve produzir receipt legível por tópico, sem misturar prova de territórios diferentes em um parágrafo único.

Formato mínimo:

```text
[TÓPICO]
CLAIM=
SCOPE=
OWNER=
T0=
ACTION=
T1=
EVIDENCE_REF=
COMMIT_SHA=
FILE_BLOB_SHA=
SHA256=
TEST=
COUNTERPROOF=
CI_SAME_HEAD=
RUNTIME_PROOF=
STATUS=PROVEN|UNKNOWN|NOT_PROVEN|BLOCKED
NEXT_CURSOR=
```

Regras:

```text
ONE_TOPIC_ONE_PROOF_ROW=true
CLAIM_PROOF_COLOCATION=true
CHECKSUM_WHEN_BYTES_ARE_MATERIAL=true
COMMIT_SHA_WHEN_GIT_MUTATED=true
FILE_BLOB_SHA_WHEN_GITHUB_CONTENT_MUTATED=true
SAME_HEAD_REQUIRED_FOR_CI_CLAIM=true
UNKNOWN_FIELDS_REMAIN_UNKNOWN=true
MISSING_CHECKSUM_MUST_NOT_BE_INVENTED=true
```

Hash/checksum prova identidade de bytes, não funcionamento. Commit SHA prova versão Git, não runtime. Workflow verde prova o workflow aplicável naquele HEAD, não toda a CentralDark.

## 9. Fechamento ao CHEFE

A primeira frase de um fechamento material deve informar **o que já foi registrado**, não prometer que será registrado depois.

Formato:

```text
JÁ_REGISTREI=<o quê>
PR/OWNER=<onde>
COMMIT_SHA=<sha ou UNKNOWN>
RECEIPT=<ref>
VEREDITO=<PROVEN|UNKNOWN|NOT_PROVEN|BLOCKED>
```

Depois vêm as provas por tópico. Se o registro ainda não existe, a IA não deve dizer “feito”.

```text
SAY_DONE_REQUIRES_PERSISTED_EFFECT=true
SAY_REGISTERED_REQUIRES_READ_BACK=true
WRITE_WITHOUT_READBACK != PROVEN
```

ADMINISTRABLE_COMMAND=!REMEDIÇÃO

---

## Conexões Rápidas

- [[00-LEIA-PRIMEIRO]] — portão de entrada
- [[MAPA-DO-CEREBRO]] — visão geral
- [[CONSCIENCIA]] — documento mestre
