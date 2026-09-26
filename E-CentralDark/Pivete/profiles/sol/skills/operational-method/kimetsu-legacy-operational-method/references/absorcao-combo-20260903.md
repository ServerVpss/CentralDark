# Absorção Combo Potência — 2026-09-03

Owner único: `kimetsu-legacy-operational-method` v2.2.0

## Deletadas (absorbed_into este owner)

| Skill | Estado |
|-------|--------|
| kimetsu-legacy-breathing | DELETED |
| kimetsu-legacy-complete | DELETED |
| auto-cura-kimetsu-fixedpoint | DELETED |

## Prova disco

- Dir kimetsu em `E:/CentralDark/Pivete/skills`: 1 (`operational-method/kimetsu-legacy-operational-method`)
- Dirs breathing / complete / auto-cura: 0

## Prova registry

- `skills_list` kimetsu: somente `kimetsu-legacy-operational-method`

## Dedup no corpo (2026-09-03)

- Bloco "Calibração Obrigatória" duplicado → 1
- Pitfall 9 duplicado → 1

## Fixed Point desta cristalização

```
objective_closed          = 4 skills → 1 owner
counterproof_survived     = registry 1 + disco 1 dir
applicable_invariants     = ONE_SYSTEM_ONLY, REUSE_BEFORE_CREATE, não recriar
no_material_unknown       = duplicatas de corpo removidas; leftovers de dir = 0
FIXED_POINT               = TRUE (escopo: combo potência)
```

NÃO reabrir sem novo evento (skill recriada, drift de dir, ou conteúdo material novo).
