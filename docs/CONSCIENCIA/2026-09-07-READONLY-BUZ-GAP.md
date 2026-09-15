# 🖥️ BUZ · CORREÇÃO DO CARD READ-ONLY

Status desta correção: **READ_ONLY receipt**.

## Resultado

```text
APP_FRONT=PARTIAL
MISSING_COMPONENT=BUZ
BUZ_STATUS=UNKNOWN
```

O registro anterior `Buz = ABSENT no repo` prova apenas ausência no escopo/repositorio medido naquela varredura. Ele **não prova ausência global** na Casa, em outro repo, outro path, outra máquina ou outro runtime.

## Cadeado

```text
ABSENT_IN_MEASURED_REPO != ABSENT_GLOBALLY
UNKNOWN != PASS
DOCUMENTED != EXECUTED
ACTION != PROOF
```

## Próximo cursor

```text
NEXT_CURSOR=FIND_BUZ_READ_ONLY
```

A próxima medição deve localizar e classificar, sem mutação:

```text
BUZ_STATUS=
  FOUND_CANONICAL
  FOUND_EXTERNAL
  FOUND_DUPLICATED
  FOUND_FRAGMENTED
  ABSENT_PROVEN
  UNKNOWN
```

Se encontrado, registrar:

```text
OWNER
PATH
REPO
RUNTIME
CONSUMERS
API_BOUNDARY
UI_BOUNDARY
OVERLAP_WITH_OVERCLOCK
OVERLAP_WITH_GROK
MERGE_CANDIDATE
DO_NOT_TOUCH
```

## Regra de escopo

Esta correção **não altera runtime, app, BRAIN, Hermes, workflows ou arquitetura**. Apenas corrige o veredito da frente APP para evitar falso fechamento antes de medir o Buz.

```text
BUZ_FOUND
→ reconciliar sobreposição
→ atualizar CARD
→ só então APP_FRONT=CLOSED
```
