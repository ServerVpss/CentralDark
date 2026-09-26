# MÉTRICAS DE SESSÃO

## Métricas legítimas

```text
CAPTURED
PROCESSING
PROCESSED
VALIDATED
CRYSTALLIZED
REJECTED
NOISE
PENDING
UNKNOWN
ERROR
QUEUE_TOTAL
QUEUE_COMPLETED
QUEUE_PROGRESS_PERCENT
```

`QUEUE_PROGRESS_PERCENT = completed / total_known_work`

Se a fila continua recebendo itens, mostrar denominador dinâmico e sinalizar `LIVE_QUEUE=true`.

## Não permitido

```text
INTELLIGENCE_PERCENT
HERMES_SMARTER_PERCENT
HUMAN_PROFILE_COMPLETE_PERCENT
```

Não existem medidas honestas para isso.

## Confiança

Por item, usar classes:

```text
PROVEN
SUPPORTED
CANDIDATE
CONFLICTED
UNKNOWN
```

Não transformar score heurístico em “verdade”.

## Resumo do dia

```text
SESSION_COUNT
ACTIVE_TIME
SOURCES_SEEN
NEW_DELTA
CRYSTALLIZED_COUNT
NO_CHANGE_COUNT
REJECTED_COUNT
UNKNOWN_COUNT
TOPICS
LAST_CRYSTALLIZATION
```
