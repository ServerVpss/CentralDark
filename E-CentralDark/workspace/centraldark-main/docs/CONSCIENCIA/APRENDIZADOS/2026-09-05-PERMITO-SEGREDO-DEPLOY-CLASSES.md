# 👑 PERMITO-SEGREDO — classes persistentes de deploy

📜 *“Cada porta com sua chave; cada chave com seu destino.”*

## Owner canônico

A autoridade continua definida por `docs/CONSCIENCIA/02-PERMISSOES.md`.
Este arquivo cristaliza a ligação determinística entre a label `👑 PERMITO-SEGREDO` e duas classes de ação de deploy, sem criar nova autoridade e sem criar nova label.

## Regra

```text
👑 PERMITO-SEGREDO
+ CURRENT_INTENT_AUTHORIZED=true
+ SAME_REPOSITORY=true
+ COMPATIBLE_SCOPE=true
+ ACTION_CLASS
+ DEPLOY_TARGET
+ ROLLBACK_READY=true
= DEPLOY_ACTION_AUTHORIZED
```

A label é a prova persistente de autoridade do SEGREDO/CHEFE. A classe de ação declara **o que** está autorizado.

## Classes

### `MICRO_DEPLOY`

Uso: menor escopo causal, reversível, componente/serviço conhecido.

```text
PERMITO-SEGREDO:MICRO_DEPLOY
```

Não implica full deploy, merge, restart, force-push ou rotação de secrets.

### `DEPLOY`

Uso: deploy completo/promocional quando a causa técnica atravessa fronteiras ou quando o escopo autorizado exige promoção integral.

```text
PERMITO-SEGREDO:DEPLOY
```

Não implica force-push, secret rotation ou mudança de intenção.

## Gate determinístico

Owner executável:

- `scripts/lupa/label-gate.mjs`
- `scripts/lupa/label-gate-run.mjs`

Variáveis consumidas quando um workflow quer validar uma ação de deploy:

```text
CENTRALDARK_ACTION_CLASS=MICRO_DEPLOY|DEPLOY
CENTRALDARK_INTENT_AUTHORIZED=true
CENTRALDARK_DEPLOY_TARGET=<alvo explícito>
CENTRALDARK_ROLLBACK_READY=true
```

Sem `CENTRALDARK_ACTION_CLASS`, o label gate mantém sua função anterior e não inventa permissão de deploy.

Com `CENTRALDARK_ACTION_CLASS`, a ação só passa quando a autoridade, a intenção, o alvo e o rollback estão explicitamente presentes.

## Invariantes

```text
PERMITO_SEGREDO_LABEL != CARTA_BRANCA
ACTION_CLASS_REQUIRED_FOR_DEPLOY=true
MICRO_DEPLOY != DEPLOY
DEPLOY != MERGE
DEPLOY != RESTART
DEPLOY != FORCE_PUSH
DEPLOY != SECRET_ROTATION
UNKNOWN != PASS
ROLLBACK_REQUIRED=true
MINIMUM_SCOPE_FIRST=true
```

## Estado cristalizado

```text
DEPLOY_PERMISSION_IN_02_PERMISSOES=PROVED
PERMITO_SEGREDO_AS_AUTHORITY_SEAL=PROVED
ACTION_CLASS_BINDING_BEFORE_THIS_DELTA=MISSING
MICRO_DEPLOY_CLASS=ADDED
DEPLOY_CLASS=ADDED
DETERMINISTIC_GATE=ADDED
RUNTIME_WORKFLOW_CONSUMPTION=REQUIRES_CALLER_ENV
```

Próximo cursor: conectar `CENTRALDARK_ACTION_CLASS` nos workflows de deploy que já são owners reais, um por um, sem criar workflows paralelos.
