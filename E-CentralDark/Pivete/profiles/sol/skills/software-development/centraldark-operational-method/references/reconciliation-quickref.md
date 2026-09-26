# Reconciliação — Quick Reference Card

## Golden Rules
```
LOCAL ATRASADO != REMOTO AUSENTE
FOUND_LOCAL != CURRENT_REMOTE
HISTORY != CURRENT_STATE
```

## 1-Line Commands

```bash
# Full recon state
git fetch origin --prune && git rev-parse HEAD origin/main && git merge-base HEAD origin/main && git rev-list --left-right --count origin/main...HEAD

# Diff stats vs main
git diff --stat origin/main...HEAD

# Classify working tree
git status --porcelain | while read status file; do echo "$status $file"; done

# Drop duplicates (already in main)
git restore <file>
```

## Classification Matrix

| Status | Meaning | Action |
|---|---|---|
| `DUPLICADO` | Already in origin/main | `git restore` |
| `CANONICAL_DELTA` | New material not in main | Keep + validate |
| `LOCAL_WORK_IN_PROGRESS` | WIP, not ready | Stash or continue |
| `GENERATED/CACHE` | Build artifacts | Ignore |
| `HISTORICAL` | Old, archived | Archive |
| `UNKNOWN` | Can't classify | **Don't delete**, investigate |

## Validation Quick Checks

```bash
# YAML syntax
python3 -c "import yaml; yaml.safe_load(open('file.yml'))" && echo "OK"

# GitHub Actions schema (if actionlint available)
actionlint -shellcheck="" file.yml

# Known-bad counterproof
KNOWN_BAD → MUST_FAIL
KNOWN_GOOD → MUST_PASS
```

## Decision Tree

```
git diff origin/main...HEAD -- <file>
    │
    ├─ No diff → DUPLICADO → git restore
    │
    ├─ Has diff → Is it new delta?
    │              │
    │              ├─ Yes → Validate (syntax + schema + counterproof) → Keep
    │              │
    │              └─ No (local noise) → Drop / stash
    │
    └─ Untracked → Classify first (UNKNOWN != DELETE)
```

## Pitfall Quick-Fix

| Problem | Fix |
|---|---|
| "14 commits ahead, push!" | `git rev-list --left-right --count origin/main...HEAD` first |
| "File not found locally" | `git fetch && git ls-tree -r origin/main --name-only \| grep file` |
| "Created new skill" | Search existing skills first (`skill_view` / `skills_list`) |
| "YAML passes parser" | Syntax ≠ Schema ≠ Consumer ≠ Runtime |
| "Need to push" | Classify → Dedupe → Delta → Test → Counterproof → Promote |

## Writer Check

```bash
# Who owns the scope?
git log --oneline -5 -- <scope_path>
# Active PR?
gh pr list --state open --json number,headRefName,title
```

---

**Mantra**: FETCH → MEASURE → CLASSIFY → DEDUPE → DELTA → TEST → COUNTERPROOF → PROMOTE