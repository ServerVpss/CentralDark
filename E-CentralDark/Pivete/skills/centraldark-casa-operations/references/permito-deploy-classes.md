# PERMITO-SEGREDO — Classes de Deploy

Cristalização do CHEFE 05/09/2026: a autoridade `👑 PERMITO-SEGREDO` agora tem duas classes explícitas de ação.

## Classes

| Classe | Escopo | Rollback |
|--------|--------|----------|
| `MICRO_DEPLOY` | Menor escopo causal, alvo explícito | Pronto |
| `DEPLOY` | Deploy completo/promocional | Exigido |

## Gate variables

```
CENTRALDARK_ACTION_CLASS=MICRO_DEPLOY|DEPLOY
CENTRALDARK_INTENT_AUTHORIZED=true
CENTRALDARK_DEPLOY_TARGET=<alvo>
CENTRALDARK_ROLLBACK_READY=true
```

Sem classe → comportamento antigo. Com classe → bloqueia se faltar autoridade, intenção, target ou rollback.

## Wiring em workflows existentes

- `.github/workflows/auto-pr-and-deploy.yml` — step `Micro deploy (dry-run)` tem env com as 4 variáveis.
- `.github/workflows/autonomia-promocao.yml` — step `judge` tem env com as 4 variáveis.
- **NÃO criar workflow novo** — reutilizar os existentes.

## Cadeado

- `PERMITO_SEGREDO_LABEL != CARTA_BRANCA`
- `MICRO_DEPLOY != DEPLOY`
- `DEPLOY != MERGE`
- `DEPLOY != FORCE_PUSH`
- `UNKNOWN != PASS`

## Residual

`RUNTIME_WORKFLOW_CONSUMPTION=NOT_YET_PROVEN` — a regra está no motor candidato; falta CI green provando o consumo real.

## PR

PR #1430: `fix/permito-deploy-classes-20260905` — gate + runner + cristal.
PR #1431: `feat/status-badge-fabric-20260905` — MERGED, Badge Fabric absorvido.

## Referência canônica

Owner: `docs/CONSCIENCIA/APRENDIZADOS/2026-09-05-PERMITO-SEGREDO-DEPLOY-CLASSES.md`
