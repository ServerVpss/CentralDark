# Git Merge Semantics — Empirical Proof Technique

When git merge behavior is unclear or disputed, prove it with a throwaway repo instead of trusting documentation or intuition.

## The Pattern

```bash
# 1. Create throwaway repo
rm -rf /tmp/merge-test && mkdir /tmp/merge-test && cd /tmp/merge-test
git init -q -b main && git config user.email "t@t" && git config user.name "t"
git config core.autocrlf false

# 2. Create base commit
printf '{"a":1,"b":2}\n' > f.json && git add . && git commit -qm base

# 3. Create PR branch with change
git checkout -qb pr && printf '{"a":9,"b":2}\n' > f.json && git commit -qam "PR: a=9"

# 4. Advance main with conflicting change
git checkout -q main && printf '{"a":1,"b":7}\n' > f.json && git commit -qam "main: b=7"

# 5. Merge main INTO PR branch (this is what the motor does)
git checkout -f pr && git merge --no-commit --no-ff main 2>&1 | grep CONFLICT

# 6. Test --ours and --theirs
echo "--- --ours (HEAD/PR) ---"; git checkout --ours -- f.json && cat f.json
echo "--- --theirs (MERGE_HEAD/main) ---"; git checkout --theirs -- f.json && cat f.json
```

## Key Insight (Proven 2026-08-28)

When you're **ON the PR branch** and merge main:
- `--ours`   = side of the PR (HEAD)
- `--theirs` = side of the main (MERGE_HEAD)

This is **counterintuitive** — most developers expect `--ours` to mean "the main we're merging into". It doesn't.

## Why It Matters

The old `resolve-conflicts.sh` motor had the comments inverted: said "mantém main" but used `--ours`, which accepts the PR. Effect: the "fail-closed" default failed **open** — any PR touching `.github/**`, `docs/**`, or `scripts/trigger-fabric/**` had its version accepted automatically.

## The Fix

For `package.json`, never use `git checkout --ours` — it's blind and loses ALL of main's other changes. Instead, use **merge-base as reference**:

```python
# Compare PR vs merge-base (not vs main)
base = read_json("merge-base")
pr = read_json("HEAD")      # :2:
main = read_json("MERGE_HEAD")  # :3:

for dep in all_deps:
    if pr[dep] != base[dep]:
        merged[dep] = pr[dep]   # PR changed it → apply bump
    else:
        merged[dep] = main[dep] # PR didn't change it → keep main
```

Result: main preserved + PR bump applied.

## When to Use This Technique

- Any time `--ours`/`--theirs` behavior is unclear
- Before committing to a merge strategy in a skill or script
- When a git tool's documentation contradicts observed behavior
- When the cost of getting it wrong is high (governance, security, data loss)

## Cleanup

```bash
cd / && rm -rf /tmp/merge-test
```
