# Fixed-point candidate — HERMES state-driven narration

PR: #1554
Date: 2026-09-16

## Estado source

```text
NARRATION_CORE=SOURCE_PRESENT
NARRATION_TESTS=SOURCE_PRESENT
ROLLING_HANDOFF=SOURCE_PRESENT
TRIGGER_FABRIC_BINDING_DOC=SOURCE_PRESENT
LEARNING_CRYSTAL=SOURCE_PRESENT
RUNTIME_BINDING=NOT_PROVEN
CI_SAME_HEAD=UNKNOWN
FIXED_POINT=NOT_REACHED
```

## Cadeia pretendida

```text
TRIGGER/HANDOFF EVENT
→ BUILD MATERIAL STATE
→ HASH
→ COMPARE
→ CHANGED ? NARRATE+UPDATE : SUPPRESS+CONTINUE
→ OUTPUT_GUARD
→ REALITY_JUDGE
→ RECEIPT
→ NEXT_CURSOR
```

## Contraprova obrigatória antes de PASS

- repetir exatamente o mesmo estado não pode gerar segunda narração;
- alterar evidência deve gerar nova narração;
- alterar apenas `updated_at` não pode gerar nova narração;
- espera silenciosa preserva GOAL/NEXT_CURSOR;
- plugin/HUD desligado não pode desativar o guardrail;
- runtime precisa demonstrar o comportamento no HEAD exato promovido.
