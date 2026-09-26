# TIK_TAK RELAY — quando múltiplos agents atuam na mesma missão

## Regra central

Quando o CHEFE emite "!CENTRALDARK :: intenção" e mais de um agente está na mesma missão:

1. **Mesmo compasso, papéis diferentes:** um agente executa, o outro contraprova. Não dois executores no mesmo escopo.
2. **Relógio é músico da banda:** se o agente demora mais de 30s entre medir e agir, re-medir.
3. **Interrupção não é fim:** se o comando for interrompido, tentar menor passo, testar, continuar, não parar a missão.

## Protocolo de relay

### Executor (HERMES)
```
MEDIR → ATUAÇÃO → TESTAR PORT/PROCESS → REPORTAR
```

### Contraprova (Nemotron mede)
```
MEDIR INDEPENDENTE → COMPARAR → PASS/FAIL
```

Se divergência: RECONCILIAR antes de declarar PASS.

## Contrapasso de pergunta

CHEFE: "TIK TAK, vai perder a prova se ficar perguntando"

Agente: NÃO perguntar. Medir, agir, remeasure, reportar. Se pendência do CHEFE, marcar e siga.

## Checkpoint por rodada

Cada rodada de FABLE_LOOP salva:
- O que ficou provado (SHA/port/process)
- O que mudou desde a rodada anterior
- NEXT_CURSOR

Repetir o bloco nas rodadas seguintes para não re-derivar.

## STOP condições

- FIXED_POINT_PROVEN
- REAL_BLOCK_PROVEN
- Pendência do CHEFE marcada (abelha sem flor: dormir até watchdog acordar)
