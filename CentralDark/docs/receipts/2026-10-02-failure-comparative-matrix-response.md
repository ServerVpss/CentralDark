# Receipt — failure comparative matrix / CHEFE response

- Data: 2026-10-02
- Owner: `docs/CONSCIENCIA/PADRAO-RESPOSTA-SEGREDO-CHEFE.md`
- Learning: #141
- Boot inheritance: `CENTRALDARK_AI_BOOT.yaml#portable_operation_contract.communication`
- Scope: apresentação causal/comparativa de falhas; não altera classificação técnica dos componentes.

## Cristal

```text
FAILURE_COMPARATIVE_MATRIX_REQUIRED_WHEN_USER_ASKS_WHERE_REDS_ARE=true
FAILURE_MATRIX_COLUMNS=RED_NAME|SECTOR|DETECTOR|DIRECTORY_OR_OWNER
ONE_INDEPENDENT_RED_PER_ROW=true
DETECTOR_FAIL_DOES_NOT_IMPLY_TARGET_FAIL=true
LOCAL_RED_DOES_NOT_IMPLY_SECTOR_RED=true
ONE_TEST_FAIL_DOES_NOT_IMPLY_CORE_BROKEN=true
CORE_PASS_AND_ADJACENT_RED_MUST_BE_SHOWN_SEPARATELY=true
COMPARISON_FIRST_EXPLANATION_SECOND=true
NO_TEXT_WALL_WHEN_MATRIX_CLOSES_THE_QUESTION=true
```

## Forma mínima

```text
RED_NAME | SECTOR | DETECTOR | DIRECTORY_OR_OWNER
```

## Contraprova

- detector quebrado não prova alvo quebrado;
- teste isolado vermelho não prova core inteiro vermelho;
- owner/path só aparece se medido;
- UNKNOWN não recebe localização inventada;
- tabela não substitui causalidade nem prova.

NEXT_CURSOR: usar automaticamente a matriz para perguntas de localização/comparação de vermelhos e expandir só quando o CHEFE pedir causa, efeito ou reparo.
