---
title: "Regra Global — Pré-produção MCP Mão na Massa"
status: "CANONICAL_GLOBAL_RULE"
updated: 2026-09-25
owner: "docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/"
authority: "SEGREDO/CHEFE"
scope: "CentralDark, VPS, MCP, Hermes, bots, plugins, workflows e agentes autorizados"
truth_rule: "REALIDADE_IS_JUDGE"
---

# Regra Global — Pré-produção MCP Mão na Massa

Esta regra torna global o modo operacional definido pelo SEGREDO/CHEFE para o ambiente de pré-produção MCP da CentralDark.

## 1. Intenção

Quando o CHEFE der uma ordem operacional dentro do escopo CentralDark/VPS/MCP/Hermes/bots/plugins/workflows, o executor deve preferir agir no ambiente vivo, adaptar o comando ao estado real e fazer funcionar primeiro, em vez de apenas explicar como faria.

```text
ORDEM_DO_CHEFE
→ MEDIR_ESTADO_VIVO
→ ADAPTAR_AO_RUNTIME
→ EXECUTAR_NA_VPS_OU_CANAL_AUTORIZADO
→ FAZER_FUNCIONAR
→ PROVAR_MINIMO
→ REGISTRAR_RECEIPT
→ REFINAR_NO_CI_CD
```

## 2. Modo pré-produção MCP

```text
PREPRODUCAO_MCP_MAO_NA_MASSA=true
EXECUTE_WHEN_TOOL_AVAILABLE=true
ADAPT_COMMAND_TO_CURRENT_RUNTIME=true
MAKE_IT_WORK_FIRST=true
REFINE_AFTER_IN_CI_CD=true
NO_EXPLANATION_INSTEAD_OF_AVAILABLE_ACTION=true
```

Se houver ferramenta viva e autorização de escopo, o executor deve usar a ferramenta. Se não houver ferramenta, deve declarar `EXECUTION_CAPABILITY=ADVISORY_ONLY` e entregar o melhor artefato executável possível sem fingir execução.

## 3. Segredos e tokens

O CHEFE pode fornecer trecho de token, nome de secret, chave parcial, variável ou dado sensível durante uma ordem operacional. Isso deve ser tratado como entrada sensível de runtime, não como texto para espalhar.

```text
SECRET_INPUT_FROM_CHEFE_ALLOWED_AS_OPERATIONAL_INPUT=true
DO_NOT_PRINT_SECRET=true
DO_NOT_COMMIT_SECRET=true
DO_NOT_ECHO_SECRET_IN_CHAT=true
DO_NOT_PUT_SECRET_IN_PR_COMMENT=true
DO_NOT_PUT_SECRET_IN_RECEIPT=true
USE_ONLY_AS_LOCAL_ENV_OR_SECRET_BINDING=true
MASK_OR_REDACT_WHEN_REPORTING=true
```

Segredo entra no local seguro, variável, vault, secret manager ou arquivo autorizado fora do Git. O valor nunca vira log público, commit, comentário de PR, receipt ou documentação.

## 4. Limites que continuam obrigatórios

Pré-produção não significa falso-verde nem destruição sem controle.

```text
UNKNOWN != PASS
ACTION != PROOF
DOCUMENTED != EXECUTED
MERGED != DEPLOYED
QUEUED != PASS
CI_PENDING_IS_NOT_PASS
REALIDADE_IS_JUDGE=true
NO_BLIND_RESET=true
NO_BLIND_PULL_OVER_DIRTY_RUNTIME=true
NO_SECRET_LEAK=true
NO_AUTO_EXECUTE_DANGEROUS_FILE=true
```

Arquivos recebidos, inclusive `.exe`, scripts, HTML, JS, CSS, ZIP ou binários, podem ser guardados, indexados, hasheados e linkados como conhecimento, mas não executados automaticamente.

## 5. Git, PR-mãe e PR-filho

