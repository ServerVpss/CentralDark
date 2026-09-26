# Métricas e fórmulas

## Regra

Número sem baseline comparável é decoração. Uma baseline inválida não entra no
denominador.

## Desempenho operacional

```text
GANHO_TEMPO_% =
(tempo_baseline - tempo_novo) / tempo_baseline × 100

REDUCAO_ERROS_% =
(erros_baseline - erros_novos) / erros_baseline × 100

REDUCAO_RETRABALHO_% =
(retrabalho_baseline - retrabalho_novo) / retrabalho_baseline × 100

FIRST_PASS_SUCCESS_RATE =
execuções válidas na primeira tentativa / execuções comparáveis

TIMEOUT_RATE =
timeouts / execuções comparáveis

SCOPE_VIOLATION_RATE =
violações de escopo / execuções comparáveis
```

Também medir:

- `EVIDENCE_COMPLETENESS`;
- `LATENCY_P50`;
- `LATENCY_P95`;
- `HUMAN_INTERVENTION_COUNT`;
- `ROLLBACK_SUCCESS_RATE`;
- `REWORK_RATE`.

## Medição de turnos

```text
SOL_RESPONSE_RENDERED_AT
HERMES_ACK_AT
ACTION_STARTED_AT
ACTION_COMPLETED_AT
EVIDENCE_SENT_AT
PIVETE_GATE_AT
```

Use relógio civil com fuso para auditoria e relógio monotônico para duração.

## Incerteza

```text
odds = p / (1 - p)
odds_posterior = odds_prior × ∏LR
p_posterior = odds_posterior / (1 + odds_posterior)
```

Só usar LR numérico com base defensável. Evidências do mesmo cluster não são
multiplicadas como independentes.

```text
H(p) = -p·log2(p) - (1-p)·log2(1-p)
```

Entropia mede incerteza, não autorização.

```text
VOI = perda_antes - perda_depois - custo_total_do_teste
```

O custo inclui tempo, dinheiro, risco, reversibilidade, exposição e carga
cognitiva.

```text
p* = C_falso_positivo / (C_falso_positivo + C_falso_negativo)
```

O limiar apoia decisão; não autoriza ação crítica.

## Exemplo real da sessão

```text
05B_LINES=337
05C_LINES=190
REDUCAO=147
REDUCAO_PERCENTUAL=43.62%
LIMITE=180
EXCESSO=10
EXCESSO_SOBRE_LIMITE=5.56%
```

Apesar do ganho, 05C permaneceu rejeitado porque violou o limite e não
descartava o enumerador deterministically.

