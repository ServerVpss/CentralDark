# REGRA — FIGMA/MERMAID POR MICRO-DEPLOY COMPROVADO

## Status

CANONICAL_RULE=true
SCOPE=centraldark.microdeploy.visual_receipt
OWNER=CentralDark

## Regra central

Todo micro-deploy comprovado deve gerar ou atualizar um artefato visual correspondente quando houver rota, decisão, fluxo, prova ou arquitetura material a preservar.

```text
PASS_COMPROVADO
→ MICRO_DEPLOY_DO_ESCOPO_AFETADO
→ HEALTH/PROVA_RUNTIME
→ RECEIPT
→ FIGMA_OR_FIGJAM_MERMAID_ARTIFACT
→ PR_MAE_LEDGER
→ NEXT_TIK_TAK
```

## Regras de execução

```text
FIGMA_MERMAID_REQUIRED_FOR_ROUTE_PROOF=true
MERMAID_DESCRIBES_ACTUAL_ROUTE_TAKEN=true
VISUAL_ARTIFACT_IS_RECEIPT_SUPPORT=true
VISUAL_ARTIFACT_IS_NOT_RUNTIME_PROOF_BY_ITSELF=true
DO_NOT_CREATE_PARALLEL_ARCHITECTURE=true
APPEND_TO_EXISTING_ROUTE_WHEN_AVAILABLE=true
SAME_ROUTE_EVOLVES_OVER_TIME=true
REFINE_LATER_IN_CI_CD=true
```

## Cadeados

```text
DIAGRAM != DEPLOY
FIGMA_ARTIFACT != HEALTH_PASS
SCREENSHOT != RUNTIME_PROOF
UNKNOWN != PASS
ACTION_REQUIRED != PASS
SECRET_EXPOSED=false
```

## Aplicação prática

Quando um agente terminar um delta e conseguir remedir depois de criar:

1. Registrar o caminho real tomado.
2. Gerar Mermaid simples e determinístico.
3. Criar/atualizar artefato Figma/FigJam correspondente.
4. Salvar receipt no repositório e/ou PR-mãe.
5. Continuar a mesma rota; não criar sistema paralelo.
6. Deixar refinamento visual/CI para etapa posterior.

## Exemplo de rota

```text
Ordem do Chefe
→ medir estado vivo
→ PASS determinístico
→ micro-deploy do escopo
→ health/prova runtime
→ Figma/FigJam Mermaid
→ receipt no PR-mãe
→ NEXT_TIK_TAK
```