```text
PR_MOTHER=#1562
PR_MOTHER_ROLE=LEDGER_RENDEZVOUS_NOT_WRITER
PR_CHILD_OR_MAIN_WRITES_DELTA=true
RECEIPT_RETURNS_TO_PR_MOTHER=true
CHILD_MATCH_KEY=OWNER+SCOPE+CAPABILITY
EXISTING_COMPATIBLE_CHILD_PR_IS_MANDATORY_LANE=true
DIRECT_MAIN_FORBIDDEN_WHEN_COMPATIBLE_CHILD_IS_HEALTHY=true
STALE_OR_CONFLICTING_CHILD_REQUIRES_RECEIPT_BEFORE_BYPASS=true
DIRECT_MAIN_ALLOWED_WITHOUT_CHILD_OR_EXPLICIT_BYPASS=true
MAIN_READBACK_MUST_RETURN_TO_CHILD_AND_PR_MOTHER=true
```

Antes de escrever, medir PRs-filhos por OWNER+SCOPE+CAPABILITY. Filho compatível saudável é obrigatório e promove por SAME_HEAD -> SQUASH -> MAIN. Filho stale/conflicting recebe CHILD_LANE_STALE_BLOCKED antes de bypass. Após MAIN_READBACK, o SHA final retorna ao filho existente e ao PR-mãe.

## 6. CI determinístico aberto

O CI de pré-produção deve permanecer aberto para progresso incremental. Ele não precisa provar perfeição global para aceitar um delta operacional, mas só pode marcar como `PASS` aquilo que foi medido e provado de forma determinística.

```text
CI_DETERMINISTICO_ABERTO=true
CI_PASS_ONLY_PROVEN_DETERMINISTIC_ROUTES=true
CI_DOES_NOT_REQUIRE_GLOBAL_PERFECTION=true
UNPROVEN_CHECK_STAYS_UNKNOWN_OR_PENDING=true
UNKNOWN_CHECK_DOES_NOT_BLOCK_UNRELATED_PROVEN_DELTA=true
FAILED_DETERMINISTIC_CHECK_BLOCKS_ONLY_ITS_SCOPE=true
PROVEN_HOTPATCH_CAN_BE_COMMITTED_WITH_RECEIPT=true
IMPERFECT_BUT_PROVEN_DELTA_CAN_PROGRESS=true
REFINE_AFTER_PASSING_MINIMUM=true
```

Fluxo padrão:

```text
VPS_PREPROD_HOTPATCH
→ PROVA_LOCAL_MINIMA
→ COMMIT_MAIN_OU_PR_FILHO
→ RECEIPT_PR_MAE
→ MICRO_DEPLOY_VPS_QUANDO_APLICAVEL
→ CI_CD_REFINA
→ SOMENTE_ROTAS_PROVADAS_PASSAM
→ UNKNOWN_PERMANECE_ABERTO
```

Isso acelera sem falso-verde: o que passou, passou porque provou; o que não provou fica aberto para próximo TIK-TAK.

## 7. Forma correta de resposta operacional

Quando uma ordem operacional for executável, o padrão é:

```text
MEDIÇÃO
→ EXECUÇÃO
→ CONTRAPROVA
→ COMMIT/RECEIPT_QUANDO_HOUVER_DELTA
→ ESTADO_FINAL
→ NEXT_CURSOR
```

Não devolver uma cadeia de comandos para o CHEFE executar quando o executor possui ferramenta viva para fazer com segurança.

## 8. Falha ou bloqueio

Se não der para executar, o executor deve mostrar o bloqueio exato:

```text
HOST=
COMPONENT=
FILE_OR_SERVICE=
COMMAND_ATTEMPTED=
OBSERVED_ERROR=
CAUSE=PROVEN|HYPOTHESIS|UNKNOWN
SECRET_EXPOSED=false
NEXT_SAFE_ACTION=
```

Erro genérico, conselho solto ou pedido para o humano adivinhar é `FAIL`.

## 9. Frase canônica

> Pré-produção MCP é mão na massa: executa, adapta e faz funcionar; segredo não vaza; realidade continua julgando.

> CI aberto não é CI frouxo: só passa o que provou, e deixa o resto vivo para o próximo TIK-TAK.
