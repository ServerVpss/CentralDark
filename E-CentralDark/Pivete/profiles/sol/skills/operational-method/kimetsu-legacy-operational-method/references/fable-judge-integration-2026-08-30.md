# FABLE JUDGE — Error Recurrence Gate (Executed 2026-08-30)

## Context
Added to `porta-de-entrada.yml` as part of reconciliation mission.

## What Was Added

```yaml
- name: Testar juiz de reincidência de erro registrado
  run: node --test scripts/lupa/erro-reincidencia.test.mjs

- name: FABLE JUDGE — erro registrado não pode reincidir
  run: |
    set -uo pipefail
    BASE="${{ github.event.pull_request.base.sha || github.event.before }}"
    HEAD_REF="${{ github.event.pull_request.head.sha || github.sha }}"
    if [ -n "$BASE" ] && [ "$BASE" != "0000000000000000000000000000000000000000" ]; then
      node scripts/lupa/erro-reincidencia.mjs --intervalo "$BASE..$HEAD_REF"
    else
      echo "REINCIDENCIA_ESCOPO=SEM_BASE — auditando apenas o HEAD"
      node scripts/lupa/erro-reincidencia.mjs --intervalo "$HEAD_REF~1..$HEAD_REF"
    fi
```

## Verification

```bash
node --test scripts/lupa/erro-reincidencia.test.mjs
# Result: 20/20 PASS
```

## Detectors Covered
| Detector | Type | Status |
|----------|------|--------|
| `padrao_proibido` | Mecanizado | ✅ PASS |
| `delete_sem_recibo` | Mecanizado | ✅ PASS |
| `commit_anuncia_prova_sem_conteudo` | Mecanizado | ✅ PASS |
| 2 others | Não-mecanizável (motivo declarado) | ✅ UNKNOWN ≠ PASS |

## Key Principle
```
KNOWN_BAD → MUST_FAIL
KNOWN_GOOD → MUST_PASS
UNKNOWN ≠ PASS (silencioso)
```

## Integration Point
Added to `porta-de-entrada.yml` after `proof-ownership.mjs` step, before Dream Review tests.

## Evidence
- Commit: `58e0c6d48` — feat(porta-de-entrada): add FABLE JUDGE reincidencia test steps
- Test run: 20/20 PASS, ~570ms
- File: `.github/workflows/porta-de-entrada.yml` (+21 lines)