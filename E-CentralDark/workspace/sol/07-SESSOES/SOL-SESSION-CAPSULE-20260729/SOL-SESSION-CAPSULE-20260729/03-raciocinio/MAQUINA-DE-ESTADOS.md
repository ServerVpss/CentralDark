# Máquina de estados cognitiva

## Estados da missão

```text
IDLE
→ CONTRACTED
→ ACKNOWLEDGED
→ RUNNING
→ EVIDENCE_READY
→ UNDER_REVIEW
→ ACCEPTED | PARTIAL | INVALID
→ NEXT_GATE | BLOCKED | CLOSED
```

## Transições válidas

| Origem | Evento | Destino |
|---|---|---|
| IDLE | autorização explícita | CONTRACTED |
| CONTRACTED | executor repete o contrato | ACKNOWLEDGED |
| ACKNOWLEDGED | ação começa dentro do escopo | RUNNING |
| RUNNING | saída e recibo encerrados | EVIDENCE_READY |
| EVIDENCE_READY | SOL recebe o mesmo turno | UNDER_REVIEW |
| UNDER_REVIEW | contrato satisfeito | ACCEPTED |
| UNDER_REVIEW | útil, mas incompleto | PARTIAL |
| UNDER_REVIEW | instrumento/contrato falhou | INVALID |
| ACCEPTED | novo contrato explícito | NEXT_GATE |
| qualquer | stop condition | BLOCKED |
| ACCEPTED | ponto fixo + objetivo cumprido | CLOSED |

## Transições proibidas

```text
INVALID → SUCCESS
PARTIAL → CONSOLIDATED
ACKNOWLEDGED → NEXT_GATE
RUNNING → NEW_COLLECTOR
SESSION_RELOAD → AUTHORIZED
HIGH_CONFIDENCE → DESTRUCTIVE_ACTION
```

## Estados do conhecimento

```text
UNKNOWN
→ OBSERVED
→ REPRODUCED
→ FALSIFIED_OR_SUPPORTED
→ PROVEN_FOR_SCOPE
→ CANONICAL
```

`PROVEN_FOR_SCOPE` não significa verdade universal. Mudança de versão, alvo,
perfil ou tempo pode exigir nova prova.

