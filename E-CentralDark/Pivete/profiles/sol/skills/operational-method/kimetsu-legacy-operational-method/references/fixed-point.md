---
title: Fixed Point Logic — Kimetsu Legacy
---

# Fixed Point Logic

## Condições de Fechamento (TODAS obrigatórias)

```text
IF objective_closed
   AND counterproof_survived
   AND applicable_invariants_hold
   AND no_material_unknown:
    FIXED_POINT=TRUE
ELSE:
    FIXED_POINT=FALSE
```

### Definições

| Condição | Descrição |
|----------|-----------|
| `objective_closed` | Objetivo original da missão foi atingido com evidência |
| `counterproof_survived` | LUA executou contraprova deliberada e conclusão sobreviveu |
| `applicable_invariants_hold` | Invariantes do domínio (PEDRA) preservadas após execução |
| `no_material_unknown` | Zero UNKNOWN material restante |

### Regra

**Todas as 5 condições devem ser TRUE simultaneamente.** Qualquer FALSE → `FIXED_POINT=FALSE`.

---

## Sequência de Fechamento (Fixed Point Sequence)

| Etapa | Respiração | Verificação | Comando |
|-------|------------|-------------|---------|
| 1 | **SOL** | Objetivo original atingido? | `objective_closed=TRUE` |
| 2 | **LUA** | Contraprova sobreviveu? | `counterproof_survived=TRUE` |
| 3 | **VENTO** | Efeitos propagados verificados? | `propagation_verified=TRUE` |
| 4 | **PEDRA** | Invariantes preservadas? | `applicable_invariants_hold=TRUE` |

**Todas as 5 condições devem ser TRUE para `FIXED_POINT=TRUE`.**

---

### Regra — NÃO inventar FIXED_POINT

Quando uma operação destrutiva (chattr -i, deploy) falha no host real, registrar `FAIL` documentado. Não promover `FIXED_POINT=TRUE` por silêncio. A 5ª condição (`no_material_unknown`) só fecha quando `DEPLOY_PROVED` e `COUNTERPROOF_SURVIVES` estiverem confirmados no mesmo HEAD.

Se `chattr` não existe ou `DEPLOY` não foi executado: `FIXED_POINT=FALSE`. A missão continua sem duplicação ou segundo sistema.

## Lógica ELSE

```text
IF objective_closed
   AND counterproof_survived
   AND applicable_invariants_hold
   AND no_material_unknown:
    FIXED_POINT=TRUE
ELSE:
    FIXED_POINT=FALSE
```

---

## Uso Prático

```text
# Verificar se pode fechar
CHECK_FIXED_POINT:
  objective_closed=TRUE
  counterproof_survived=TRUE
  applicable_invariants_hold=TRUE
  no_material_unknown=TRUE
RESULT: FIXED_POINT=TRUE → FECHAMENTO CONFIRMADO

# Se qualquer condição FALSE
CHECK_FIXED_POINT:
  objective_closed=TRUE
  counterproof_survived=TRUE
  applicable_invariants_hold=FALSE
  no_material_unknown=TRUE
RESULT: FIXED_POINT=FALSE → REABRIR → SELECT_BREATH
```