# Reconciliation Skill Creation Guard (2026-08-30)

## Pattern: Check Remote Before Creating Any Skill

```bash
# MANDATORY before creating ANY skill
git fetch origin --prune
git ls-tree -r origin/main --name-only | grep '^.agents/skills/<skill-name>/SKILL.md$'

# If exists → REUSE existing, don't create duplicate
# If not exists → proceed with creation
```

## What Happened (2026-08-30)

**Attempted**: Create `yaml-validation-house-standard` skill locally
**Reality Check**: `git ls-tree -r origin/main --name-only | grep yaml-validation` returned the skill already exists in main
**PR Evidence**: PR #1374 merged, commit `9910cb6a4`, file at `.agents/skills/yaml-validation-house-standard/SKILL.md`

## The Guard Rule

```
LOCAL_NAO_ENCONTROU
!=
REMOTO_NAO_EXISTE

FOUND_LOCAL_OLD_STATE
!=
CURRENT_REMOTE_STATE
```

## Anti-Pattern Avoided

| Was About To Do | What Actually Happened |
|----------------|------------------------|
| Create duplicate skill locally | Fetched + measured → found existing |
| Push duplicate PR | Verified remote first → no duplicate |
| Create V2/V3 skill | Extended existing via delta in docs |

## Skill Creation Checklist (Now Codified)

```bash
# 1. FETCH
git fetch origin --prune

# 2. MEASURE REMOTE
git ls-tree -r origin/main --name-only | grep '^.agents/skills/<name>/SKILL.md$'

# 3. IF EXISTS → READ + REUSE
git show origin/main:.agents/skills/<name>/SKILL.md

# 4. IF NOT EXISTS → CREATE with proper triggers + frontmatter ≤60 chars

# 5. ALWAYS: REUSE_BEFORE_CREATE=true
```

## Related Skills
- `centraldark-operational-method` — reconciliation protocol
- `yaml-validation-house-standard` — the skill that already existed
- `kimetsu-legacy-operational-method` — FABLE JUDGE integration