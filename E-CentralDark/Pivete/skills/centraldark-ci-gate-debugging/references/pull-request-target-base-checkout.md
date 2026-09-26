# `pull_request_target` e checkout da base confiável

## Sinal
Um job privilegiado falha num teste que o HEAD do PR já corrigiu.

## Diagnóstico
`pull_request_target` pode executar o workflow da base e fazer checkout explícito de `github.event.pull_request.base.sha`. Nesse desenho, o job não consome a correção do teste presente no HEAD do PR.

## Procedimento

1. Ler o workflow e provar a ref do checkout (`base.sha`, `head.sha` ou `github.sha`).
2. Comparar o teste na base e no HEAD do PR:

```bash
grep -n -A8 -B4 'actions/checkout\|pull_request_target' .github/workflows/<workflow>.yml
git show <base_sha>:<test> | sed -n '<range>p'
git show <head_sha>:<test> | sed -n '<range>p'
gh run view <run_id> --log-failed
```

3. Classificar como `BASE_RED` quando a falha pertence à base e o delta do PR já corrige o teste.
4. Não trocar cegamente para `head.sha`: em `pull_request_target`, isso pode executar código do PR com token/permissões privilegiadas.
5. Não alegar CI verde. Registrar `BLOCKED_BASE_WORKFLOW`, causa e `NEXT_CURSOR` no receipt.
6. Não remover teste, aceitar falha ou enfraquecer gate para contornar o bloqueio. Alteração no workflow só com correção de segurança/protocolo autorizada.

`BASE_RED` pode não ser regressão do PR, mas continua sendo uma falha observada do job e deve permanecer visível.