# Narração operacional dirigida por estado

## Aprendizado

A narração do Hermes é útil quando funciona como trilho de orientação, memória de trabalho e continuidade. O defeito não é narrar; é repetir a mesma intenção sem novo estado material.

```text
NARRATION_IS_OPERATIONAL_RAIL=true
NARRATION_IS_NOT_PROGRESS_BY_ITSELF=true

STATE_CHANGED
→ NARRATE_DELTA
→ UPDATE_ROLLING_HANDOFF

STATE_UNCHANGED
→ KEEP_GOAL
→ KEEP_NEXT_CURSOR
→ SUPPRESS_DUPLICATE_NARRATION
→ CONTINUE
```

A regra é aplicada por fingerprint material, não por estética do texto. `updated_at` sozinho não conta como delta.

## Reutilização

- HERMES-CORE executa o guardrail;
- Trigger Fabric fornece os eventos/handoffs existentes;
- OUTPUT_GUARD/REALITY_JUDGE continuam julgando evidência;
- plugins/HUD apenas projetam o estado;
- nenhum segundo cérebro, hook ou owner é criado.

## Sinais que liberam narração

- GOAL mudou;
- POSITION mudou;
- OWNER/WRITER_SCOPE mudou;
- evidência nova;
- hipótese nova;
- estado novo;
- blocker novo;
- ação material iniciou/terminou;
- NEXT_CURSOR mudou.

## Sinais que não liberam nova narração

- mesma hipótese;
- mesma evidência;
- mesmo alvo;
- mesmo NEXT_CURSOR;
- nenhuma tool call/medição nova;
- espera sem delta.

## Regra de runtime

```text
SAME_STATE_HASH_WITHOUT_NEW_INFORMATION=DROP_DUPLICATE
NEW_STATE_HASH=NARRATE_ONCE_AND_CONTINUE
UNKNOWN != PASS
```
