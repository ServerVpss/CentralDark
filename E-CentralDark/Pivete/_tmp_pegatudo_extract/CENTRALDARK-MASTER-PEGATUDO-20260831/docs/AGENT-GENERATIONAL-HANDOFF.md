# CENTRALDARK — HANDOFF GERACIONAL DE AGENTES

## Regra

Agente muda. Modelo muda. Persona muda. **Estado provado não pode depender da memória da conversa.**

Cada ciclo material encerra com um handoff consumível pelo próximo agente. O próximo agente não “acredita” no anterior: ele usa o handoff para saber **onde medir primeiro**.

## Bloco obrigatório

```yaml
HANDOFF:
  objective: ...
  source_truth:
    repo: ...
    branch: ...
    tested_head: ...
    pushed_head: ... | NONE
  actual_state:
    casa: ... | UNKNOWN
    vps: ... | UNKNOWN
    drive_revision: ... | UNKNOWN
  owners_touched: []
  changed_files: []
  tests: []
  falsifiers: []
  ci: PASS | FAIL | BLOCKED | UNKNOWN
  receipts: []
  unknowns: []
  blockers: []
  next_cursor: ...
```

## Proibido

- “já testei antes” sem HEAD/revisão;
- memória de chat como fonte da verdade;
- entregar personalidade como estado;
- esconder falha para o próximo agente avançar;
- criar novo cérebro/owner porque não achou o antigo na primeira busca.

## Consumo

`#ACORDAR` → ler contrato canônico → ler HANDOFF → medir repo/runtime/providers → invalidar somente claims dependentes de estado que mudou → continuar.
