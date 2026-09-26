---
title: Fixed Point Sequence — Kimetsu Legacy
---

# Fixed Point Sequence — Sequência de Fechamento Obrigatória

## Sequência Obrigatória (4 Etapas)

| Etapa | Respiração | Verificação | Comando de Verificação |
|-------|------------|-------------|------------------------|
| 1 | **SOL** | Objetivo original atingido? | `objective_closed=TRUE` |
| 2 | **LUA** | Contraprova sobreviveu? | `counterproof_survived=TRUE` |
| 3 | **VENTO** | Efeitos propagados verificados? | `propagation_verified=TRUE` |
| 4 | **PEDRA** | Invariantes preservadas? | `applicable_invariants_hold=TRUE` |

**Todas as 5 condições devem ser TRUE para `FIXED_POINT=TRUE`.**

---

## Execução da Sequência

```text
# Etapa 1: SOL
RESPIRAÇÃO DO SOL
VERIFICAR: objective_closed=TRUE
SE FALSE → REABRIR

# Etapa 2: LUA
RESPIRAÇÃO DA LUA
VERIFICAR: counterproof_survived=TRUE
SE FALSE → REABRIR

# Etapa 3: VENTO
RESPIRAÇÃO DO VENTO
VERIFICAR: propagation_verified=TRUE
SE FALSE → REABRIR

# Etapa 4: PEDRA
RESPIRAÇÃO DA PEDRA
VERIFICAR: applicable_invariants_hold=TRUE
SE FALSE → REABRIR

# Todas TRUE
FIXED_POINT=TRUE → FECHAMENTO CONFIRMADO
```

---

## Lógica Completa

```text
IF objective_closed
   AND counterproof_survived
   AND propagation_verified
   AND applicable_invariants_hold
   AND no_material_unknown:
    FIXED_POINT=TRUE
ELSE:
    FIXED_POINT=FALSE
```

---

## Regra de Ouro

> **Nenhum fechamento sem passar pela sequência completa.**
> Pular etapa = `FIXED_POINT=FALSE` automático.