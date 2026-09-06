# 🧿 WORKFLOW STARTUP FAILURE — mineral de reconciliação

## Intenção

Restaurar capacidade executável sem apagar aprendizado. `CURRENT > HISTORY`, `UNKNOWN != PASS`, `REUSE_BEFORE_CREATE`.

## Evidência causal

Na `main@46a3f8a28f46bf42420e7ea9c290d850a0eb7369`, quatro workflow runs terminaram `failure`; os quatro retornaram `jobs=[]`, portanto a falha ocorreu antes da execução de jobs.

O commit `62e7bb94fc097a02c6afae37638f41eb4a3a1cb6` reserializou YAMLs inteiros para alterações pequenas. Foram observados:

- `.github/workflows/auto-pr-and-deploy.yml`: `on:` virou `true:`;
- `.github/workflows/autonomia-promocao.yml`: `on:` virou `true:`;
- `.github/workflows/lupa-conformance.yml`: `if:` foi inserido como elemento inválido dentro de `steps:` e outro `if:` duplicou a condição do job de cartazes.

## Remediação mínima

Restaurar esses três owners ao blob do último pai estruturalmente válido `7f27c79570613dc66a11e4f3ed54e3bd075d7324`, sem criar workflow V2.

## Aprendizado preservado — REFUTED_MINERAL

As intenções adicionadas no commit causal não são descartadas. Em especial, a ligação de variáveis `CENTRALDARK_ACTION_CLASS`, `CENTRALDARK_INTENT_AUTHORIZED`, `CENTRALDARK_DEPLOY_TARGET` e `CENTRALDARK_ROLLBACK_READY` deve voltar à META_LUPA somente após o workflow voltar a ser aceito pelo GitHub e criar jobs.

```text
FAILED_CANDIDATE=REFUTED_MINERAL
FAILURE_SIGNATURE=WORKFLOW_STARTUP_FAILURE_ZERO_JOBS
CAUSE=WHOLE_YAML_RESERIALIZATION_CHANGED_SEMANTICS
LAST_GOOD_STATE=7f27c79570613dc66a11e4f3ed54e3bd075d7324
REOPEN_CAUSE=WORKFLOW_PARSER_GREEN_AND_MINIMAL_REAPPLY
NO_SILENT_DISCARD=true
```

## Regra persistente

Nunca usar serialização YAML genérica que converta a chave GitHub Actions `on` em booleano `true` ou que reposicione condições de job/step. Alterações de workflow devem ser delta mínimo, seguidas por validação estrutural antes de promoção.

`DOCUMENTED != EXECUTED`: este arquivo preserva o aprendizado; o verde só existe quando o HEAD exato produzir jobs/checks válidos.
