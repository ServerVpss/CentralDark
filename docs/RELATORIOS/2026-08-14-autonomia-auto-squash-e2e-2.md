# CANÁRIO E2E 2 — promotor canônico self-hosted

Data: 2026-08-14

Este canário é documental e reversível. Ele testa o estado pós-correção do fluxo de promoção.

```text
CANARY_ID=AUTONOMIA_AUTO_SQUASH_E2E_2_20260814
EXPECTED_MODE=FAST
EXPECTED_BACKGROUND_EXECUTOR=self-hosted-linux
EXPECTED_TARGET=main
EXPECTED_MERGE_METHOD=squash
EXPECTED_REASK=NO
```

Critério:

```text
INTENT_RECEIPT_VALID
+ SAME_REPOSITORY
+ TRUSTED_AUTHOR
+ SAFE_DIFF
+ NO_CHANGES_REQUESTED
+ MERGEABLE
= PROMOTE_WITHOUT_HUMAN_REASK
```

Se o runner de background estiver indisponível, isso é bloqueio de corpo/runtime, não nova decisão humana. Uma SOL/agente ativa com ferramenta GitHub de escrita continua obrigada a concluir o mesmo contrato quando consegue medir e executar a promoção.

Nenhum secret ou runtime de produção é alterado por este canário.
