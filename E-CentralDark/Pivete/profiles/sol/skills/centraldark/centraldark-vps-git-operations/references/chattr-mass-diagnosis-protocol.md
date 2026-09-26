# Chattr +i Mass Diagnosis Protocol (2026-08-28)

## When CHEFE says "22k files with +i"

The number is almost certainly a false positive. The bug: `lsattr -R | awk '$1 ~ /i/'` counts the letter `i` in **any** position of the line — file names, directory headers, other attributes. Real `+i` is in positions 1-9 of field 1.

### Step 1 — Measure the REAL number

```bash
# Correct filter: field 1 must be attribute format AND contain 'i'
git ls-files -z | xargs -0 lsattr 2>/dev/null | awk '$1 ~ /^[-aAcCdDeEFijImNPsStTux]+$/ && $1 ~ /i/ {print $2}'
```

### Step 2 — Map distribution

```bash
# Group by directory to find the pattern
git ls-files -z | xargs -0 lsattr 2>/dev/null | awk '$1 ~ /^[-aAcCdDeEFijImNPsStTux]+$/ && $1 ~ /i/ {print $2}' | sed 's|/[^/]*$||' | sort | uniq -c | sort -rn
```

### Step 3 — Classify origin

| Pattern | Origin | Action |
|---|---|---|
| All in one module (e.g., HERMES-CORE) | Surgical lock during rebase crisis | `chattr -i` on exact paths |
| Scattered across many dirs | Script bug or hardening run | Investigate before mass removal |
| Only untracked files | Data/cache lock | Usually safe to ignore |

### Step 4 — Decide removal

- **Surgical (known paths):** `chattr -i <exact paths>` — safe with CHEFE order
- **Mass (unknown origin):** `git ls-files -z | xargs -0 -r chattr -i` — only with explicit CHEFE scope
- **Never:** `find . -exec chattr -i {} +` blindly — may remove protection from data that needs it

## Real-world example (2026-08-28)

- CHEFE reported "22k files with +i"
- Real count: **9 files**, all in `apps/modulos/HERMES-CORE/`
- Origin: surgical lock during rebase crisis (reflog showed `rebase-merge` from 14/07)
- Resolution: `chattr -R -i apps/modulos/HERMES-CORE/` + `rm -rf .git/rebase-merge`
- The "22k" came from counting any line with the letter "i" in `lsattr -R` output (371,609 lines, 292,087 containing "i" somewhere)
