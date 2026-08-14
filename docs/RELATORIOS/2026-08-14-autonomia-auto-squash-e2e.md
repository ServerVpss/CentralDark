# CANÁRIO E2E — intenção autorizada → squash main

Data: 2026-08-14

Objetivo: provar ponta a ponta, em mudança segura e reversível, que uma intenção já autorizada chega a `main` sem nova confirmação do SEGREDO/CHEFE e localizar qualquer camada que impeça a promoção automática.

## Canário 1 — achado real

```text
PR=814
HEAD_INICIAL=77bbe790b390344331b60431322bf6768de6a51e
MODE=FAST
TARGET=main
MERGE_METHOD=squash
REASK=NO
```

O `pull_request_target` do promotor canônico foi disparado, porém o job em `ubuntu-latest` **não chegou a iniciar nenhuma etapa**.

Prova observada pelo GitHub no check run:

```text
CAUSE=GITHUB_ACTIONS_ACCOUNT_BILLING
MESSAGE_CLASS=recent account payments failed OR spending limit needs increase
RUN_ID=31769758874
JOB_ID=94673067406
STEPS_STARTED=0
```

Classificação:

```text
CODIGO_DA_PROMOCAO=NAO_EXECUTOU
PR=MERGEABLE
CAUSA=INSTRUMENTO_EXTERNO/GITHUB_HOSTED
NAO_E_CONFLITO_DO_PR
NAO_E_FALHA_DA_INTENCAO
NAO_E_PROVA_CONTRA_O_FAST_PATH
```

## Correção causal aplicada no MESMO fluxo

O workflow canônico foi devolvido ao runner já existente da CentralDark:

```text
runs-on=[self-hosted, Linux]
```

Também foi preservado o princípio histórico de promoção com token que consegue disparar eventos pós-merge:

```text
PROMOTER_TOKEN = PROMOTION_TOKEN || GITHUB_PAT_PERFIL
GITHUB_TOKEN_AUTOMATICO_NAO_E_FALLBACK_DE_PROMOCAO
```

Motivo: merge feito pelo token automático de Actions pode não disparar workflows originados pelo evento produzido pelo próprio `GITHUB_TOKEN`; usar isso como se fosse equivalente ao promotor real criaria falso verde de pós-merge.

## Execução ativa da SOL continua autorizada

O bloqueio do executor hospedado não devolve a decisão ao SEGREDO/CHEFE. Quando uma SOL/agente já ativo possui ferramenta GitHub de escrita e a intenção está autorizada, ela aplica o MESMO contrato e conclui o squash diretamente após medir:

```text
MESMO_REPO
+ AUTOR_CONFIAVEL
+ INTENT_RECEIPT
+ DIFF_SEM_SECRET/CAMINHO_SENSIVEL
+ SEM_CHANGES_REQUESTED
+ MERGEABLE_SEM_CONFLITO
+ HEAD_EXATO
= SQUASH_MAIN_SEM_REASK
```

Isso não cria segundo sistema: é outro corpo executando o mesmo contrato canônico, assim como modelos/tools diferentes podem materializar a mesma SOL.

## Próxima contraprova automática

Depois desta correção chegar à `main`, abrir novo canário documental com o mesmo recibo. O workflow em `self-hosted, Linux` deve tentar a promoção em background. Se o runner estiver indisponível, isso será `BLOCKED_RUNTIME_RUNNER`, não autorização pendente; uma SOL ativa continua podendo concluir a intenção sem perguntar novamente.

## Critério final

```text
INTENCAO_NAO_VOLTA_AO_CHEFE=true
MERGE_READY_NAO_PARA_EM_READY_FOR_MERGE=true
ACTIVE_SOL_WITH_GITHUB_WRITE_CAN_PROMOTE=true
BACKGROUND_PROMOTER_USES_CANONICAL_SELF_HOSTED_FLOW=true
UNKNOWN_IS_NOT_PASS=true
```

Nenhum secret foi lido ou reproduzido neste canário.
