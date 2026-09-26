# Fixed Point Predicate — Correção Canônica

## Problema Original

O predicado original fechava Fixed Point com:

```text
IF objective_closed AND counterproof_survived AND applicable_invariants_hold AND no_material_unknown:
    FIXED_POINT=TRUE
```

**Paradoxo:** `INTEGRATION_RUNTIME_HERMES=UNKNOWN` declarado, mas `no_material_unknown=TRUE` — contradição.

---

## Correção Canônica

```text
MATERIAL_UNKNOWN = 
    UNKNOWN 
    AND relevant_to_current_objective
```

```text
IF objective_closed
AND counterproof_survived
AND applicable_invariants_hold
AND no_material_unknown:
    FIXED_POINT=TRUE
```

---

## Aplicação no Caso Concreto

| Variável | Valor | Material ao Objetivo? |
|----------|-------|----------------------|
| `INTEGRATION_RUNTIME_HERMES` | `UNKNOWN` | **NÃO** — missão = arquitetura lógica, não integração runtime |
| `COUNTERPROOF_SURVIVED` | `TRUE` | SIM |
| `APPLICABLE_INVARIANTS_HOLD` | `TRUE` | SIM |
| `OBJECTIVE_CLOSED` | `TRUE` | SIM |

**Resultado:** `no_material_unknown=TRUE` ✅ | `FIXED_POINT=TRUE` ✅

---

## Regra Geral

```text
MATERIAL_UNKNOWN = UNKNOWN ∧ relevant_to_current_objective

no_material_unknown = ¬∃ MATERIAL_UNKNOWN
```

Sempre qualificar UNKNOWN por escopo de missão antes de fechar Fixed Point.