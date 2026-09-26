# CENTRALDARK — PACOTE FINAL CANÔNICO DO PROJETO

Este pacote reconcilia **estado vivo + histórico + sessões recuperáveis do ChatGPT + handoffs anteriores + runtime/skills relatados + GitHub vivo**.

Regra central:

```text
INTENT
→ SELF_APPLY
→ LIVE_STATE
→ DISCOVER
→ EXPAND
→ COMPRESS
→ RECONCILE
→ PLAN
→ DISTRIBUTE
→ EXECUTE
→ EVIDENCE
→ COUNTERPROOF
→ REMEDIATE ↺
→ LEARN
→ REMEASURE
→ FIXED_POINT_CHECK
→ RETURN
```

## Veredito

```text
PACKAGE_FIXED_POINT = TRUE, se verify_package.py passar.
PROJECT_GLOBAL_FIXED_POINT = FALSE / NOT_PROVEN.
```

O pacote pode ser autocontido e íntegro sem fingir que o projeto inteiro terminou.

## Regra sobre “O CICLO ESTÁ FECHADO”

Só é válido com escopo explícito.

- `PACKAGE_CYCLE_CLOSED` pode ser verdadeiro depois da contraprova estrutural.
- `PROJECT_CYCLE_CLOSED` é proibido enquanto houver PR vivo relevante, runtime material UNKNOWN, trabalho elegível importante ou contradição aberta.

Comece por `CANONICAL_VERDICT.md`, depois `02_STATE_RECONCILIATION/CURRENT_VS_HISTORICAL.md` e `06_PROOF_COUNTERPROOF/COUNTERPROOF.md`.
