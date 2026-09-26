# AURÉOLA Panel Pattern — Canonical Reference

## Context
From deep-research-report (3).md (GARIMPO-CHEFE) and live repo measurement (pr-1381, HEAD d2df622db).

## Key Finding
**AURÉOLA-BAHIA-BIBLICA.yml does NOT exist in current working tree or pr-1381 branch**, despite being referenced as `CANONICAL_SOURCE_CONTRACT` in the deep-research report (blob 508bf44...).

The report states it declares:
- `!CENTRALDARK` as trigger, `#ACORDAR` as alias
- Required header at top and on repo visit
- Observable fields: `phase`, `axis`, `destination`, `next_gate`
- Canonical path through `CI_SAME_HEAD`, `FIXED_POINT`, `POST_GREEN_LOCK`, `REGISTRA`, `HANDOFF`, `BOOT`

## Current State (Measured 2026-09-03)

| Layer | Observed State |
|-------|----------------|
| Auréola declared in candidate | **SIM** (referenced, not present) |
| Multibússola contractual | **SIM** |
| Post-Green Lock declared | **SIM** |
| GitHub enforcement real | **NÃO PROVADO** (`main` protected=false) |
| CI same-head | **UNKNOWN** (0 workflow runs for HEAD) |
| Fixed Point global | **NÃO PROVADO** |
| Production/main loading contract | **NÃO PROVADO** |

## Canonical Path (Must Be Restored/Created)
```
docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/AUREOLA-BAHIA-BIBLICA.yml
```

## Architecture Principle (from report)
> "A Auréola não deve mostrar o pensamento secreto do modelo. Ela deve mostrar o painel do carro."
> 
> **WHERE AM I → WHICH AXIS → WHICH DIRECTION CHEFE GAVE → WHICH DESTINATION → WHICH FACT OBSERVED → WHICH GATE NOW → WHY GREEN OR NOT**

This is reconstructible, testable, and model-agnostic.

## VERDE Formula (to crystallize)
```
VERDE = INTENÇÃO_ALINHADA ∧ LIVE_STATE ∧ DELTA_MÍNIMO ∧ EVIDÊNCIA ∧ CONTRAPROVA ∧ MESMO_HEAD
```

**NEVER**: `"MODELO DISSE QUE FEZ" = VERDE`

## Action Required (Next Gold)
1. Create/restore `AUREOLA-BAHIA-BIBLICA.yml` at canonical path
2. Run Hermes Fixed-Point Proof workflow (from report lines 668-929) on SAME HEAD
3. Do NOT commit receipt back (breaks same-head proof)
4. Accept green only if same SHA survives to end

## Related Files
- `DELTA-CONTINUO.md` — owner of continuous delta
- `POST-GREEN-LOCK.yml` — requires semantic_green, multibussola, counterproof, reality_judge, ci_same_head
- `fixed-point-fabric/` — tests: test_core.py, test_counterproof.py, test_state_library.py, test_fable_binding.py

## Provenance
- deep-research-report (3).md lines 7-72, 516-564, 658-744, 956-1012
- Live git measurement: pr-1381 branch, origin/main b5f821359
- SOUL: HERMES-CASA profile pivete