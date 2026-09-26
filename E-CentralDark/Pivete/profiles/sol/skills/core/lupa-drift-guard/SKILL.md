---
name: lupa-drift-guard
description: Lupa Drift Guard helper
---
current_version: 2.1.0
last_updated: 2026-08-27
---
### Use case
Rescuing the guard that flagger *lupa* skills as orphaned.  This
umbrella skill explains how *tecnica‑da‑lupa* folder can be
accepted when its SKILL.md declares
```
TECNICA_DA_LUPA_IS_SECOND_SKILL=false
TECNICA_DA_LUPA_IS_SECOND_OWNER=false
META_LUPA_IS_CANONICAL_OWNER=true
```
If those flags are present the guard should *not* exit with
`SKILL_REMOVIDA_REAPARECEU`.

### Reference file
`references/technique_da_lupa_alias.md` – contains the exact
```
TECNICA_DA_LUPA_IS_SECOND_SKILL=false
TECNICA_DA_LUPA_IS_SECOND_OWNER=false
META_LUPA_IS_CANONICAL_OWNER=true
```
---
