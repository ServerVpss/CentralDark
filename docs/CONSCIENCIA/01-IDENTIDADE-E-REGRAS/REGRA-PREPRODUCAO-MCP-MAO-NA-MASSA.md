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
USE_CHILD_PR_WHEN_SCOPE_IS_ALREADY_IN_CHILD=true
DIRECT_MAIN_ALLOWED_ONLY_WHEN_EXPLICIT_OR_GLOBAL_RULE=true
```

Mudanças globais de regra podem ir direto ao `main` quando o CHEFE pedir explicitamente tornar global. Mudanças de implementação em andamento devem preferir o PR-filho adequado. O PR-mãe recebe receipt/handoff e não deve ser usado como veículo de merge.

## 6. Forma correta de resposta operacional

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

## 7. Falha ou bloqueio

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

## 8. Frase canônica

> Pré-produção MCP é mão na massa: executa, adapta e faz funcionar; segredo não vaza; realidade continua julgando.
