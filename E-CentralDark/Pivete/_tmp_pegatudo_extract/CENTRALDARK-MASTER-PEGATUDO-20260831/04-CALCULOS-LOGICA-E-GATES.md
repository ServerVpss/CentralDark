# 04 — CÁLCULOS, LÓGICA E GATES

## 1. Cobertura de contrato

`CONTRACT_COVERAGE = PASS_DEFINED_GATES / TOTAL_DEFINED_GATES`

Só pode declarar `100%` quando o denominador estiver definido.

Exemplo:
- 12 gates definidos
- 12 executados
- 12 PASS
- 0 escapes

`CONTRACT_COVERAGE = 12/12 = 100%`

Isso prova somente aquele contrato e aqueles caminhos definidos.

## 2. Recuperação de lineage

`LINEAGE_RECOVERY = CLASSIFIED_RELEVANT_NODES / DISCOVERED_RELEVANT_NODES`

Alvo antes de promoção: `1.0`.

Se a busca ainda não terminou ou a paginação ficou incompleta, o denominador é desconhecido e o status é `UNKNOWN`.

## 3. Retenção de ouro

`GOLD_RETENTION = USEFUL_GOLD_ABSORBED_OR_PRESERVED / USEFUL_GOLD_IDENTIFIED`

Alvo: `1.0`.

O denominador só inclui ouro identificado, não todos os bytes históricos.

## 4. Escape de regressão

`REGRESSION_ESCAPE = ESCAPED_REGRESSIONS / EXECUTED_FALSIFIERS`

Alvo: `0`.

Um falsificador deve ser desenhado antes do resultado.

## 5. Sobrevivência de duplicata

`DUPLICATE_SURVIVAL = SURVIVING_DUPLICATE_OWNERS / DETECTED_DUPLICATE_OWNERS`

Alvo: `0`.

Preservar histórico não autoriza preservar duas fontes operacionais equivalentes.

## 6. Lógica de Horn

Exemplos de cláusulas operacionais:

- `CURRENT_HEAD ∧ TESTS_PASS ∧ COUNTERPROOF_PASS ∧ ROLLBACK_READY → GREEN`
- `UNKNOWN_CRITICAL → NOT_GREEN`
- `WRITER_COLLISION → BLOCKED`
- `SECRET_EXPOSED → BLOCKED`
- `STALE_HEAD → REMEASURE`
- `DUPLICATE_OWNER → RECONCILE`

O motor aplica regras até nenhum fato novo surgir.

### Contradição

Se o conjunto derivar simultaneamente `GREEN` e `NOT_GREEN`, promoção é bloqueada.

A contradição é dado, não motivo para escolher o resultado desejado.

## 7. Risco de deploy

Componentes normalizados entre 0 e 1:

- `B` = blast radius
- `R` = custo/dificuldade de rollback
- `S` = statefulness
- `T` = exposição de tráfego
- `O` = lacuna de observabilidade

`DEPLOY_RISK = 0.30B + 0.25R + 0.20S + 0.15T + 0.10O`

Uso:
- risco baixo: Rolling ou micro-deploy, se coexistência for segura;
- risco médio: Canary;
- risco alto: Blue-Green quando isolamento e recursos justificarem; senão Canary em passos menores.

Essa fórmula é um **heurístico operacional testável**, não uma verdade universal.

## 8. Regra de tempo

`STATUS_ANTIGO != STATUS_ATUAL`

Toda evidência temporal deve carregar timestamp/fuso e, quando Git estiver envolvido, HEAD.

Se HEAD mudar, os gates dependentes do código precisam ser remediados.
