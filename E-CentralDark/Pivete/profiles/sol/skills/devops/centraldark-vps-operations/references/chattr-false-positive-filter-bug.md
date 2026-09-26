# chattr +i False Positive Filter Bug

## Symptom
Running `lsattr -R | awk '$1 ~ /i/'` returns thousands of "immutable" files
when there are only a handful. This session saw "22,054 immutable files"
when the real number was 9.

## Root Cause
The letter "i" appears in many places in `lsattr` output:
- File paths (e.g., `infra`, `scripts`, `ai-diag.json`)
- Other attributes (the field is a string of single-letter flags)
- Directory headers (e.g., `apps/modulos/HERMES-CORE/agents:`)

The filter `$1 ~ /i/` matches ANY line containing "i" anywhere in field 1,
not just lines where the immutable flag is set.

## Correct Filter
The field 1 of `lsattr` output is a string of attribute flags in a fixed order:
```
aAcCdDeEFijImNPsStTux
```

To match ONLY the immutable flag (`i`), anchor the regex to the attribute format:

```bash
# For tracked files only (recommended):
git ls-files -z | xargs -0 -r lsattr -d 2>/dev/null \
  | awk '$1 ~ /^[-aAcCdDeEFijImNPsStTux]+$/ && $1 ~ /i/ { $1=""; sub(/^ +/,""); print }'

# For entire disk (including untracked):
lsattr -R -a . 2>/dev/null \
  | awk '$1 ~ /^[-aAcCdDeEFijImNPsStTux]+$/ && $1 ~ /i/ && NF>=2'
```

## Key Insight
The `i` in the attribute string appears at a specific position. The regex
`/^[-aAcCdDeEFijImNPsStTux]+$/` ensures field 1 is a valid attribute string,
then `$1 ~ /i/` checks for the immutable flag within that string.

## Lesson
NEVER use `$1 ~ /i/` alone. Always validate the field format first.
A single misplaced regex can turn 9 files into 22,000 — and trigger
unnecessary mass-mutation panic.

## Session Evidence
- 2026-08-28: Initial count showed 22,054 (false positive)
- Correct filter showed 85 (tracked) / 0 (untracked)
- After `chattr -R -i apps/modulos/HERMES-CORE/`: 0
